package edu.educhain.sms.dto;

import lombok.Data;
import java.time.LocalDate;

@Data
public class AttendanceDTO {
    private Long id;
    private String studentId; // Identity string like EDU-2023...
    private String date;
    private String status;
    private Integer semester;
    private String branch;
}
