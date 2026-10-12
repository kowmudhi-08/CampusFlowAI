package com.campusflow.controller;

import com.campusflow.dto.*;
import com.campusflow.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@Tag(name = "Authentication", description = "Endpoints for Admin Setup, Registration, Login, and Profile Management")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/admin-setup-status")
    @Operation(summary = "Check if initial Admin setup is needed", description = "Returns true if no administrator exists yet")
    public ResponseEntity<AdminSetupStatusResponse> checkAdminSetupStatus() {
        return ResponseEntity.ok(authService.checkAdminSetupStatus());
    }

    @PostMapping("/setup-admin")
    @Operation(summary = "Setup initial Administrator", description = "Allowed exactly ONCE when no administrator exists")
    public ResponseEntity<AuthResponse> setupInitialAdmin(@Valid @RequestBody SetupAdminRequest request) {
        AuthResponse response = authService.setupInitialAdmin(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/register")
    @Operation(summary = "Register student or faculty account", description = "Public registration for STUDENT or FACULTY only")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    @Operation(summary = "Authenticate user and issue JWT", description = "Validates credentials against MySQL and returns JWT token with verified role")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<UserProfileResponse> getCurrentUser() {
        return ResponseEntity.ok(authService.getCurrentUserProfile());
    }

    @PutMapping("/me")
    @Operation(summary = "Update permitted profile information")
    public ResponseEntity<UserProfileResponse> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        return ResponseEntity.ok(authService.updateProfile(request));
    }

    @PostMapping("/change-password")
    @Operation(summary = "Change authenticated user password")
    public ResponseEntity<Map<String, String>> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        authService.changePassword(request);
        return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
    }

    @PostMapping("/logout")
    @Operation(summary = "Logout user and invalidate session")
    public ResponseEntity<Map<String, String>> logout() {
        return ResponseEntity.ok(Map.of("message", "Logged out successfully"));
    }
}
