package com.campusflow.service;

import com.campusflow.dto.*;
import com.campusflow.entity.*;
import com.campusflow.exception.BadRequestException;
import com.campusflow.exception.ConflictException;
import com.campusflow.exception.ForbiddenException;
import com.campusflow.exception.ResourceNotFoundException;
import com.campusflow.repository.PlacementApplicationRepository;
import com.campusflow.repository.PlacementDriveRepository;
import com.campusflow.repository.StudentProfileRepository;
import com.campusflow.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class PlacementService {

    private final PlacementDriveRepository driveRepository;
    private final PlacementApplicationRepository applicationRepository;
    private final StudentProfileRepository studentProfileRepository;

    public PlacementService(
            PlacementDriveRepository driveRepository,
            PlacementApplicationRepository applicationRepository,
            StudentProfileRepository studentProfileRepository
    ) {
        this.driveRepository = driveRepository;
        this.applicationRepository = applicationRepository;
        this.studentProfileRepository = studentProfileRepository;
    }

    @Transactional(readOnly = true)
    public List<PlacementDriveDto> getAllDrives() {
        return driveRepository.findAllByOrderByCreatedAtDesc().stream().map(this::mapToDriveDto).toList();
    }

    @Transactional(readOnly = true)
    public List<PlacementDriveDto> getActiveDrives() {
        return driveRepository.findByActiveTrueOrderByDeadlineAsc().stream().map(this::mapToDriveDto).toList();
    }

    @Transactional(readOnly = true)
    public PlacementDriveDto getDriveById(Long id) {
        PlacementDrive drive = driveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Placement drive not found with id: " + id));
        return mapToDriveDto(drive);
    }

    @Transactional
    public PlacementDriveDto createPlacementDrive(CreatePlacementDriveRequest request) {
        PlacementDrive drive = new PlacementDrive(
                request.getCompanyName().trim(),
                request.getJobTitle().trim(),
                request.getJobDescription(),
                request.getEligibilityCriteria(),
                request.getMinCgpa(),
                request.getPackageDetails(),
                request.getDeadline(),
                request.getActive() != null ? request.getActive() : true
        );
        PlacementDrive saved = driveRepository.save(drive);
        return mapToDriveDto(saved);
    }

    @Transactional
    public PlacementDriveDto updatePlacementDrive(Long id, CreatePlacementDriveRequest request) {
        PlacementDrive drive = driveRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Placement drive not found with id: " + id));

        if (request.getCompanyName() != null) drive.setCompanyName(request.getCompanyName().trim());
        if (request.getJobTitle() != null) drive.setJobTitle(request.getJobTitle().trim());
        if (request.getJobDescription() != null) drive.setJobDescription(request.getJobDescription());
        if (request.getEligibilityCriteria() != null) drive.setEligibilityCriteria(request.getEligibilityCriteria());
        if (request.getMinCgpa() != null) drive.setMinCgpa(request.getMinCgpa());
        if (request.getPackageDetails() != null) drive.setPackageDetails(request.getPackageDetails());
        if (request.getDeadline() != null) drive.setDeadline(request.getDeadline());
        if (request.getActive() != null) drive.setActive(request.getActive());

        PlacementDrive updated = driveRepository.save(drive);
        return mapToDriveDto(updated);
    }

    @Transactional
    public void deletePlacementDrive(Long id) {
        if (!driveRepository.existsById(id)) {
            throw new ResourceNotFoundException("Placement drive not found with id: " + id);
        }
        driveRepository.deleteById(id);
    }

    @Transactional
    public PlacementApplicationDto applyToDrive(ApplyPlacementRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        StudentProfile student = studentProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new ForbiddenException("Only registered students can apply for placement drives"));

        PlacementDrive drive = driveRepository.findById(request.getPlacementDriveId())
                .orElseThrow(() -> new ResourceNotFoundException("Placement drive not found with id: " + request.getPlacementDriveId()));

        if (!drive.isActive()) {
            throw new BadRequestException("This placement drive is currently inactive");
        }

        if (LocalDateTime.now().isAfter(drive.getDeadline())) {
            throw new BadRequestException("The application deadline for this drive has passed");
        }

        if (applicationRepository.existsByPlacementDriveIdAndStudentId(drive.getId(), student.getId())) {
            throw new ConflictException("You have already applied to this placement drive");
        }

        // Validate eligibility criteria (CGPA)
        if (drive.getMinCgpa() != null && student.getCgpa().compareTo(drive.getMinCgpa()) < 0) {
            throw new BadRequestException("Your current CGPA (" + student.getCgpa() + ") does not meet the minimum eligibility requirement (" + drive.getMinCgpa() + ")");
        }

        PlacementApplication application = new PlacementApplication(drive, student, request.getRemarks());
        PlacementApplication saved = applicationRepository.save(application);
        return mapToApplicationDto(saved);
    }

    @Transactional(readOnly = true)
    public List<PlacementApplicationDto> getApplicationsForDrive(Long driveId) {
        return applicationRepository.findByPlacementDriveId(driveId).stream()
                .map(this::mapToApplicationDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PlacementApplicationDto> getApplicationsForStudent(Long studentId) {
        return applicationRepository.findByStudentId(studentId).stream()
                .map(this::mapToApplicationDto)
                .toList();
    }

    @Transactional
    public PlacementApplicationDto updateApplicationStatus(Long applicationId, UpdateApplicationStatusRequest request) {
        PlacementApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        application.setStatus(request.getStatus());
        if (request.getRemarks() != null) {
            application.setRemarks(request.getRemarks());
        }
        PlacementApplication updated = applicationRepository.save(application);
        return mapToApplicationDto(updated);
    }

    public PlacementDriveDto mapToDriveDto(PlacementDrive d) {
        PlacementDriveDto dto = new PlacementDriveDto();
        dto.setId(d.getId());
        dto.setCompanyName(d.getCompanyName());
        dto.setJobTitle(d.getJobTitle());
        dto.setJobDescription(d.getJobDescription());
        dto.setEligibilityCriteria(d.getEligibilityCriteria());
        dto.setMinCgpa(d.getMinCgpa());
        dto.setPackageDetails(d.getPackageDetails());
        dto.setDeadline(d.getDeadline());
        dto.setActive(d.isActive());
        dto.setTotalApplications(applicationRepository.findByPlacementDriveId(d.getId()).size());
        dto.setCreatedAt(d.getCreatedAt());
        return dto;
    }

    public PlacementApplicationDto mapToApplicationDto(PlacementApplication a) {
        PlacementApplicationDto dto = new PlacementApplicationDto();
        dto.setId(a.getId());
        dto.setPlacementDriveId(a.getPlacementDrive().getId());
        dto.setCompanyName(a.getPlacementDrive().getCompanyName());
        dto.setJobTitle(a.getPlacementDrive().getJobTitle());
        dto.setPackageDetails(a.getPlacementDrive().getPackageDetails());
        dto.setStudentId(a.getStudent().getId());
        dto.setStudentName(a.getStudent().getUser().getFullName());
        dto.setStudentRollNumber(a.getStudent().getRollNumber());
        if (a.getStudent().getDepartment() != null) {
            dto.setStudentDepartment(a.getStudent().getDepartment().getName());
        }
        dto.setStudentCgpa(a.getStudent().getCgpa());
        dto.setAppliedAt(a.getAppliedAt());
        dto.setStatus(a.getStatus());
        dto.setRemarks(a.getRemarks());
        return dto;
    }
}
