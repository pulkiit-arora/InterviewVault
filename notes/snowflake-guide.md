# ❄️ Snowflake — Quick Reference Guide

> **Purpose:** Concise refresher — cheat-sheet style. Key concepts, short definitions, quick SQL snippets, and callouts for tricky bits.  
> **Last Updated:** 2026-07-12

---

## 📚 Topics Covered

1. [What is Snowflake?](#1-what-is-snowflake)
2. [Three-Layer Architecture](#2-three-layer-architecture)
3. [Columnar Storage & Micro-partitions](#3-columnar-storage--micro-partitions)
4. [Caching](#4-caching)
5. [Virtual Warehouses](#5-virtual-warehouses)
6. [Query Execution Flow](#6-query-execution-flow)
7. [OLTP vs OLAP](#7-oltp-vs-olap)
8. [Data Modeling — Star & Snowflake Schema](#8-data-modeling--star--snowflake-schema)
9. [Fact vs Dimension](#9-fact-vs-dimension)
10. [Constraints, Views & Dynamic Tables](#10-constraints-views--dynamic-tables)
11. [Semi-Structured Data — VARIANT](#11-semi-structured-data--variant)
12. [JSON Functions](#12-json-functions)
13. [Stages & COPY INTO](#13-stages--copy-into)
14. [Key Interview Questions](#14-key-interview-questions)

---

## 1. What is Snowflake?

**Snowflake** is a cloud-native **Data + AI Platform** that separates storage and compute.

- Enables: analytics, data engineering, data sharing, AI workloads
- Not just a database — a full platform

---

## 2. Three-Layer Architecture

```
Applications
     │
Cloud Services Layer   ← Brain
     │
Virtual Warehouses     ← Muscle
     │
Storage Layer          ← Memory
```

| Layer | Responsible For |
|-------|----------------|
| **Cloud Services** | Authentication, Authorization, Metadata, Query Optimizer, Transactions, Result Cache |
| **Virtual Warehouse** | Executing SQL, Reading data, Filtering, Joining, Aggregating |
| **Storage** | Columnar storage, Compression, Micro-partitions, Persistent storage |

> ⚠️ **A Warehouse does NOT store data.** It only computes.

---

## 3. Columnar Storage & Micro-partitions

**Columnar Storage** — data stored column-by-column, not row-by-row.

| Advantage | Why |
|-----------|-----|
| Reads fewer columns | Only fetches what the query needs |
| Better compression | Similar values grouped together |
| Faster analytics | Less I/O |

**Micro-partitions** — Snowflake auto-divides data into small partitions.  
- You never create them manually  
- Metadata stored per partition: **min value, max value, statistics**

**Partition Pruning** — Snowflake skips partitions that can't match your `WHERE` clause.
```sql
WHERE salary > 100000  -- Snowflake skips partitions where max < 100000
```
Result: Less I/O → Faster queries. **This replaces the need for indexes.**

---

## 4. Caching

| Cache | What it stores | Lost when? |
|-------|----------------|------------|
| **Result Cache** | Exact previous query results | 24 hours / data changes |
| **Warehouse Cache** | Local disk cache while warehouse runs | Warehouse suspends |
| **Metadata Cache** | Micro-partition metadata (min/max/stats) | Never (managed by Cloud Services) |

> 💡 Same query run twice = Result Cache hit, **no warehouse needed**.

---

## 5. Virtual Warehouses

- **Purpose:** Compute only (not storage)
- **Key Features:** Auto Suspend, Auto Resume, Resize, Multi-cluster, Workload Isolation
- **Sizes:** XS → S → M → L → XL → 2XL ... (each size = 2× compute of previous)
- Multi-cluster = multiple warehouses auto-scale for concurrent users

---

## 6. Query Execution Flow

```
User → SQL Worksheet → Cloud Services
         → Auth → Authorization → SQL Parser → Optimizer
              → Warehouse → Storage → Results
```

---

## 7. OLTP vs OLAP

| | OLTP | OLAP |
|--|------|------|
| **Purpose** | Transactions | Analytics |
| **Operations** | Insert-heavy | Read-heavy |
| **Design** | Highly normalized | Optimized for reporting |
| **Example** | Banking app | Data warehouse |

> ❄️ **Snowflake is primarily an OLAP platform.**

---

## 8. Data Modeling — Star & Snowflake Schema

**Enterprise Schema Pattern** (instead of one HR schema):

```
MASTER        → Employee, Department, Designation
TRANSACTION   → Payroll, Attendance, Leave
REPORTING     → Views, Aggregated data
```

**Star Schema**
```
Department ─────┐
                Payroll (Fact) ─── Date
Employee ───────┘
```
- Fewer joins → **Preferred for BI tools**

**Snowflake Schema** — Normalized dimensions
```
Country → Location → Department → Employee
```
- More joins, less redundancy

---

## 9. Fact vs Dimension

| | Dimension | Fact |
|--|-----------|------|
| **Describes** | Context / "who, what, where" | Measurable events |
| **Examples** | Employee, Department, Date | Payroll, Attendance, Sales |
| **Changes** | Slowly | Frequently (append-heavy) |

---

## 10. Constraints, Views & Dynamic Tables

**Constraints (PK / FK)**
- Snowflake supports them **but does NOT enforce** them on standard tables
- Purpose: Documentation, Optimizer hints, BI tool compatibility

**Views** — Stores SQL only. Always re-executes the underlying query.

**Materialized Views** — Pre-computed data. 
- ✅ Enterprise Edition only  
- ❌ Not on trial/standard accounts

**Dynamic Tables** — Auto-refreshed. Used for modern **ELT pipelines**.

---

## 11. Semi-Structured Data — VARIANT

`VARIANT` can store: **JSON, Avro, ORC, Parquet, XML**

```sql
-- Navigate JSON
profile:name               -- top-level key
profile:address.city       -- nested key
profile:skills[0]          -- array index
```

**Hybrid Model (Best Practice)**
```
EMPLOYEE table
├── id, name, dept_id  ← relational columns
└── profile (VARIANT)  ← flexible JSON blob
```
> 💡 Don't put everything in JSON. Use columns for what you filter/join on.

---

## 12. JSON Functions

| Function | Purpose | Quick Example |
|----------|---------|---------------|
| `PARSE_JSON()` | Text → VARIANT | `PARSE_JSON('{"name":"John"}')` |
| `OBJECT_CONSTRUCT()` | Build JSON object | `OBJECT_CONSTRUCT('name','John','age',30)` |
| `ARRAY_CONSTRUCT()` | Build JSON array | `ARRAY_CONSTRUCT('Java','AWS')` |
| `ARRAY_AGG()` | Rows → one array | `SELECT ARRAY_AGG(skill) FROM ...` |
| `FLATTEN()` | Array → rows | `FROM table, LATERAL FLATTEN(skills)` |

**`LATERAL FLATTEN`** — Applies `FLATTEN()` per row (like a nested loop).

```sql
SELECT e.name, f.value::STRING AS skill
FROM employee_profile e,
LATERAL FLATTEN(input => e.profile:skills) f;
```

---

## 13. Stages & COPY INTO

**Stages** — Temporary holding area for files before loading.

| Type | Description |
|------|-------------|
| User Stage | Per user, `@~` |
| Table Stage | Per table, `@%table_name` |
| Named Internal | Custom internal, `@stage_name` |
| External | S3 / Azure Blob / GCS |

**COPY INTO** — Bulk loads files into a table. Much faster than repeated INSERTs.
```sql
COPY INTO employees
FROM @hr_stage/employees.csv
FILE_FORMAT = (TYPE = 'CSV' SKIP_HEADER = 1);
```

---

## 14. Key Interview Questions

- What is Snowflake? Why is it called a Data + AI Platform?
- Why separate Storage and Compute?
- What is a Virtual Warehouse? Does it store data?
- Why does Snowflake not need indexes?
- What are Micro-partitions? What metadata is stored?
- What is Partition Pruning?
- Explain the three caches and when each is used.
- Walk through query execution flow.
- OLTP vs OLAP — where does Snowflake fit?
- Star Schema vs Snowflake Schema — when to use which?
- Fact vs Dimension — examples?
- Why doesn't Snowflake enforce PK/FK?
- What is `VARIANT`? When would you use it?
- What does `FLATTEN()` do? What is `LATERAL`?
- Difference between a View and a Materialized View?
- What is `COPY INTO` and why use it over `INSERT`?

---

## 🗒️ Quick Tips & Gotchas

- `VARIANT` accepts nested/dynamic JSON but **always cast before operations**: `profile:age::INT`
- Result Cache is per **query text** — even a space difference = cache miss
- Warehouses auto-suspend to save credits; **auto-resume is instant**
- Snowflake Schema ≠ Snowflake (the product). They're different things!
- `COPY INTO` is idempotent by default — re-loading same file won't duplicate (uses load metadata)

---

*Living document — updated as new topics are learned.*
