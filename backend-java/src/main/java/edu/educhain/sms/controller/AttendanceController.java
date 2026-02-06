package edu.educhain.sms.controller;

import edu.educhain.sms.dto.AttendanceDTO;
import edu.educhain.sms.model.Attendance;
import edu.educhain.sms.service.AttendanceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/v1/attendance")
@CrossOrigin(origins = "*")
public class AttendanceController {
    private final AttendanceService attendanceService;

    public AttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping
    public ResponseEntity<List<Attendance>> getAttendance(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String branch,
            @RequestParam Integer semester) {
        return ResponseEntity.ok(attendanceService.getAttendance(date, branch, semester));
    }

    @PostMapping
    public ResponseEntity<Attendance> markAttendance(@RequestBody AttendanceDTO attendanceDTO) {
        return ResponseEntity.ok(attendanceService.markAttendance(attendanceDTO));
    }
}
