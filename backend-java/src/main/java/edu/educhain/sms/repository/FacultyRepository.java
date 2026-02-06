package edu.educhain.sms.repository;

import edu.educhain.sms.model.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface FacultyRepository extends JpaRepository<Faculty, Long> {
    @Query("SELECT f FROM Faculty f WHERE LOWER(f.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(f.lastName) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(f.employeeId) LIKE LOWER(CONCAT('%', :search, '%'))")
    List<Faculty> searchFaculty(String search);
    
    long countByStatus(String status);
}
