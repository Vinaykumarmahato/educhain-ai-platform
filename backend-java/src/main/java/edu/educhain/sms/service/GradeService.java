package edu.educhain.sms.service;

import edu.educhain.sms.dto.GradeDTO;
import edu.educhain.sms.model.Course;
import edu.educhain.sms.model.Grade;
import edu.educhain.sms.model.Student;
import edu.educhain.sms.repository.CourseRepository;
import edu.educhain.sms.repository.GradeRepository;
import edu.educhain.sms.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class GradeService {
    private static final Logger log = LoggerFactory.getLogger(GradeService.class);
    private final GradeRepository gradeRepository;
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;

    public GradeService(GradeRepository gradeRepository, StudentRepository studentRepository, CourseRepository courseRepository) {
        this.gradeRepository = gradeRepository;
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
    }

    public List<Grade> findAll() {
        return gradeRepository.findAll();
    }

    public List<Grade> findByStudent(Long studentId) {
        return gradeRepository.findByStudentId(studentId);
    }

    public List<Grade> findByStudentId(String studentId) {
        return gradeRepository.findByStudent_StudentId(studentId);
    }

    public Grade save(GradeDTO dto) {
        log.info("Saving grade: {}", dto);
        try {
            Grade grade;
            if (dto.getId() != null) {
                grade = gradeRepository.findById(dto.getId()).orElse(new Grade());
            } else {
                grade = new Grade();
            }

            grade.setGrade(dto.getGrade());
            grade.setMarks(dto.getScore());
            grade.setSemester(dto.getSemester());

            if (dto.getStudentId() != null) {
                Student student = studentRepository.findByStudentId(dto.getStudentId())
                        .orElseThrow(() -> new RuntimeException("Student not found"));
                grade.setStudent(student);
            }

            if (dto.getCourseCode() != null) {
                Course course = courseRepository.findByCode(dto.getCourseCode())
                        .orElseThrow(() -> new RuntimeException("Course not found"));
                grade.setCourse(course);
            }

            Grade saved = gradeRepository.save(grade);
            log.info("Successfully saved grade for student: {} in course: {}", dto.getStudentId(), dto.getCourseCode());
            return saved;
        } catch (Exception e) {
            log.error("Error saving grade: {}", e.getMessage());
            throw e;
        }
    }

    public void delete(Long id) {
        gradeRepository.deleteById(id);
    }
}
