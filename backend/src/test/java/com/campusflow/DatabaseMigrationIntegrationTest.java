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
        // Absolute requirement: zero initial business records!
        assertEquals(0, userRepository.countByRole(Role.ADMIN), "Zero admin records must be seeded");
        assertEquals(0, studentProfileRepository.count(), "Zero student records must be seeded");
        assertEquals(0, facultyProfileRepository.count(), "Zero faculty records must be seeded");
        assertEquals(0, departmentRepository.count(), "Zero departments must be seeded");
        assertEquals(0, courseRepository.count(), "Zero courses must be seeded");
        assertEquals(0, enrollmentRepository.count(), "Zero enrollments must be seeded");
        assertEquals(0, attendanceRepository.count(), "Zero attendance records must be seeded");
        assertEquals(0, examinationRepository.count(), "Zero exams must be seeded");
        assertEquals(0, markRepository.count(), "Zero marks must be seeded");
        assertEquals(0, assignmentRepository.count(), "Zero assignments must be seeded");
        assertEquals(0, submissionRepository.count(), "Zero submissions must be seeded");
        assertEquals(0, noticeRepository.count(), "Zero notices must be seeded");
        assertEquals(0, driveRepository.count(), "Zero placement drives must be seeded");
        assertEquals(0, applicationRepository.count(), "Zero placement applications must be seeded");
    }
}
