package com.campusflow.repository;

import com.campusflow.entity.Assignment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByCourseId(Long courseId);
    List<Assignment> findByFacultyId(Long facultyId);
}
