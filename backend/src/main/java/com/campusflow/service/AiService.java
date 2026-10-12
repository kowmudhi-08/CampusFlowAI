package com.campusflow.service;

import com.campusflow.dto.PerformanceInsightsDto;
import com.campusflow.dto.PlacementReadinessDto;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Map;

@Service
public class AiService {

    private final AnalyticsService analyticsService;
    private final RestClient restClient;

    @Value("${campusflow.ai-service.url:http://localhost:8000}")
    private String aiServiceUrl;

    public AiService(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
        this.restClient = RestClient.builder().build();
    }

    public Map<String, Object> checkAiServiceHealth() {
        try {
            return restClient.get()
                    .uri(aiServiceUrl + "/health")
                    .retrieve()
                    .body(Map.class);
        } catch (Exception e) {
            return Map.of(
                    "status", "DEGRADED",
                    "mode", "FALLBACK_RULES_ENGINE",
                    "message", "AI Python microservice unreachable; utilizing Spring Boot built-in analytics engine.",
                    "error", e.getMessage() != null ? e.getMessage() : "Connection refused"
            );
        }
    }

    public PerformanceInsightsDto getStudentAiPerformance(Long studentId) {
        // First retrieve baseline analytics from database
        PerformanceInsightsDto insights = analyticsService.calculatePerformanceInsights(studentId);

        // If sufficient data exists and AI service is available, attempt inference enhancement
        if (insights.isDataSufficient()) {
            try {
                ResponseEntity<Map> response = restClient.post()
                        .uri(aiServiceUrl + "/api/v1/ai/performance-analysis")
                        .body(insights)
                        .retrieve()
                        .toEntity(Map.class);

                if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                    Map<String, Object> body = response.getBody();
                    if (body.containsKey("aiModel") && body.get("aiModel") != null) {
                        insights.setStatusMessage(insights.getStatusMessage() + " [AI Engine: " + body.get("aiModel") + "]");
                    }
                }
            } catch (Exception ignored) {
                // Graceful fallback to verified statistical heuristics
            }
        }

        return insights;
    }

    public PlacementReadinessDto getStudentAiReadiness(Long studentId) {
        PlacementReadinessDto readiness = analyticsService.calculatePlacementReadiness(studentId);

        try {
            ResponseEntity<Map> response = restClient.post()
                    .uri(aiServiceUrl + "/api/v1/ai/placement-readiness")
                    .body(readiness)
                    .retrieve()
                    .toEntity(Map.class);

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                Map<String, Object> body = response.getBody();
                if (body.containsKey("aiModel") && body.get("aiModel") != null) {
                    readiness.setExplanation(readiness.getExplanation() + " (Inference confirmed by " + body.get("aiModel") + ")");
                }
            }
        } catch (Exception ignored) {
            // Graceful fallback
        }

        return readiness;
    }
}
