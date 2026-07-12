# ❄️ Snowflake — Quick Reference Guide

> **Purpose:** Concise refresher — cheat-sheet style. Key concepts, short definitions, quick SQL snippets, and callouts for tricky bits.  
> **Last Updated:** 2026-07-12

---

## 📚 Chapters

- **[Chapter 1: Architecture & Core Concepts](#chapter-1-architecture-core-concepts)**
  - [1.1 What is Snowflake?](#11-what-is-snowflake)
  - [1.2 Three-Layer Architecture](#12-three-layer-architecture)
  - [1.3 Columnar Storage & Micro-partitions](#13-columnar-storage-micro-partitions)
  - [1.4 Caching](#14-caching)
  - [1.5 Virtual Warehouses](#15-virtual-warehouses)
  - [1.6 Query Execution Flow](#16-query-execution-flow)
- **[Chapter 2: Enterprise Data Modeling](#chapter-2-enterprise-data-modeling)**
  - [2.1 OLTP vs OLAP](#21-oltp-vs-olap)
  - [2.2 Data Modeling — Star & Snowflake Schema](#22-data-modeling-star-snowflake-schema)
  - [2.3 Fact vs Dimension](#23-fact-vs-dimension)
  - [2.4 Constraints, Views & Dynamic Tables](#24-constraints-views-dynamic-tables)
- **[Chapter 3: Semi-Structured Data & Ingestion](#chapter-3-semi-structured-data-ingestion)**
  - [3.1 Semi-Structured Data — VARIANT](#31-semi-structured-data-variant)
  - [3.2 JSON Functions](#32-json-functions)
  - [3.3 Stages & COPY INTO](#33-stages-copy-into)
  - [3.4 Advanced COPY INTO & Ingestion Metadata](#34-advanced-copy-into-ingestion-metadata)
- **[Chapter 4: Enterprise Data Ingestion Pipelines](#chapter-4-enterprise-data-ingestion-pipelines)**
  - [4.1 Multi-Layer Pipeline Architecture](#41-multi-layer-pipeline-architecture)
  - [4.2 Data Validation & Error Logging](#42-data-validation-error-logging)
  - [4.3 Incremental Loading & MERGE (UPSERT)](#43-incremental-loading-merge-upsert)
  - [4.4 RAW vs CURATED Design (Lineage & Replay)](#44-raw-vs-curated-design-lineage-replay)
  - [4.5 Pipeline Best Practices & AI Readiness](#45-pipeline-best-practices-ai-readiness)
- **[Chapter 5: Practice & Interview Prep](#chapter-5-practice-interview-prep)**
  - [5.1 Key Interview Questions](#51-key-interview-questions)
  - [5.2 Quick Tips & Gotchas](#52-quick-tips-gotchas)

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
Cloud Services Layer   ← Brain (Metadata, Auth, Optimizer, Result Cache)
     │
Virtual Warehouses     ← Muscle (Compute, Reading, Joining, Aggregating)
     │
Storage Layer          ← Memory (Columnar Micro-partitions, Compression)
```

> ⚠️ **A Warehouse does NOT store data.** It only computes.

---

### 1.3 Columnar Storage & Micro-partitions

**Columnar Storage** — data stored column-by-column, not row-by-row.
- Reads fewer columns: only fetches what is queried.
- Better compression: similar datatypes group together.
- Faster analytics: drastically reduced I/O.

**Micro-partitions** — Snowflake auto-divides data into small partitions (50MB to 500MB).  
- Generated automatically; you never define or create them manually.  
- Metadata stores **min/max values, distinct count, null count** per partition.

**Partition Pruning** — Optimizer skips partitions that can't match `WHERE` filters.
```sql
WHERE salary > 100000  -- Skips all partitions where max_salary < 100000
```
Result: **This replaces the need for indexes.**

---

### 1.4 Caching

| Cache | Scope | Saved Location | Lost When? |
|-------|-------|----------------|------------|
| **Result Cache** | Global (any user) | Cloud Services Layer | 24 Hours / Data modification |
| **Warehouse Cache** | Local to active warehouse | Local SSD on Compute Node | Warehouse suspends |
| **Metadata Cache** | Global | Cloud Services Layer | Never (always up to date) |

---

### 1.5 Virtual Warehouses

- **Compute Only:** Temporary worker nodes mapped to a specific size (XS = 1 node, S = 2, M = 4, L = 8, XL = 16, etc.).
- **Auto-Suspend/Auto-Resume:** Shuts down when idle to save billing credits; resumes instantly on query submission.
- **Scaling:**
  - *Scale Up:* Resize warehouse size (e.g., M → L) to make a single heavy query run faster.
  - *Scale Out:* Multi-cluster warehouse adds clusters automatically to handle high concurrent user load.

---

### 1.6 Query Execution Flow

```
User -> SQL Worksheet -> Cloud Services (Auth -> Parser -> Optimizer -> Result Cache Check)
                             -> Virtual Warehouse (Compute/Exec) -> Storage Layer (Read Columns) -> Results
```

---

## Chapter 2: Enterprise Data Modeling

### 2.1 OLTP vs OLAP

| Feature | OLTP (Online Transaction Processing) | OLAP (Online Analytical Processing) |
|---------|------------------------------------|-----------------------------------|
| **Use Case** | Day-to-day operational transactions | High-volume analytical queries |
| **Write/Read** | High writes (Insert/Update/Delete) | High reads (Complex Selects) |
| **Design** | Highly normalized (3NF) | Denormalized (Star/Snowflake) |
| **Snowflake** | ❌ Poor fit (no transactional latency support) | ✅ Excellent fit (optimized for big data scans) |

---

### 2.2 Data Modeling — Star & Snowflake Schema

**Enterprise Schema Design Layers:**
```
MASTER         → Master Dimensions (Employee, Department, Designation)
TRANSACTION    → Fact tables / Event records (Payroll, Attendance, Leave)
REPORTING      → Client-facing views / pre-aggregated tables
```

**Star Schema:** Fact table in center connected directly to denormalized Dimension tables.
- Fewer joins → Highly preferred for BI tools (Power BI, Tableau).

**Snowflake Schema:** Dimensions are normalized into sub-dimensions (e.g., Employee -> Department -> Location -> Country).
- Reduces redundancy, but requires more SQL joins.

---

### 2.3 Fact vs Dimension

- **Dimension Tables:** Contextual data representing "Who, What, Where, When". Slow-moving. (e.g., `Employee`, `Date`, `Product`).
- **Fact Tables:** Measurable quantitative events. Append-heavy. (e.g., `Payroll`, `Sales_Amount`, `Units_Sold`).

---

### 2.4 Constraints, Views & Dynamic Tables

- **Constraints (PK/FK/Unique):** Supported in DDL syntax but **NOT enforced** by Snowflake (except `NOT NULL`).
  - *Why define them?* Helps Optimizer build better query paths, serves as documentation, and assists BI tools in auto-mapping joins.
- **Secure Views:** Prevents users from seeing the underlying query definition (`GET_DDL`) or filter logic.
- **Materialized Views:** Pre-computes and stores query results. Automatically updated. Requires **Enterprise Edition** or higher.
- **Dynamic Tables:** Declared with a target lag (e.g., `LAG = '1 hour'`) and query. Automatically refreshes without scheduling manual tasks. Preferred for modern **ELT pipelines**.

---

## Chapter 3: Semi-Structured Data & Ingestion

### 3.1 Semi-Structured Data — VARIANT

`VARIANT` is a native datatype storing up to 16MB of semi-structured formats (**JSON, XML, Parquet, Avro, ORC**).
- **Navigation Syntax:**
  ```sql
  profile:name::STRING             -- Extracts string value
  profile:address.city::STRING     -- Traverses nested paths
  profile:skills[0]::STRING        -- Accesses array element
  ```

---

### 3.2 JSON Functions

| Function | Description | Example |
|----------|-------------|---------|
| `PARSE_JSON(str)` | Converts string representation of JSON to VARIANT | `PARSE_JSON('{"id": 1}')` |
| `OBJECT_CONSTRUCT(k,v)` | Dynamically builds a JSON object | `OBJECT_CONSTRUCT('name', 'John')` |
| `ARRAY_CONSTRUCT(v1,v2)` | Dynamically builds a JSON array | `ARRAY_CONSTRUCT('Java', 'SQL')` |
| `ARRAY_AGG(col)` | Aggregates column values into a single JSON array | `SELECT ARRAY_AGG(salary) FROM ...` |
| `FLATTEN(input)` | Explodes a JSON array/object into relational rows | `LATERAL FLATTEN(input => profile:skills)` |

```sql
-- Flatten Example
SELECT e.name, f.value::STRING AS skill
FROM employee_profile e,
LATERAL FLATTEN(input => e.profile:skills) f;
```

---

### 3.3 Stages & COPY INTO

- **Internal Stages:** File storage hosted inside Snowflake.
  - *User Stage (`@~`):* Private to the logged-in user.
  - *Table Stage (`@%table`):* Tied to a specific table; only that table can load from it.
  - *Named Stage (`@my_stage`):* Shared stage created using DDL.
- **External Stages:** Points to cloud storage buckets (AWS S3, Azure Blob, Google Cloud Storage) using integration objects.

**Basic Ingestion Command:**
```sql
COPY INTO my_table
FROM @my_stage/data_file.csv
FILE_FORMAT = (TYPE = 'CSV' SKIP_HEADER = 1);
```

---

### 3.4 Advanced COPY INTO & Ingestion Metadata

**Ingestion Status & Operations:**
- `SHOW STAGES;` / `DESC STAGE my_stage;` — Inspect stage properties and path config.
- `LIST @my_stage;` — List files waiting in the stage.

**`COPY INTO` Advanced Options:**
- `MATCH_BY_COLUMN_NAME = CASE_SENSITIVE | CASE_INSENSITIVE` — Matches headers in source CSV/Parquet with column names of target table.
- `ON_ERROR = ABORT_STATEMENT | CONTINUE | SKIP_FILE | SKIP_FILE_10%` — Defines pipeline response to format/data errors.
- `VALIDATION_MODE = RETURN_ERRORS | RETURN_ALL_ERRORS` — Pre-validates file format and displays issues **without loading any data**.
- `FORCE = TRUE` — Bypasses load history checking and loads a file even if it was imported before.
- `PURGE = TRUE` — Automatically deletes files from the stage after a successful load.

**Metadata Tracking:**
- `INFORMATION_SCHEMA.COPY_HISTORY` — System table function containing detailed historical logs of all file loads executed over the last 14 days.

---

## Chapter 4: Enterprise Data Ingestion Pipelines

### 4.1 Multi-Layer Pipeline Architecture

Enterprise ingestion models utilize a multi-tier lakehouse architecture:

```
Source Files (CSV/JSON)
        │
        ▼
   Stage Area
        │  (COPY INTO ... ON_ERROR = CONTINUE)
        ▼
   [RAW Layer]         ← Append-only. Raw string columns. No casting. Holds historical load snapshot.
        │
        ▼
   [CLEAN Layer]       ← Cleaned data. Whitespace trimmed, dates parsed, values cast to types.
        │              ← Evaluated against validation rules.
        ├───────────────► [Error Table]  ← Invalid record payloads logged with error descriptions.
        ▼
  [MASTER Layer]       ← Production state. UPSERTed via MERGE using primary keys.
        │
        ▼
 [REPORTING Layer]     ← Consumer views. Performance aggregates, BI feeds, and Cortex AI ready datasets.
```

---

### 4.2 Data Validation & Error Logging

- **Validation Checks:** Perform schema-level constraints checks during raw-to-clean promotion:
  - *Salary limits:* `salary >= 0`
  - *Structure validation:* Email regex format checks.
  - *Reference integrity:* Check if incoming `department_id` exists in the Department master table.
  - *Duplicates:* Remove duplicates by selecting the latest record via `ROW_NUMBER() OVER (PARTITION BY id ORDER BY load_timestamp DESC)`.
- **Why log bad records instead of deleting them?**
  - **Audit trail:** Proves why a file didn't fully sync.
  - **Reprocessing:** Allows downstream analysts to fix source data errors and replay imports.
  - **System visibility:** Avoids silent drop bugs that leave finance/analytics tables incomplete.

---

### 4.3 Incremental Loading & MERGE (UPSERT)

Instead of truncating and reloading large tables (which wastes credit cost and causes locks), use `MERGE` to perform incremental upserts.

```sql
MERGE INTO master_employee TARGET
USING clean_employee SOURCE
ON TARGET.employee_id = SOURCE.employee_id
WHEN MATCHED AND SOURCE.update_timestamp > TARGET.update_timestamp THEN
  UPDATE SET TARGET.name = SOURCE.name, TARGET.salary = SOURCE.salary, TARGET.last_updated = CURRENT_TIMESTAMP()
WHEN NOT MATCHED THEN
  INSERT (employee_id, name, salary, last_updated)
  VALUES (SOURCE.employee_id, SOURCE.name, SOURCE.salary, CURRENT_TIMESTAMP());
```

**Internal MERGE Mechanics:**
- Behind the scenes, Snowflake executes a `JOIN` between the target micro-partitions and source table.
- It identifies matching rows, updates columns in existing micro-partitions (by writing new versions of those micro-partitions), and appends brand-new micro-partitions for unmatched insertions.

---

### 4.4 RAW vs CURATED Design (Lineage & Replay)

| Table Layer | Description | Purpose |
|-------------|-------------|---------|
| **RAW** | Unmodified copy of source files. Typeless columns (usually `VARCHAR` or `VARIANT`). | **Replay Capability:** If business rules change, you can rebuild the clean layer entirely from RAW. **Auditing & Lineage:** Proof of what came from the source. |
| **CURATED (Clean/Master)** | Fully structured, typed, validated, and normalized data. | **Single Source of Truth:** Business-ready data layer consumed by analytics, AI engines, and applications. |

---

### 4.5 Pipeline Best Practices & AI Readiness

1. **Never load directly into production tables:** Always buffer imports via RAW and validate through CLEAN before committing upserts to MASTER.
2. **Preserve original source files:** Never delete files from cloud stages immediately until the RAW load verification is logged in `COPY_HISTORY`.
3. **Separate ingestion compute from reporting compute:** Assign distinct Virtual Warehouses for loading data vs querying data to prevent resource contention.
4. **Prepare data for Cortex AI:** High-quality AI output requires curated data. Clean text, strip special characters, standardize structure, and ensure clear metadata labeling before loading data into Cortex semantic search indexes.

---

## Chapter 5: Practice & Interview Prep

### 5.1 Key Interview Questions

- **What is a Stage?** Explain the differences between User, Table, Named, and External stages.
- **Why is COPY INTO faster than INSERT?** `COPY INTO` bulk loads files using parallel compute threads from the warehouse directly, while `INSERT` processes statement-by-statement through the Cloud Services optimizer.
- **How does MATCH_BY_COLUMN_NAME work?** It ignores order mismatches between columns in the target table and headers in the file, loading by string match.
- **What is the use of VALIDATION_MODE?** It checks files for formatting errors without writing data to the table, helping preview format bugs.
- **How do you monitor loading history?** Query `INFORMATION_SCHEMA.COPY_HISTORY` or view the Snowflake UI copy history panel.
- **Why shouldn't you enforce PK/FK constraints in Snowflake?** Snowflake does not enforce constraints at write-time (to maximize speed). Enforcing them requires custom pipeline logic (like validation rules in CLEAN step).
- **Explain the difference between MERGE and UPDATE.** `MERGE` handles both inserts and updates conditionally in one statement, while `UPDATE` only modifies existing rows.
- **Explain the multi-layer pipeline architecture (RAW -> CLEAN -> MASTER -> REPORTING).**
- **What happens internally during a MERGE statement execution?**
- **Why should you log validation errors to an Error Table instead of discarding them?**

---

### 5.2 Quick Tips & Gotchas

- `COPY INTO` is idempotent (files already loaded successfully are skipped unless `FORCE = TRUE` is passed).
- If your files have duplicate keys inside a single load batch, `MERGE` will fail with a "multiple updates to same target row" error. Always deduplicate source files in RAW/CLEAN before running a `MERGE` target statement.
- Warehouse Cache is cleared when the warehouse is suspended. If you run back-to-back ETL tasks, make sure the warehouse doesn't suspend in between to keep query scans fast.
- Materialized Views cost credits both for initial compilation and automatic maintenance when base tables change. Use them sparingly on highly active tables.

---

*Living document — updated as new topics are learned.*
