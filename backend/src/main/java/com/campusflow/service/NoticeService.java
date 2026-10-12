package com.campusflow.service;

import com.campusflow.dto.CreateNoticeRequest;
import com.campusflow.dto.NoticeDto;
import com.campusflow.entity.Notice;
import com.campusflow.entity.NoticeAudience;
import com.campusflow.entity.Role;
import com.campusflow.entity.User;
import com.campusflow.exception.ResourceNotFoundException;
import com.campusflow.repository.NoticeRepository;
import com.campusflow.repository.UserRepository;
import com.campusflow.security.SecurityUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
public class NoticeService {

    private final NoticeRepository noticeRepository;
    private final UserRepository userRepository;

    public NoticeService(NoticeRepository noticeRepository, UserRepository userRepository) {
        this.noticeRepository = noticeRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<NoticeDto> getAllNotices() {
        return noticeRepository.findAllByOrderByCreatedAtDesc().stream().map(this::mapToDto).toList();
    }

    @Transactional(readOnly = true)
    public List<NoticeDto> getActiveNoticesForCurrentRole() {
        Role role = SecurityUtils.getCurrentUserRole();
        if (role == Role.ADMIN) {
            return noticeRepository.findByActiveTrueOrderByCreatedAtDesc().stream().map(this::mapToDto).toList();
        } else if (role == Role.STUDENT) {
            return noticeRepository.findByActiveTrueAndAudienceInOrderByCreatedAtDesc(
                    Arrays.asList(NoticeAudience.ALL, NoticeAudience.STUDENTS)
            ).stream().map(this::mapToDto).toList();
        } else if (role == Role.FACULTY) {
            return noticeRepository.findByActiveTrueAndAudienceInOrderByCreatedAtDesc(
                    Arrays.asList(NoticeAudience.ALL, NoticeAudience.FACULTY)
            ).stream().map(this::mapToDto).toList();
        }
        return List.of();
    }

    @Transactional
    public NoticeDto createNotice(CreateNoticeRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        Notice notice = new Notice(
                request.getTitle().trim(),
                request.getContent(),
                request.getAudience(),
                request.getActive() != null ? request.getActive() : true,
                creator
        );
        Notice saved = noticeRepository.save(notice);
        return mapToDto(saved);
    }

    @Transactional
    public NoticeDto updateNotice(Long id, CreateNoticeRequest request) {
        Notice notice = noticeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notice not found with id: " + id));

        if (request.getTitle() != null) notice.setTitle(request.getTitle().trim());
        if (request.getContent() != null) notice.setContent(request.getContent());
        if (request.getAudience() != null) notice.setAudience(request.getAudience());
        if (request.getActive() != null) notice.setActive(request.getActive());

        Notice updated = noticeRepository.save(notice);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteNotice(Long id) {
        if (!noticeRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notice not found with id: " + id);
        }
        noticeRepository.deleteById(id);
    }

    public NoticeDto mapToDto(Notice n) {
        NoticeDto dto = new NoticeDto();
        dto.setId(n.getId());
        dto.setTitle(n.getTitle());
        dto.setContent(n.getContent());
        dto.setAudience(n.getAudience());
        dto.setActive(n.isActive());
        dto.setCreatedById(n.getCreatedBy().getId());
        dto.setCreatedByName(n.getCreatedBy().getFullName());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }
}
