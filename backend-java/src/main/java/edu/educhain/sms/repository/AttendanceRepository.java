package edu.educhain.sms.repository;

import edu.educhain.sms.model.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByDateAndBranchAndSemester(LocalDate date, String branch, Integer semester);
    
    java.util.Optional<Attendance> findByStudentAndDate(edu.educhain.sms.model.Student student, LocalDate date);
}
