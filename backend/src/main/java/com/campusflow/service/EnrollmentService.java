package com.campusflow.service;

import com.campusflow.dto.EnrollRequest;
import com.campusflow.dto.EnrollmentDto;
import com.campusflow.entity.AcademicSession;
import com.campusflow.entity.Course;
import com.campusflow.entity.Enrollment;
import com.campusflow.entity.StudentProfile;
import com.campusflow.exception.ConflictException;
import com.campusflow.exception.ResourceNotFoundException;
import com.campusflow.repository.AcademicSessionRepository;
import com.campusflow.repository.CourseRepository;
import com.campusflow.repository.EnrollmentRepository;
import com.campusflow.repository.StudentProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final CourseRepository courseRepository;
    private final AcademicSessionRepository sessionRepository;

    public EnrollmentService(
            EnrollmentRepository enrollmentRepository,
            StudentProfileRepository studentProfileRepository,
            CourseRepository courseRepository,
            AcademicSessionRepository sessionRepository
    ) {
        this.enrollmentRepository = enrollmentRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.courseRepository = courseRepository;
        this.sessionRepository = sessionRepository;
    }

    @Transactional(readOnly = true)
    public List<EnrollmentDto> getAllEnrollments() {
        return enrollmentRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EnrollmentDto> getEnrollmentsByStudent(Long studentId) {
        return enrollmentRepository.findByStudentId(studentId).stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<EnrollmentDto> getEnrollmentsByCourse(Long courseId) {
        return enrollmentRepository.findByCourseId(courseId).stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional
    public EnrollmentDto enrollStudent(EnrollRequest request) {
        StudentProfile student = studentProfileRepository.findById(request.getStudentId())
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + request.getStudentId()));

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + request.getCourseId()));

        if (enrollmentRepository.existsByStudentIdAndCourseId(request.getStudentId(), request.getCourseId())) {
            throw new ConflictException("Student " + student.getRollNumber() + " is already enrolled in course " + course.getCode());
        }

        AcademicSession session = null;
        if (request.getAcademicSessionId() != null) {
            session = sessionRepository.findById(request.getAcademicSessionId()).orElse(null);
        } else if (course.getAcademicSession() != null) {
            session = course.getAcademicSession();
        }

        Enrollment enrollment = new Enrollment(student, course, session);
        Enrollment saved = enrollmentRepository.save(enrollment);
        return mapToDto(saved);
    }

    @Transactional
    public void unenrollStudent(Long enrollmentId) {
        if (!enrollmentRepository.existsById(enrollmentId)) {
            throw new ResourceNotFoundException("Enrollment not found with id: " + enrollmentId);
        }
        enrollmentRepository.deleteById(enrollmentId);
    }

    public EnrollmentDto mapToDto(Enrollment e) {
        EnrollmentDto dto = new EnrollmentDto();
        dto.setId(e.getId());
        dto.setStudentId(e.getStudent().getId());
        dto.setStudentName(e.getStudent().getUser().getFullName());
        dto.setStudentRollNumber(e.getStudent().getRollNumber());
        dto.setCourseId(e.getCourse().getId());
        dto.setCourseCode(e.getCourse().getCode());
        dto.setCourseTitle(e.getCourse().getTitle());
        dto.setCourseCredits(e.getCourse().getCredits());
        if (e.getCourse().getFaculty() != null) {
            dto.setFacultyName(e.getCourse().getFaculty().getUser().getFullName());
        }
        if (e.getAcademicSession() != null) {
            dto.setAcademicSessionId(e.getAcademicSession().getId());
            dto.setAcademicSessionName(e.getAcademicSession().getName());
        }
        dto.setEnrolledAt(e.getEnrolledAt());
        dto.setStatus(e.getStatus());
        return dto;
    }
}
