package com.campusflow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class DepartmentDto {
    private Long id;

    @NotBlank(message = "Department name is required")
    @Size(min = 2, max = 150)
    private String name;

    @NotBlank(message = "Department code is required")
    @Size(min = 2, max = 50)
    private String code;

    private String description;

    public DepartmentDto() {
    }

    public DepartmentDto(Long id, String name, String code, String description) {
        this.id = id;
        this.name = name;
        this.code = code;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
