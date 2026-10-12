package com.campusflow.dto;

import com.campusflow.entity.Role;

public class AuthResponse {
    private String token;
    private String type = "Bearer";
    private Long userId;
    private String fullName;
    private String email;
    private Role role;
    private Long profileId;

    public AuthResponse() {
    }

    public AuthResponse(String token, Long userId, String fullName, String email, Role role, Long profileId) {
        this.token = token;
        this.type = "Bearer";
        this.userId = userId;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.profileId = profileId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }

    public Long getProfileId() {
        return profileId;
    }

    public void setProfileId(Long profileId) {
        this.profileId = profileId;
    }
}
