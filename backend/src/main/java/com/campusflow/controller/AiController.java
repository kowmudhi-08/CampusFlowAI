package com.campusflow.controller;

import com.campusflow.dto.PerformanceInsightsDto;
import com.campusflow.dto.PlacementReadinessDto;
import com.campusflow.service.AiService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ai")
@Tag(name = "AI Service", description = "AI microservice integration and machine learning inference proxy")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> getAiHealth() {
        return ResponseEntity.ok(aiService.checkAiServiceHealth());
    }

    @GetMapping("/student/{studentId}/performance")
    public ResponseEntity<PerformanceInsightsDto> getStudentAiPerformance(@PathVariable Long studentId) {
        return ResponseEntity.ok(aiService.getStudentAiPerformance(studentId));
    }

    @GetMapping("/student/{studentId}/readiness")
    public ResponseEntity<PlacementReadinessDto> getStudentAiReadiness(@PathVariable Long studentId) {
        return ResponseEntity.ok(aiService.getStudentAiReadiness(studentId));
    }
}
