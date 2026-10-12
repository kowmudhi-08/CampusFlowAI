package com.campusflow.service;

import com.campusflow.dto.AcademicSessionDto;
import com.campusflow.entity.AcademicSession;
import com.campusflow.exception.ConflictException;
import com.campusflow.exception.ResourceNotFoundException;
import com.campusflow.repository.AcademicSessionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AcademicSessionService {

    private final AcademicSessionRepository sessionRepository;

    public AcademicSessionService(AcademicSessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
    }

    @Transactional(readOnly = true)
    public List<AcademicSessionDto> getAllSessions() {
        return sessionRepository.findAll().stream()
                .map(this::mapToDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public AcademicSessionDto getSessionById(Long id) {
        AcademicSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Academic session not found with id: " + id));
        return mapToDto(session);
    }

    @Transactional
    public AcademicSessionDto createSession(AcademicSessionDto dto) {
        if (sessionRepository.existsByName(dto.getName().trim())) {
            throw new ConflictException("Academic session with name already exists: " + dto.getName());
        }

        if (dto.isCurrent()) {
            sessionRepository.findByCurrentTrue().ifPresent(s -> {
                s.setCurrent(false);
                sessionRepository.save(s);
            });
        }

        AcademicSession session = new AcademicSession(
                dto.getName().trim(),
                dto.getStartDate(),
                dto.getEndDate(),
                dto.isCurrent()
        );
        AcademicSession saved = sessionRepository.save(session);
        return mapToDto(saved);
    }

    @Transactional
    public AcademicSessionDto updateSession(Long id, AcademicSessionDto dto) {
        AcademicSession session = sessionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Academic session not found with id: " + id));

        if (!session.getName().equalsIgnoreCase(dto.getName().trim()) && sessionRepository.existsByName(dto.getName().trim())) {
            throw new ConflictException("Academic session with name already exists: " + dto.getName());
        }

        if (dto.isCurrent() && !session.isCurrent()) {
            sessionRepository.findByCurrentTrue().ifPresent(s -> {
                s.setCurrent(false);
                sessionRepository.save(s);
            });
        }

        session.setName(dto.getName().trim());
        session.setStartDate(dto.getStartDate());
        session.setEndDate(dto.getEndDate());
        session.setCurrent(dto.isCurrent());
        AcademicSession updated = sessionRepository.save(session);
        return mapToDto(updated);
    }

    @Transactional
    public void deleteSession(Long id) {
        if (!sessionRepository.existsById(id)) {
            throw new ResourceNotFoundException("Academic session not found with id: " + id);
        }
        sessionRepository.deleteById(id);
    }

    private AcademicSessionDto mapToDto(AcademicSession s) {
        return new AcademicSessionDto(s.getId(), s.getName(), s.getStartDate(), s.getEndDate(), s.isCurrent());
    }
}
