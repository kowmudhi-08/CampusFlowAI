package com.campusflow.controller;

import com.campusflow.dto.*;
import com.campusflow.entity.Role;
import com.campusflow.entity.StudentProfile;
import com.campusflow.exception.ForbiddenException;
import com.campusflow.repository.StudentProfileRepository;
import com.campusflow.security.SecurityUtils;
import com.campusflow.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/students")
@Tag(name = "Students", description = "Student management and student dashboard personal academic endpoints")
public class StudentController {

    private final StudentService studentService;
    private final StudentProfileRepository studentProfileRepository;
    private final EnrollmentService enrollmentService;
    private final AttendanceService attendanceService;
    private final ExaminationService examinationService;
    private final AssignmentService assignmentService;
    private final PlacementService placementService;
    private final AnalyticsService analyticsService;

    public StudentController(
            StudentService studentService,
            StudentProfileRepository studentProfileRepository,
            EnrollmentService enrollmentService,
            AttendanceService attendanceService,
            ExaminationService examinationService,
            AssignmentService assignmentService,
            PlacementService placementService,
            AnalyticsService analyticsService
    ) {
        this.studentService = studentService;
        this.studentProfileRepository = studentProfileRepository;
        this.enrollmentService = enrollmentService;
        this.attendanceService = attendanceService;
        this.examinationService = examinationService;
        this.assignmentService = assignmentService;
        this.placementService = placementService;
        this.analyticsService = analyticsService;
    }

    private Long getCurrentStudentProfileId() {
        Long userId = SecurityUtils.getCurrentUserId();
        return studentProfileRepository.findByUserId(userId)
                .map(StudentProfile::getId)
                .orElseThrow(() -> new ForbiddenException("Authenticated user does not have a student profile"));
    }

    @GetMapping
    public ResponseEntity<List<StudentDto>> getAllStudents(
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) String search
    ) {
        return ResponseEntity.ok(studentService.getAllStudents(departmentId, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<StudentDto> getStudentById(@PathVariable Long id) {
        // Enforce RBAC: If student, they can only view their own record
        if (SecurityUtils.getCurrentUserRole() == Role.STUDENT) {
            Long profileId = getCurrentStudentProfileId();
            if (!profileId.equals(id)) {
                throw new ForbiddenException("Students may only view their own academic profile");
            }
        }
        return ResponseEntity.ok(studentService.getStudentById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StudentDto> createStudent(@Valid @RequestBody CreateStudentRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(studentService.createStudent(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<StudentDto> updateStudent(@PathVariable Long id, @Valid @RequestBody UpdateStudentRequest request) {
        return ResponseEntity.ok(studentService.updateStudent(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteStudent(@PathVariable Long id) {
        studentService.deleteStudent(id);
        return ResponseEntity.ok(Map.of("message", "Student deleted successfully"));
    }

    // Student self-service endpoints
    @GetMapping("/me/courses")
    public ResponseEntity<List<EnrollmentDto>> getMyEnrolledCourses() {
        Long profileId = getCurrentStudentProfileId();
        return ResponseEntity.ok(enrollmentService.getEnrollmentsByStudent(profileId));
    }

    @GetMapping("/me/attendance")
    public ResponseEntity<List<AttendanceSummaryDto>> getMyAttendanceSummaries() {
        Long profileId = getCurrentStudentProfileId();
        return ResponseEntity.ok(attendanceService.getStudentAttendanceSummaries(profileId));
    }

    @GetMapping("/me/attendance/history")
    public ResponseEntity<List<AttendanceRecordDto>> getMyAttendanceHistory() {
        Long profileId = getCurrentStudentProfileId();
        return ResponseEntity.ok(attendanceService.getAttendanceByStudent(profileId));
    }

    @GetMapping("/me/marks")
    public ResponseEntity<List<MarkDto>> getMyMarks() {
        Long profileId = getCurrentStudentProfileId();
        return ResponseEntity.ok(examinationService.getMarksByStudent(profileId, true));
    }

    @GetMapping("/me/submissions")
    public ResponseEntity<List<SubmissionDto>> getMySubmissions() {
        Long profileId = getCurrentStudentProfileId();
        return ResponseEntity.ok(assignmentService.getSubmissionsByStudent(profileId));
    }

    @GetMapping("/me/applications")
    public ResponseEntity<List<PlacementApplicationDto>> getMyPlacementApplications() {
        Long profileId = getCurrentStudentProfileId();
        return ResponseEntity.ok(placementService.getApplicationsForStudent(profileId));
    }

    @GetMapping("/me/performance-insights")
    public ResponseEntity<PerformanceInsightsDto> getMyPerformanceInsights() {
        Long profileId = getCurrentStudentProfileId();
        return ResponseEntity.ok(analyticsService.calculatePerformanceInsights(profileId));
    }

    @GetMapping("/me/placement-readiness")
    public ResponseEntity<PlacementReadinessDto> getMyPlacementReadiness() {
        Long profileId = getCurrentStudentProfileId();
        return ResponseEntity.ok(analyticsService.calculatePlacementReadiness(profileId));
    }
}
