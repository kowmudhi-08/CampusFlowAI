package com.campusflow.dto;

import jakarta.validation.constraints.NotNull;

public class ApplyPlacementRequest {

    @NotNull(message = "Placement drive ID is required")
    private Long placementDriveId;

    private String remarks;

    public ApplyPlacementRequest() {
    }

    public ApplyPlacementRequest(Long placementDriveId, String remarks) {
        this.placementDriveId = placementDriveId;
        this.remarks = remarks;
    }

    public Long getPlacementDriveId() {
        return placementDriveId;
    }

    public void setPlacementDriveId(Long placementDriveId) {
        this.placementDriveId = placementDriveId;
    }

    public String getRemarks() {
        return remarks;
    }

    public void setRemarks(String remarks) {
        this.remarks = remarks;
    }
}
