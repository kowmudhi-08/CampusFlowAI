package com.campusflow.repository;

import com.campusflow.entity.FacultyProfile;
import com.campusflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FacultyProfileRepository extends JpaRepository<FacultyProfile, Long> {
    Optional<FacultyProfile> findByUser(User user);
    Optional<FacultyProfile> findByUserId(Long userId);
    Optional<FacultyProfile> findByEmployeeCode(String employeeCode);
    boolean existsByEmployeeCode(String employeeCode);
    List<FacultyProfile> findByDepartmentId(Long departmentId);
}
