package com.campusflow.dto;

import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public class UpdateStudentRequest {

    @Size(min = 2, max = 150)
    private String fullName;

    private String rollNumber;
    private Long departmentId;
    private Integer batchYear;
    private String phone;
    private String address;
    private BigDecimal cgpa;
    private Boolean active;

    public UpdateStudentRequest() {
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public Integer getBatchYear() {
        return batchYear;
    }

    public void setBatchYear(Integer batchYear) {
        this.batchYear = batchYear;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public BigDecimal getCgpa() {
        return cgpa;
    }

    public void setCgpa(BigDecimal cgpa) {
        this.cgpa = cgpa;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
