package edu.educhain.sms.repository;

import edu.educhain.sms.model.Student;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    @Query("SELECT s FROM Student s WHERE " +
           "LOWER(s.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(s.studentId) LIKE LOWER(CONCAT('%', :search, '%'))")
    Page<Student> findAll(@org.springframework.data.repository.query.Param("search") String search, Pageable pageable);

    long countByMajor(edu.educhain.sms.model.Department major);

    java.util.List<Student> findByRiskLevelIn(java.util.List<String> riskLevels);

    java.util.Optional<Student> findByStudentId(String studentId);

    java.util.Optional<Student> findByEmail(String email);

    java.util.List<Student> findByMajorNameAndSemester(String majorName, Integer semester);
}
