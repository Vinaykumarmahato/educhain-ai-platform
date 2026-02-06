package edu.educhain.sms.controller;

import edu.educhain.sms.dto.AuthResponse;
import edu.educhain.sms.dto.LoginRequest;
import edu.educhain.sms.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PutMapping("/profile")
    public ResponseEntity<AuthResponse> updateProfile(
            @RequestBody edu.educhain.sms.dto.UpdateProfileRequest request,
            java.security.Principal principal) {
        return ResponseEntity.ok(authService.updateProfile(principal.getName(), request));
    }
}
