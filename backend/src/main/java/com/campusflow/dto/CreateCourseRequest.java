package com.campusflow.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class CreateCourseRequest {

    @NotBlank(message = "Course code is required")
    @Size(min = 2, max = 50)
    private String code;

    @NotBlank(message = "Course title is required")
    @Size(min = 2, max = 200)
    private String title;

    private String description;

    @NotNull(message = "Credits are required")
    @Min(value = 1, message = "Credits must be at least 1")
    private Integer credits;

    private Long departmentId;
    private Long facultyId;
    private Long academicSessionId;

    @NotNull(message = "Semester is required")
    @Min(value = 1, message = "Semester must be at least 1")
    private Integer semester;

    public CreateCourseRequest() {
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getCredits() {
        return credits;
    }

    public void setCredits(Integer credits) {
        this.credits = credits;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public Long getFacultyId() {
        return facultyId;
    }

    public void setFacultyId(Long facultyId) {
        this.facultyId = facultyId;
    }

    public Long getAcademicSessionId() {
        return academicSessionId;
    }

    public void setAcademicSessionId(Long academicSessionId) {
        this.academicSessionId = academicSessionId;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }
}
