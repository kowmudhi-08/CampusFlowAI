package com.campusflow.dto;

public class CourseDto {
    private Long id;
    private String code;
    private String title;
    private String description;
    private Integer credits;
    private Long departmentId;
    private String departmentName;
    private Long facultyId;
    private String facultyName;
    private Long academicSessionId;
    private String academicSessionName;
    private Integer semester;
    private long enrolledStudentsCount;

    public CourseDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getCredits() {
        return credits;
    }

    public void setCredits(Integer credits) {
        this.credits = credits;
    }

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public Long getFacultyId() {
        return facultyId;
    }

    public void setFacultyId(Long facultyId) {
        this.facultyId = facultyId;
    }

    public String getFacultyName() {
        return facultyName;
    }

    public void setFacultyName(String facultyName) {
        this.facultyName = facultyName;
    }

    public Long getAcademicSessionId() {
        return academicSessionId;
    }

    public void setAcademicSessionId(Long academicSessionId) {
        this.academicSessionId = academicSessionId;
    }

    public String getAcademicSessionName() {
        return academicSessionName;
    }

    public void setAcademicSessionName(String academicSessionName) {
        this.academicSessionName = academicSessionName;
    }

    public Integer getSemester() {
        return semester;
    }

    public void setSemester(Integer semester) {
        this.semester = semester;
    }

    public long getEnrolledStudentsCount() {
        return enrolledStudentsCount;
    }

    public void setEnrolledStudentsCount(long enrolledStudentsCount) {
        this.enrolledStudentsCount = enrolledStudentsCount;
    }
}
