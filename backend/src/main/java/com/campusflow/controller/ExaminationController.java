package com.campusflow.controller;

import com.campusflow.dto.*;
import com.campusflow.service.ExaminationService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/examinations")
@Tag(name = "Examinations", description = "Examinations, marks entry, and result publishing")
public class ExaminationController {

    private final ExaminationService examinationService;

    public ExaminationController(ExaminationService examinationService) {
        this.examinationService = examinationService;
    }

    @GetMapping
    public ResponseEntity<List<ExaminationDto>> getAllExaminations() {
        return ResponseEntity.ok(examinationService.getAllExaminations());
    }

    @GetMapping("/published")
    public ResponseEntity<List<ExaminationDto>> getPublishedExaminations() {
        return ResponseEntity.ok(examinationService.getPublishedExaminations());
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ExaminationDto>> getExaminationsByCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(examinationService.getExaminationsByCourse(courseId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExaminationDto> getExaminationById(@PathVariable Long id) {
        return ResponseEntity.ok(examinationService.getExaminationById(id));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ExaminationDto> createExamination(@Valid @RequestBody CreateExamRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(examinationService.createExamination(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ExaminationDto> updateExamination(@PathVariable Long id, @Valid @RequestBody CreateExamRequest request) {
        return ResponseEntity.ok(examinationService.updateExamination(id, request));
    }

    @PutMapping("/{id}/publish")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<ExaminationDto> publishExamination(@PathVariable Long id, @RequestParam boolean published) {
        return ResponseEntity.ok(examinationService.publishExamination(id, published));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<Map<String, String>> deleteExamination(@PathVariable Long id) {
        examinationService.deleteExamination(id);
        return ResponseEntity.ok(Map.of("message", "Examination deleted successfully"));
    }

    @PostMapping("/marks")
    @PreAuthorize("hasAnyRole('FACULTY', 'ADMIN')")
    public ResponseEntity<List<MarkDto>> enterMarks(@Valid @RequestBody EnterMarksRequest request) {
        return ResponseEntity.ok(examinationService.enterMarks(request));
    }

    @GetMapping("/{id}/marks")
    public ResponseEntity<List<MarkDto>> getMarksByExamination(@PathVariable Long id) {
        return ResponseEntity.ok(examinationService.getMarksByExamination(id));
    }

    @GetMapping("/student/{studentId}/marks")
    public ResponseEntity<List<MarkDto>> getMarksByStudent(
            @PathVariable Long studentId,
            @RequestParam(defaultValue = "false") boolean onlyPublished
    ) {
        return ResponseEntity.ok(examinationService.getMarksByStudent(studentId, onlyPublished));
    }
}
