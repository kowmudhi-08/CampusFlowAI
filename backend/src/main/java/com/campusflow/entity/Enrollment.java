package com.campusflow.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments", uniqueConstraints = {
    @UniqueConstraint(name = "uk_student_course", columnNames = {"student_id", "course_id"})
})
public class Enrollment {

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
    @JoinColumn(name = "academic_session_id")
    private AcademicSession academicSession;

    @Column(name = "enrolled_at", nullable = false, updatable = false)
    private LocalDateTime enrolledAt;

    @Column(nullable = false, length = 30)
    private String status = "ACTIVE";

    public Enrollment() {
    }

    public Enrollment(StudentProfile student, Course course, AcademicSession academicSession) {
        this.student = student;
        this.course = course;
        this.academicSession = academicSession;
        this.status = "ACTIVE";
    }

    @PrePersist
    protected void onCreate() {
        this.enrolledAt = LocalDateTime.now();
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

    public AcademicSession getAcademicSession() {
        return academicSession;
    }

    public void setAcademicSession(AcademicSession academicSession) {
        this.academicSession = academicSession;
    }

    public LocalDateTime getEnrolledAt() {
        return enrolledAt;
    }

    public void setEnrolledAt(LocalDateTime enrolledAt) {
        this.enrolledAt = enrolledAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
