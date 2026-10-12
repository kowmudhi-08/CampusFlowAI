package com.campusflow.service;

import com.campusflow.dto.CreateFacultyRequest;
import com.campusflow.dto.FacultyDto;
import com.campusflow.dto.UpdateFacultyRequest;
import com.campusflow.entity.Department;
import com.campusflow.entity.FacultyProfile;
import com.campusflow.entity.Role;
import com.campusflow.entity.User;
import com.campusflow.exception.ConflictException;
import com.campusflow.exception.ResourceNotFoundException;
import com.campusflow.repository.DepartmentRepository;
import com.campusflow.repository.FacultyProfileRepository;
import com.campusflow.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class FacultyService {

    private final FacultyProfileRepository facultyProfileRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public FacultyService(
            FacultyProfileRepository facultyProfileRepository,
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.facultyProfileRepository = facultyProfileRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<FacultyDto> getAllFaculty(Long departmentId, String search) {
        List<FacultyProfile> profiles;
        if (departmentId != null) {
            profiles = facultyProfileRepository.findByDepartmentId(departmentId);
        } else {
            profiles = facultyProfileRepository.findAll();
        }

        if (search != null && !search.trim().isEmpty()) {
            String lower = search.trim().toLowerCase();
            profiles = profiles.stream()
                    .filter(f -> f.getUser().getFullName().toLowerCase().contains(lower)
                            || f.getUser().getEmail().toLowerCase().contains(lower)
                            || f.getEmployeeCode().toLowerCase().contains(lower))
                    .toList();
        }

        return profiles.stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public FacultyDto getFacultyById(Long id) {
        FacultyProfile profile = facultyProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found with id: " + id));
        return mapToDto(profile);
    }

    @Transactional(readOnly = true)
    public FacultyDto getFacultyByUserId(Long userId) {
        FacultyProfile profile = facultyProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found for user id: " + userId));
        return mapToDto(profile);
    }

    @Transactional
    public FacultyDto createFaculty(CreateFacultyRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email already in use: " + email);
        }

        String code = request.getEmployeeCode().trim();
        if (facultyProfileRepository.existsByEmployeeCode(code)) {
            throw new ConflictException("Employee code already in use: " + code);
        }

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));
        }

        User user = new User(
                request.getFullName().trim(),
                email,
                passwordEncoder.encode(request.getPassword()),
                Role.FACULTY
        );
        User savedUser = userRepository.save(user);

        FacultyProfile profile = new FacultyProfile(
                savedUser,
                code,
                department,
                request.getDesignation(),
                request.getPhone(),
                request.getQualification()
        );
        FacultyProfile saved = facultyProfileRepository.save(profile);
        return mapToDto(saved);
    }

    @Transactional
    public FacultyDto updateFaculty(Long id, UpdateFacultyRequest request) {
        FacultyProfile profile = facultyProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found with id: " + id));

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            profile.getUser().setFullName(request.getFullName().trim());
        }

        if (request.getEmployeeCode() != null && !request.getEmployeeCode().trim().isEmpty()) {
            String newCode = request.getEmployeeCode().trim();
            if (!profile.getEmployeeCode().equalsIgnoreCase(newCode) && facultyProfileRepository.existsByEmployeeCode(newCode)) {
                throw new ConflictException("Employee code already in use: " + newCode);
            }
            profile.setEmployeeCode(newCode);
        }

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));
            profile.setDepartment(department);
        }

        if (request.getDesignation() != null) {
            profile.setDesignation(request.getDesignation().trim());
        }
        if (request.getPhone() != null) {
            profile.setPhone(request.getPhone().trim());
        }
        if (request.getQualification() != null) {
            profile.setQualification(request.getQualification().trim());
        }
        if (request.getActive() != null) {
            profile.getUser().setActive(request.getActive());
        }

        userRepository.save(profile.getUser());
        FacultyProfile saved = facultyProfileRepository.save(profile);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteFaculty(Long id) {
        FacultyProfile profile = facultyProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Faculty profile not found with id: " + id));
        User user = profile.getUser();
        facultyProfileRepository.delete(profile);
        userRepository.delete(user);
    }

    public FacultyDto mapToDto(FacultyProfile f) {
        FacultyDto dto = new FacultyDto();
        dto.setId(f.getId());
        dto.setUserId(f.getUser().getId());
        dto.setFullName(f.getUser().getFullName());
        dto.setEmail(f.getUser().getEmail());
        dto.setEmployeeCode(f.getEmployeeCode());
        if (f.getDepartment() != null) {
            dto.setDepartmentId(f.getDepartment().getId());
            dto.setDepartmentName(f.getDepartment().getName());
        }
        dto.setDesignation(f.getDesignation());
        dto.setPhone(f.getPhone());
        dto.setQualification(f.getQualification());
        dto.setActive(f.getUser().isActive());
        dto.setCreatedAt(f.getCreatedAt());
        return dto;
    }
}
