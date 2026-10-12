package com.campusflow.controller;

import com.campusflow.dto.*;
import com.campusflow.service.AttendanceService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@Tag(name = "Attendance", description = "Course attendance marking, correction, and statistical reporting")
public class AttendanceController {

    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @PostMapping("/mark")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<List<AttendanceRecordDto>> markAttendance(@Valid @RequestBody MarkAttendanceRequest request) {
        return ResponseEntity.ok(attendanceService.markAttendance(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<AttendanceRecordDto> updateAttendanceRecord(
            @PathVariable Long id,
            @Valid @RequestBody UpdateAttendanceItemRequest request
    ) {
        return ResponseEntity.ok(attendanceService.updateAttendanceRecord(id, request));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<AttendanceRecordDto>> getAttendanceByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByCourse(courseId));
    }

    @GetMapping("/course/{courseId}/date")
    public ResponseEntity<List<AttendanceRecordDto>> getAttendanceByCourseAndDate(
            @PathVariable Long courseId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return ResponseEntity.ok(attendanceService.getAttendanceByCourseAndDate(courseId, date));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<AttendanceRecordDto>> getAttendanceByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getAttendanceByStudent(studentId));
    }

    @GetMapping("/student/{studentId}/summary")
    public ResponseEntity<List<AttendanceSummaryDto>> getStudentAttendanceSummaries(@PathVariable Long studentId) {
        return ResponseEntity.ok(attendanceService.getStudentAttendanceSummaries(studentId));
    }
}
