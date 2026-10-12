package com.campusflow.dto;

import com.campusflow.entity.NoticeAudience;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateNoticeRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 2, max = 255)
    private String title;

    @NotBlank(message = "Content is required")
    private String content;

    private NoticeAudience audience = NoticeAudience.ALL;
    private Boolean active = true;

    public CreateNoticeRequest() {
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

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
