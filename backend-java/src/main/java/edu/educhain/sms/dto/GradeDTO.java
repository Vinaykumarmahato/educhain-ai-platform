package edu.educhain.sms.dto;

import lombok.Data;

@Data
public class GradeDTO {
    private Long id;
    private String studentId;
    private String courseCode;
    private String grade;
    private Integer score;
    private Integer semester;
}
