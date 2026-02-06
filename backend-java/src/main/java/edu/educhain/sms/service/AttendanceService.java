package edu.educhain.sms.service;

import edu.educhain.sms.dto.AttendanceDTO;
import edu.educhain.sms.model.Attendance;
import edu.educhain.sms.model.Student;
import edu.educhain.sms.repository.AttendanceRepository;
import edu.educhain.sms.repository.StudentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AttendanceService {
    private static final Logger log = LoggerFactory.getLogger(AttendanceService.class);
    private final AttendanceRepository attendanceRepository;
    private final StudentRepository studentRepository;

    public AttendanceService(AttendanceRepository attendanceRepository, StudentRepository studentRepository) {
        this.attendanceRepository = attendanceRepository;
        this.studentRepository = studentRepository;
    }

    public List<Attendance> getAttendance(LocalDate date, String branch, Integer semester) {
        log.info("Fetching attendance for date: {}, branch: {}, semester: {}", date, branch, semester);
        
        // 1. Fetch all students in this branch and semester
        List<Student> students = studentRepository.findByMajorNameAndSemester(branch, semester);
        
        // 2. Fetch all existing attendance records for this date/branch/semester
        List<Attendance> existingRecords = attendanceRepository.findByDateAndBranchAndSemester(date, branch, semester);
        
        // 3. Map students to their existing attendance status
        Map<String, Attendance> studentIdToAttendance = existingRecords.stream()
                .collect(Collectors.toMap(a -> a.getStudent().getStudentId(), a -> a));
        
        List<Attendance> fullList = new ArrayList<>();
        for (Student s : students) {
            if (studentIdToAttendance.containsKey(s.getStudentId())) {
                fullList.add(studentIdToAttendance.get(s.getStudentId()));
            } else {
                // Return a virtual/unsaved record so UI can display the student
                Attendance virtual = new Attendance();
                virtual.setStudent(s);
                virtual.setDate(date);
                virtual.setBranch(branch);
                virtual.setSemester(semester);
                virtual.setStatus("ABSENT"); // Default to absent or leave null
                fullList.add(virtual);
            }
        }
        
        return fullList;
    }

    public Attendance markAttendance(AttendanceDTO dto) {
        log.info("Marking attendance: {}", dto);
        try {
            Student student = studentRepository.findByStudentId(dto.getStudentId())
                    .orElseThrow(() -> new RuntimeException("Student not found with ID: " + dto.getStudentId()));

            LocalDate date;
            try {
                date = LocalDate.parse(dto.getDate());
            } catch (Exception e) {
                date = LocalDate.now();
            }

            Attendance attendance = attendanceRepository.findByStudentAndDate(student, date)
                    .orElse(new Attendance());

            attendance.setStudent(student);
            attendance.setDate(date);
            attendance.setStatus(dto.getStatus());
            attendance.setSemester(dto.getSemester());
            attendance.setBranch(dto.getBranch());

            Attendance saved = attendanceRepository.save(attendance);
            log.info("Successfully marked attendance for student: {}", dto.getStudentId());
            return saved;
        } catch (Exception e) {
            log.error("Error marking attendance: {}", e.getMessage());
            throw e;
        }
    }
}
