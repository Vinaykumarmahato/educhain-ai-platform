<div align="center">

  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&height=280&section=header&text=EduChain%20Enterprise&fontSize=80&animation=fadeIn&fontAlignY=35&desc=Next-Gen%20AI-Powered%20Institutional%20Management%20Platform&descAlignY=55&descAlign=50" alt="EduChain Header" width="100%">

  <br />

  [![React](https://img.shields.io/badge/React-19.2.4-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
  [![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.4.2-6DB33F?style=for-the-badge&logo=spring&logoColor=white)](https://spring.io/projects/spring-boot)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Google Gemini](https://img.shields.io/badge/AI-Gemini_1.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)
  [![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)

  <br />

  [![GitHub stars](https://img.shields.io/github/stars/Vinaykumarmahato/educhain-ai-platform?style=social)](https://github.com/Vinaykumarmahato/educhain-ai-platform/stargazers)
  [![GitHub forks](https://img.shields.io/github/forks/Vinaykumarmahato/educhain-ai-platform?style=social)](https://github.com/Vinaykumarmahato/educhain-ai-platform/network/members)
  [![GitHub issues](https://img.shields.io/github/issues/Vinaykumarmahato/educhain-ai-platform?style=social)](https://github.com/Vinaykumarmahato/educhain-ai-platform/issues)
  [![GitHub license](https://img.shields.io/github/license/Vinaykumarmahato/educhain-ai-platform?style=social)](https://github.com/Vinaykumarmahato/educhain-ai-platform)

</div>

<br />

---

## 🚀 About The Project

**EduChain Enterprise SMS** is a cutting-edge, full-stack educational management platform designed to streamline institutional operations while leveraging **Artificial Intelligence** for student success. Unlike traditional monolithic ERPs, EduChain uses a modern microservices-ready architecture with a clean, **glassmorphic UI**.

> 💡 **Key Differentiator:** Our built-in **AI Intervention System** analyzes student performance (grades, attendance) to generate personalized "Recovery Roadmaps" using **Google's Gemini 1.5 Flash** model.

<br />

## 🌟 Key Features

| 🤖 **AI-Driven Intelligence** | 🔐 **Enterprise Security** |
|:-----------------------------|:--------------------------|
| • **Predictive Analytics:** Calculates student risk levels (Low/Medium/High).<br>• **Smart Intervention:** Generates personalized study plans via Gemini AI.<br>• **Cognitive Insights:** Role-based tips for Admins, Teachers, & Students. | • **Spring Security 6:** Robust, industry-standard protection.<br>• **JWT Auth:** Stateless, scalable session management.<br>• **RBAC:** Strict roles for `ADMIN`, `TEACHER`, `STUDENT`.<br>• **Encrypted:** BCrypt password hashing. |

| 📊 **Interactive Dashboards** | 👥 **Academic Management** |
|:-----------------------------|:--------------------------|
| • **Live Stats:** Real-time counters for students, faculty, & courses.<br>• **Visual Trends:** GPA tracking graphs & enrollment pie charts.<br>• **Activity Feed:** Live updates on system events. | • **Student Lifecycle:** Enrollment, profiles, & history.<br>• **Faculty Hub:** Digital staff directory & workload.<br>• **Course Co-ordination:** Curriculum & credit management. |

| 📅 **Attendance & Grades** | 🔔 **Smart Communication** |
|:--------------------------|:--------------------------|
| • **Digital Register:** Subject-wise & date-wise tracking.<br>• **Centralized Marks:** Semester-wise aggregation.<br>• **Status Tracking:** Present, Absent, Late indicators. | • **Notification Center:** Real-time academic alerts.<br>• **Read Receipts:** Track acknowledged messages.<br>• **Auto-Alerts:** Triggers for consecutive absenteeism. |

<br />

## 💻 Modern UI/UX Engineering

*   ✨ **Glassmorphism Design:** A sleek, modern aesthetic using translucent layers.
*   📱 **Fully Responsive:** Mobile-first approach with **Tailwind CSS v4**.
*   🎨 **Smooth Animations:** Interactive elements using `animate.css`.
*   🔍 **Global Search:** Powerful search bar for instant access to any record.

<br />

## 🛠️ Technology Stack

### **Frontend (Client-Side)**
*   ![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB) **React 19 (Vite)**
*   ![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white) **TypeScript**
*   ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white) **Tailwind CSS v4**
*   ![Google Gemini](https://img.shields.io/badge/Google_AI-4285F4?style=flat&logo=google&logoColor=white) **Gemini SDK**
*   ![Recharts](https://img.shields.io/badge/Recharts-22b5bf?style=flat) **Data Visualization**

### **Backend (Server-Side)**
*   ![Spring Boot](https://img.shields.io/badge/Spring_Boot-6DB33F?style=flat&logo=spring&logoColor=white) **Spring Boot 3.4.2**
*   ![Java](https://img.shields.io/badge/Java-ED8B00?style=flat&logo=openjdk&logoColor=white) **Java 21**
*   ![MySQL](https://img.shields.io/badge/MySQL-005C84?style=flat&logo=mysql&logoColor=white) **MySQL 8.0**
*   ![Hibernate](https://img.shields.io/badge/Hibernate-59666C?style=flat&logo=hibernate&logoColor=white) **JPA / Hibernate**
*   ![JWT](https://img.shields.io/badge/JWT-black?style=flat&logo=json%20web%20tokens) **JSON Web Tokens**

<br />

## 📦 Installation & Setup

### Prerequisites
*   Node.js (v18+)
*   Java JDK 21
*   MySQL Server
*   Google Gemini API Key
*   Cloudinary Account

### 1. Clone the Repository
```bash
git clone https://github.com/Vinaykumarmahato/educhain-ai-platform.git
cd educhain-ai-platform
```

### 2. Backend Setup
```bash
cd backend-java
# Configure src/main/resources/application.properties with your DB credentials
mvn spring-boot:run
```

### 3. Frontend Setup
```bash
cd ..
npm install
# Create .env.local with your VITE_GEMINI_API_KEY and Cloudinary credentials
npm run dev
```

<br />

## 🖥️ Usage Guide

1.  **Login Portal**: Access at `http://localhost:3000`.
    *   *Default Admin Credentials*: `admin` / `admin123`
2.  **Dashboard**: Explore high-level insights.
3.  **AI Analytics**: Test the "Recovery Roadmap" generation in the Analytics tab.
4.  **Profile**: Update your digital avatar via Cloudinary.

<br />

## 🔮 Future Roadmap
*   [ ] 📱 **Mobile App (React Native)**
*   [ ] 🔗 **LMS Integration (Canvas/Moodle)**
*   [ ] ⛓️ **Blockchain Certificate Issuance**
*   [ ] 📨 **SMS/WhatsApp Notifications**

<br />

## 🤝 Contributing
Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

<br />

---

<div align="center">

  **Developed with ❤️ by [Vinay Kumar Mahato](https://github.com/Vinaykumarmahato)**

  [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/vinay-kumar860964/)
  [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Vinaykumarmahato)

</div>
