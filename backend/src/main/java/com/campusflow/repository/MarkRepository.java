package com.campusflow.repository;

import com.campusflow.entity.Mark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MarkRepository extends JpaRepository<Mark, Long> {
    List<Mark> findByExaminationId(Long examinationId);
    List<Mark> findByStudentId(Long studentId);
    List<Mark> findByStudentIdAndExaminationPublishedTrue(Long studentId);
    Optional<Mark> findByExaminationIdAndStudentId(Long examinationId, Long studentId);
    boolean existsByExaminationIdAndStudentId(Long examinationId, Long studentId);
}
