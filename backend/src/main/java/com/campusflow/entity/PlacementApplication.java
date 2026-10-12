package com.campusflow.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "placement_applications", uniqueConstraints = {
    @UniqueConstraint(name = "uk_drive_student", columnNames = {"placement_drive_id", "student_id"})
})
public class PlacementApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "placement_drive_id", nullable = false)
    private PlacementDrive placementDrive;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "student_id", nullable = false)
    private StudentProfile student;

    @Column(name = "applied_at", nullable = false, updatable = false)
    private LocalDateTime appliedAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    @Column(length = 255)
    private String remarks;

    public PlacementApplication() {
    }

    public PlacementApplication(PlacementDrive placementDrive, StudentProfile student, String remarks) {
        this.placementDrive = placementDrive;
        this.student = student;
        this.remarks = remarks;
        this.status = ApplicationStatus.APPLIED;
    }

    @PrePersist
    protected void onCreate() {
        this.appliedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = ApplicationStatus.APPLIED;
        }
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public PlacementDrive getPlacementDrive() {
        return placementDrive;
    }

    public void setPlacementDrive(PlacementDrive placementDrive) {
        this.placementDrive = placementDrive;
    }

    public StudentProfile getStudent() {
        return student;
    }

    public void setStudent(StudentProfile student) {
        this.student = student;
    }

    public LocalDateTime getAppliedAt() {
        return appliedAt;
    }

    public void setAppliedAt(LocalDateTime appliedAt) {
        this.appliedAt = appliedAt;
    }

    public ApplicationStatus getStatus() {
        return status;
    }

    public void setStatus(ApplicationStatus status) {
        this.status = status;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
