package com.campusflow.service;

import com.campusflow.dto.CourseDto;
import com.campusflow.dto.CreateCourseRequest;
import com.campusflow.dto.UpdateCourseRequest;
import com.campusflow.entity.*;
import com.campusflow.exception.ConflictException;
import com.campusflow.exception.ResourceNotFoundException;
import com.campusflow.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final DepartmentRepository departmentRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final AcademicSessionRepository sessionRepository;
    private final EnrollmentRepository enrollmentRepository;

    public CourseService(
            CourseRepository courseRepository,
            DepartmentRepository departmentRepository,
            FacultyProfileRepository facultyProfileRepository,
            AcademicSessionRepository sessionRepository,
            EnrollmentRepository enrollmentRepository
    ) {
        this.courseRepository = courseRepository;
        this.departmentRepository = departmentRepository;
        this.facultyProfileRepository = facultyProfileRepository;
        this.sessionRepository = sessionRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    @Transactional(readOnly = true)
    public List<CourseDto> getAllCourses(Long departmentId, Long facultyId) {
        List<Course> courses;
        if (departmentId != null) {
            courses = courseRepository.findByDepartmentId(departmentId);
        } else if (facultyId != null) {
            courses = courseRepository.findByFacultyId(facultyId);
        } else {
            courses = courseRepository.findAll();
        }
        return courses.stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public CourseDto getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));
        return mapToDto(course);
    }

    @Transactional(readOnly = true)
    public List<CourseDto> getCoursesByFacultyId(Long facultyId) {
        return courseRepository.findByFacultyId(facultyId).stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional
    public CourseDto createCourse(CreateCourseRequest request) {
        String code = request.getCode().trim().toUpperCase();
        if (courseRepository.existsByCode(code)) {
            throw new ConflictException("Course code already exists: " + code);
        }

        Department department = null;
        if (request.getDepartmentId() != null) {
            department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));
        }

        FacultyProfile faculty = null;
        if (request.getFacultyId() != null) {
            faculty = facultyProfileRepository.findById(request.getFacultyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + request.getFacultyId()));
        }

        AcademicSession session = null;
        if (request.getAcademicSessionId() != null) {
            session = sessionRepository.findById(request.getAcademicSessionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Academic session not found with id: " + request.getAcademicSessionId()));
        }

        Course course = new Course(
                code,
                request.getTitle().trim(),
                request.getDescription(),
                request.getCredits() != null ? request.getCredits() : 3,
                department,
                faculty,
                session,
                request.getSemester() != null ? request.getSemester() : 1
        );
        Course saved = courseRepository.save(course);
        return mapToDto(saved);
    }

    @Transactional
    public CourseDto updateCourse(Long id, UpdateCourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + id));

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            course.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            course.setDescription(request.getDescription());
        }
        if (request.getCredits() != null) {
            course.setCredits(request.getCredits());
        }
        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Department not found with id: " + request.getDepartmentId()));
            course.setDepartment(department);
        }
        if (request.getFacultyId() != null) {
            FacultyProfile faculty = facultyProfileRepository.findById(request.getFacultyId())
                    .orElseThrow(() -> new ResourceNotFoundException("Faculty not found with id: " + request.getFacultyId()));
            course.setFaculty(faculty);
        }
        if (request.getAcademicSessionId() != null) {
            AcademicSession session = sessionRepository.findById(request.getAcademicSessionId())
                    .orElseThrow(() -> new ResourceNotFoundException("Academic session not found with id: " + request.getAcademicSessionId()));
            course.setAcademicSession(session);
        }
        if (request.getSemester() != null) {
            course.setSemester(request.getSemester());
        }

        Course saved = courseRepository.save(course);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteCourse(Long id) {
        if (!courseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Course not found with id: " + id);
        }
        courseRepository.deleteById(id);
    }

    public CourseDto mapToDto(Course c) {
        CourseDto dto = new CourseDto();
        dto.setId(c.getId());
        dto.setCode(c.getCode());
        dto.setTitle(c.getTitle());
        dto.setDescription(c.getDescription());
        dto.setCredits(c.getCredits());
        if (c.getDepartment() != null) {
            dto.setDepartmentId(c.getDepartment().getId());
            dto.setDepartmentName(c.getDepartment().getName());
        }
        if (c.getFaculty() != null) {
            dto.setFacultyId(c.getFaculty().getId());
            dto.setFacultyName(c.getFaculty().getUser().getFullName());
        }
        if (c.getAcademicSession() != null) {
            dto.setAcademicSessionId(c.getAcademicSession().getId());
            dto.setAcademicSessionName(c.getAcademicSession().getName());
        }
        dto.setSemester(c.getSemester());
        dto.setEnrolledStudentsCount(enrollmentRepository.countByCourseId(c.getId()));
        return dto;
    }
}
