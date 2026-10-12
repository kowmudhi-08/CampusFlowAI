package com.campusflow.controller;

import com.campusflow.dto.EnrollRequest;
import com.campusflow.dto.EnrollmentDto;
import com.campusflow.service.EnrollmentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/enrollments")
@Tag(name = "Enrollments", description = "Student course enrollment management")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @GetMapping
    public ResponseEntity<List<EnrollmentDto>> getAllEnrollments() {
        return ResponseEntity.ok(enrollmentService.getAllEnrollments());
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<List<EnrollmentDto>> getEnrollmentsByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByStudent(studentId));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<EnrollmentDto>> getEnrollmentsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByCourse(courseId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EnrollmentDto> enrollStudent(@Valid @RequestBody EnrollRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(enrollmentService.enrollStudent(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> unenrollStudent(@PathVariable Long id) {
        enrollmentService.unenrollStudent(id);
        return ResponseEntity.ok(Map.of("message", "Enrollment removed successfully"));
    }
}
