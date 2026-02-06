package edu.educhain.sms.controller;

import edu.educhain.sms.dto.FacultyDTO;
import edu.educhain.sms.model.Faculty;
import edu.educhain.sms.service.FacultyService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/v1/faculty")
@CrossOrigin(origins = "*")
public class FacultyController {
    private final FacultyService facultyService;

    public FacultyController(FacultyService facultyService) {
        this.facultyService = facultyService;
    }

    @GetMapping
    public ResponseEntity<List<Faculty>> getAllFaculty(@RequestParam(required = false) String search) {
        return ResponseEntity.ok(facultyService.findAll(search));
    }

    @PostMapping
    public ResponseEntity<Faculty> createFaculty(@RequestBody FacultyDTO facultyDTO) {
        return ResponseEntity.ok(facultyService.save(facultyDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFaculty(@PathVariable Long id) {
        facultyService.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
