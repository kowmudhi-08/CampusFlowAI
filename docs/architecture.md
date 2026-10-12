# CampusFlow AI — Architecture & System Design

CampusFlow AI is an enterprise-grade full-stack College Management System engineered with a decoupled microservice architecture, combining a Spring Boot backend, a Python FastAPI predictive machine learning engine, a modern React/Vite/TypeScript frontend, and a normalized MySQL relational database.

---

## 1. High-Level Architectural Overview

```
                      +------------------------------------------+
                      |         React 18 + Vite Frontend         |
                      |   (TypeScript, Tailwind CSS, Recharts)   |
                      |             Port: 5173                   |
                      +--------------------+---------------------+
                                           |
                                  HTTP / JSON (REST)
                             Bearer JWT Authentication
                                           |
                                           v
                      +------------------------------------------+
                      |        Spring Boot 3.3.4 Backend         |
                      |   (Spring Security 6, JPA / Hibernate)   |
                      |             Port: 8088                   |
                      +-----------+------------------+-----------+

                                  |                  |
                         JDBC / SQL (Port 3306)      | Internal REST (Port 8000)
                                  |                  | JSON Payload
                                  v                  v
       +----------------------------+      +-------------------------------+
       |       MySQL 8.0 RDBMS      |      |   FastAPI AI Microservice     |
       |  (15 Normalized Tables)    |      |  (Scikit-Learn, Pandas, NumPy)|
       |   Zero Seed Initial Data   |      |   Ridge Regression & Scoring  |
       +----------------------------+      +-------------------------------+
```

---

## 2. Core Architectural Pillars

### A. Security & Authentication
- **Initial Single-Admin Flow**:
  - The application strictly enforces **exactly ONE initial administrator** account via `/api/v1/auth/setup-admin`.
  - Once created, public access to setup-admin is permanently disabled and rejects concurrent requests.
  - Public registration (`/api/v1/auth/register`) only permits `STUDENT` or `FACULTY` roles; attempts to pass `ADMIN` are strictly rejected with HTTP 403 Forbidden.
- **Stateless JWT Tokens**:
  - JJWT 0.12.6 signs tokens using HMAC-SHA256 with an injected 256-bit secret key.
  - Token expiration and claims validation are evaluated on every incoming request through `JwtAuthenticationFilter`.
- **Role-Based Access Control (RBAC)**:
  - Spring Security maps roles to authorities (`ROLE_ADMIN`, `ROLE_FACULTY`, `ROLE_STUDENT`).
  - Endpoints utilize `@PreAuthorize("hasRole('ADMIN')")` or combined role checks.

### B. Relational Database Design & Zero-Seed Policy
- **Schema Management via Flyway**:
  - All 15 database tables are created via immutable migration scripts (`V1__init_schema.sql`).
  - Strict compliance with the **Zero Seed Data Requirement**: zero sample students, courses, fake grades, or dummy attendance records are seeded.
  - Initial system boots with genuine empty states; counts and charts are queried directly from live database tables.

### C. Artificial Intelligence & Academic Diagnostics
- **Python FastAPI Service (Port 8000)**:
  - Consumes student academic signals: attendance session attendance percentage, examination scores, assignment submission counts, and GPA.
  - **Explainability & Ethical AI**: Zero demographic or sensitive personal identifiers are passed to the model.
  - **Transparent Data Sufficiency Guard**: If a student has fewer than 3 recorded attendance sessions or zero examination marks, the system honestly outputs an `INSUFFICIENT_DATA` advisory rather than fabricating fake predictions.
  - **Inference Models**:
    - **Performance Forecast**: Scikit-Learn Ridge Regression estimator for end-term score forecasting.
    - **Placement Readiness**: Multivariate weighted rule-based index evaluating GPA cutoffs, assignment discipline, and active recruitment drives.

---

## 3. Database Entity Relationship Model

| Entity Table | Primary Key | Foreign Keys & Relationships |
|---|---|---|
| `users` | `id` | Root authentication credentials (BCrypt hash, email, role, active). |
| `departments` | `id` | Academic faculties (Code, Name, Description). |
| `academic_sessions` | `id` | Academic term calendar (Start Date, End Date, Current Flag). |
| `student_profiles` | `id` | `user_id -> users(id)`, `department_id -> departments(id)`. |
| `faculty_profiles` | `id` | `user_id -> users(id)`, `department_id -> departments(id)`. |
| `courses` | `id` | `department_id -> departments(id)`, `faculty_id -> faculty_profiles(id)`. |
| `enrollments` | `id` | `student_id -> student_profiles(id)`, `course_id -> courses(id)`. |
| `attendance_records` | `id` | `student_id -> student_profiles(id)`, `course_id -> courses(id)`. |
| `examinations` | `id` | `course_id -> courses(id)`. |
| `marks` | `id` | `examination_id -> examinations(id)`, `student_id -> student_profiles(id)`. |
| `assignments` | `id` | `course_id -> courses(id)`. |
| `submissions` | `id` | `assignment_id -> assignments(id)`, `student_id -> student_profiles(id)`. |
| `notices` | `id` | `created_by_id -> users(id)`. |
| `placement_drives` | `id` | Corporate recruitment postings and minimum CGPA criteria. |
| `placement_applications`| `id` | `placement_drive_id -> placement_drives(id)`, `student_id -> student_profiles(id)`. |
