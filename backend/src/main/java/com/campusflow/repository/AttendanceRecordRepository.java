package com.campusflow.repository;

import com.campusflow.entity.AttendanceRecord;
import com.campusflow.entity.AttendanceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findByCourseId(Long courseId);
    List<AttendanceRecord> findByStudentId(Long studentId);
    List<AttendanceRecord> findByCourseIdAndAttendanceDate(Long courseId, LocalDate attendanceDate);
    List<AttendanceRecord> findByStudentIdAndCourseId(Long studentId, Long courseId);
    Optional<AttendanceRecord> findByStudentIdAndCourseIdAndAttendanceDateAndSessionName(
            Long studentId, Long courseId, LocalDate attendanceDate, String sessionName);
    boolean existsByStudentIdAndCourseIdAndAttendanceDateAndSessionName(
            Long studentId, Long courseId, LocalDate attendanceDate, String sessionName);

    long countByStudentIdAndCourseId(Long studentId, Long courseId);
    long countByStudentIdAndCourseIdAndStatus(Long studentId, Long courseId, AttendanceStatus status);

    long countByStudentId(Long studentId);
    long countByStudentIdAndStatus(Long studentId, AttendanceStatus status);
}
