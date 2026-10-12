package com.campusflow.dto;

import java.util.List;

public class PerformanceInsightsDto {
    private Long studentId;
    private String studentName;
    private String rollNumber;
    private double attendancePercentage;
    private double averageExamMarks;
    private long totalAssignmentsSubmitted;
    private String riskStatus; // LOW_RISK, MODERATE_RISK, AT_RISK, INSUFFICIENT_DATA
    private boolean dataSufficient;
    private String statusMessage;
    private List<String> strengths;
    private List<String> areasForImprovement;
    private List<String> recommendations;

    public PerformanceInsightsDto() {
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

    public double getAttendancePercentage() {
        return attendancePercentage;
    }

    public void setAttendancePercentage(double attendancePercentage) {
        this.attendancePercentage = attendancePercentage;
    }

    public double getAverageExamMarks() {
        return averageExamMarks;
    }

    public void setAverageExamMarks(double averageExamMarks) {
        this.averageExamMarks = averageExamMarks;
    }

    public long getTotalAssignmentsSubmitted() {
        return totalAssignmentsSubmitted;
    }

    public void setTotalAssignmentsSubmitted(long totalAssignmentsSubmitted) {
        this.totalAssignmentsSubmitted = totalAssignmentsSubmitted;
    }

    public String getRiskStatus() {
        return riskStatus;
    }

    public void setRiskStatus(String riskStatus) {
        this.riskStatus = riskStatus;
    }

    public boolean isDataSufficient() {
        return dataSufficient;
    }

    public void setDataSufficient(boolean dataSufficient) {
        this.dataSufficient = dataSufficient;
    }

    public String getStatusMessage() {
        return statusMessage;
    }

    public void setStatusMessage(String statusMessage) {
        this.statusMessage = statusMessage;
    }

    public List<String> getStrengths() {
        return strengths;
    }

    public void setStrengths(List<String> strengths) {
        this.strengths = strengths;
    }

    public List<String> getAreasForImprovement() {
        return areasForImprovement;
    }

    public void setAreasForImprovement(List<String> areasForImprovement) {
        this.areasForImprovement = areasForImprovement;
    }

    public List<String> getRecommendations() {
        return recommendations;
    }

    public void setRecommendations(List<String> recommendations) {
        this.recommendations = recommendations;
    }
}
