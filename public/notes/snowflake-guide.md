# ❄️ Snowflake — Quick Reference Guide

> **Purpose:** Concise refresher — cheat-sheet style. Key concepts, short definitions, quick SQL snippets, and callouts for tricky bits.  
> **Last Updated:** 2026-07-12

---

## 📚 Chapters

- **[Chapter 1: Architecture & Core Concepts](#chapter-1-architecture--core-concepts)**
  - [1.1 What is Snowflake?](#11-what-is-snowflake)
  - [1.2 Three-Layer Architecture](#12-three-layer-architecture)
  - [1.3 Columnar Storage & Micro-partitions](#13-columnar-storage--micro-partitions)
  - [1.4 Caching](#14-caching)
  - [1.5 Virtual Warehouses](#15-virtual-warehouses)
  - [1.6 Query Execution Flow](#16-query-execution-flow)
- **[Chapter 2: Enterprise Data Modeling](#chapter-2-enterprise-data-modeling)**
  - [2.1 OLTP vs OLAP](#21-oltp-vs-olap)
  - [2.2 Data Modeling — Star & Snowflake Schema](#22-data-modeling--star--snowflake-schema)
  - [2.3 Fact vs Dimension](#23-fact-vs-dimension)
  - [2.4 Constraints, Views & Dynamic Tables](#24-constraints-views--dynamic-tables)
- **[Chapter 3: Semi-Structured Data & Ingestion](#chapter-3-semi-structured-data--ingestion)**
  - [3.1 Semi-Structured Data — VARIANT](#31-semi-structured-data--variant)
  - [3.2 JSON Functions](#32-json-functions)
  - [3.3 Stages & COPY INTO](#33-stages--copy-into)
- **[Chapter 4: Practice & Interview Prep](#chapter-4-practice--interview-prep)**
  - [4.1 Key Interview Questions](#41-key-interview-questions)
  - [4.2 Quick Tips & Gotchas](#42-quick-tips--gotchas)

---

## Chapter 1: Architecture & Core Concepts

### 1.1 What is Snowflake?

**Snowflake** is a cloud-native **Data + AI Platform** that separates storage and compute.

- Enables: analytics, data engineering, data sharing, AI workloads
- Not just a database — a full platform

---

### 1.2 Three-Layer Architecture

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

### 1.3 Columnar Storage & Micro-partitions

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

### 1.4 Caching

| Cache | What it stores | Lost when? |
|-------|----------------|------------|
| **Result Cache** | Exact previous query results | 24 hours / data changes |
| **Warehouse Cache** | Local disk cache while warehouse runs | Warehouse suspends |
| **Metadata Cache** | Micro-partition metadata (min/max/stats) | Never (managed by Cloud Services) |

> 💡 Same query run twice = Result Cache hit, **no warehouse needed**.

---

### 1.5 Virtual Warehouses

- **Purpose:** Compute only (not storage)
- **Key Features:** Auto Suspend, Auto Resume, Resize, Multi-cluster, Workload Isolation
- **Sizes:** XS → S → M → L → XL → 2XL ... (each size = 2× compute of previous)
- Multi-cluster = multiple warehouses auto-scale for concurrent users

---

### 1.6 Query Execution Flow

```
User → SQL Worksheet → Cloud Services
         → Auth → Authorization → SQL Parser → Optimizer
              → Warehouse → Storage → Results
```

---

## Chapter 2: Enterprise Data Modeling

### 2.1 OLTP vs OLAP

| | OLTP | OLAP |
|--|------|------|
| **Purpose** | Transactions | Analytics |
| **Operations** | Insert-heavy | Read-heavy |
| **Design** | Highly normalized | Optimized for reporting |
| **Example** | Banking app | Data warehouse |

> ❄️ **Snowflake is primarily an OLAP platform.**

---

### 2.2 Data Modeling — Star & Snowflake Schema

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

### 2.3 Fact vs Dimension

| | Dimension | Fact |
|--|-----------|------|
| **Describes** | Context / "who, what, where" | Measurable events |
| **Examples** | Employee, Department, Date | Payroll, Attendance, Sales |
| **Changes** | Slowly | Frequently (append-heavy) |

---

### 2.4 Constraints, Views & Dynamic Tables

**Constraints (PK / FK)**
- Snowflake supports them **but does NOT enforce** them on standard tables
- Purpose: Documentation, Optimizer hints, BI tool compatibility

**Views** — Stores SQL only. Always re-executes the underlying query.

**Materialized Views** — Pre-computed data. 
- ✅ Enterprise Edition only  
- ❌ Not on trial/standard accounts

**Dynamic Tables** — Auto-refreshed. Used for modern **ELT pipelines**.

---

## Chapter 3: Semi-Structured Data & Ingestion

### 3.1 Semi-Structured Data — VARIANT

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

### 3.2 JSON Functions

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

### 3.3 Stages & COPY INTO

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

## Chapter 4: Practice & Interview Prep

### 4.1 Key Interview Questions

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

### 4.2 Quick Tips & Gotchas

- `VARIANT` accepts nested/dynamic JSON but **always cast before operations**: `profile:age::INT`
- Result Cache is per **query text** — even a space difference = cache miss
- Warehouses auto-suspend to save credits; **auto-resume is instant**
- Snowflake Schema ≠ Snowflake (the product). They're different things!
- `COPY INTO` is idempotent by default — re-loading same file won't duplicate (uses load metadata)

---

*Living document — updated as new topics are learned.*
