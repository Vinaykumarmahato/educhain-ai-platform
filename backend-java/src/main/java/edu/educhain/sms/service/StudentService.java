package edu.educhain.sms.service;

import edu.educhain.sms.dto.StudentDTO;
import edu.educhain.sms.model.Department;
import edu.educhain.sms.model.Student;
import edu.educhain.sms.repository.DepartmentRepository;
import edu.educhain.sms.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import edu.educhain.sms.model.StudentStatus;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.Optional;

@Service
public class StudentService {
    private static final Logger log = LoggerFactory.getLogger(StudentService.class);
    private final StudentRepository studentRepository;
    private final DepartmentRepository departmentRepository;

    public StudentService(StudentRepository studentRepository, DepartmentRepository departmentRepository) {
        this.studentRepository = studentRepository;
        this.departmentRepository = departmentRepository;
    }

    @Transactional(readOnly = true)
    public Page<Student> findAll(String search, Pageable pageable) {
        if (search == null || search.trim().isEmpty()) {
            return studentRepository.findAll(pageable);
        }
        return studentRepository.findAll(search, pageable);
    }

    @Transactional
    public Student save(StudentDTO dto) {
        log.info("Processing student save: {}", dto);
        try {
            Student student = null;
            
            // 1. Try finding by ID
            if (dto.getId() != null) {
                student = studentRepository.findById(dto.getId()).orElse(null);
            }
            
            // 2. Try finding by StudentId (if new or ID not found)
            if (student == null && dto.getStudentId() != null && !dto.getStudentId().trim().isEmpty()) {
                student = studentRepository.findByStudentId(dto.getStudentId()).orElse(null);
            }
            
            // 3. Try finding by Email (to prevent duplicates)
            if (student == null && dto.getEmail() != null && !dto.getEmail().trim().isEmpty()) {
                student = studentRepository.findByEmail(dto.getEmail()).orElse(null);
            }
            
            // 4. Create new if still not found
            if (student == null) {
                log.info("No existing student found. Initializing new registry entry.");
                student = new Student();
            } else {
                log.info("Existing student found (ID: {}). Updating records.", student.getId());
            }

            // Map basic fields
            student.setStudentId(dto.getStudentId());
            student.setFirstName(dto.getFirstName());
            student.setLastName(dto.getLastName());
            student.setEmail(dto.getEmail());
            student.setMobileNumber(dto.getMobileNumber());
            student.setStatus(dto.getStatus() != null ? dto.getStatus() : StudentStatus.ACTIVE);
            student.setGpa(dto.getGpa() != null ? dto.getGpa() : 0.0);
            student.setSemester(dto.getSemester() != null ? dto.getSemester() : 1);
            
            // Map enrollment date
            if (dto.getEnrollmentDate() != null && !dto.getEnrollmentDate().isEmpty()) {
                try {
                    String dateStr = dto.getEnrollmentDate();
                    if (dateStr.matches("\\d{2}-\\d{2}-\\d{4}")) {
                        String[] parts = dateStr.split("-");
                        student.setEnrollmentDate(LocalDate.of(Integer.parseInt(parts[2]), Integer.parseInt(parts[1]), Integer.parseInt(parts[0])).atStartOfDay());
                    } else if (dateStr.matches("\\d{4}-\\d{2}-\\d{2}")) {
                        student.setEnrollmentDate(LocalDate.parse(dateStr).atStartOfDay());
                    } else if (dateStr.contains("T")) {
                        student.setEnrollmentDate(LocalDateTime.parse(dateStr));
                    } else {
                        student.setEnrollmentDate(LocalDateTime.now());
                    }
                } catch (Exception e) {
                    log.warn("Date parse fallback for {}: {}", dto.getEnrollmentDate(), e.getMessage());
                    student.setEnrollmentDate(LocalDateTime.now());
                }
            } else {
                student.setEnrollmentDate(LocalDateTime.now());
            }

            student.setSuccessScore(dto.getSuccessScore() != null ? dto.getSuccessScore() : 75);
            student.setRiskLevel(dto.getRiskLevel() != null ? dto.getRiskLevel() : "LOW");

            // Handle Department (Major)
            if (dto.getMajor() != null && !dto.getMajor().isEmpty()) {
                String deptName = dto.getMajor();
                Department dept = departmentRepository.findByName(deptName)
                        .orElseGet(() -> {
                            String code = deptName.length() >= 2 ? deptName.substring(0, 2).toUpperCase() : deptName.toUpperCase();
                            return departmentRepository.save(new Department(null, deptName, code));
                        });
                student.setMajor(dept);
            }

            Student saved = studentRepository.save(student);
            log.info("Student committed to registry. ID: {}, StudentId: {}", saved.getId(), saved.getStudentId());
            return saved;
        } catch (Exception e) {
            log.error("Registry transaction failed: {}", e.getMessage());
            throw new RuntimeException(e.getMessage());
        }
    }
    public Optional<Student> findById(Long id) {
        return studentRepository.findById(id);
    }

    public void deleteById(Long id) {
        studentRepository.deleteById(id);
    }

    public java.util.List<Student> getAtRiskStudents() {
        return studentRepository.findByRiskLevelIn(java.util.List.of("HIGH", "MEDIUM"));
    }
}
