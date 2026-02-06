package edu.educhain.sms.service;

import edu.educhain.sms.model.*;
import edu.educhain.sms.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.Set;

@Service
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final CourseRepository courseRepository;
    private final DepartmentRepository departmentRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, StudentRepository studentRepository, 
                           FacultyRepository facultyRepository, CourseRepository courseRepository, 
                           DepartmentRepository departmentRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.courseRepository = courseRepository;
        this.departmentRepository = departmentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Initialize Departments
        Department cs = createDeptIfNotExist("Computer Science", "CS");
        Department ee = createDeptIfNotExist("Electrical Engineering", "EE");
        Department me = createDeptIfNotExist("Mechanical Engineering", "ME");

        // Initialize Users
        if (userRepository.findByUsername("vinay").isEmpty()) {
            User admin = new User();
            admin.setUsername("vinay");
            admin.setPassword(passwordEncoder.encode("ADVindiancoder@860964"));
            admin.setFullName("Vinay Kumar Mahato");
            admin.setEmail("vinay@educhain.edu");
            admin.setRoles(Set.of(Role.ROLE_ADMIN));
            admin.setAvatar("https://ui-avatars.com/api/?name=Vinay+Kumar&background=4f46e5&color=fff");
            userRepository.save(admin);
            System.out.println("Admin user 'vinay' created.");
        }

        // Initialize Students
        if (studentRepository.count() == 0) {
            for (int i = 1; i <= 5; i++) {
                Student s = Student.builder()
                        .studentId("EDU-2023-100" + i)
                        .firstName("Student")
                        .lastName(String.valueOf(i))
                        .email("student" + i + "@educhain.edu")
                        .status(StudentStatus.ACTIVE)
                        .gpa(3.5 + (i * 0.1))
                        .major(cs)
                        .semester(1)
                        .successScore(85 - (i * 5))
                        .riskLevel(i > 3 ? "MEDIUM" : "LOW")
                        .enrollmentDate(LocalDateTime.now())
                        .build();
                studentRepository.save(s);
            }
        }

        // Initialize Faculty
        if (facultyRepository.count() == 0) {
            Faculty f = Faculty.builder()
                    .employeeId("FAC-2023-101")
                    .firstName("Rajesh")
                    .lastName("Kumar")
                    .email("rajesh.k@educhain.edu")
                    .department(cs)
                    .designation("Professor")
                    .status("ACTIVE")
                    .joiningDate(LocalDateTime.now())
                    .build();
            facultyRepository.save(f);
        }

        // Initialize Courses
        if (courseRepository.count() == 0) {
            Course c1 = Course.builder()
                    .code("CS-101")
                    .name("Introduction to Programming")
                    .department(cs)
                    .credits(4)
                    .instructor("Prof. Rajesh Kumar")
                    .capacity(60)
                    .studentCount(45)
                    .semester(1)
                    .build();
            courseRepository.save(c1);

            Course c2 = Course.builder()
                    .code("CS-102")
                    .name("Data Structures")
                    .department(cs)
                    .credits(4)
                    .instructor("Prof. Elena Sloane")
                    .capacity(50)
                    .studentCount(38)
                    .semester(2)
                    .build();
            courseRepository.save(c2);
        }
    }

    private Department createDeptIfNotExist(String name, String code) {
        return departmentRepository.findByName(name)
                .orElseGet(() -> departmentRepository.save(
                        new Department(null, name, code)
                ));
    }
}
