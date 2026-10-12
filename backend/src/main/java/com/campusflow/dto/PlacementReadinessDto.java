package com.campusflow.dto;

import java.math.BigDecimal;
import java.util.List;

public class PlacementReadinessDto {
    private Long studentId;
    private String studentName;
    private String rollNumber;
    private BigDecimal currentCgpa;
    private double attendancePercentage;
    private int readinessScore; // 0 to 100
    private String readinessLevel; // NOT_READY, NEEDS_IMPROVEMENT, READY, HIGHLY_COMPETITIVE
    private boolean eligible;
    private long eligibleDrivesCount;
    private String explanation;
    private List<String> positiveFactors;
    private List<String> gapFactors;
    private List<String> recommendedActions;

    public PlacementReadinessDto() {
    }

    public Long getStudentId() {
        return studentId;
    }

    public void setStudentId(Long studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getRollNumber() {
        return rollNumber;
    }

    public void setRollNumber(String rollNumber) {
        this.rollNumber = rollNumber;
    }

    public BigDecimal getCurrentCgpa() {
        return currentCgpa;
    }

    public void setCurrentCgpa(BigDecimal currentCgpa) {
        this.currentCgpa = currentCgpa;
    }

    public double getAttendancePercentage() {
        return attendancePercentage;
    }

    public void setAttendancePercentage(double attendancePercentage) {
        this.attendancePercentage = attendancePercentage;
    }

    public int getReadinessScore() {
        return readinessScore;
    }

    public void setReadinessScore(int readinessScore) {
        this.readinessScore = readinessScore;
    }

    public String getReadinessLevel() {
        return readinessLevel;
    }

    public void setReadinessLevel(String readinessLevel) {
        this.readinessLevel = readinessLevel;
    }

    public boolean isEligible() {
        return eligible;
    }

    public void setEligible(boolean eligible) {
        this.eligible = eligible;
    }

    public long getEligibleDrivesCount() {
        return eligibleDrivesCount;
    }

    public void setEligibleDrivesCount(long eligibleDrivesCount) {
        this.eligibleDrivesCount = eligibleDrivesCount;
    }

    public String getExplanation() {
        return explanation;
    }

    public void setExplanation(String explanation) {
        this.explanation = explanation;
    }

    public List<String> getPositiveFactors() {
        return positiveFactors;
    }

    public void setPositiveFactors(List<String> positiveFactors) {
        this.positiveFactors = positiveFactors;
    }

    public List<String> getGapFactors() {
        return gapFactors;
    }

    public void setGapFactors(List<String> gapFactors) {
        this.gapFactors = gapFactors;
    }

    public List<String> getRecommendedActions() {
        return recommendedActions;
    }

    public void setRecommendedActions(List<String> recommendedActions) {
        this.recommendedActions = recommendedActions;
    }
}
