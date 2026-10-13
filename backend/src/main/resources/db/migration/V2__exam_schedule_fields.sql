-- V2__exam_schedule_fields.sql
-- Add start_time and duration_minutes to examinations table for scheduling
ALTER TABLE examinations
    ADD COLUMN start_time VARCHAR(20) NULL AFTER exam_date,
    ADD COLUMN duration_minutes INT NULL AFTER start_time;
