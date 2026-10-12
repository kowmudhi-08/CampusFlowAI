package com.campusflow.service;

import com.campusflow.dto.*;
import com.campusflow.entity.*;
import com.campusflow.exception.BadRequestException;
import com.campusflow.exception.ConflictException;
import com.campusflow.exception.ResourceNotFoundException;
import com.campusflow.exception.UnauthorizedException;
import com.campusflow.repository.*;
import com.campusflow.security.CustomUserDetails;
import com.campusflow.security.JwtService;
import com.campusflow.security.SecurityUtils;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(
            UserRepository userRepository,
            StudentProfileRepository studentProfileRepository,
            FacultyProfileRepository facultyProfileRepository,
            DepartmentRepository departmentRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.facultyProfileRepository = facultyProfileRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional(readOnly = true)
    public AdminSetupStatusResponse checkAdminSetupStatus() {
        long adminCount = userRepository.countByRole(Role.ADMIN);
        if (adminCount == 0) {
            return new AdminSetupStatusResponse(true, "Initial Administrator setup is required");
        } else {
            return new AdminSetupStatusResponse(false, "Administrator already configured. Setup disabled.");
        }
    }

    @Transactional(isolation = Isolation.SERIALIZABLE)
    public AuthResponse setupInitialAdmin(SetupAdminRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        // Absolute requirement: Only ONE initial administrator account
        if (userRepository.existsByRole(Role.ADMIN)) {
            throw new ConflictException("Administrator setup has already been completed. Further admin creation through setup is disabled.");
        }

        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new ConflictException("Email already in use: " + request.getEmail());
        }

        User admin = new User(
                request.getFullName().trim(),
                request.getEmail().trim().toLowerCase(),
                passwordEncoder.encode(request.getPassword()),
                Role.ADMIN
        );
        admin.setActive(true);
        User savedAdmin = userRepository.save(admin);

        CustomUserDetails userDetails = new CustomUserDetails(savedAdmin);
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(
                token,
                savedAdmin.getId(),
                savedAdmin.getFullName(),
                savedAdmin.getEmail(),
                savedAdmin.getRole(),
                null
        );
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Password and confirm password do not match");
        }

        // Strict Requirement: Never accept ADMIN as a public registration role
        if (request.getRole() == null || request.getRole() == Role.ADMIN) {
            throw new BadRequestException("Public registration is only permitted for STUDENT or FACULTY roles");
        }

        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("User with this email already exists: " + email);
        }

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElse(null);
        }

        User user = new User(
                request.getFullName().trim(),
                email,
                passwordEncoder.encode(request.getPassword()),
                request.getRole()
        );
        user.setActive(true);
        User savedUser = userRepository.save(user);

        Long profileId = null;
        if (request.getRole() == Role.STUDENT) {
            String roll = request.getRollNumber();
            if (roll == null || roll.trim().isEmpty()) {
                roll = "STU-" + System.currentTimeMillis() % 1000000;
            } else {
                roll = roll.trim();
                if (studentProfileRepository.existsByRollNumber(roll)) {
                    throw new ConflictException("Roll number is already in use: " + roll);
                }
            }

            StudentProfile studentProfile = new StudentProfile(
                    savedUser,
                    roll,
                    department,
                    request.getBatchYear() != null ? request.getBatchYear() : 2026,
                    request.getPhone(),
                    null
            );
            StudentProfile savedProfile = studentProfileRepository.save(studentProfile);
            profileId = savedProfile.getId();
        } else if (request.getRole() == Role.FACULTY) {
            String empCode = request.getEmployeeCode();
            if (empCode == null || empCode.trim().isEmpty()) {
                empCode = "FAC-" + System.currentTimeMillis() % 1000000;
            } else {
                empCode = empCode.trim();
                if (facultyProfileRepository.existsByEmployeeCode(empCode)) {
                    throw new ConflictException("Employee code is already in use: " + empCode);
                }
            }

            FacultyProfile facultyProfile = new FacultyProfile(
                    savedUser,
                    empCode,
                    department,
                    request.getDesignation() != null ? request.getDesignation() : "Assistant Professor",
                    request.getPhone(),
                    request.getQualification()
            );
            FacultyProfile savedProfile = facultyProfileRepository.save(facultyProfile);
            profileId = savedProfile.getId();
        }

        CustomUserDetails userDetails = new CustomUserDetails(savedUser);
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getFullName(),
                savedUser.getEmail(),
                savedUser.getRole(),
                profileId
        );
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid email or password");
        }

        if (!user.isActive()) {
            throw new UnauthorizedException("Your account has been deactivated. Please contact an administrator.");
        }

        Long profileId = null;
        if (user.getRole() == Role.STUDENT) {
            profileId = studentProfileRepository.findByUser(user)
                    .map(StudentProfile::getId)
                    .orElse(null);
        } else if (user.getRole() == Role.FACULTY) {
            profileId = facultyProfileRepository.findByUser(user)
                    .map(FacultyProfile::getId)
                    .orElse(null);
        }

        CustomUserDetails userDetails = new CustomUserDetails(user);
        String token = jwtService.generateToken(userDetails);

        return new AuthResponse(
                token,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole(),
                profileId
        );
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile() {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        UserProfileResponse response = new UserProfileResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setEmail(user.getEmail());
        response.setRole(user.getRole());
        response.setActive(user.isActive());

        if (user.getRole() == Role.STUDENT) {
            studentProfileRepository.findByUser(user).ifPresent(p -> {
                response.setProfileId(p.getId());
                response.setCode(p.getRollNumber());
                if (p.getDepartment() != null) {
                    response.setDepartmentId(p.getDepartment().getId());
                    response.setDepartmentName(p.getDepartment().getName());
                }
                response.setPhone(p.getPhone());
                response.setAddress(p.getAddress());
                response.setBatchYear(p.getBatchYear());
                response.setCgpa(p.getCgpa());
            });
        } else if (user.getRole() == Role.FACULTY) {
            facultyProfileRepository.findByUser(user).ifPresent(p -> {
                response.setProfileId(p.getId());
                response.setCode(p.getEmployeeCode());
                if (p.getDepartment() != null) {
                    response.setDepartmentId(p.getDepartment().getId());
                    response.setDepartmentName(p.getDepartment().getName());
                }
                response.setPhone(p.getPhone());
                response.setDesignation(p.getDesignation());
                response.setQualification(p.getQualification());
            });
        }

        return response;
    }

    @Transactional
    public UserProfileResponse updateProfile(UpdateProfileRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            user.setFullName(request.getFullName().trim());
            userRepository.save(user);
        }

        if (user.getRole() == Role.STUDENT) {
            studentProfileRepository.findByUser(user).ifPresent(p -> {
                if (request.getPhone() != null) p.setPhone(request.getPhone().trim());
                if (request.getAddress() != null) p.setAddress(request.getAddress().trim());
                studentProfileRepository.save(p);
            });
        } else if (user.getRole() == Role.FACULTY) {
            facultyProfileRepository.findByUser(user).ifPresent(p -> {
                if (request.getPhone() != null) p.setPhone(request.getPhone().trim());
                if (request.getDesignation() != null) p.setDesignation(request.getDesignation().trim());
                if (request.getQualification() != null) p.setQualification(request.getQualification().trim());
                facultyProfileRepository.save(p);
            });
        }

        return getCurrentUserProfile();
    }

    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match");
        }

        Long userId = SecurityUtils.getCurrentUserId();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }
}
