# CampusFlow AI — REST API Documentation

Base URL: `http://localhost:8088/api/v1`  
Swagger OpenAPI Interactive UI: `http://localhost:8088/swagger-ui/index.html`  
OpenAPI JSON Specification: `http://localhost:8088/v3/api-docs`


---

## 1. Authentication & Security Endpoints (`/api/v1/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/auth/admin-setup-status` | Public | Returns whether initial admin setup is required (`setupRequired: true/false`). |
| `POST` | `/auth/setup-admin` | Public (Initial only) | Creates the first and only initial administrator. Disabled permanently after first admin creation. |
| `POST` | `/auth/register` | Public | Registers a student or faculty account. Rejects ADMIN role submissions. |
| `POST` | `/auth/login` | Public | Authenticates credentials and returns signed JWT token with user role. |
| `GET` | `/auth/me` | Authenticated | Retrieves current logged-in user and linked profile information. |
| `PUT` | `/auth/me` | Authenticated | Updates contact information (phone, address, qualification). |
| `POST` | `/auth/change-password` | Authenticated | Validates old password and updates BCrypt password hash. |
| `POST` | `/auth/logout` | Authenticated | Invalidates user session tokens. |

---

## 2. Department & Academic Session Endpoints (`/api/v1/departments`, `/api/v1/academic-sessions`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/departments` | Authenticated | List all college departments. |
| `POST` | `/departments` | ADMIN | Create a new academic department. |
| `PUT` | `/departments/{id}` | ADMIN | Update department details. |
| `DELETE` | `/departments/{id}` | ADMIN | Delete department. |
| `GET` | `/academic-sessions` | Authenticated | List all academic calendar terms. |
| `POST` | `/academic-sessions` | ADMIN | Create a new academic session. |
| `PUT` | `/academic-sessions/{id}` | ADMIN | Update session details. |
| `DELETE` | `/academic-sessions/{id}` | ADMIN | Delete academic session. |

---

## 3. Student & Faculty Directory (`/api/v1/students`, `/api/v1/faculty`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/students` | ADMIN, FACULTY | Query students with department filter and text search. |
| `GET` | `/students/{id}` | Authenticated | Get student profile by ID. |
| `POST` | `/students` | ADMIN | Register new student with roll number and batch. |
| `PUT` | `/students/{id}` | ADMIN | Update student details and CGPA. |
| `DELETE` | `/students/{id}` | ADMIN | Delete/deactivate student profile. |
| `GET` | `/students/me/courses` | STUDENT | Get enrolled courses for logged-in student. |
| `GET` | `/students/me/attendance` | STUDENT | Get course-wise attendance summary for logged-in student. |
| `GET` | `/students/me/marks` | STUDENT | Get published exam marks for logged-in student. |
| `GET` | `/students/me/submissions` | STUDENT | Get assignment submissions for logged-in student. |
| `GET` | `/students/me/applications` | STUDENT | Get placement drive applications for logged-in student. |
| `GET` | `/faculty` | ADMIN, FACULTY | Query faculty members. |
| `POST` | `/faculty` | ADMIN | Create new faculty profile. |
| `PUT` | `/faculty/{id}` | ADMIN | Update faculty designation and contact info. |
| `DELETE` | `/faculty/{id}` | ADMIN | Delete/deactivate faculty profile. |
| `GET` | `/faculty/me/courses` | FACULTY | Get courses assigned to current faculty member. |

---

## 4. Courses & Enrollments (`/api/v1/courses`, `/api/v1/enrollments`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/courses` | Authenticated | List courses with department filter. |
| `POST` | `/courses` | ADMIN | Create a new course offering. |
| `PUT` | `/courses/{id}` | ADMIN | Update course syllabus, instructor, and credits. |
| `DELETE` | `/courses/{id}` | ADMIN | Delete course offering. |
| `GET` | `/enrollments` | ADMIN | List all student enrollments. |
| `GET` | `/enrollments/course/{courseId}` | ADMIN, FACULTY | List students enrolled in a specific course. |
| `POST` | `/enrollments` | ADMIN | Enroll a student into a course module. |
| `DELETE` | `/enrollments/{id}` | ADMIN | Remove a student's course enrollment. |

---

## 5. Attendance & Grading (`/api/v1/attendance`, `/api/v1/examinations`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/attendance/mark` | ADMIN, FACULTY | Submit roll-call session attendance for a course. |
| `GET` | `/attendance/course/{courseId}` | ADMIN, FACULTY | Get historical attendance records for a course. |
| `GET` | `/attendance/student/{studentId}/summary` | ADMIN, FACULTY | Get attendance percentage calculations for a student. |
| `GET` | `/examinations` | ADMIN, FACULTY | List all scheduled examinations. |
| `GET` | `/examinations/published` | Authenticated | List published examinations. |
| `POST` | `/examinations` | ADMIN, FACULTY | Schedule an exam (MIDTERM, FINAL, QUIZ). |
| `PUT` | `/examinations/{id}/publish` | ADMIN, FACULTY | Toggle publication of marks for students. |
| `POST` | `/examinations/marks` | ADMIN, FACULTY | Bulk save student marks for an exam. |
| `GET` | `/examinations/{id}/marks` | ADMIN, FACULTY | Retrieve marksheet for an examination. |

---

## 6. Assignments & Notices (`/api/v1/assignments`, `/api/v1/notices`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/assignments` | Authenticated | List assignments. |
| `POST` | `/assignments` | ADMIN, FACULTY | Create assignment with due date and max marks. |
| `DELETE` | `/assignments/{id}` | ADMIN, FACULTY | Delete an assignment. |
| `POST` | `/assignments/submit` | STUDENT | Submit student work (solution text or file URL). |
| `GET` | `/assignments/{id}/submissions` | ADMIN, FACULTY | Get submitted student responses for grading. |
| `PUT` | `/assignments/submissions/{id}/grade`| ADMIN, FACULTY | Record grades and feedback for a submission. |
| `GET` | `/notices/feed` | Authenticated | Get active announcements tailored to user role. |
| `POST` | `/notices` | ADMIN, FACULTY | Post a new bulletin notice. |
| `DELETE` | `/notices/{id}` | ADMIN | Delete a notice. |

---

## 7. Placements & AI Analytics (`/api/v1/placements`, `/api/v1/analytics`, `/api/v1/ai`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/placements/drives` | Authenticated | List all placement drives. |
| `GET` | `/placements/drives/active` | Authenticated | List currently open placement drives. |
| `POST` | `/placements/drives` | ADMIN | Post a new recruitment drive with CGPA cutoff. |
| `POST` | `/placements/apply` | STUDENT | Submit job application to an active drive. |
| `GET` | `/placements/drives/{id}/applications`| ADMIN | View all student applicants for a drive. |
| `PUT` | `/placements/applications/{id}/status`| ADMIN | Update candidate status (SHORTLISTED, SELECTED, REJECTED). |
| `GET` | `/analytics/metrics` | ADMIN, FACULTY | Return institution-wide KPI counts and ratios. |
| `GET` | `/ai/health` | Authenticated | Verify connection to FastAPI AI service. |
| `GET` | `/ai/student/{id}/performance` | ADMIN, FACULTY, STUDENT | Get ML performance forecasts and risk evaluation. |
| `GET` | `/ai/student/{id}/readiness` | ADMIN, FACULTY, STUDENT | Get placement readiness score and career recommendations. |
