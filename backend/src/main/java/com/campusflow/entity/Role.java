package com.campusflow.entity;

import com.fasterxml.jackson.annotation.JsonCreator;

public enum Role {
    ADMIN,
    FACULTY,
    STUDENT;

    @JsonCreator
    public static Role fromString(String value) {
        if (value == null) {
            return null;
        }
        for (Role role : Role.values()) {
            if (role.name().equalsIgnoreCase(value.trim())) {
                return role;
            }
        }
        throw new IllegalArgumentException("Invalid role: " + value + ". Permitted roles are: STUDENT, FACULTY");
    }
}
