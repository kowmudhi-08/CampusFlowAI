package com.campusflow.controller;

import com.campusflow.dto.*;
import com.campusflow.service.PlacementService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/placements")
@Tag(name = "Placements", description = "Campus placement drives, eligibility, and applications")
public class PlacementController {

    private final PlacementService placementService;

    public PlacementController(PlacementService placementService) {
        this.placementService = placementService;
    }

    @GetMapping("/drives")
    public ResponseEntity<List<PlacementDriveDto>> getAllDrives() {
        return ResponseEntity.ok(placementService.getAllDrives());
    }

    @GetMapping("/drives/active")
    public ResponseEntity<List<PlacementDriveDto>> getActiveDrives() {
        return ResponseEntity.ok(placementService.getActiveDrives());
    }

    @GetMapping("/drives/{id}")
    public ResponseEntity<PlacementDriveDto> getDriveById(@PathVariable Long id) {
        return ResponseEntity.ok(placementService.getDriveById(id));
    }

    @PostMapping("/drives")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlacementDriveDto> createPlacementDrive(@Valid @RequestBody CreatePlacementDriveRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(placementService.createPlacementDrive(request));
    }

    @PutMapping("/drives/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlacementDriveDto> updatePlacementDrive(@PathVariable Long id, @Valid @RequestBody CreatePlacementDriveRequest request) {
        return ResponseEntity.ok(placementService.updatePlacementDrive(id, request));
    }

    @DeleteMapping("/drives/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deletePlacementDrive(@PathVariable Long id) {
        placementService.deletePlacementDrive(id);
        return ResponseEntity.ok(Map.of("message", "Placement drive deleted successfully"));
    }

    @PostMapping("/apply")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<PlacementApplicationDto> applyToDrive(@Valid @RequestBody ApplyPlacementRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(placementService.applyToDrive(request));
    }

    @GetMapping("/drives/{id}/applications")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PlacementApplicationDto>> getApplicationsForDrive(@PathVariable Long id) {
        return ResponseEntity.ok(placementService.getApplicationsForDrive(id));
    }

    @GetMapping("/student/{studentId}/applications")
    public ResponseEntity<List<PlacementApplicationDto>> getApplicationsForStudent(@PathVariable Long studentId) {
        return ResponseEntity.ok(placementService.getApplicationsForStudent(studentId));
    }

    @PutMapping("/applications/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PlacementApplicationDto> updateApplicationStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateApplicationStatusRequest request
    ) {
        return ResponseEntity.ok(placementService.updateApplicationStatus(id, request));
    }
}
