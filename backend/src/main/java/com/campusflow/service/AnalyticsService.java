package com.campusflow.service;

import com.campusflow.dto.*;
import com.campusflow.entity.*;
import com.campusflow.exception.ResourceNotFoundException;
import com.campusflow.repository.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class AnalyticsService {

    private final UserRepository userRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final FacultyProfileRepository facultyProfileRepository;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final AttendanceRecordRepository attendanceRepository;
    private final ExaminationRepository examinationRepository;
    private final MarkRepository markRepository;
    private final AssignmentRepository assignmentRepository;
    private final SubmissionRepository submissionRepository;
    private final NoticeRepository noticeRepository;
    private final PlacementDriveRepository driveRepository;
    private final PlacementApplicationRepository applicationRepository;

    @Value("${campusflow.attendance.threshold-percent:75.0}")
    private double warningThresholdPercent;

    public AnalyticsService(
            UserRepository userRepository,
            StudentProfileRepository studentProfileRepository,
            FacultyProfileRepository facultyProfileRepository,
            DepartmentRepository departmentRepository,
            CourseRepository courseRepository,
            EnrollmentRepository enrollmentRepository,
            AttendanceRecordRepository attendanceRepository,
            ExaminationRepository examinationRepository,
            MarkRepository markRepository,
            AssignmentRepository assignmentRepository,
            SubmissionRepository submissionRepository,
            NoticeRepository noticeRepository,
            PlacementDriveRepository driveRepository,
            PlacementApplicationRepository applicationRepository
    ) {
        this.userRepository = userRepository;
        this.studentProfileRepository = studentProfileRepository;
        this.facultyProfileRepository = facultyProfileRepository;
        this.departmentRepository = departmentRepository;
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
        this.attendanceRepository = attendanceRepository;
        this.examinationRepository = examinationRepository;
        this.markRepository = markRepository;
        this.assignmentRepository = assignmentRepository;
        this.submissionRepository = submissionRepository;
        this.noticeRepository = noticeRepository;
        this.driveRepository = driveRepository;
        this.applicationRepository = applicationRepository;
    }

    @Transactional(readOnly = true)
    public DashboardMetricsDto getDashboardMetrics() {
        DashboardMetricsDto dto = new DashboardMetricsDto();
        dto.setTotalStudents(studentProfileRepository.count());
        dto.setTotalFaculty(facultyProfileRepository.count());
        dto.setTotalDepartments(departmentRepository.count());
        dto.setTotalCourses(courseRepository.count());
        dto.setTotalEnrollments(enrollmentRepository.count());
        dto.setTotalAttendanceRecords(attendanceRepository.count());
        dto.setTotalExaminations(examinationRepository.count());
        dto.setTotalAssignments(assignmentRepository.count());
        dto.setActiveNotices(noticeRepository.findByActiveTrueOrderByCreatedAtDesc().size());
        dto.setActivePlacementDrives(driveRepository.findByActiveTrueOrderByDeadlineAsc().size());
        dto.setTotalApplications(applicationRepository.count());
        return dto;
    }

    @Transactional(readOnly = true)
    public PerformanceInsightsDto calculatePerformanceInsights(Long studentId) {
        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        List<AttendanceRecord> attendanceRecords = attendanceRepository.findByStudentId(student.getId());
        List<Mark> marks = markRepository.findByStudentId(student.getId());
        List<Submission> submissions = submissionRepository.findByStudentId(student.getId());

        PerformanceInsightsDto insights = new PerformanceInsightsDto();
        insights.setStudentId(student.getId());
        insights.setStudentName(student.getUser().getFullName());
        insights.setRollNumber(student.getRollNumber());
        insights.setTotalAssignmentsSubmitted(submissions.size());

        // Zero-data / Insufficient-data safety check
        if (attendanceRecords.size() < 3 && marks.isEmpty()) {
            insights.setDataSufficient(false);
            insights.setRiskStatus("INSUFFICIENT_DATA");
            insights.setStatusMessage("Not enough academic data is available for AI predictions. At least 3 attendance sessions and recorded examination marks are required.");
            insights.setAttendancePercentage(0.0);
            insights.setAverageExamMarks(0.0);
            insights.setStrengths(List.of("Student profile registered"));
            insights.setAreasForImprovement(List.of("Awaiting attendance logging and examination marks"));
            insights.setRecommendations(List.of("Attend scheduled classes and participate in examinations to generate performance insights"));
            return insights;
        }

        insights.setDataSufficient(true);

        // Attendance Percentage
        double attendancePercent = 0.0;
        if (!attendanceRecords.isEmpty()) {
            long present = attendanceRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
            long late = attendanceRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.LATE).count();
            attendancePercent = ((present + (late * 0.5)) / attendanceRecords.size()) * 100.0;
            attendancePercent = Math.round(attendancePercent * 100.0) / 100.0;
        }
        insights.setAttendancePercentage(attendancePercent);

        // Average Exam Marks
        double avgExamMarks = 0.0;
        if (!marks.isEmpty()) {
            double totalPct = 0.0;
            int count = 0;
            for (Mark m : marks) {
                if (m.getExamination().getMaxMarks().compareTo(BigDecimal.ZERO) > 0) {
                    totalPct += (m.getMarksObtained().doubleValue() / m.getExamination().getMaxMarks().doubleValue()) * 100.0;
                    count++;
                }
            }
            if (count > 0) {
                avgExamMarks = Math.round((totalPct / count) * 100.0) / 100.0;
            }
        }
        insights.setAverageExamMarks(avgExamMarks);

        // Risk Assessment
        List<String> strengths = new ArrayList<>();
        List<String> areas = new ArrayList<>();
        List<String> recommendations = new ArrayList<>();

        if (attendancePercent >= warningThresholdPercent) {
            strengths.add("Strong attendance consistency (" + attendancePercent + "%)");
        } else {
            areas.add("Attendance is below institutional threshold (" + attendancePercent + "% < " + warningThresholdPercent + "%)");
            recommendations.add("Prioritize class attendance to prevent examination eligibility sanctions");
        }

        if (avgExamMarks >= 75.0) {
            strengths.add("High academic performance with an average score of " + avgExamMarks + "%");
        } else if (avgExamMarks >= 50.0) {
            areas.add("Moderate test scores (" + avgExamMarks + "%); room for academic improvement");
            recommendations.add("Review lecture notes and consult faculty during office hours for challenging topics");
        } else if (!marks.isEmpty()) {
            areas.add("Academic score average is concerning (" + avgExamMarks + "%)");
            recommendations.add("Academic mentoring recommended. Attend remedial sessions and revision clinics");
        }

        if (!submissions.isEmpty()) {
            strengths.add("Actively submitted " + submissions.size() + " assignments");
        } else {
            areas.add("No assignment submissions recorded yet");
            recommendations.add("Complete and submit course assignments before upcoming deadlines");
        }

        String riskStatus;
        if (attendancePercent < 60.0 || (avgExamMarks < 45.0 && !marks.isEmpty())) {
            riskStatus = "AT_RISK";
            insights.setStatusMessage("Student demonstrates high risk factors requiring immediate academic intervention.");
        } else if (attendancePercent < warningThresholdPercent || (avgExamMarks < 60.0 && !marks.isEmpty())) {
            riskStatus = "MODERATE_RISK";
            insights.setStatusMessage("Student exhibits moderate risk factors. Targeted attention suggested.");
        } else {
            riskStatus = "LOW_RISK";
            insights.setStatusMessage("Student maintains positive academic standing across attendance and assessments.");
        }

        insights.setRiskStatus(riskStatus);
        insights.setStrengths(strengths);
        insights.setAreasForImprovement(areas);
        insights.setRecommendations(recommendations);
        return insights;
    }

    @Transactional(readOnly = true)
    public PlacementReadinessDto calculatePlacementReadiness(Long studentId) {
        StudentProfile student = studentProfileRepository.findById(studentId)
                .orElseThrow(() -> new ResourceNotFoundException("Student not found with id: " + studentId));

        BigDecimal cgpa = student.getCgpa() != null ? student.getCgpa() : BigDecimal.ZERO;
        List<AttendanceRecord> attendanceRecords = attendanceRepository.findByStudentId(student.getId());
        List<PlacementDrive> activeDrives = driveRepository.findByActiveTrueOrderByDeadlineAsc();

        double attendancePercent = 0.0;
        if (!attendanceRecords.isEmpty()) {
            long present = attendanceRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.PRESENT).count();
            long late = attendanceRecords.stream().filter(r -> r.getStatus() == AttendanceStatus.LATE).count();
            attendancePercent = Math.round((((present + (late * 0.5)) / attendanceRecords.size()) * 100.0) * 100.0) / 100.0;
        }

        long eligibleCount = activeDrives.stream()
                .filter(d -> d.getMinCgpa() == null || cgpa.compareTo(d.getMinCgpa()) >= 0)
                .count();

        // Calculate transparent readiness score (0-100)
        // Weight: CGPA (50%), Attendance (30%), Assignment Activity (20%)
        double cgpaScore = Math.min(10.0, cgpa.doubleValue()) / 10.0 * 50.0;
        double attScore = (attendancePercent / 100.0) * 30.0;
        long subCount = submissionRepository.findByStudentId(student.getId()).size();
        double subScore = Math.min(5.0, subCount) / 5.0 * 20.0;

        int readinessScore = (int) Math.round(cgpaScore + attScore + subScore);

        String level;
        if (readinessScore >= 80) {
            level = "HIGHLY_COMPETITIVE";
        } else if (readinessScore >= 65) {
            level = "READY";
        } else if (readinessScore >= 45) {
            level = "NEEDS_IMPROVEMENT";
        } else {
            level = "NOT_READY";
        }

        List<String> positive = new ArrayList<>();
        List<String> gaps = new ArrayList<>();
        List<String> actions = new ArrayList<>();

        if (cgpa.compareTo(BigDecimal.valueOf(7.5)) >= 0) {
            positive.add("Strong cumulative CGPA of " + cgpa + "/10.0");
        } else if (cgpa.compareTo(BigDecimal.valueOf(6.0)) >= 0) {
            positive.add("Satisfactory CGPA of " + cgpa + "/10.0");
        } else {
            gaps.add("Current CGPA (" + cgpa + ") restricts qualification for competitive drives");
            actions.add("Improve examination scores in upcoming semester modules to raise CGPA above 6.5");
        }

        if (attendancePercent >= warningThresholdPercent) {
            positive.add("Reliable attendance discipline (" + attendancePercent + "%)");
        } else if (!attendanceRecords.isEmpty()) {
            gaps.add("Attendance consistency (" + attendancePercent + "%) is below institutional benchmark");
            actions.add("Maintain regular classroom and lab attendance");
        }

        if (subCount > 0) {
            positive.add("Demonstrated practical coursework diligence (" + subCount + " assignments)");
        } else {
            actions.add("Engage in technical assignments to demonstrate applied competence");
        }

        PlacementReadinessDto dto = new PlacementReadinessDto();
        dto.setStudentId(student.getId());
        dto.setStudentName(student.getUser().getFullName());
        dto.setRollNumber(student.getRollNumber());
        dto.setCurrentCgpa(cgpa);
        dto.setAttendancePercentage(attendancePercent);
        dto.setReadinessScore(readinessScore);
        dto.setReadinessLevel(level);
        dto.setEligible(eligibleCount > 0);
        dto.setEligibleDrivesCount(eligibleCount);
        dto.setExplanation("Readiness calculated objectively from verified CGPA (" + cgpa + "), attendance record (" + attendancePercent + "%), and practical submissions. No demographic or sensitive attributes are evaluated.");
        dto.setPositiveFactors(positive);
        dto.setGapFactors(gaps);
        dto.setRecommendedActions(actions);
        return dto;
    }
}
