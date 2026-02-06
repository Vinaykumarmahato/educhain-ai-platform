# EduChain Enterprise SMS (Smart Management System)

<div align="center">
  <img src="https://ui-avatars.com/api/?name=EduChain&background=4F46E5&color=fff&size=128&length=2" alt="EduChain Logo" width="100">
  <h1>EduChain Enterprise</h1>
  <p><strong>Next-Generation AI-Powered Institutional Management Platform</strong></p>

  [![React](https://img.shields.io/badge/React-19.2.4-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
  [![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.2-green?style=for-the-badge&logo=spring)](https://spring.io/projects/spring-boot)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
  [![Google Gemini](https://img.shields.io/badge/AI-Gemini%201.5%20Flash-orange?style=for-the-badge&logo=google)](https://deepmind.google/technologies/gemini/)
  [![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](https://opensource.org/licenses/MIT)
</div>

---

## 🚀 About The Project

EduChain Enterprise SMS is a cutting-edge, full-stack educational management platform designed to streamline institutional operations while leveraging Artificial Intelligence for student success. Unlike traditional monolithic ERPs, EduChain uses a modern microservices-ready architecture with a clean, glassmorphic UI.

**Key Differentiator:** Built-in AI intervention system that analyzes student performance (grades, attendance) to generate personalized "Recovery Roadmaps" using **Google's Gemini 1.5 Flash** model.

## 🌟 Comprehensive Feature List

### � 1. AI-Driven Decision Support
*   **Predictive Success Analytics**: Automatically calculates student risk levels (Low/Medium/High) based on real-time academic and attendance data.
*   **Generative Intervention Plans**: Uses Google Gemini 1.5 Flash to synthesize detailed, personalized recovery roadmaps for at-risk students.
*   **Role-Based Cognitive Insights**:
    *   **Admins**: Receive system-wide health and resource optimization tips.
    *   **Teachers**: Get class performance summaries and "student-at-risk" alerts.
    *   **Students**: Receive personalized study tips and deadline reminders.

### 🔐 2. Enterprise-Grade Security & Authentication
*   **Secure Authentication**: Robust implementation using Spring Security 6.
*   **JWT (JSON Web Tokens)**: Stateless session management for scalability.
*   **RBAC (Role-Based Access Control)**: Strictly enforced permissions for `ADMIN`, `TEACHER`, and `STUDENT` roles.
*   **Password Encryption**: Industry-standard BCrypt hashing.
*   **Persistent User Profiles**:
    *   Secure editing of personal details (Name, Email).
    *   Profile picture management with **Cloudinary** integration.
    *   Changes persisted directly to MySQL database.

### 📊 3. Interactive Dashboards
*   **Real-Time Statistics**: Live counters for Total Students, Active Faculty, Courses, and Average GPA.
*   **Data Visualization**:
    *   **Branch Distribution**: Interactive pie charts showing student enrollment per department.
    *   **Performance Trends**: Visual graphs for GPA tracking (powered by `recharts`).
*   **Recent Activity Feed**: Live tracking of new enrollments and system updates.

### 👥 4. Academic Management Modules
*   **Student Management**:
    *   Complete lifecycle management (Enrollment, Status Updates).
    *   Advanced filtering by Branch, Semester, and Status.
    *   Detailed student profiles with academic history.
*   **Faculty Administration**:
    *   Staff directory with designation and department tracking.
    *   Workload management and contact details.
*   **Course Coordination**:
    *   Course creation, credit assignment, and instructor mapping.
    *   Department-specific curriculum organization.

### 📅 5. Attendance & Performance Tracking
*   **Digital Attendance Register**:
    *   Date-wise and Subject-wise attendance marking.
    *   Status tracking (Present, Absent, Late).
*   **Grades & Assessment**:
    *   Centralized repository for student marks.
    *   Semester-wise performance aggregation.

### 🔔 6. Communication & Notifications
*   **System Alerts**: Built-in notification center for academic updates.
*   **Read/Unread Status**: Track acknowledged notifications.
*   **Absenteeism Alerts**: Automated triggers for consecutive absences.

### 💻 7. Modern UI/UX Engineering
*   **Glassmorphism Design**: Sleek, modern aesthetic using translucent layers and blur effects.
*   **Responsive Layout**: Fully mobile-responsive sidebar, tables, and cards using **Tailwind CSS v4**.
*   **Smooth Animations**: Page transitions and interactive elements using `animate.css` and CSS transitions.
*   **Global Search**: powerful search bar to check ID, Modules, or Faculties.

## 🛠️ Technology Stack

### Frontend (Client-Side)
- **Framework**: React 19 (Vite)
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4, PostCSS
- **State Management**: React Hooks & Context API
- **Visualization**: Recharts
- **AI Integration**: Google Generative AI SDK (`@google/generative-ai`)
- **HTTP Client**: Axios with Interceptors

### Backend (Server-Side)
- **Framework**: Spring Boot 3.4.2 (Java 21)
- **Security**: Spring Security, JWT (JSON Web Tokens)
- **Database**: MySQL 8.0 (Hibernate/JPA)
- **API Documentation**: RESTful Architecture
- **Build Tool**: Maven

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+)
- Java JDK 21
- MySQL Server
- Google Gemini API Key
- Cloudinary Account (for image uploads)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/educhain-sms.git
cd educhain-sms
```

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend-java
   ```
2. Configure database in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/educhain_sms
   spring.datasource.username=root
   spring.datasource.password=YOUR_PASSWORD
   ```
3. Run the application:
   ```bash
   mvn spring-boot:run
   ```

### 3. Frontend Setup
1. Navigate to the project root (if not already there):
   ```bash
   cd ..
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env.local` file:
   ```bash
   VITE_GEMINI_API_KEY=your_gemini_api_key
   VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
   VITE_CLOUDINARY_API_KEY=your_api_key
   VITE_CLOUDINARY_API_SECRET=your_api_secret
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

## 🖥️ Usage

1. **Login**: Access the portal at `http://localhost:3000`.
   - **Default Admin**: `admin` / `admin123` (Ensure database is seeded).
2. **Dashboard**: View high-level stats.
3. **Success Analytics**: Navigate to the analytics tab to test the AI intervention generation.
4. **Profile**: Update your avatar and personal details (persisted to DB).

## 🔮 Future Roadmap
- [ ] Integration with Learning Management Systems (LMS).
- [ ] Automated SMS/Email notifications for attendance.
- [ ] Blockchain-based certificate issuance (EduChain Core).
- [ ] Mobile App (React Native).

## 🤝 Contributing
Contributions are welcome! Please fork the repository and submit a pull request.

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---
**Developed with ❤️ by Vinay Kumar Mahato**