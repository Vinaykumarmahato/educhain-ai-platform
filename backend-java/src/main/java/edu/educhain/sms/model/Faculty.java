package edu.educhain.sms.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "faculty")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Faculty {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String employeeId;

    @NotBlank
    private String firstName;
    
    @NotBlank
    private String lastName;

    @Email
    @Column(unique = true, nullable = false)
    private String email;

    private String mobileNumber;

    private String password;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    private String designation;

    private String status; // ACTIVE, ON_LEAVE, INACTIVE

    private LocalDateTime joiningDate;
}
