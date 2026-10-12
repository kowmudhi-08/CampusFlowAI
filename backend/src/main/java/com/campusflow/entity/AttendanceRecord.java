package com.campusflow.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "attendance_records", uniqueConstraints = {
    @UniqueConstraint(name = "uk_student_course_date_session", columnNames = {"student_id", "course_id", "attendance_date", "session_name"})
})
public class AttendanceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "faculty_id")
    private FacultyProfile faculty;

    @Column(name = "attendance_date", nullable = false)
    private LocalDate attendanceDate;

    @Column(name = "session_name", nullable = false, length = 50)
    private String sessionName = "Session 1";

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AttendanceStatus status;

    @Column(length = 255)
    private String remarks;

    @Column(name = "recorded_at", nullable = false, updatable = false)
    private LocalDateTime recordedAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public AttendanceRecord() {
    }

    public AttendanceRecord(StudentProfile student, Course course, FacultyProfile faculty, LocalDate attendanceDate, String sessionName, AttendanceStatus status, String remarks) {
        this.student = student;
        this.course = course;
        this.faculty = faculty;
        this.attendanceDate = attendanceDate;
        this.sessionName = sessionName != null ? sessionName : "Session 1";
        this.status = status;
        this.remarks = remarks;
    }

    @PrePersist
    protected void onCreate() {
        this.recordedAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public StudentProfile getStudent() {
        return student;
    }

    public void setStudent(StudentProfile student) {
        this.student = student;
    }

    public Course getCourse() {
        return course;
    }

    public void setCourse(Course course) {
        this.course = course;
    }

    public FacultyProfile getFaculty() {
        return faculty;
    }

    public void setFaculty(FacultyProfile faculty) {
        this.faculty = faculty;
    }

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(LocalDate attendanceDate) {
        this.attendanceDate = attendanceDate;
    }

    public String getSessionName() {
        return sessionName;
    }

    public void setSessionName(String sessionName) {
        this.sessionName = sessionName;
    }

    public AttendanceStatus getStatus() {
        return status;
    }

    public void setStatus(AttendanceStatus status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }

    public LocalDateTime getRecordedAt() {
        return recordedAt;
    }

    public void setRecordedAt(LocalDateTime recordedAt) {
        this.recordedAt = recordedAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
