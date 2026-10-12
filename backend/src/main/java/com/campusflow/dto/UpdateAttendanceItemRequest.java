package com.campusflow.dto;

import com.campusflow.entity.AttendanceStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateAttendanceItemRequest {

    @NotNull(message = "Status is required")
    private AttendanceStatus status;

    private String remarks;

    public UpdateAttendanceItemRequest() {
    }

    public UpdateAttendanceItemRequest(AttendanceStatus status, String remarks) {
        this.status = status;
        this.remarks = remarks;
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
}
