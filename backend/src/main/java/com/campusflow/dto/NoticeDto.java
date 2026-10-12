package com.campusflow.dto;

import com.campusflow.entity.NoticeAudience;
import java.time.LocalDateTime;

public class NoticeDto {
    private Long id;
    private String title;
    private String content;
    private NoticeAudience audience;
    private boolean active;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;

    public NoticeDto() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public NoticeAudience getAudience() {
        return audience;
    }

    public void setAudience(NoticeAudience audience) {
        this.audience = audience;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Long getCreatedById() {
        return createdById;
    }

    public void setCreatedById(Long createdById) {
        this.createdById = createdById;
    }

    public String getCreatedByName() {
        return createdByName;
    }

    public void setCreatedByName(String createdByName) {
        this.createdByName = createdByName;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
