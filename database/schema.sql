-- =============================================================================
-- CAMPUSFLOW AI — MySQL Database Schema Reference
-- =============================================================================

CREATE DATABASE IF NOT EXISTS campusflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE campusflow;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    full_name VARCHAR(150) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email),
    INDEX idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Departments Table
CREATE TABLE IF NOT EXISTS departments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_dept_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Academic Sessions Table
CREATE TABLE IF NOT EXISTS academic_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_current BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Student Profiles Table
CREATE TABLE IF NOT EXISTS student_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    roll_number VARCHAR(50) NOT NULL UNIQUE,
    department_id BIGINT NULL,
    batch_year INT NULL,
    phone VARCHAR(25) NULL,
    address TEXT NULL,
    cgpa DECIMAL(4, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_student_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_student_department FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE SET NULL,
    INDEX idx_student_roll (roll_number),
    INDEX idx_student_dept (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Faculty Profiles Table
CREATE TABLE IF NOT EXISTS faculty_profiles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    employee_code VARCHAR(50) NOT NULL UNIQUE,
    department_id BIGINT NULL,
    designation VARCHAR(100) NULL,
    phone VARCHAR(25) NULL,
    qualification VARCHAR(150) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_faculty_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
    CONSTRAINT fk_faculty_department FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE SET NULL,
    INDEX idx_faculty_code (employee_code),
    INDEX idx_faculty_dept (department_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Courses Table
CREATE TABLE IF NOT EXISTS courses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    title VARCHAR(200) NOT NULL,
    description TEXT NULL,
    credits INT NOT NULL DEFAULT 3,
    department_id BIGINT NULL,
    faculty_id BIGINT NULL,
    academic_session_id BIGINT NULL,
    semester INT NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_course_department FOREIGN KEY (department_id) REFERENCES departments (id) ON DELETE SET NULL,
    CONSTRAINT fk_course_faculty FOREIGN KEY (faculty_id) REFERENCES faculty_profiles (id) ON DELETE SET NULL,
    CONSTRAINT fk_course_session FOREIGN KEY (academic_session_id) REFERENCES academic_sessions (id) ON DELETE SET NULL,
    INDEX idx_course_code (code),
    INDEX idx_course_dept (department_id),
    INDEX idx_course_faculty (faculty_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Enrollments Table
CREATE TABLE IF NOT EXISTS enrollments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    academic_session_id BIGINT NULL,
    enrolled_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    CONSTRAINT fk_enroll_student FOREIGN KEY (student_id) REFERENCES student_profiles (id) ON DELETE CASCADE,
    CONSTRAINT fk_enroll_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    CONSTRAINT fk_enroll_session FOREIGN KEY (academic_session_id) REFERENCES academic_sessions (id) ON DELETE SET NULL,
    CONSTRAINT uk_student_course UNIQUE (student_id, course_id),
    INDEX idx_enroll_student (student_id),
    INDEX idx_enroll_course (course_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Attendance Records Table
CREATE TABLE IF NOT EXISTS attendance_records (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_id BIGINT NOT NULL,
    course_id BIGINT NOT NULL,
    faculty_id BIGINT NULL,
    attendance_date DATE NOT NULL,
    session_name VARCHAR(50) NOT NULL DEFAULT 'Session 1',
    status VARCHAR(20) NOT NULL,
    remarks VARCHAR(255) NULL,
    recorded_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_att_student FOREIGN KEY (student_id) REFERENCES student_profiles (id) ON DELETE CASCADE,
    CONSTRAINT fk_att_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    CONSTRAINT fk_att_faculty FOREIGN KEY (faculty_id) REFERENCES faculty_profiles (id) ON DELETE SET NULL,
    CONSTRAINT uk_student_course_date_session UNIQUE (student_id, course_id, attendance_date, session_name),
    INDEX idx_att_student (student_id),
    INDEX idx_att_course (course_id),
    INDEX idx_att_date (attendance_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Examinations Table
CREATE TABLE IF NOT EXISTS examinations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    course_id BIGINT NOT NULL,
    exam_date DATE NOT NULL,
    max_marks DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
    exam_type VARCHAR(50) NOT NULL DEFAULT 'MIDTERM',
    is_published BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_exam_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    INDEX idx_exam_course (course_id),
    INDEX idx_exam_date (exam_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Marks Table
CREATE TABLE IF NOT EXISTS marks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    examination_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    marks_obtained DECIMAL(5, 2) NOT NULL,
    remarks VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_marks_exam FOREIGN KEY (examination_id) REFERENCES examinations (id) ON DELETE CASCADE,
    CONSTRAINT fk_marks_student FOREIGN KEY (student_id) REFERENCES student_profiles (id) ON DELETE CASCADE,
    CONSTRAINT uk_exam_student UNIQUE (examination_id, student_id),
    INDEX idx_marks_student (student_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    course_id BIGINT NOT NULL,
    faculty_id BIGINT NULL,
    due_date DATETIME NOT NULL,
    max_marks DECIMAL(5, 2) NOT NULL DEFAULT 100.00,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_assign_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    CONSTRAINT fk_assign_faculty FOREIGN KEY (faculty_id) REFERENCES faculty_profiles (id) ON DELETE SET NULL,
    INDEX idx_assign_course (course_id),
    INDEX idx_assign_due (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Submissions Table
CREATE TABLE IF NOT EXISTS submissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    assignment_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    submission_text TEXT NULL,
    file_url VARCHAR(500) NULL,
    submitted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    marks_obtained DECIMAL(5, 2) NULL,
    feedback TEXT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
    CONSTRAINT fk_sub_assignment FOREIGN KEY (assignment_id) REFERENCES assignments (id) ON DELETE CASCADE,
    CONSTRAINT fk_sub_student FOREIGN KEY (student_id) REFERENCES student_profiles (id) ON DELETE CASCADE,
    CONSTRAINT uk_assignment_student UNIQUE (assignment_id, student_id),
    INDEX idx_sub_student (student_id),
    INDEX idx_sub_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 13. Notices Table
CREATE TABLE IF NOT EXISTS notices (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    audience VARCHAR(30) NOT NULL DEFAULT 'ALL',
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_by BIGINT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_notice_creator FOREIGN KEY (created_by) REFERENCES users (id) ON DELETE CASCADE,
    INDEX idx_notice_audience (audience),
    INDEX idx_notice_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 14. Placement Drives Table
CREATE TABLE IF NOT EXISTS placement_drives (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    job_title VARCHAR(150) NOT NULL,
    job_description TEXT NOT NULL,
    eligibility_criteria TEXT NULL,
    min_cgpa DECIMAL(4, 2) NOT NULL DEFAULT 0.00,
    package_details VARCHAR(100) NULL,
    deadline DATETIME NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_placement_active (is_active),
    INDEX idx_placement_deadline (deadline)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 15. Placement Applications Table
CREATE TABLE IF NOT EXISTS placement_applications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    placement_drive_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) NOT NULL DEFAULT 'APPLIED',
    remarks VARCHAR(255) NULL,
    CONSTRAINT fk_app_drive FOREIGN KEY (placement_drive_id) REFERENCES placement_drives (id) ON DELETE CASCADE,
    CONSTRAINT fk_app_student FOREIGN KEY (student_id) REFERENCES student_profiles (id) ON DELETE CASCADE,
    CONSTRAINT uk_drive_student UNIQUE (placement_drive_id, student_id),
    INDEX idx_app_student (student_id),
    INDEX idx_app_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
