package com.campusflow.repository;

import com.campusflow.entity.Notice;
import com.campusflow.entity.NoticeAudience;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoticeRepository extends JpaRepository<Notice, Long> {
    List<Notice> findByActiveTrueOrderByCreatedAtDesc();
    List<Notice> findByActiveTrueAndAudienceInOrderByCreatedAtDesc(List<NoticeAudience> audiences);
    List<Notice> findAllByOrderByCreatedAtDesc();
}
