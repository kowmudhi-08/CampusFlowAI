package com.campusflow.service;

import com.campusflow.dto.CreateStudentRequest;
import com.campusflow.dto.StudentDto;
import com.campusflow.dto.UpdateStudentRequest;
import com.campusflow.entity.Department;
import com.campusflow.entity.Role;
import com.campusflow.entity.StudentProfile;
import com.campusflow.entity.User;
import com.campusflow.exception.ConflictException;
import com.campusflow.exception.ResourceNotFoundException;
import com.campusflow.repository.DepartmentRepository;
import com.campusflow.repository.StudentProfileRepository;
import com.campusflow.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class StudentService {

    private final StudentProfileRepository studentProfileRepository;
    private final UserRepository userRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public StudentService(
            StudentProfileRepository studentProfileRepository,
            UserRepository userRepository,
            DepartmentRepository departmentRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.studentProfileRepository = studentProfileRepository;
        this.userRepository = userRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public List<StudentDto> getAllStudents(Long departmentId, String search) {
        List<StudentProfile> profiles;
        if (departmentId != null) {
            profiles = studentProfileRepository.findByDepartmentId(departmentId);
        } else {
            profiles = studentProfileRepository.findAll();
        }

        if (search != null && !search.trim().isEmpty()) {
            String lowerSearch = search.trim().toLowerCase();
            profiles = profiles.stream()
                    .filter(s -> s.getUser().getFullName().toLowerCase().contains(lowerSearch)
                            || s.getUser().getEmail().toLowerCase().contains(lowerSearch)
                            || s.getRollNumber().toLowerCase().contains(lowerSearch))
                    .toList();
        }

        return profiles.stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public StudentDto getStudentById(Long id) {
        StudentProfile profile = studentProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found with id: " + id));
        return mapToDto(profile);
    }

    @Transactional(readOnly = true)
    public StudentDto getStudentByUserId(Long userId) {
        StudentProfile profile = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found for user id: " + userId));
        return mapToDto(profile);
    }

    @Transactional
    public StudentDto createStudent(CreateStudentRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmail(email)) {
            throw new ConflictException("Email already in use: " + email);
        }

        String roll = request.getRollNumber().trim();
        if (studentProfileRepository.existsByRollNumber(roll)) {
            throw new ConflictException("Roll number already in use: " + roll);
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
                Role.STUDENT
        );
        User savedUser = userRepository.save(user);

        StudentProfile profile = new StudentProfile(
                savedUser,
                roll,
                department,
                request.getBatchYear(),
                request.getPhone(),
                request.getAddress()
        );
        StudentProfile saved = studentProfileRepository.save(profile);
        return mapToDto(saved);
    }

    @Transactional
    public StudentDto updateStudent(Long id, UpdateStudentRequest request) {
        StudentProfile profile = studentProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found with id: " + id));

        if (request.getFullName() != null && !request.getFullName().trim().isEmpty()) {
            profile.getUser().setFullName(request.getFullName().trim());
        }

        if (request.getRollNumber() != null && !request.getRollNumber().trim().isEmpty()) {
            String newRoll = request.getRollNumber().trim();
            if (!profile.getRollNumber().equalsIgnoreCase(newRoll) && studentProfileRepository.existsByRollNumber(newRoll)) {
                throw new ConflictException("Roll number already in use: " + newRoll);
            }
            profile.setRollNumber(newRoll);
        }

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));
            profile.setDepartment(department);
        }

        if (request.getBatchYear() != null) {
            profile.setBatchYear(request.getBatchYear());
        }
        if (request.getPhone() != null) {
            profile.setPhone(request.getPhone().trim());
        }
        if (request.getAddress() != null) {
            profile.setAddress(request.getAddress().trim());
        }
        if (request.getCgpa() != null) {
            profile.setCgpa(request.getCgpa());
        }
        if (request.getActive() != null) {
            profile.getUser().setActive(request.getActive());
        }

        userRepository.save(profile.getUser());
        StudentProfile saved = studentProfileRepository.save(profile);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteStudent(Long id) {
        StudentProfile profile = studentProfileRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Student profile not found with id: " + id));
        User user = profile.getUser();
        studentProfileRepository.delete(profile);
        userRepository.delete(user);
    }

    public StudentDto mapToDto(StudentProfile p) {
        StudentDto dto = new StudentDto();
        dto.setId(p.getId());
        dto.setUserId(p.getUser().getId());
        dto.setFullName(p.getUser().getFullName());
        dto.setEmail(p.getUser().getEmail());
        dto.setRollNumber(p.getRollNumber());
        if (p.getDepartment() != null) {
            dto.setDepartmentId(p.getDepartment().getId());
            dto.setDepartmentName(p.getDepartment().getName());
        }
        dto.setBatchYear(p.getBatchYear());
        dto.setPhone(p.getPhone());
        dto.setAddress(p.getAddress());
        dto.setCgpa(p.getCgpa() != null ? p.getCgpa() : BigDecimal.ZERO);
        dto.setActive(p.getUser().isActive());
        dto.setCreatedAt(p.getCreatedAt());
        return dto;
    }
}
