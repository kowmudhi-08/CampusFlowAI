package com.campusflow.dto;

import jakarta.validation.constraints.NotNull;

public class CreateSubmissionRequest {

    @NotNull(message = "Assignment ID is required")
    private Long assignmentId;

    private String submissionText;
    private String fileUrl;

    public CreateSubmissionRequest() {
    }

    public Long getAssignmentId() {
        return assignmentId;
    }

    public void setAssignmentId(Long assignmentId) {
        this.assignmentId = assignmentId;
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
}
