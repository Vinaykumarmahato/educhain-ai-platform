package edu.educhain.sms.dto;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardStatsDTO {
    private long totalStudents;
    private long totalCourses;
    private long activeTeachers;
    private double averageGpa;
    private List<Integer> recentEnrollments;
    private List<BranchDist> branchDistribution;
    private StudentStats studentStats;
    private TeacherStats teacherStats;

    @Data
    @Builder
    public static class BranchDist {
        private String name;
        private long val;
    }

    @Data
    @Builder
    public static class StudentStats {
        private double personalGpa;
        private int attendanceRate;
        private int creditsEarned;
        private List<Deadline> upcomingDeadlines;
    }

    @Data
    @Builder
    public static class TeacherStats {
        private int assignedCourses;
        private int avgClassPerformance;
        private int pendingAttendance;
    }

    @Data
    @Builder
    public static class Deadline {
        private String title;
        private String date;
    }
}
