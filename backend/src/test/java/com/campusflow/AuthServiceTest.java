package com.campusflow;

import com.campusflow.dto.*;
import com.campusflow.entity.*;
import com.campusflow.exception.BadRequestException;
import com.campusflow.exception.ConflictException;
import com.campusflow.exception.UnauthorizedException;
import com.campusflow.repository.*;
import com.campusflow.security.CustomUserDetails;
import com.campusflow.security.JwtService;
import com.campusflow.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentProfileRepository studentProfileRepository;

    @Mock
    private FacultyProfileRepository facultyProfileRepository;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(
                userRepository,
                studentProfileRepository,
                facultyProfileRepository,
                departmentRepository,
                passwordEncoder,
                jwtService
        );
    }

    @Test
    void testCheckAdminSetupStatus_WhenNoAdminExists_ReturnsSetupRequired() {
        when(userRepository.countByRole(Role.ADMIN)).thenReturn(0L);

        AdminSetupStatusResponse response = authService.checkAdminSetupStatus();

        assertTrue(response.isSetupRequired());
        assertEquals("Initial Administrator setup is required", response.getMessage());
    }

    @Test
    void testCheckAdminSetupStatus_WhenAdminExists_ReturnsSetupDisabled() {
        when(userRepository.countByRole(Role.ADMIN)).thenReturn(1L);

        AdminSetupStatusResponse response = authService.checkAdminSetupStatus();

        assertFalse(response.isSetupRequired());
    }

    @Test
    void testSetupInitialAdmin_Success() {
        SetupAdminRequest req = new SetupAdminRequest("System Admin", "admin@campusflow.edu", "Password123!", "Password123!");

        when(userRepository.existsByRole(Role.ADMIN)).thenReturn(false);
        when(userRepository.existsByEmail("admin@campusflow.edu")).thenReturn(false);
        when(passwordEncoder.encode("Password123!")).thenReturn("hashedPassword");

        User savedUser = new User("System Admin", "admin@campusflow.edu", "hashedPassword", Role.ADMIN);
        savedUser.setId(1L);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtService.generateToken(any(CustomUserDetails.class))).thenReturn("mock-jwt-token");

        AuthResponse resp = authService.setupInitialAdmin(req);

        assertNotNull(resp);
        assertEquals("mock-jwt-token", resp.getToken());
        assertEquals(Role.ADMIN, resp.getRole());
        assertEquals("admin@campusflow.edu", resp.getEmail());
    }

    @Test
    void testSetupInitialAdmin_WhenAdminAlreadyExists_ThrowsConflictException() {
        SetupAdminRequest req = new SetupAdminRequest("Second Admin", "admin2@campusflow.edu", "Password123!", "Password123!");

        when(userRepository.existsByRole(Role.ADMIN)).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.setupInitialAdmin(req));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testRegister_WhenAttemptingAdminRole_ThrowsBadRequestException() {
        RegisterRequest req = new RegisterRequest("Attacker", "hacker@test.com", "Password123!", "Password123!", Role.ADMIN);

        assertThrows(BadRequestException.class, () -> authService.register(req));
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void testRegister_PasswordMismatch_ThrowsBadRequestException() {
        RegisterRequest req = new RegisterRequest("Student", "student@test.com", "Password123!", "DifferentPass!", Role.STUDENT);

        assertThrows(BadRequestException.class, () -> authService.register(req));
    }

    @Test
    void testRegister_DuplicateEmail_ThrowsConflictException() {
        RegisterRequest req = new RegisterRequest("Student", "duplicate@test.com", "Password123!", "Password123!", Role.STUDENT);

        when(userRepository.existsByEmail("duplicate@test.com")).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.register(req));
    }

    @Test
    void testRegister_Student_Success_WithProvidedRollNumber() {
        RegisterRequest req = new RegisterRequest("Student One", "student1@test.com", "Password123!", "Password123!", Role.STUDENT);
        req.setRollNumber("STU-2026-001");

        when(userRepository.existsByEmail("student1@test.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123!")).thenReturn("hashedPassword");

        User savedUser = new User("Student One", "student1@test.com", "hashedPassword", Role.STUDENT);
        savedUser.setId(10L);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        when(studentProfileRepository.existsByRollNumber("STU-2026-001")).thenReturn(false);
        StudentProfile savedProfile = new StudentProfile(savedUser, "STU-2026-001", null, 2026, null, null);
        savedProfile.setId(100L);
        when(studentProfileRepository.save(any(StudentProfile.class))).thenReturn(savedProfile);
        when(jwtService.generateToken(any(CustomUserDetails.class))).thenReturn("jwt-token-student");

        AuthResponse resp = authService.register(req);

        assertNotNull(resp);
        assertEquals("jwt-token-student", resp.getToken());
        assertEquals(Role.STUDENT, resp.getRole());
        assertEquals("student1@test.com", resp.getEmail());
        assertEquals(100L, resp.getProfileId());
    }

    @Test
    void testRegister_Student_Success_WithGeneratedRollNumber() {
        RegisterRequest req = new RegisterRequest("Student Two", "student2@test.com", "Password123!", "Password123!", Role.STUDENT);

        when(userRepository.existsByEmail("student2@test.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123!")).thenReturn("hashedPassword");

        User savedUser = new User("Student Two", "student2@test.com", "hashedPassword", Role.STUDENT);
        savedUser.setId(11L);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        when(studentProfileRepository.existsByRollNumber(anyString())).thenReturn(false);
        StudentProfile savedProfile = new StudentProfile(savedUser, "STU-123456", null, 2026, null, null);
        savedProfile.setId(101L);
        when(studentProfileRepository.save(any(StudentProfile.class))).thenReturn(savedProfile);
        when(jwtService.generateToken(any(CustomUserDetails.class))).thenReturn("jwt-token-student2");

        AuthResponse resp = authService.register(req);

        assertNotNull(resp);
        assertEquals(Role.STUDENT, resp.getRole());
        assertEquals(101L, resp.getProfileId());
    }

    @Test
    void testRegister_Faculty_Success() {
        RegisterRequest req = new RegisterRequest("Prof Faculty", "faculty1@test.com", "Password123!", "Password123!", Role.FACULTY);
        req.setEmployeeCode("FAC-2026-001");

        when(userRepository.existsByEmail("faculty1@test.com")).thenReturn(false);
        when(passwordEncoder.encode("Password123!")).thenReturn("hashedPassword");

        User savedUser = new User("Prof Faculty", "faculty1@test.com", "hashedPassword", Role.FACULTY);
        savedUser.setId(12L);
        when(userRepository.save(any(User.class))).thenReturn(savedUser);

        when(facultyProfileRepository.existsByEmployeeCode("FAC-2026-001")).thenReturn(false);
        FacultyProfile savedProfile = new FacultyProfile(savedUser, "FAC-2026-001", null, "Assistant Professor", null, null);
        savedProfile.setId(200L);
        when(facultyProfileRepository.save(any(FacultyProfile.class))).thenReturn(savedProfile);
        when(jwtService.generateToken(any(CustomUserDetails.class))).thenReturn("jwt-token-faculty");

        AuthResponse resp = authService.register(req);

        assertNotNull(resp);
        assertEquals(Role.FACULTY, resp.getRole());
        assertEquals(200L, resp.getProfileId());
    }

    @Test
    void testRegister_DuplicateRollNumber_ThrowsConflictException() {
        RegisterRequest req = new RegisterRequest("Student", "student3@test.com", "Password123!", "Password123!", Role.STUDENT);
        req.setRollNumber("STU-EXISTING");

        when(userRepository.existsByEmail("student3@test.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenReturn(new User("Student", "student3@test.com", "hashed", Role.STUDENT));
        when(studentProfileRepository.existsByRollNumber("STU-EXISTING")).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.register(req));
    }

    @Test
    void testRegister_DuplicateEmployeeCode_ThrowsConflictException() {
        RegisterRequest req = new RegisterRequest("Faculty", "faculty3@test.com", "Password123!", "Password123!", Role.FACULTY);
        req.setEmployeeCode("FAC-EXISTING");

        when(userRepository.existsByEmail("faculty3@test.com")).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("hashed");
        when(userRepository.save(any(User.class))).thenReturn(new User("Faculty", "faculty3@test.com", "hashed", Role.FACULTY));
        when(facultyProfileRepository.existsByEmployeeCode("FAC-EXISTING")).thenReturn(true);

        assertThrows(ConflictException.class, () -> authService.register(req));
    }

    @Test
    void testLogin_InvalidCredentials_ThrowsUnauthorizedException() {
        LoginRequest req = new LoginRequest("user@test.com", "WrongPassword");

        User user = new User("User", "user@test.com", "hashedPassword", Role.STUDENT);
        when(userRepository.findByEmail("user@test.com")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("WrongPassword", "hashedPassword")).thenReturn(false);

        assertThrows(UnauthorizedException.class, () -> authService.login(req));
    }
}
