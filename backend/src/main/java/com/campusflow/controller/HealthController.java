package com.campusflow.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health Check", description = "System health check and diagnostic status")
public class HealthController {

    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> getHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("application", "CampusFlow AI Backend");
        health.put("version", "1.0.0");
        health.put("timestamp", LocalDateTime.now().toString());

        boolean dbOk = false;
        try (Connection conn = dataSource.getConnection()) {
            dbOk = conn.isValid(2);
        } catch (Exception ignored) {
        }
        health.put("database", dbOk ? "CONNECTED" : "DISCONNECTED");

        return ResponseEntity.ok(health);
    }
}
