package com.campusflow.controller;

import com.campusflow.dto.CourseDto;
import com.campusflow.dto.CreateFacultyRequest;
import com.campusflow.dto.FacultyDto;
import com.campusflow.dto.UpdateFacultyRequest;
import com.campusflow.entity.FacultyProfile;
import com.campusflow.entity.Role;
import com.campusflow.exception.ForbiddenException;
import com.campusflow.repository.FacultyProfileRepository;
import com.campusflow.security.SecurityUtils;
import com.campusflow.service.CourseService;
import com.campusflow.service.FacultyService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/faculty")
@Tag(name = "Faculty", description = "Faculty management and faculty self-service endpoints")
public class FacultyController {

    private final FacultyService facultyService;
    private final FacultyProfileRepository facultyProfileRepository;
    private final CourseService courseService;

    public FacultyController(
            FacultyService facultyService,
            FacultyProfileRepository facultyProfileRepository,
            CourseService courseService
    ) {
        this.facultyService = facultyService;
        this.facultyProfileRepository = facultyProfileRepository;
        this.courseService = courseService;
    }

    private Long getCurrentFacultyProfileId() {
        Long userId = SecurityUtils.getCurrentUserId();
        return facultyProfileRepository.findByUserId(userId)
                .map(FacultyProfile::getId)
                .orElseThrow(() -> new ForbiddenException("Authenticated user does not have a faculty profile"));
    }

    @GetMapping
    public ResponseEntity<List<FacultyDto>> getAllFaculty(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(facultyService.getAllFaculty(departmentId, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<FacultyDto> getFacultyById(@PathVariable Long id) {
        return ResponseEntity.ok(facultyService.getFacultyById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FacultyDto> createFaculty(@Valid @RequestBody CreateFacultyRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(facultyService.createFaculty(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FacultyDto> updateFaculty(@PathVariable Long id, @Valid @RequestBody UpdateFacultyRequest request) {
        return ResponseEntity.ok(facultyService.updateFaculty(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteFaculty(@PathVariable Long id) {
        facultyService.deleteFaculty(id);
        return ResponseEntity.ok(Map.of("message", "Faculty deleted successfully"));
    }

    @GetMapping("/me/courses")
    public ResponseEntity<List<CourseDto>> getMyAssignedCourses() {
        Long profileId = getCurrentFacultyProfileId();
        return ResponseEntity.ok(courseService.getCoursesByFacultyId(profileId));
    }
}
