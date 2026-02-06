package edu.educhain.sms.dto;

import lombok.Data;

@Data
public class CourseDTO {
    private Long id;
    private String code;
    private String name;
    private String department; // Department name
    private Integer credits;
    private String instructor;
    private Integer capacity;
    private Integer studentCount;
    private Integer semester;
}
