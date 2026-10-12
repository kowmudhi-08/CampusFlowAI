package com.campusflow.repository;

import com.campusflow.entity.PlacementApplication;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PlacementApplicationRepository extends JpaRepository<PlacementApplication, Long> {
    List<PlacementApplication> findByPlacementDriveId(Long placementDriveId);
    List<PlacementApplication> findByStudentId(Long studentId);
    Optional<PlacementApplication> findByPlacementDriveIdAndStudentId(Long placementDriveId, Long studentId);
    boolean existsByPlacementDriveIdAndStudentId(Long placementDriveId, Long studentId);
}
