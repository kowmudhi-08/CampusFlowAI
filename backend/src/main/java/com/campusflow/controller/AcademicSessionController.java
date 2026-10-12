package com.campusflow.controller;

import com.campusflow.dto.AcademicSessionDto;
import com.campusflow.service.AcademicSessionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/academic-sessions")
@Tag(name = "Academic Sessions", description = "Semester and academic year term management")
public class AcademicSessionController {

    private final AcademicSessionService sessionService;

    public AcademicSessionController(AcademicSessionService sessionService) {
        this.sessionService = sessionService;
    }

    @GetMapping
    public ResponseEntity<List<AcademicSessionDto>> getAllSessions() {
        return ResponseEntity.ok(sessionService.getAllSessions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<AcademicSessionDto> getSessionById(@PathVariable Long id) {
        return ResponseEntity.ok(sessionService.getSessionById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AcademicSessionDto> createSession(@Valid @RequestBody AcademicSessionDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(sessionService.createSession(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AcademicSessionDto> updateSession(@PathVariable Long id, @Valid @RequestBody AcademicSessionDto dto) {
        return ResponseEntity.ok(sessionService.updateSession(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteSession(@PathVariable Long id) {
        sessionService.deleteSession(id);
        return ResponseEntity.ok(Map.of("message", "Academic session deleted successfully"));
    }
}
