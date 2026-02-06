package edu.educhain.sms.service;

import edu.educhain.sms.dto.AuthResponse;
import edu.educhain.sms.dto.LoginRequest;
import edu.educhain.sms.model.User;
import edu.educhain.sms.repository.UserRepository;
import edu.educhain.sms.security.JwtService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Service;

import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(UserRepository userRepository, JwtService jwtService, AuthenticationManager authenticationManager) {
        this.userRepository = userRepository;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow();
        
        var userDetails = new org.springframework.security.core.userdetails.User(
                user.getUsername(),
                user.getPassword(),
                user.getRoles().stream()
                        .map(role -> new SimpleGrantedAuthority(role.name()))
                        .collect(Collectors.toList())
        );

        String jwtToken = jwtService.generateToken(userDetails);
        
        return AuthResponse.builder()
                .token(jwtToken)
                .username(user.getUsername())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .roles(user.getRoles())
                .avatar(user.getAvatar())
                .build();
    }

    public AuthResponse updateProfile(String username, edu.educhain.sms.dto.UpdateProfileRequest request) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getAvatar() != null) user.setAvatar(request.getAvatar());

        User updatedUser = userRepository.save(user);

        // We can reuse the existing token since it validates identity, not specific fields like avatar
        // ideally we might issue a new token if claims change, but valid here
        return AuthResponse.builder()
                .username(updatedUser.getUsername())
                .fullName(updatedUser.getFullName())
                .email(updatedUser.getEmail())
                .roles(updatedUser.getRoles())
                .avatar(updatedUser.getAvatar())
                .build();
    }
}
