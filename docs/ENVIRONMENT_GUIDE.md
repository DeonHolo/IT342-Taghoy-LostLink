# LostLink – Development Environment Guide

> **Purpose:** This document describes the two development environments used for this project. Before making any code changes, an AI assistant (or developer) should read this guide and apply the correct configuration for the current environment.

---

## Environment Summary

| Setting                  | 🏫 Lab (CIT Computer Lab)              | 🏠 Home                                   |
|--------------------------|----------------------------------------|-------------------------------------------|
| **Java Version**         | Java 11 (OpenJDK 11.0.12)             | Java 17+                                  |
| **Spring Boot Version**  | 2.7.18                                | 3.5.x (as specified in SDD)              |
| **Spring Security API**  | 5.x (chained `.and()` style)          | 6.x (lambda DSL style)                   |
| **JPA/Validation Imports** | `javax.persistence.*`, `javax.validation.*` | `jakarta.persistence.*`, `jakarta.validation.*` |
| **Database Server**      | XAMPP MySQL (localhost:3306)           | MySQL Workbench (localhost:3306)          |
| **MySQL Connector**      | `mysql:mysql-connector-java:8.0.33`   | `com.mysql:mysql-connector-j` (managed by Boot) |
| **Hibernate Dialect**    | `org.hibernate.dialect.MySQL8Dialect` | `org.hibernate.dialect.MySQLDialect`      |
| **Lombok Version**       | Explicit `1.18.30` in compiler plugin | Managed by Spring Boot (no version needed)|
| **DB Credentials**       | `root` / (no password)                | `root` / (your home password)            |

---

## Files That Change Between Environments

### 1. `pom.xml`

#### Lab → Home changes:
```xml
<!-- Parent: 2.7.18 → 3.5.x -->
<version>2.7.18</version>       →  <version>3.5.11</version>

<!-- Java: 11 → 17 -->
<java.version>11</java.version> →  <java.version>17</java.version>

<!-- MySQL Connector: old artifact → new artifact (remove explicit version) -->
<groupId>mysql</groupId>                        →  <groupId>com.mysql</groupId>
<artifactId>mysql-connector-java</artifactId>   →  <artifactId>mysql-connector-j</artifactId>
<version>8.0.33</version>                       →  (remove this line, Boot manages it)

<!-- Lombok annotation processor: remove explicit version (Boot manages it) -->
<version>1.18.30</version>  →  (remove this line)
```

#### Home → Lab changes: reverse of the above.

---

### 2. `src/main/resources/application.properties`

#### Lab (XAMPP):
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/lostlink_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.username=root
spring.datasource.password=

spring.jpa.database-platform=org.hibernate.dialect.MySQL8Dialect
```

#### Home (MySQL Workbench):
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/lostlink_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver
spring.datasource.username=root
spring.datasource.password=YOUR_HOME_PASSWORD_HERE

spring.jpa.database-platform=org.hibernate.dialect.MySQLDialect
```

> Note: The datasource URL itself is the same. Only the password and dialect change.

---

### 3. All Java Files – Package Namespace Swap

This is the biggest change. **Every Java file** that imports `javax.*` (lab) must be swapped to `jakarta.*` (home), and vice versa.

#### Lab (Spring Boot 2.7.x / Java 11):
```java
import javax.persistence.*;
import javax.validation.constraints.*;
import javax.validation.Valid;
```

#### Home (Spring Boot 3.5.x / Java 17):
```java
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import jakarta.validation.Valid;
```

**Affected files (as of Phase 1):**
- `model/User.java` → `javax.persistence` ↔ `jakarta.persistence`
- `dto/RegisterRequest.java` → `javax.validation` ↔ `jakarta.validation`
- `dto/LoginRequest.java` → `javax.validation` ↔ `jakarta.validation`
- `controller/AuthController.java` → `javax.validation.Valid` ↔ `jakarta.validation.Valid`

**Quick find-and-replace command (Lab → Home):**
```
Find:    javax.persistence
Replace: jakarta.persistence

Find:    javax.validation
Replace: jakarta.validation
```

---

### 4. `config/SecurityConfig.java`

#### Lab (Spring Security 5.x – chained API):
```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .cors().and()
        .csrf().disable()
        .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
        .and()
        .authorizeHttpRequests()
            .antMatchers("/api/auth/**").permitAll()
            .antMatchers("/h2-console/**").permitAll()
            .anyRequest().authenticated()
        .and()
        .headers().frameOptions().disable();
    return http.build();
}
```

#### Home (Spring Security 6.x – lambda DSL):
```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .cors(Customizer.withDefaults())
        .csrf(csrf -> csrf.disable())
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/h2-console/**").permitAll()
            .anyRequest().authenticated()
        )
        .headers(headers -> headers.frameOptions(frame -> frame.disable()));
    return http.build();
}
```

Key differences:
- `.antMatchers()` → `.requestMatchers()`
- Chained `.and()` → Lambda DSL `(config -> ...)` 
- `.cors().and()` → `.cors(Customizer.withDefaults())`

---

## AI Assistant Instructions

When the user says they are developing in a specific environment, apply all changes listed above **before doing any other work**:

### "I'm at the lab" → Apply Lab Config
1. Set `pom.xml` to Spring Boot `2.7.18`, Java `11`, explicit MySQL connector + Lombok versions.
2. Set `application.properties` dialect to `MySQL8Dialect`, password empty.
3. Replace all `jakarta.*` → `javax.*` in Java files.
4. Rewrite `SecurityConfig` using Spring Security 5.x chained API.
5. Run `./mvnw clean compile` to verify.

### "I'm at home" → Apply Home Config
1. Set `pom.xml` to Spring Boot `3.5.11`, Java `17`, managed MySQL connector + Lombok.
2. Set `application.properties` dialect to `MySQLDialect`, set home password.
3. Replace all `javax.*` → `jakarta.*` in Java files.
4. Rewrite `SecurityConfig` using Spring Security 6.x lambda DSL.
5. Run `./mvnw clean compile` to verify.

---

## Current State

**As of Phase 1 (March 7, 2026):** The codebase is currently configured for the **🏫 Lab** environment.
