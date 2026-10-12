package com.campusflow.repository;

import com.campusflow.entity.PlacementDrive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PlacementDriveRepository extends JpaRepository<PlacementDrive, Long> {
    List<PlacementDrive> findByActiveTrueOrderByDeadlineAsc();
    List<PlacementDrive> findAllByOrderByCreatedAtDesc();
}
