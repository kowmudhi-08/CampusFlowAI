package com.campusflow.service;

import com.campusflow.dto.*;
import com.campusflow.entity.*;
import com.campusflow.exception.BadRequestException;
import com.campusflow.exception.ConflictException;
import com.campusflow.exception.ForbiddenException;
import com.campusflow.exception.ResourceNotFoundException;
import com.campusflow.repository.*;
import com.campusflow.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final CourseRepository courseRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final StudentProfileRepository studentProfileRepository;

    public AssignmentService(
            AssignmentRepository assignmentRepository,
            SubmissionRepository submissionRepository,
            CourseRepository courseRepository,
            FacultyProfileRepository facultyProfileRepository,
            StudentProfileRepository studentProfileRepository
    ) {
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.courseRepository = courseRepository;
        this.facultyProfileRepository = facultyProfileRepository;
        this.studentProfileRepository = studentProfileRepository;
    }

    @Transactional(readOnly = true)
    public List<AssignmentDto> getAllAssignments() {
        return assignmentRepository.findAll().stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public List<AssignmentDto> getAssignmentsByCourse(Long courseId) {
        return assignmentRepository.findByCourseId(courseId).stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public AssignmentDto getAssignmentById(Long id) {
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + id));
        return mapToDto(assignment);
    }

    @Transactional
    public AssignmentDto createAssignment(CreateAssignmentRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + request.getCourseId()));

        FacultyProfile faculty = null;
        if (SecurityUtils.getCurrentUserRole() == Role.FACULTY) {
            faculty = facultyProfileRepository.findByUserId(SecurityUtils.getCurrentUserId())
                    .orElseThrow(() -> new ForbiddenException("Faculty profile not found"));
            if (course.getFaculty() != null && !course.getFaculty().getId().equals(faculty.getId())) {
                throw new ForbiddenException("You can only create assignments for your assigned courses");
            }
        } else {
            faculty = course.getFaculty();
        }

        Assignment assignment = new Assignment(
                request.getTitle().trim(),
                request.getDescription(),
                course,
                faculty,
                request.getDueDate(),
                request.getMaxMarks()
        );
        Assignment saved = assignmentRepository.save(assignment);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteAssignment(Long id) {
        if (!assignmentRepository.existsById(id)) {
            throw new ResourceNotFoundException("Assignment not found with id: " + id);
        }
        assignmentRepository.deleteById(id);
    }

    @Transactional
    public SubmissionDto submitAssignment(CreateSubmissionRequest request) {
        Long studentId;
        if (SecurityUtils.getCurrentUserRole() == Role.STUDENT) {
            StudentProfile profile = studentProfileRepository.findByUserId(SecurityUtils.getCurrentUserId())
                    .orElseThrow(() -> new ForbiddenException("Student profile not found"));
            studentId = profile.getId();
        } else {
            throw new ForbiddenException("Only students can submit assignments");
        }

        Assignment assignment = assignmentRepository.findById(request.getAssignmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Assignment not found with id: " + request.getAssignmentId()));

        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found"));

        if (submissionRepository.existsByAssignmentIdAndStudentId(assignment.getId(), student.getId())) {
            throw new ConflictException("You have already submitted this assignment");
        }

        Submission submission = new Submission(
                assignment,
                student,
                request.getSubmissionText(),
                request.getFileUrl()
        );

        if (LocalDateTime.now().isAfter(assignment.getDueDate())) {
            submission.setStatus(SubmissionStatus.LATE);
        } else {
            submission.setStatus(SubmissionStatus.SUBMITTED);
        }

        Submission saved = submissionRepository.save(submission);
        return mapToSubmissionDto(saved);
    }

    @Transactional(readOnly = true)
    public List<SubmissionDto> getSubmissionsByAssignment(Long assignmentId) {
        return submissionRepository.findByAssignmentId(assignmentId).stream()
                .map(this::mapToSubmissionDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SubmissionDto> getSubmissionsByStudent(Long studentId) {
        return submissionRepository.findByStudentId(studentId).stream()
                .map(this::mapToSubmissionDto)
                .toList();
    }

    @Transactional
    public SubmissionDto gradeSubmission(Long submissionId, GradeSubmissionRequest request) {
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new ResourceNotFoundException("Submission not found with id: " + submissionId));

        if (request.getMarksObtained().compareTo(submission.getAssignment().getMaxMarks()) > 0) {
            throw new BadRequestException("Marks obtained cannot exceed maximum marks (" + submission.getAssignment().getMaxMarks() + ")");
        }

        submission.setMarksObtained(request.getMarksObtained());
        submission.setFeedback(request.getFeedback());
        submission.setStatus(SubmissionStatus.GRADED);
        Submission updated = submissionRepository.save(submission);
        return mapToSubmissionDto(updated);
    }

    public AssignmentDto mapToDto(Assignment a) {
        AssignmentDto dto = new AssignmentDto();
        dto.setId(a.getId());
        dto.setTitle(a.getTitle());
        dto.setDescription(a.getDescription());
        dto.setCourseId(a.getCourse().getId());
        dto.setCourseCode(a.getCourse().getCode());
        dto.setCourseTitle(a.getCourse().getTitle());
        if (a.getFaculty() != null) {
            dto.setFacultyId(a.getFaculty().getId());
            dto.setFacultyName(a.getFaculty().getUser().getFullName());
        }
        dto.setDueDate(a.getDueDate());
        dto.setMaxMarks(a.getMaxMarks());
        dto.setCreatedAt(a.getCreatedAt());
        dto.setSubmissionsCount(submissionRepository.findByAssignmentId(a.getId()).size());
        return dto;
    }

    public SubmissionDto mapToSubmissionDto(Submission s) {
        SubmissionDto dto = new SubmissionDto();
        dto.setId(s.getId());
        dto.setAssignmentId(s.getAssignment().getId());
        dto.setAssignmentTitle(s.getAssignment().getTitle());
        dto.setCourseId(s.getAssignment().getCourse().getId());
        dto.setCourseCode(s.getAssignment().getCourse().getCode());
        dto.setCourseTitle(s.getAssignment().getCourse().getTitle());
        dto.setStudentId(s.getStudent().getId());
        dto.setStudentName(s.getStudent().getUser().getFullName());
        dto.setStudentRollNumber(s.getStudent().getRollNumber());
        dto.setSubmissionText(s.getSubmissionText());
        dto.setFileUrl(s.getFileUrl());
        dto.setSubmittedAt(s.getSubmittedAt());
        dto.setMarksObtained(s.getMarksObtained());
        dto.setMaxMarks(s.getAssignment().getMaxMarks());
        dto.setFeedback(s.getFeedback());
        dto.setStatus(s.getStatus());
        return dto;
    }
}
