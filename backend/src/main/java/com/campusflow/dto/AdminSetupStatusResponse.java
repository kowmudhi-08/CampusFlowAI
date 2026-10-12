package com.campusflow.dto;

public class AdminSetupStatusResponse {
    private boolean setupRequired;
    private String message;

    public AdminSetupStatusResponse() {
    }

    public AdminSetupStatusResponse(boolean setupRequired, String message) {
        this.setupRequired = setupRequired;
        this.message = message;
    }

    public boolean isSetupRequired() {
        return setupRequired;
    }

    public void setSetupRequired(boolean setupRequired) {
        this.setupRequired = setupRequired;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
