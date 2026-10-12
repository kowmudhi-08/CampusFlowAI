package com.campusflow.repository;

import com.campusflow.entity.StudentProfile;
import com.campusflow.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface StudentProfileRepository extends JpaRepository<StudentProfile, Long> {
    Optional<StudentProfile> findByUser(User user);
    Optional<StudentProfile> findByUserId(Long userId);
    Optional<StudentProfile> findByRollNumber(String rollNumber);
    boolean existsByRollNumber(String rollNumber);
    List<StudentProfile> findByDepartmentId(Long departmentId);
}
