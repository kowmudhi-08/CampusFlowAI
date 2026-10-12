# CampusFlow AI — User & Operational Guide

CampusFlow AI provides tailored role-based portals for College Administrators, Academic Faculty, and Students.

---

## 1. Initial System Boot & Administrator Setup

When the application is booted for the very first time with an empty database:
1. Navigate to `http://localhost:5173/` or `http://localhost:5173/setup-admin`.
2. The system detects that zero administrators exist in MySQL and displays the **Initial Admin Setup** portal.
3. Enter:
   - **Full Name** (e.g. `System Administrator`)
   - **Email Address** (e.g. `admin@campusflow.edu`)
   - **Password** & **Confirm Password** (minimum 6 characters)
4. Click **Create Administrator**.
5. Once submitted, the backend saves the record with a BCrypt-hashed password, issues your initial session token, and automatically locks the endpoint so that no other admin can be created through public setup.

---

## 2. Institutional Setup (Administrator Workflow)

As an Administrator:
1. **Academic Sessions**:
   - Go to **Departments & Sessions** -> **Academic Sessions** tab.
   - Click **Add Academic Session** (e.g., `2026-2027 Fall Semester`, Start: `2026-08-01`, End: `2026-12-15`, Current: `Yes`).
2. **Departments**:
   - In **Departments** tab, click **Add Department**.
   - Create academic divisions (e.g., `Computer Science & Engineering` with Code `CSE`).
3. **Faculty Registration**:
   - Go to **Faculty** -> **Add Faculty**.
   - Enter name, email, employee code (e.g. `FAC-CSE-01`), department, and designation.
4. **Student Registration**:
   - Go to **Students** -> **Add Student**.
   - Enter name, email, roll number (e.g. `CSE-2026-001`), department, batch year, and initial CGPA.
5. **Course Offerings**:
   - Go to **Courses** -> **Add Course**.
   - Enter Course Code (`CS-301`), Title (`Data Structures & Algorithms`), Credits (`4`), Semester (`3`), and assign the faculty instructor.
6. **Student Enrollments**:
   - Go to **Enrollments** -> **Enroll Student**.
   - Select the student and course to enroll them into the class roster.

---

## 3. Academic Operations (Faculty Workflow)

As a Faculty Member:
1. **Daily Attendance Roll-Call**:
   - Navigate to **Attendance**.
   - Select your assigned course, date, and lecture session.
   - Mark students as **Present**, **Late**, or **Absent** (or click **Mark All Present**).
   - Click **Save Attendance Session**.
2. **Scheduling Examinations & Grading**:
   - Go to **Examinations** -> **Schedule Exam**.
   - Set Title, Course, Exam Type (Midterm, Final, Quiz), Date, and Max Marks.
   - Click the **Marks** action button on the exam row to enter marks and feedback per student.
   - Click the eye icon to **Publish Scores** to student dashboards.
3. **Assignments & Homework**:
   - Go to **Assignments** -> **Create Assignment**.
   - Set prompt, due date, and max marks.
   - When students submit, click **Review Submissions** to award grades and feedback.
4. **Notice Board**:
   - Go to **Notices** -> **Post Notice** to broadcast announcements to students or all campus users.

---

## 4. Student Self-Service & AI Insights (Student Workflow)

As a Student:
1. **Course Curriculum**:
   - View enrolled subjects, instructor details, and credit load under **My Courses**.
2. **Attendance Tracker**:
   - View attendance percentage per course under **My Attendance**.
   - Real-time alerts trigger automatically if attendance falls below 75%.
3. **Assignments Submission**:
   - Under **Assignments**, view deadlines and click **Submit Assignment** to submit solution writeups or file repository links.
4. **Examination Marks**:
   - Under **Exam Results**, review published marks, percentages, and teacher remarks.
5. **Placement Drives**:
   - Under **Placement Drives**, view active recruiting companies with CGPA cutoffs.
   - Submit applications with resume links.
6. **AI Academic Diagnostics & Placement Readiness**:
   - Under **Performance & AI**:
     - Transparently explains data requirements (minimum 3 attendance sessions and exam marks).
     - Predicts expected final score percentage and flags academic risk levels.
     - Evaluates placement readiness score out of 100 with actionable next steps.
