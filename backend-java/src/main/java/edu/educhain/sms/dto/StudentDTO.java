package edu.educhain.sms.dto;

import edu.educhain.sms.model.StudentStatus;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class StudentDTO {
    private Long id;
    private String studentId;
    private String firstName;
    private String lastName;
    private String email;
    private String mobileNumber;
    private String password;
    private String major; // Department name
    private Integer semester;
    private StudentStatus status;
    private Double gpa;
    private Integer successScore;
    private String riskLevel;
    private String enrollmentDate;
}
