package com.campusflow.service;

import com.campusflow.dto.DepartmentDto;
import com.campusflow.entity.Department;
import com.campusflow.exception.ConflictException;
import com.campusflow.exception.ResourceNotFoundException;
import com.campusflow.repository.DepartmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    @Transactional(readOnly = true)
    public List<DepartmentDto> getAllDepartments() {
        return departmentRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public DepartmentDto getDepartmentById(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));
        return mapToDto(department);
    }

    @Transactional
    public DepartmentDto createDepartment(DepartmentDto dto) {
        String code = dto.getCode().trim().toUpperCase();
        if (departmentRepository.existsByCode(code)) {
            throw new ConflictException("Department code already exists: " + code);
        }

        Department department = new Department(dto.getName().trim(), code, dto.getDescription());
        Department saved = departmentRepository.save(department);
        return mapToDto(saved);
    }

    @Transactional
    public DepartmentDto updateDepartment(Long id, DepartmentDto dto) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + id));

        String newCode = dto.getCode().trim().toUpperCase();
        if (!department.getCode().equalsIgnoreCase(newCode) && departmentRepository.existsByCode(newCode)) {
            throw new ConflictException("Department code already exists: " + newCode);
        }

        department.setName(dto.getName().trim());
        department.setCode(newCode);
        department.setDescription(dto.getDescription());
        Department updated = departmentRepository.save(department);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Department not found with id: " + id);
        }
        departmentRepository.deleteById(id);
    }

    private DepartmentDto mapToDto(Department d) {
        return new DepartmentDto(d.getId(), d.getName(), d.getCode(), d.getDescription());
    }
}
