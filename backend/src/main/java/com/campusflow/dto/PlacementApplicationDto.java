package com.campusflow.dto;

import com.campusflow.entity.ApplicationStatus;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PlacementApplicationDto {
    private Long id;
    private Long placementDriveId;
    private String companyName;
    private String jobTitle;
    private String packageDetails;
    private Long studentId;
    private String studentName;
    private String studentRollNumber;
    private String studentDepartment;
    private BigDecimal studentCgpa;
    private LocalDateTime appliedAt;
    private ApplicationStatus status;
    private String remarks;

    public PlacementApplicationDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getPlacementDriveId() {
        return placementDriveId;
    }

    public void setPlacementDriveId(Long placementDriveId) {
        this.placementDriveId = placementDriveId;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getJobTitle() {
        return jobTitle;
    }

    public void setJobTitle(String jobTitle) {
        this.jobTitle = jobTitle;
    }

    public String getPackageDetails() {
        return packageDetails;
    }

    public void setPackageDetails(String packageDetails) {
        this.packageDetails = packageDetails;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentRollNumber() {
        return studentRollNumber;
    }

    public void setStudentRollNumber(String studentRollNumber) {
        this.studentRollNumber = studentRollNumber;
    }

    public String getStudentDepartment() {
        return studentDepartment;
    }

    public void setStudentDepartment(String studentDepartment) {
        this.studentDepartment = studentDepartment;
    }

    public BigDecimal getStudentCgpa() {
        return studentCgpa;
    }

    public void setStudentCgpa(BigDecimal studentCgpa) {
        this.studentCgpa = studentCgpa;
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
