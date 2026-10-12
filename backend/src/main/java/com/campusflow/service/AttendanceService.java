package com.campusflow.service;

import com.campusflow.dto.*;
import com.campusflow.entity.*;
import com.campusflow.exception.ForbiddenException;
import com.campusflow.exception.ResourceNotFoundException;
import com.campusflow.repository.*;
import com.campusflow.security.SecurityUtils;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class AttendanceService {

    private final AttendanceRecordRepository attendanceRepository;
    private final CourseRepository courseRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final EnrollmentRepository enrollmentRepository;

    @Value("${campusflow.attendance.threshold-percent:75.0}")
    private double warningThresholdPercent;

    public AttendanceService(
            AttendanceRecordRepository attendanceRepository,
            CourseRepository courseRepository,
            StudentProfileRepository studentProfileRepository,
            FacultyProfileRepository facultyProfileRepository,
            EnrollmentRepository enrollmentRepository
    ) {
        this.attendanceRepository = attendanceRepository;
        this.courseRepository = courseRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.facultyProfileRepository = facultyProfileRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Transactional
    public List<AttendanceRecordDto> markAttendance(MarkAttendanceRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + request.getCourseId()));

        // Check if caller is faculty assigned to this course, or admin
        FacultyProfile faculty = null;
        if (SecurityUtils.getCurrentUserRole() == Role.FACULTY) {
            faculty = facultyProfileRepository.findByUserId(SecurityUtils.getCurrentUserId())
                    .orElseThrow(() -> new ForbiddenException("Faculty profile not found for user"));
            if (course.getFaculty() != null && !course.getFaculty().getId().equals(faculty.getId())) {
                throw new ForbiddenException("You are not authorized to mark attendance for this course");
            }
        } else {
            faculty = course.getFaculty();
        }

        String sessionName = request.getSessionName() != null ? request.getSessionName().trim() : "Session 1";
        LocalDate date = request.getAttendanceDate();

        List<AttendanceRecord> savedRecords = new ArrayList<>();
        for (StudentAttendanceItem item : request.getAttendanceItems()) {
            StudentProfile student = studentProfileRepository.findById(item.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + item.getStudentId()));

            Optional<AttendanceRecord> existing = attendanceRepository
                    .findByStudentIdAndCourseIdAndAttendanceDateAndSessionName(student.getId(), course.getId(), date, sessionName);

            AttendanceRecord record;
            if (existing.isPresent()) {
                record = existing.get();
                record.setStatus(item.getStatus());
                record.setRemarks(item.getRemarks());
                record.setFaculty(faculty);
            } else {
                record = new AttendanceRecord(
                        student,
                        course,
                        faculty,
                        date,
                        sessionName,
                        item.getStatus(),
                        item.getRemarks()
                );
            }
            savedRecords.add(attendanceRepository.save(record));
        }

        return savedRecords.stream().map(this::mapToDto).toList();
    }

    @Transactional
    public AttendanceRecordDto updateAttendanceRecord(Long recordId, UpdateAttendanceItemRequest request) {
        AttendanceRecord record = attendanceRepository.findById(recordId)
                .orElseThrow(() -> new ResourceNotFoundException("Attendance record not found with id: " + recordId));

        if (SecurityUtils.getCurrentUserRole() == Role.FACULTY) {
            FacultyProfile faculty = facultyProfileRepository.findByUserId(SecurityUtils.getCurrentUserId())
                    .orElseThrow(() -> new ForbiddenException("Faculty profile not found"));
            if (record.getCourse().getFaculty() != null && !record.getCourse().getFaculty().getId().equals(faculty.getId())) {
                throw new ForbiddenException("You can only correct attendance for your assigned courses");
            }
        }

        record.setStatus(request.getStatus());
        if (request.getRemarks() != null) {
            record.setRemarks(request.getRemarks());
        }
        AttendanceRecord updated = attendanceRepository.save(record);
        return mapToDto(updated);
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecordDto> getAttendanceByCourse(Long courseId) {
        return attendanceRepository.findByCourseId(courseId).stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecordDto> getAttendanceByCourseAndDate(Long courseId, LocalDate date) {
        return attendanceRepository.findByCourseIdAndAttendanceDate(courseId, date).stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecordDto> getAttendanceByStudent(Long studentId) {
        return attendanceRepository.findByStudentId(studentId).stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<AttendanceSummaryDto> getStudentAttendanceSummaries(Long studentId) {
        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(student.getId());
        List<AttendanceSummaryDto> summaries = new ArrayList<>();

        for (Enrollment enrollment : enrollments) {
            Course course = enrollment.getCourse();
            List<AttendanceRecord> records = attendanceRepository.findByStudentIdAndCourseId(student.getId(), course.getId());

            long total = records.size();
            long present = records.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
            long late = records.stream().filter(r -> r.getStatus() == AttendanceStatus.LATE).count();
            long absent = records.stream().filter(r -> r.getStatus() == AttendanceStatus.ABSENT).count();

            double percentage = total > 0 ? ((present + (late * 0.5)) / total) * 100.0 : 0.0;
            percentage = Math.round(percentage * 100.0) / 100.0;

            AttendanceSummaryDto summary = new AttendanceSummaryDto();
            summary.setStudentId(student.getId());
            summary.setStudentName(student.getUser().getFullName());
            summary.setRollNumber(student.getRollNumber());
            summary.setCourseId(course.getId());
            summary.setCourseCode(course.getCode());
            summary.setCourseTitle(course.getTitle());
            summary.setTotalSessions(total);
            summary.setPresentCount(present);
            summary.setLateCount(late);
            summary.setAbsentCount(absent);
            summary.setPercentage(percentage);
            summary.setLowAttendanceWarning(total > 0 && percentage < warningThresholdPercent);

            summaries.add(summary);
        }

        return summaries;
    }

    public AttendanceRecordDto mapToDto(AttendanceRecord r) {
        AttendanceRecordDto dto = new AttendanceRecordDto();
        dto.setId(r.getId());
        dto.setStudentId(r.getStudent().getId());
        dto.setStudentName(r.getStudent().getUser().getFullName());
        dto.setStudentRollNumber(r.getStudent().getRollNumber());
        dto.setCourseId(r.getCourse().getId());
        dto.setCourseCode(r.getCourse().getCode());
        dto.setCourseTitle(r.getCourse().getTitle());
        if (r.getFaculty() != null) {
            dto.setFacultyId(r.getFaculty().getId());
            dto.setFacultyName(r.getFaculty().getUser().getFullName());
        }
        dto.setAttendanceDate(r.getAttendanceDate());
        dto.setSessionName(r.getSessionName());
        dto.setStatus(r.getStatus());
        dto.setRemarks(r.getRemarks());
        dto.setRecordedAt(r.getRecordedAt());
        return dto;
    }
}
