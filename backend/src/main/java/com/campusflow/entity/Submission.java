package com.campusflow.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "submissions", uniqueConstraints = {
    @UniqueConstraint(name = "uk_assignment_student", columnNames = {"assignment_id", "student_id"})
})
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "assignment_id", nullable = false)
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @Column(name = "submission_text", columnDefinition = "TEXT")
    private String submissionText;

    @Column(name = "file_url", length = 500)
    private String fileUrl;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @Column(name = "marks_obtained", precision = 5, scale = 2)
    private BigDecimal marksObtained;

    @Column(columnDefinition = "TEXT")
    private String feedback;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private SubmissionStatus status = SubmissionStatus.SUBMITTED;

    public Submission() {
    }

    public Submission(Assignment assignment, StudentProfile student, String submissionText, String fileUrl) {
        this.assignment = assignment;
        this.student = student;
        this.submissionText = submissionText;
        this.fileUrl = fileUrl;
        this.status = SubmissionStatus.SUBMITTED;
    }

    @PrePersist
    protected void onCreate() {
        this.submittedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = SubmissionStatus.SUBMITTED;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Assignment getAssignment() {
        return assignment;
    }

    public void setAssignment(Assignment assignment) {
        this.assignment = assignment;
    }

    public StudentProfile getStudent() {
        return student;
    }

    public void setStudent(StudentProfile student) {
        this.student = student;
    }

    public String getSubmissionText() {
        return submissionText;
    }

    public void setSubmissionText(String submissionText) {
        this.submissionText = submissionText;
    }

    public String getFileUrl() {
        return fileUrl;
    }

    public void setFileUrl(String fileUrl) {
        this.fileUrl = fileUrl;
    }

    public LocalDateTime getSubmittedAt() {
        return submittedAt;
    }

    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public BigDecimal getMarksObtained() {
        return marksObtained;
    }

    public void setMarksObtained(BigDecimal marksObtained) {
        this.marksObtained = marksObtained;
    }

    public String getFeedback() {
        return feedback;
    }

    public void setFeedback(String feedback) {
        this.feedback = feedback;
    }

    public SubmissionStatus getStatus() {
        return status;
    }

    public void setStatus(SubmissionStatus status) {
        this.status = status;
    }
}
