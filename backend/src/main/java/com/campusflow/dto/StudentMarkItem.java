package com.campusflow.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class StudentMarkItem {

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Marks obtained is required")
    @DecimalMin(value = "0.0", message = "Marks cannot be negative")
    private BigDecimal marksObtained;

    private String remarks;

    public StudentMarkItem() {
    }

    public StudentMarkItem(Long studentId, BigDecimal marksObtained, String remarks) {
        this.studentId = studentId;
        this.marksObtained = marksObtained;
        this.remarks = remarks;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public BigDecimal getMarksObtained() {
        return marksObtained;
    }

    public void setMarksObtained(BigDecimal marksObtained) {
        this.marksObtained = marksObtained;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
