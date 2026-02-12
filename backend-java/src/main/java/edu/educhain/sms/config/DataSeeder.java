package edu.educhain.sms.config;

import edu.educhain.sms.model.Role;
import edu.educhain.sms.model.User;
import edu.educhain.sms.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (userRepository.count() == 0) {
                // Admin
                User admin = new User();
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setFullName("System Administrator");
                admin.setEmail("admin@educhain.edu");
                admin.setRoles(Set.of(Role.ROLE_ADMIN));
                admin.setAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=admin");
                userRepository.save(admin);

                // Teacher
                User teacher = new User();
                teacher.setUsername("teacher");
                teacher.setPassword(passwordEncoder.encode("teacher123"));
                teacher.setFullName("Prof. Smith");
                teacher.setEmail("smith@educhain.edu");
                teacher.setRoles(Set.of(Role.ROLE_TEACHER));
                teacher.setAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=teacher");
                userRepository.save(teacher);

                // Student
                User student = new User();
                student.setUsername("student");
                student.setPassword(passwordEncoder.encode("student123"));
                student.setFullName("John Doe");
                student.setEmail("john@educhain.edu");
                student.setRoles(Set.of(Role.ROLE_STUDENT));
                student.setAvatar("https://api.dicebear.com/7.x/avataaars/svg?seed=student");
                userRepository.save(student);
                
                System.out.println("Default users created: admin/admin123, teacher/teacher123, student/student123");
            }
        };
    }
}
