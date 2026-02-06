package edu.educhain.sms.controller;

import edu.educhain.sms.dto.GradeDTO;
import edu.educhain.sms.model.Grade;
import edu.educhain.sms.service.GradeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/grades")
@CrossOrigin(origins = "*")
public class GradeController {
    private final GradeService gradeService;

    public GradeController(GradeService gradeService) {
        this.gradeService = gradeService;
    }

    @GetMapping("/student/{id}")
    public ResponseEntity<List<Grade>> getGradesByStudent(@PathVariable Long id) {
        return ResponseEntity.ok(gradeService.findByStudent(id));
    }

    @PostMapping
    public ResponseEntity<Grade> createGrade(@RequestBody GradeDTO gradeDTO) {
        return ResponseEntity.ok(gradeService.save(gradeDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGrade(@PathVariable Long id) {
        gradeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
