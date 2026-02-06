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
@Table(name = "students")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String studentId;

    @NotBlank
    private String firstName;
    
    @NotBlank
    private String lastName;

    @Email
    @Column(unique = true, nullable = false)
    private String email;

    private String mobileNumber;
    
    private String password; // For login purposes

    private LocalDateTime enrollmentDate;

    @Enumerated(EnumType.STRING)
    private StudentStatus status;

    private Double gpa;

    @ManyToOne
    @JoinColumn(name = "major_id")
    private Department major;
    private Integer semester;

    private Integer successScore;

    private String riskLevel; // HIGH, MEDIUM, LOW
}
