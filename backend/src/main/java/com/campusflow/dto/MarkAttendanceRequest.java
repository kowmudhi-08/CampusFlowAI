package com.campusflow.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;
import java.util.List;

public class MarkAttendanceRequest {

    @NotNull(message = "Course ID is required")
    private Long courseId;

    @NotNull(message = "Attendance date is required")
    private LocalDate attendanceDate;

    private String sessionName = "Session 1";

    @NotEmpty(message = "Attendance items cannot be empty")
    @Valid
    private List<StudentAttendanceItem> attendanceItems;

    public MarkAttendanceRequest() {
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public LocalDate getAttendanceDate() {
        return attendanceDate;
    }

    public void setAttendanceDate(LocalDate attendanceDate) {
        this.attendanceDate = attendanceDate;
    }

    public String getSessionName() {
        return sessionName;
    }

    public void setSessionName(String sessionName) {
        this.sessionName = sessionName;
    }

    public List<StudentAttendanceItem> getAttendanceItems() {
        return attendanceItems;
    }

    public void setAttendanceItems(List<StudentAttendanceItem> attendanceItems) {
        this.attendanceItems = attendanceItems;
    }

    public List<StudentAttendanceItem> getRecords() {
        return attendanceItems;
    }

    public void setRecords(List<StudentAttendanceItem> records) {
        this.attendanceItems = records;
    }
}
