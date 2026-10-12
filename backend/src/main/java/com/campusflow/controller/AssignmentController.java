package com.campusflow.controller;

import com.campusflow.dto.*;
import com.campusflow.service.AssignmentService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/assignments")
@Tag(name = "Assignments", description = "Course assignments, student submissions, and grading")
public class AssignmentController {

    private final AssignmentService assignmentService;

    public AssignmentController(AssignmentService assignmentService) {
        this.assignmentService = assignmentService;
    }

    @GetMapping
    public ResponseEntity<List<AssignmentDto>> getAllAssignments() {
        return ResponseEntity.ok(assignmentService.getAllAssignments());
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<AssignmentDto>> getAssignmentsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(assignmentService.getAssignmentsByCourse(courseId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssignmentDto> getAssignmentById(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getAssignmentById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<AssignmentDto> createAssignment(@Valid @RequestBody CreateAssignmentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assignmentService.createAssignment(request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<Map<String, String>> deleteAssignment(@PathVariable Long id) {
        assignmentService.deleteAssignment(id);
        return ResponseEntity.ok(Map.of("message", "Assignment deleted successfully"));
    }

    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<SubmissionDto> submitAssignment(@Valid @RequestBody CreateSubmissionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(assignmentService.submitAssignment(request));
    }

    @GetMapping("/{id}/submissions")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<List<SubmissionDto>> getSubmissionsByAssignment(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getSubmissionsByAssignment(id));
    }

    @GetMapping("/student/{studentId}/submissions")
    public ResponseEntity<List<SubmissionDto>> getSubmissionsByStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(assignmentService.getSubmissionsByStudent(studentId));
    }

    @PutMapping("/submissions/{submissionId}/grade")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<SubmissionDto> gradeSubmission(
            @PathVariable Long submissionId,
            @Valid @RequestBody GradeSubmissionRequest request
    ) {
        return ResponseEntity.ok(assignmentService.gradeSubmission(submissionId, request));
    }
}
