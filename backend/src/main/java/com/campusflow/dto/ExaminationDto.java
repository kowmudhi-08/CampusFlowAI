package com.campusflow.dto;

import com.campusflow.entity.ExamType;
import java.math.BigDecimal;
import java.time.LocalDate;

public class ExaminationDto {
    private Long id;
    private String title;
    private Long courseId;
    private String courseCode;
    private String courseTitle;
    private LocalDate examDate;
    private BigDecimal maxMarks;
    private ExamType examType;
    private boolean published;

    public ExaminationDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public Long getCourseId() {
        return courseId;
    }

    public void setCourseId(Long courseId) {
        this.courseId = courseId;
    }

    public String getCourseCode() {
        return courseCode;
    }

    public void setCourseCode(String courseCode) {
        this.courseCode = courseCode;
    }

    public String getCourseTitle() {
        return courseTitle;
    }

    public void setCourseTitle(String courseTitle) {
        this.courseTitle = courseTitle;
    }

    public LocalDate getExamDate() {
        return examDate;
    }

    public void setExamDate(LocalDate examDate) {
        this.examDate = examDate;
    }

    public BigDecimal getMaxMarks() {
        return maxMarks;
    }

    public void setMaxMarks(BigDecimal maxMarks) {
        this.maxMarks = maxMarks;
    }

    public ExamType getExamType() {
        return examType;
    }

    public void setExamType(ExamType examType) {
        this.examType = examType;
    }

    public boolean isPublished() {
        return published;
    }

    public void setPublished(boolean published) {
        this.published = published;
    }
}
