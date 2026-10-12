package com.campusflow.controller;

import com.campusflow.dto.DashboardMetricsDto;
import com.campusflow.dto.PerformanceInsightsDto;
import com.campusflow.dto.PlacementReadinessDto;
import com.campusflow.service.AnalyticsService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/analytics")
@Tag(name = "Analytics", description = "Institutional metrics and descriptive academic insights")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @GetMapping("/metrics")
    public ResponseEntity<DashboardMetricsDto> getDashboardMetrics() {
        return ResponseEntity.ok(analyticsService.getDashboardMetrics());
    }

    @GetMapping("/student/{studentId}/insights")
    public ResponseEntity<PerformanceInsightsDto> getStudentInsights(@PathVariable Long studentId) {
        return ResponseEntity.ok(analyticsService.calculatePerformanceInsights(studentId));
    }

    @GetMapping("/student/{studentId}/readiness")
    public ResponseEntity<PlacementReadinessDto> getStudentReadiness(@PathVariable Long studentId) {
        return ResponseEntity.ok(analyticsService.calculatePlacementReadiness(studentId));
    }
}
