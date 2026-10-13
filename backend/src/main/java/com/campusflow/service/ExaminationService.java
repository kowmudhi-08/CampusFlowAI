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
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class ExaminationService {

    private final ExaminationRepository examinationRepository;
    private final MarkRepository markRepository;
    private final CourseRepository courseRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final FacultyProfileRepository facultyProfileRepository;

    public ExaminationService(
            ExaminationRepository examinationRepository,
            MarkRepository markRepository,
            CourseRepository courseRepository,
            StudentProfileRepository studentProfileRepository,
            FacultyProfileRepository facultyProfileRepository
    ) {
        this.examinationRepository = examinationRepository;
        this.markRepository = markRepository;
        this.courseRepository = courseRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.facultyProfileRepository = facultyProfileRepository;
    }

    @Transactional(readOnly = true)
    public List<ExaminationDto> getAllExaminations() {
        return examinationRepository.findAll().stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public List<ExaminationDto> getExaminationsByCourse(Long courseId) {
        return examinationRepository.findByCourseId(courseId).stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public List<ExaminationDto> getPublishedExaminations() {
        return examinationRepository.findByPublishedTrue().stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public ExaminationDto getExaminationById(Long id) {
        Examination exam = examinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Examination not found with id: " + id));
        return mapToDto(exam);
    }

    @Transactional
    public ExaminationDto createExamination(CreateExamRequest request) {
        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + request.getCourseId()));

        if (examinationRepository.existsByTitleIgnoreCaseAndCourseId(request.getTitle().trim(), course.getId())) {
            throw new ConflictException("An examination with title '" + request.getTitle().trim() + "' already exists for this course");
        }

        if (SecurityUtils.getCurrentUserRole() == Role.FACULTY) {
            FacultyProfile faculty = facultyProfileRepository.findByUserId(SecurityUtils.getCurrentUserId())
                    .orElseThrow(() -> new ForbiddenException("Faculty profile not found"));
            if (course.getFaculty() != null && !course.getFaculty().getId().equals(faculty.getId())) {
                throw new ForbiddenException("You can only create exams for your assigned courses");
            }
        }

        Examination exam = new Examination(
                request.getTitle().trim(),
                course,
                request.getExamDate(),
                request.getMaxMarks(),
                request.getExamType(),
                request.getPublished() != null ? request.getPublished() : false
        );
        exam.setStartTime(request.getStartTime());
        exam.setDurationMinutes(request.getDurationMinutes());

        Examination saved = examinationRepository.save(exam);
        return mapToDto(saved);
    }

    @Transactional
    public ExaminationDto updateExamination(Long id, CreateExamRequest request) {
        Examination exam = examinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Examination not found with id: " + id));

        if (request.getTitle() != null) exam.setTitle(request.getTitle().trim());
        if (request.getExamDate() != null) exam.setExamDate(request.getExamDate());
        if (request.getStartTime() != null) exam.setStartTime(request.getStartTime());
        if (request.getDurationMinutes() != null) exam.setDurationMinutes(request.getDurationMinutes());
        if (request.getMaxMarks() != null) exam.setMaxMarks(request.getMaxMarks());
        if (request.getExamType() != null) exam.setExamType(request.getExamType());
        if (request.getPublished() != null) exam.setPublished(request.getPublished());

        Examination updated = examinationRepository.save(exam);
        return mapToDto(updated);
    }

    @Transactional
    public ExaminationDto publishExamination(Long id, boolean published) {
        Examination exam = examinationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Examination not found with id: " + id));
        exam.setPublished(published);
        Examination updated = examinationRepository.save(exam);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteExamination(Long id) {
        if (!examinationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Examination not found with id: " + id);
        }
        examinationRepository.deleteById(id);
    }

    @Transactional
    public List<MarkDto> enterMarks(EnterMarksRequest request) {
        Examination exam = examinationRepository.findById(request.getExaminationId())
                .orElseThrow(() -> new ResourceNotFoundException("Examination not found with id: " + request.getExaminationId()));

        List<Mark> savedMarks = new ArrayList<>();
        for (StudentMarkItem item : request.getMarksList()) {
            if (item.getMarksObtained().compareTo(exam.getMaxMarks()) > 0) {
                throw new BadRequestException("Marks obtained cannot exceed maximum marks (" + exam.getMaxMarks() + ")");
            }

            StudentProfile student = studentProfileRepository.findById(item.getStudentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + item.getStudentId()));

            Optional<Mark> existing = markRepository.findByExaminationIdAndStudentId(exam.getId(), student.getId());
            Mark mark;
            if (existing.isPresent()) {
                mark = existing.get();
                mark.setMarksObtained(item.getMarksObtained());
                mark.setRemarks(item.getRemarks());
            } else {
                mark = new Mark(exam, student, item.getMarksObtained(), item.getRemarks());
            }
            savedMarks.add(markRepository.save(mark));
        }

        // Recalculate CGPA / student average
        updateStudentCgpas(savedMarks);

        return savedMarks.stream().map(this::mapToMarkDto).toList();
    }

    private void updateStudentCgpas(List<Mark> marks) {
        for (Mark mark : marks) {
            StudentProfile student = mark.getStudent();
            List<Mark> studentMarks = markRepository.findByStudentId(student.getId());
            if (!studentMarks.isEmpty()) {
                double totalPercent = 0.0;
                int count = 0;
                for (Mark m : studentMarks) {
                    if (m.getExamination().getMaxMarks().compareTo(BigDecimal.ZERO) > 0) {
                        double p = m.getMarksObtained().doubleValue() / m.getExamination().getMaxMarks().doubleValue() * 10.0;
                        totalPercent += p;
                        count++;
                    }
                }
                if (count > 0) {
                    double gpa = totalPercent / count;
                    student.setCgpa(BigDecimal.valueOf(gpa).setScale(2, RoundingMode.HALF_UP));
                    studentProfileRepository.save(student);
                }
            }
        }
    }

    @Transactional(readOnly = true)
    public List<MarkDto> getMarksByExamination(Long examId) {
        return markRepository.findByExaminationId(examId).stream().map(this::mapToMarkDto).toList();
    }

    @Transactional(readOnly = true)
    public List<MarkDto> getMarksByStudent(Long studentId, boolean onlyPublished) {
        List<Mark> marks;
        if (onlyPublished) {
            marks = markRepository.findByStudentIdAndExaminationPublishedTrue(studentId);
        } else {
            marks = markRepository.findByStudentId(studentId);
        }
        return marks.stream().map(this::mapToMarkDto).toList();
    }

    public ExaminationDto mapToDto(Examination e) {
        ExaminationDto dto = new ExaminationDto();
        dto.setId(e.getId());
        dto.setTitle(e.getTitle());
        dto.setCourseId(e.getCourse().getId());
        dto.setCourseCode(e.getCourse().getCode());
        dto.setCourseTitle(e.getCourse().getTitle());
        dto.setExamDate(e.getExamDate());
        dto.setStartTime(e.getStartTime());
        dto.setDurationMinutes(e.getDurationMinutes());
        dto.setMaxMarks(e.getMaxMarks());
        dto.setExamType(e.getExamType());
        dto.setPublished(e.isPublished());
        return dto;
    }

    public MarkDto mapToMarkDto(Mark m) {
        MarkDto dto = new MarkDto();
        dto.setId(m.getId());
        dto.setExaminationId(m.getExamination().getId());
        dto.setExamTitle(m.getExamination().getTitle());
        dto.setCourseId(m.getExamination().getCourse().getId());
        dto.setCourseCode(m.getExamination().getCourse().getCode());
        dto.setCourseTitle(m.getExamination().getCourse().getTitle());
        dto.setStudentId(m.getStudent().getId());
        dto.setStudentName(m.getStudent().getUser().getFullName());
        dto.setStudentRollNumber(m.getStudent().getRollNumber());
        dto.setMarksObtained(m.getMarksObtained());
        dto.setMaxMarks(m.getExamination().getMaxMarks());
        double percentage = 0.0;
        if (m.getExamination().getMaxMarks().compareTo(BigDecimal.ZERO) > 0) {
            percentage = m.getMarksObtained().doubleValue() / m.getExamination().getMaxMarks().doubleValue() * 100.0;
            percentage = Math.round(percentage * 100.0) / 100.0;
        }
        dto.setPercentage(percentage);
        dto.setRemarks(m.getRemarks());
        return dto;
    }
}
