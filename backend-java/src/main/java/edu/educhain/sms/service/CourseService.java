package edu.educhain.sms.service;

import edu.educhain.sms.dto.CourseDTO;
import edu.educhain.sms.model.Course;
import edu.educhain.sms.model.Department;
import edu.educhain.sms.repository.CourseRepository;
import edu.educhain.sms.repository.DepartmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import java.util.Optional;

@Service
public class CourseService {
    private static final Logger log = LoggerFactory.getLogger(CourseService.class);
    private final CourseRepository courseRepository;
    private final DepartmentRepository departmentRepository;

    public CourseService(CourseRepository courseRepository, DepartmentRepository departmentRepository) {
        this.courseRepository = courseRepository;
        this.departmentRepository = departmentRepository;
    }

    public Page<Course> findAll(String search, Pageable pageable) {
        if (search == null || search.isEmpty()) {
            return courseRepository.findAll(pageable);
        }
        return courseRepository.findAll(search, pageable);
    }

    public Course save(CourseDTO dto) {
        log.info("Saving course: {}", dto);
        try {
            Course course;
            if (dto.getId() != null) {
                course = courseRepository.findById(dto.getId()).orElse(new Course());
            } else if (dto.getCode() != null) {
                course = courseRepository.findByCode(dto.getCode()).orElse(new Course());
            } else {
                course = new Course();
            }

            course.setCode(dto.getCode());
            course.setName(dto.getName());
            course.setCredits(dto.getCredits());
            course.setInstructor(dto.getInstructor());
            course.setCapacity(dto.getCapacity());
            course.setStudentCount(dto.getStudentCount() != null ? dto.getStudentCount() : 0);
            course.setSemester(dto.getSemester());

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
                course.setDepartment(dept);
            }

            Course saved = courseRepository.save(course);
            log.info("Successfully saved course: {}", saved.getCode());
            return saved;
        } catch (Exception e) {
            log.error("Error saving course: {}", e.getMessage(), e);
            throw e;
        }
    }

    public Optional<Course> findById(Long id) {
        return courseRepository.findById(id);
    }

    public void deleteById(Long id) {
        courseRepository.deleteById(id);
    }
}
