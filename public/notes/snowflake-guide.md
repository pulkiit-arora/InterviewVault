# ❄️ Snowflake — Quick Reference Guide

> **Purpose:** Concise refresher — cheat-sheet style. Key concepts, short definitions, quick SQL snippets, and callouts for tricky bits.  
> **Last Updated:** 2026-07-12

---

## 📚 Chapters

<div class="chapters-grid">
  <!-- Chapter 1 -->
  <div class="chapter-card">
    <div class="chapter-num">Chapter 1</div>
    <h3 class="chapter-name"><a href="#chapter-1-architecture-core-concepts">Architecture & Core Concepts</a></h3>
    <ul class="chapter-topics">
      <li><a href="#11-what-is-snowflake">1.1 What is Snowflake?</a></li>
      <li><a href="#12-three-layer-architecture">1.2 Three-Layer Architecture</a></li>
      <li><a href="#13-columnar-storage-micro-partitions">1.3 Columnar Storage & Micro-partitions</a></li>
      <li><a href="#14-caching">1.4 Caching</a></li>
      <li><a href="#15-virtual-warehouses">1.5 Virtual Warehouses</a></li>
      <li><a href="#16-query-execution-flow">1.6 Query Execution Flow</a></li>
    </ul>
  </div>

  <!-- Chapter 2 -->
  <div class="chapter-card">
    <div class="chapter-num">Chapter 2</div>
    <h3 class="chapter-name"><a href="#chapter-2-enterprise-data-modeling">Enterprise Data Modeling</a></h3>
    <ul class="chapter-topics">
      <li><a href="#21-oltp-vs-olap">2.1 OLTP vs OLAP</a></li>
      <li><a href="#22-data-modeling-star-snowflake-schema">2.2 Star & Snowflake Schema</a></li>
      <li><a href="#23-fact-vs-dimension">2.3 Fact vs Dimension</a></li>
      <li><a href="#24-constraints-views-dynamic-tables">2.4 Constraints, Views & Dynamic Tables</a></li>
    </ul>
  </div>

  <!-- Chapter 3 -->
  <div class="chapter-card">
    <div class="chapter-num">Chapter 3</div>
    <h3 class="chapter-name"><a href="#chapter-3-semi-structured-data-ingestion">Semi-Structured Data & Ingestion</a></h3>
    <ul class="chapter-topics">
      <li><a href="#31-semi-structured-data-variant">3.1 Semi-Structured Data — VARIANT</a></li>
      <li><a href="#32-json-functions">3.2 JSON Functions</a></li>
      <li><a href="#33-stages-copy-into">3.3 Stages & COPY INTO</a></li>
      <li><a href="#34-advanced-copy-into-ingestion-metadata">3.4 Advanced Ingestion Settings</a></li>
    </ul>
  </div>

  <!-- Chapter 4 -->
  <div class="chapter-card">
    <div class="chapter-num">Chapter 4</div>
    <h3 class="chapter-name"><a href="#chapter-4-enterprise-data-ingestion-pipelines">Enterprise Ingestion Pipelines</a></h3>
    <ul class="chapter-topics">
      <li><a href="#41-multi-layer-pipeline-architecture">4.1 Pipeline Layers (RAW to REPORTING)</a></li>
      <li><a href="#42-data-validation-error-logging">4.2 Data Validation & Error Logging</a></li>
      <li><a href="#43-incremental-loading-merge-upsert">4.3 Incremental Loading & MERGE</a></li>
      <li><a href="#44-raw-vs-curated-design-lineage-replay">4.4 RAW vs CURATED Architecture</a></li>
      <li><a href="#45-pipeline-best-practices-ai-readiness">4.5 Best Practices & AI Readiness</a></li>
    </ul>
  </div>

  <!-- Chapter 5 -->
  <div class="chapter-card">
    <div class="chapter-num">Chapter 5</div>
    <h3 class="chapter-name"><a href="#chapter-5-change-data-capture-cdc-with-streams--tasks">Change Data Capture (CDC)</a></h3>
    <ul class="chapter-topics">
      <li><a href="#51-change-data-capture-cdc-basics">5.1 CDC Basics & java analogy</a></li>
      <li><a href="#52-snowflake-streams-change-tracking">5.2 Streams & Change Logging</a></li>
      <li><a href="#53-snowflake-tasks-orchestration">5.3 Tasks & Scheduled SQL</a></li>
      <li><a href="#54-automated-cdc-pipeline-architecture">5.4 Automated Pipeline setup</a></li>
    </ul>
  </div>

  <!-- Chapter 6 -->
  <div class="chapter-card">
    <div class="chapter-num">Chapter 6</div>
    <h3 class="chapter-name"><a href="#chapter-6-data-protection--recovery-time-travel--cloning">Data Recovery & Cloning</a></h3>
    <ul class="chapter-topics">
      <li><a href="#61-time-travel-storage-internals">6.1 Time Travel & Storage layer</a></li>
      <li><a href="#62-time-travel-vs-fail-safe-vs-streams">6.2 Time Travel vs Fail-safe</a></li>
      <li><a href="#63-zero-copy-cloning-internals">6.3 Zero-Copy Cloning internals</a></li>
      <li><a href="#64-cloning-levels-methods-combinations">6.4 Cloning Levels, CTAS & backups</a></li>
    </ul>
  </div>

  <!-- Chapter 7 -->
  <div class="chapter-card">
    <div class="chapter-num">Chapter 7</div>
    <h3 class="chapter-name"><a href="#chapter-7-practice-interview-prep">Practice & Interview Prep</a></h3>
    <ul class="chapter-topics">
      <li><a href="#71-key-interview-questions">7.1 Key Interview Questions</a></li>
      <li><a href="#72-quick-tips-gotchas">7.2 Ingestion Tips & Gotchas</a></li>
    </ul>
  </div>
</div>

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
- **Fact Tables:** Quantitative measurable events. Append-heavy. (e.g., `Payroll`, `Sales_Amount`, `Units_Sold`).

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
| `PARSE_JSON(str)` | Converts string JSON to VARIANT | `PARSE_JSON('{"id": 1}')` |
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

## Chapter 5: Change Data Capture (CDC) with Streams & Tasks

### 5.1 Change Data Capture (CDC) Basics

- **What is CDC?** A design pattern that detects and captures modifications (inserts, updates, deletes) in a source table and delivers them downstream.
- **Why CDC is needed:** Traditional batch loads require full table scans and full table rewrites (Full Load). CDC enables **Incremental Load**, scanning and copying only the modified rows, which reduces processing time and warehouse cost.
- **Java Analogy:** Like an Event Listener / Observer pattern. Instead of a thread running a loop to check the state of an entire Object List (polling), the class triggers an event callback whenever a property changes.

---

### 5.2 Snowflake Streams & Change Tracking

A **Stream** is a lightweight schema object that tracks DML changes (inserts, updates, deletes) made to a source table.
- **How Streams Work Internally:** A Stream does not duplicate or store target table data. Instead, it acts as a pointer storing a transaction position bookmark. It uses **metadata-based change tracking** to compute the difference between the source table's current version and the bookmark's version.
- **DML Logging Columns:** Every stream appends three metadata columns to the query output:

| Metadata Column | Datatype | Purpose / Represents |
|-----------------|----------|----------------------|
| `METADATA$ACTION` | `VARCHAR` | The DML action type: `INSERT` or `DELETE`. |
| `METADATA$ISUPDATE` | `BOOLEAN` | `TRUE` if the row change was caused by an `UPDATE` statement; otherwise `FALSE`. |
| `METADATA$ROW_ID` | `VARCHAR` | A unique, stable ID for the row, used to track changes to the same row over time. |

- **Why UPDATE appears as DELETE + INSERT:** Because Snowflake micro-partitions are immutable, an update physically deletes the old version of the row (logs `DELETE`, `METADATA$ISUPDATE = TRUE`) and inserts the new version of the row (logs `INSERT`, `METADATA$ISUPDATE = TRUE`).

**Consuming a Stream:**
Reading from a stream returns only the delta records. Once those records are consumed in a DML transaction (like an `INSERT INTO ... SELECT FROM stream` or `MERGE`), the stream bookmark automatically advances to the end of that transaction.
```sql
CREATE OR REPLACE STREAM employee_stream ON TABLE raw_employee;

-- Query changes
SELECT * FROM employee_stream;
```

---

### 5.3 Snowflake Tasks & Orchestration

A **Task** is a scheduling object used to execute a single SQL statement, `MERGE`, or Stored Procedure.

- **Lifecycle states:** Tasks are created in a `SUSPENDED` state by default. They **must be explicitly resumed** to run.
  ```sql
  -- Resume Task
  ALTER TASK my_cdc_task RESUME;
  -- Suspend Task
  ALTER TASK my_cdc_task SUSPEND;
  ```
- **Compute Requirements:** A task requires an active Virtual Warehouse to run its SQL statements.
- **Serverless Tasks:** You can omit the `WAREHOUSE` parameter to run the task using Snowflake-managed compute resources. Snowflake automatically scales compute up/down and bills you per-second for serverless execution.
- **Monitoring Tasks:** Use the `TASK_HISTORY()` table function to audit execution status, timings, and error logs.
  ```sql
  SELECT * FROM TABLE(INFORMATION_SCHEMA.TASK_HISTORY(TASK_NAME => 'MY_CDC_TASK'));
  ```

---

### 5.4 Automated CDC Pipeline Architecture

By combining **Streams** (change capture) and **Tasks** (scheduled orchestration), you can build an automated, low-latency, end-to-end ingestion pipeline:

```
Master Table
     │
     ▼ (DML Changes occur)
Stream (Tracks changes dynamically)
     │
     ▼ (Triggers Task checking logic)
Task (Runs scheduled MERGE only when stream contains data)
     │
     ▼
Reporting / Curated Tables (Aggregated BI / Cortex AI ready views)
```

**Task with Stream Consumption Example:**
```sql
CREATE OR REPLACE TASK merge_employee_task
  WAREHOUSE = my_wh
  SCHEDULE = '5 minute'
  WHEN SYSTEM$STREAM_HAS_DATA('employee_stream')
AS
  MERGE INTO clean_employee TARGET
  USING employee_stream SOURCE
  ON TARGET.employee_id = SOURCE.employee_id
  WHEN MATCHED AND SOURCE.METADATA$ACTION = 'DELETE' THEN
    DELETE
  WHEN MATCHED AND SOURCE.METADATA$ISUPDATE = TRUE THEN
    UPDATE SET TARGET.name = SOURCE.name, TARGET.salary = SOURCE.salary
  WHEN NOT MATCHED AND SOURCE.METADATA$ACTION = 'INSERT' THEN
    INSERT (employee_id, name, salary) VALUES (SOURCE.employee_id, SOURCE.name, SOURCE.salary);
```

---

## Chapter 6: Data Protection & Recovery (Time Travel & Cloning)

### 6.1 Time Travel & Storage Internals

**Time Travel** allows you to query, clone, or restore historical data from any point in the past up to a specific retention window.
- **Standard Edition:** Default is 1 day maximum.
- **Enterprise Edition:** Up to 90 days.
- **Storage Layer Mechanics:** Because Snowflake micro-partitions are **immutable**, updates or deletes do not overwrite data in place. They write a new partition and mark the old partition as "historical". Time Travel works by reading these historical micro-partition files using the metadata logs stored at the Cloud Services layer.

**Time Travel Commands:**
```sql
-- Query historical snapshot 5 minutes ago
SELECT * FROM employee AT(OFFSET => -300);

-- Query data at a specific timestamp
SELECT * FROM employee AT(TIMESTAMP => '2026-07-12 18:00:00'::TIMESTAMP);

-- Query data as it existed before a specific statement ID
SELECT * FROM employee BEFORE(STATEMENT => '01b2a95c-0000-1122-3344-5566778899aa');

-- Restore a accidentally dropped table
UNDROP TABLE employee;
```

---

### 6.2 Time Travel vs Fail-safe vs Streams

- **Time Travel:** User-managed recovery. You can query, clone, and restore historical tables using standard SQL commands.
- **Fail-safe:** Disaster recovery only. A 7-day non-configurable safety window that starts the moment the Time Travel retention period expires. Files are compressed and only recoverable by **Snowflake Support** in disaster scenarios.
- **Streams:** Tracks *future* changes. Time Travel queries *past* states.

---

### 6.3 Zero-Copy Cloning & Internals

**Zero-Copy Cloning** allows you to replicate a table, schema, or database instantly without duplicating the underlying physical storage files.

- **How Cloning Works Internally:**
  - Cloning copies the metadata definitions and partition pointers at the Cloud Services layer. It does **not** copy the micro-partition files.
  - Initially, both the source object and the cloned object point to the **same set of immutable micro-partitions**.
- **Copy-on-Write:** If data is modified or inserted into either the source or the clone, Snowflake writes new micro-partitions containing the changed rows only. You are only billed storage fees for the **new/modified partitions** generated after cloning.

---

### 6.4 Cloning Levels, Methods & Combinations

**Cloning Commands:**
```sql
-- Table level
CREATE TABLE employee_dev CLONE employee_prod;

-- Schema level
CREATE SCHEMA hr_dev CLONE hr_prod;

-- Database level
CREATE DATABASE sales_test CLONE sales_prod;
```

**Cloning vs CTAS vs Backups:**

| Method | Metadata Copy | Storage Footprint | Execution Speed | Cost |
|--------|---------------|-------------------|-----------------|------|
| **Clone** | Pointers only | 0 bytes initially (Copy-on-Write) | Instant (Seconds) | Free initially |
| **CTAS (CREATE TABLE AS)** | Creates new table | Full duplicated physical files | Slow (depends on scan size) | Full storage fees |
| **Backup** | Full DB Copy | Full duplicated storage | Very Slow | High storage + compute |

**Clone + Time Travel:**
You can clone an object to recover its state exactly as it existed at a past point in time:
```sql
CREATE TABLE employee_recover_table
  CLONE employee_prod
  AT(TIMESTAMP => '2026-07-12 12:00:00'::TIMESTAMP);
```

---

## Chapter 7: Practice & Interview Prep

### 7.1 Key Interview Questions

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
- **What is a Stream in Snowflake and how does it track changes without duplicating data?** It is a pointer metadata object that tracks transactional offsets on the base table.
- **Explain the three stream metadata columns.** (`METADATA$ACTION`, `METADATA$ISUPDATE`, `METADATA$ROW_ID`).
- **Why does an UPDATE show up as a DELETE and INSERT in a stream?** Because partitions are immutable; an update removes the old partition pointer and appends a new one.
- **What is a Task in Snowflake and what state is it in upon creation?** It is an orchestrator object. It is created as `SUSPENDED` by default.
- **What are Serverless Tasks?** Tasks that execute compute on Snowflake-managed elastic compute engines rather than requiring a dedicated virtual warehouse.
- **What is Zero-Copy Cloning and what is Copy-on-Write?** Instant pointer replication where both source and clone share physical micro-partition files until writes occur.
- **How does Zero-Copy Cloning differ from a standard CTAS?** Zero-copy copies metadata pointers instantly; CTAS scans and physically duplicates the storage files.
- **What is the difference between Time Travel and Fail-safe?** Time travel is user-queryable and configurable (up to 90 days); Fail-safe is non-configurable (7 days) and only recoverable by Snowflake support.
- **How do you restore a table that was deleted by accident?** Using `UNDROP TABLE table_name;`.

---

### 7.2 Quick Tips & Gotchas

- `COPY INTO` is idempotent (files already loaded successfully are skipped unless `FORCE = TRUE` is passed).
- If your files have duplicate keys inside a single load batch, `MERGE` will fail with a "multiple updates to same target row" error. Always deduplicate source files in RAW/CLEAN before running a `MERGE` target statement.
- Warehouse Cache is cleared when the warehouse is suspended. If you run back-to-back ETL tasks, make sure the warehouse doesn't suspend in between to keep query scans fast.
- Materialized Views cost credits both for initial compilation and automatic maintenance when base tables change. Use them sparingly on highly active tables.
- Querying a stream consumes its data and advances the offset bookmark. If you need to perform multiple checks on a stream, write the stream data to a temporary table first.
- Recreating a table using `CREATE OR REPLACE TABLE` breaks any active streams associated with it because its internal table ID changes. Use `TRUNCATE TABLE` instead to maintain stream offsets.
- Fail-safe consumes storage costs. When you clone a table, the clone doesn't pay storage fees until new partitions are modified, but if the source table is dropped, its partitions move to Time Travel/Fail-safe and keep accumulating storage costs.

---

*Living document — updated as new topics are learned.*
