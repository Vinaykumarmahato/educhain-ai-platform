package edu.educhain.sms.service;

import edu.educhain.sms.dto.FacultyDTO;
import edu.educhain.sms.model.Department;
import edu.educhain.sms.model.Faculty;
import edu.educhain.sms.repository.DepartmentRepository;
import edu.educhain.sms.repository.FacultyRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class FacultyService {
    private static final Logger log = LoggerFactory.getLogger(FacultyService.class);
    private final FacultyRepository facultyRepository;
    private final DepartmentRepository departmentRepository;

    public FacultyService(FacultyRepository facultyRepository, DepartmentRepository departmentRepository) {
        this.facultyRepository = facultyRepository;
        this.departmentRepository = departmentRepository;
    }

    public List<Faculty> findAll(String search) {
        if (search == null || search.isEmpty()) {
            return facultyRepository.findAll();
        }
        return facultyRepository.searchFaculty(search);
    }

    public Faculty save(FacultyDTO dto) {
        log.info("Saving faculty: {}", dto);
        try {
            Faculty faculty;
            if (dto.getId() != null) {
                faculty = facultyRepository.findById(dto.getId()).orElse(new Faculty());
            } else {
                faculty = new Faculty();
            }

            faculty.setEmployeeId(dto.getEmployeeId());
            faculty.setFirstName(dto.getFirstName());
            faculty.setLastName(dto.getLastName());
            faculty.setEmail(dto.getEmail());
            faculty.setMobileNumber(dto.getMobileNumber());
            faculty.setDesignation(dto.getDesignation());
            faculty.setStatus(dto.getStatus());
            
            if (dto.getJoiningDate() != null && !dto.getJoiningDate().isEmpty()) {
                try {
                    if (dto.getJoiningDate().contains("T")) {
                        faculty.setJoiningDate(LocalDateTime.parse(dto.getJoiningDate()));
                    } else {
                        faculty.setJoiningDate(LocalDate.parse(dto.getJoiningDate()).atStartOfDay());
                    }
                } catch (Exception e) {
                    faculty.setJoiningDate(LocalDateTime.now());
                }
            } else {
                faculty.setJoiningDate(LocalDateTime.now());
            }

            if (dto.getDepartment() != null && !dto.getDepartment().isEmpty()) {
                String deptName = dto.getDepartment();
                Department dept = departmentRepository.findByName(deptName)
                        .orElseGet(() -> {
                            String code = deptName.length() >= 2 ? deptName.substring(0, 2).toUpperCase() : deptName.toUpperCase();
                            if (departmentRepository.findAll().stream().anyMatch(d -> d.getCode().equals(code))) {
                                return departmentRepository.save(new Department(null, deptName, code + (int)(Math.random()*10)));
                            }
                            return departmentRepository.save(new Department(null, deptName, code));
                        });
                faculty.setDepartment(dept);
            }

            Faculty saved = facultyRepository.save(faculty);
            log.info("Successfully saved faculty with ID: {}", saved.getId());
            return saved;
        } catch (Exception e) {
            log.error("Error saving faculty: {}", e.getMessage(), e);
            throw e;
        }
    }

    public Optional<Faculty> findById(Long id) {
        return facultyRepository.findById(id);
    }

    public void deleteById(Long id) {
        facultyRepository.deleteById(id);
    }
}
