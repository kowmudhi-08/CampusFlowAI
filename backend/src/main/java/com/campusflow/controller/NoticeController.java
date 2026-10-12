package com.campusflow.controller;

import com.campusflow.dto.CreateNoticeRequest;
import com.campusflow.dto.NoticeDto;
import com.campusflow.service.NoticeService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notices")
@Tag(name = "Notices", description = "Institutional notices and announcements")
public class NoticeController {

    private final NoticeService noticeService;

    public NoticeController(NoticeService noticeService) {
        this.noticeService = noticeService;
    }

    @GetMapping
    public ResponseEntity<List<NoticeDto>> getAllNotices() {
        return ResponseEntity.ok(noticeService.getAllNotices());
    }

    @GetMapping("/feed")
    public ResponseEntity<List<NoticeDto>> getNoticesFeed() {
        return ResponseEntity.ok(noticeService.getActiveNoticesForCurrentRole());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<NoticeDto> createNotice(@Valid @RequestBody CreateNoticeRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(noticeService.createNotice(request));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'FACULTY')")
    public ResponseEntity<NoticeDto> updateNotice(@PathVariable Long id, @Valid @RequestBody CreateNoticeRequest request) {
        return ResponseEntity.ok(noticeService.updateNotice(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> deleteNotice(@PathVariable Long id) {
        noticeService.deleteNotice(id);
        return ResponseEntity.ok(Map.of("message", "Notice deleted successfully"));
    }
}
