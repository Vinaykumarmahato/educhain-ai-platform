package edu.educhain.sms.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class FacultyDTO {
    private Long id;
    private String employeeId;
    private String firstName;
    private String lastName;
    private String email;
    private String mobileNumber;
    private String password;
    private String department; // Department name
    private String designation;
    private String status;
    private String joiningDate;
}
