package com.campusflow.dto;

import com.campusflow.entity.ApplicationStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateApplicationStatusRequest {

    @NotNull(message = "Status is required (APPLIED, SHORTLISTED, REJECTED, SELECTED)")
    private ApplicationStatus status;

    private String remarks;

    public UpdateApplicationStatusRequest() {
    }

    public UpdateApplicationStatusRequest(ApplicationStatus status, String remarks) {
        this.status = status;
        this.remarks = remarks;
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
