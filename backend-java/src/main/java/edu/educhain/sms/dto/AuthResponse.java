package edu.educhain.sms.dto;

import edu.educhain.sms.model.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AuthResponse {
    private String token;
    private String username;
    private String fullName;
    private String email;
    private Set<Role> roles;
    private String avatar;
}
