package edu.educhain.sms.service;

import edu.educhain.sms.dto.DashboardStatsDTO;
import edu.educhain.sms.model.Role;
import edu.educhain.sms.model.User;
import edu.educhain.sms.repository.*;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DashboardService {
    private final StudentRepository studentRepository;
    private final CourseRepository courseRepository;
    private final FacultyRepository facultyRepository;
    private final DepartmentRepository departmentRepository;

    public DashboardService(StudentRepository studentRepository, CourseRepository courseRepository, 
                            FacultyRepository facultyRepository, DepartmentRepository departmentRepository) {
        this.studentRepository = studentRepository;
        this.courseRepository = courseRepository;
        this.facultyRepository = facultyRepository;
        this.departmentRepository = departmentRepository;
    }

    public DashboardStatsDTO getStats(User user) {
        long totalStudents = studentRepository.count();
        long totalCourses = courseRepository.count();
        long activeTeachers = facultyRepository.countByStatus("ACTIVE");
        
        // Simplified GPA calculation; in real app we'd average students' GPA
        double avgGpa = 3.25; 

        List<DashboardStatsDTO.BranchDist> dist = departmentRepository.findAll().stream()
                .map(d -> DashboardStatsDTO.BranchDist.builder()
                        .name(d.getName())
                        .val(studentRepository.countByMajor(d))
                        .build())
                .collect(Collectors.toList());

        DashboardStatsDTO.DashboardStatsDTOBuilder builder = DashboardStatsDTO.builder()
                .totalStudents(totalStudents)
                .totalCourses(totalCourses)
                .activeTeachers(activeTeachers)
                .averageGpa(avgGpa)
                .recentEnrollments(List.of(45, 52, 38, 65, 48, 72, 85))
                .branchDistribution(dist);

        if (user.getRoles().contains(Role.ROLE_STUDENT)) {
            builder.studentStats(DashboardStatsDTO.StudentStats.builder()
                    .personalGpa(3.82)
                    .attendanceRate(94)
                    .creditsEarned(112)
                    .upcomingDeadlines(new ArrayList<>())
                    .build());
        }

        if (user.getRoles().contains(Role.ROLE_TEACHER)) {
            builder.teacherStats(DashboardStatsDTO.TeacherStats.builder()
                    .assignedCourses(4)
                    .avgClassPerformance(82)
                    .pendingAttendance(2)
                    .build());
        }

        return builder.build();
    }
}
