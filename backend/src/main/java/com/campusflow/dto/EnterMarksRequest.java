package com.campusflow.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class EnterMarksRequest {

    @NotNull(message = "Examination ID is required")
    private Long examinationId;

    @NotEmpty(message = "Marks list cannot be empty")
    @Valid
    private List<StudentMarkItem> marksList;

    public EnterMarksRequest() {
    }

    public Long getExaminationId() {
        return examinationId;
    }

    public void setExaminationId(Long examinationId) {
        this.examinationId = examinationId;
    }

    public List<StudentMarkItem> getMarksList() {
        return marksList;
    }

    public void setMarksList(List<StudentMarkItem> marksList) {
        this.marksList = marksList;
    }
}
