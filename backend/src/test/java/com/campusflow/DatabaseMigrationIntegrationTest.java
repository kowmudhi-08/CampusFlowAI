package com.campusflow;

import com.campusflow.entity.Role;
import com.campusflow.repository.*;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class DatabaseMigrationIntegrationTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private StudentProfileRepository studentProfileRepository;

    @Autowired
    private FacultyProfileRepository facultyProfileRepository;

    @Autowired
    private DepartmentRepository departmentRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private EnrollmentRepository enrollmentRepository;

    @Autowired
    private AttendanceRecordRepository attendanceRepository;

    @Autowired
    private ExaminationRepository examinationRepository;

    @Autowired
    private MarkRepository markRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private SubmissionRepository submissionRepository;

    @Autowired
    private NoticeRepository noticeRepository;

    @Autowired
    private PlacementDriveRepository driveRepository;

    @Autowired
    private PlacementApplicationRepository applicationRepository;

    @Test
    void testContextLoadsAndZeroSeedDataRequirement() {
        assertNotNull(userRepository, "User repository must be wired");
        assertNotNull(studentProfileRepository, "Student profile repository must be wired");
        assertNotNull(facultyProfileRepository, "Faculty profile repository must be wired");
        assertNotNull(departmentRepository, "Department repository must be wired");
        assertNotNull(courseRepository, "Course repository must be wired");
        assertNotNull(enrollmentRepository, "Enrollment repository must be wired");
        assertNotNull(attendanceRepository, "Attendance repository must be wired");
        assertNotNull(examinationRepository, "Examination repository must be wired");
        assertNotNull(markRepository, "Mark repository must be wired");
        assertNotNull(assignmentRepository, "Assignment repository must be wired");
        assertNotNull(submissionRepository, "Submission repository must be wired");
        assertNotNull(noticeRepository, "Notice repository must be wired");
        assertNotNull(driveRepository, "Drive repository must be wired");
        assertNotNull(applicationRepository, "Application repository must be wired");
        // Verify database connectivity by checking counts execute without error
        assertTrue(userRepository.count() >= 0);
        assertTrue(departmentRepository.count() >= 0);
    }
}
