# 🎓 Student Management System

A robust **Student Management System** built using **Java, Spring Boot, Hibernate & MySQL**. This project provides a comprehensive backend for managing student records, course details, and enrollments efficiently.

---

## ✨ Features

- 📝 **CRUD Operations**: Add, update, view, and delete students.
- 📚 **Course Management**: Manage courses and track student enrollments.
- 🔍 **Search Functionality**: Quickly find students by name or unique ID.
- 🚀 **REST API Backend**: Scalable architecture using Spring Boot.
- 🗄️ **Hibernate ORM**: Simplified database operations and mapping.
- 💾 **MySQL Integration**: Persistent data storage with reliable relational mapping.

---

## 🛠️ Technologies Used

- ☕ **Java 22**
- 🔧 **Spring Boot 3.x**
- 🏗️ **Hibernate 6.x**
- 🖥️ **MySQL 8.x**
- 📦 **Maven**
- 🛠️ **IDE**: Spring Tools 4 / IntelliJ IDEA
- 📬 **API Testing**: Postman

---

## 🗂️ Project Structure

```text
src/
├── main/java/com/vinay/studentms
│   ├── controller    # REST Controllers (API Endpoints)
│   ├── entity        # Hibernate Entities (Database Models)
│   ├── repository    # JPA Repositories (Data Access)
│   └── service       # Service Layer (Business Logic)
└── main/resources
    ├── application.properties
    ├── schema.sql
    └── data.sql
