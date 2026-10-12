package com.campusflow.dto;

import jakarta.validation.constraints.NotNull;

public class EnrollRequest {

    @NotNull(message = "Student ID is required")
    private Long studentId;

    @NotNull(message = "Course ID is required")
    private Long courseId;

    private Long academicSessionId;

    public EnrollRequest() {
    }

    public EnrollRequest(Long studentId, Long courseId, Long academicSessionId) {
        this.studentId = studentId;
        this.courseId = courseId;
        this.academicSessionId = academicSessionId;
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public Long getAcademicSessionId() {
        return academicSessionId;
    }

    public void setAcademicSessionId(Long academicSessionId) {
        this.academicSessionId = academicSessionId;
    }
}
