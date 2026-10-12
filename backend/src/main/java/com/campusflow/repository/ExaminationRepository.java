package com.campusflow.repository;

import com.campusflow.entity.Examination;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExaminationRepository extends JpaRepository<Examination, Long> {
    List<Examination> findByCourseId(Long courseId);
    List<Examination> findByCourseIdAndPublishedTrue(Long courseId);
    List<Examination> findByPublishedTrue();
}
