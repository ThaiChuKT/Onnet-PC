# ONNET-PC

Backend-first PC rental platform (Spring Boot + MySQL) with React planned as a separate frontend.

## Current Implementation Status

Implemented now:
- Guest: register, verify email, login, list machines, machine detail
- User: profile, change password, wallet summary, wallet transactions, top-up placeholder
- Security: JWT filter + protected user routes

Not fully implemented yet:
- Full booking flow (U4)
- Full payment completion workflow (U5)
- Rental history flow (U6)
- AI recommendation (U3)

---

## 1. Prerequisites

- Java 21
- Maven 3.9+ (or use Maven Wrapper)
- XAMPP MySQL running (or another local MySQL)

Recommended tools:
- Postman (API testing)
- VS Code REST Client or Insomnia

---

## 2. Database Setup (XAMPP MySQL)

1. Start MySQL in XAMPP.
2. Create database:

```sql
CREATE DATABASE IF NOT EXISTS onnetpc;
```

3. Import schema from v2_rs.sql into onnetpc.
4. Ensure the DB user in src/main/resources/application.properties exists and has access.

Example if needed:

```sql
CREATE USER 'Shiro'@'localhost' IDENTIFIED BY 'white';
GRANT ALL PRIVILEGES ON onnetpc.* TO 'Shiro'@'localhost';
FLUSH PRIVILEGES;
```

Notes:
- App uses spring.jpa.hibernate.ddl-auto=validate, so tables must already exist.
- If schema and entities mismatch, startup fails at validation.

---

## 3. Run Backend (Development)

From project root (recommended):

```powershell
.\mvnw.cmd spring-boot:run
```

If port 8080 is already in use:

```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--server.port=8081"
```

If you are currently inside src folder:

```powershell
.\..\mvnw.cmd -f ..\pom.xml spring-boot:run
```

Important:
- Do not use mvn run.
- mvn spring-boot:run only works from the folder that contains pom.xml.

---

## 4. Verify Backend Is Up

Health endpoint:

```http
GET http://localhost:8080/actuator/health
```

Expected:

```json
{"groups":["liveness","readiness"],"status":"UP"}
```

---

## 5. API Testing Guide (Current Section)

### 5.1 Guest Flow Test (G3 + G4 + G1 + G2)

1. Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
	"fullName": "Test User",
	"email": "test.user@example.com",
	"phone": "0900000000",
	"password": "password123"
}
```

2. Copy verificationToken from response.

3. Verify email

```http
POST /api/v1/auth/verify-email/{token}
```

4. Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
	"email": "test.user@example.com",
	"password": "password123"
}
```

5. Save accessToken.

6. List machines

```http
GET /api/v1/pcs?page=0&size=10&sort=price_asc
```

7. Get machine detail

```http
GET /api/v1/pcs/{pcId}
```

### 5.2 User Flow Test (U1 + U8 partial)

Use header on protected routes:

```http
Authorization: Bearer <accessToken>
```

1. Get profile

```http
GET /api/v1/users/me
```

2. Update profile

```http
PATCH /api/v1/users/me
Content-Type: application/json

{
	"fullName": "Updated Name",
	"phone": "0911222333",
	"avatar": "https://example.com/avatar.png"
}
```

3. Change password

```http
POST /api/v1/users/me/change-password
Content-Type: application/json

{
	"oldPassword": "password123",
	"newPassword": "password456",
	"confirmPassword": "password456"
}
```

4. Get wallet summary

```http
GET /api/v1/wallet
```

5. Get wallet transactions

```http
GET /api/v1/wallet/transactions
```

6. Top-up placeholder endpoint

```http
POST /api/v1/wallet/top-up
Content-Type: application/json

{
	"amount": 100
}
```

---

## 6. Frontend Development Guide (Current Section)

This section explains how to build frontend now for the currently implemented backend scope.

### 6.1 Recommended Frontend Stack

- React + Vite
- React Router
- Axios
- Optional: TanStack Query, Zod, React Hook Form

### 6.2 Create Frontend App

From project root:

```powershell
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install axios react-router-dom
```

Create frontend/.env:

```env
VITE_API_BASE_URL=http://localhost:8080
```

If backend runs on 8081, set VITE_API_BASE_URL accordingly.

### 6.3 Suggested Pages for Current Scope

Build these pages first:
- Home page (marketing/intro)
- Login page
- Register page
- Machine list page
- Machine detail page
- Profile page
- Wallet page

Suggested route map:
- / (Home)
- /login
- /register
- /machines
- /machines/:pcId
- /profile
- /wallet

### 6.4 API Client Structure

Suggested frontend src structure:

```text
src/
	api/
		client.ts
		auth.ts
		pcs.ts
		users.ts
		wallet.ts
	pages/
	components/
	hooks/
	routes/
```

Axios base client example:

```ts
import axios from "axios";

export const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL,
});

api.interceptors.request.use((config) => {
	const token = localStorage.getItem("accessToken");
	if (token) config.headers.Authorization = `Bearer ${token}`;
	return config;
});
```

### 6.5 Frontend Tasks For Current Backend

1. Auth integration
- Register -> show verification token message
- Verify email action (input token or use link)
- Login -> store accessToken

2. Guest pages
- Show available machines with paging + sort
- Machine detail with plan prices and approved reviews

3. User pages
- Profile read/update
- Change password form
- Wallet summary + recent transactions

### 6.6 CORS Notes

Backend already allows local frontend origins:
- http://localhost:5173
- http://localhost:3000

If you run frontend on a different port, add it in SecurityConfig.

---

## 7. Troubleshooting

1. Error: No plugin found for prefix spring-boot
- Cause: running Maven in wrong folder (for example src)
- Fix: run from project root or use -f ..\pom.xml

2. Error: Port 8080 already in use
- Fix: use port 8081 run argument

3. Error: Docker process not found
- Fix: docker compose auto-start is disabled in application.properties

4. Error: Schema validation failed
- Cause: DB schema does not match entities
- Fix: re-import v2_rs.sql and re-run

---

## 8. Useful Commands

Compile only:

```powershell
.\mvnw.cmd -DskipTests compile
```

Run tests:

```powershell
.\mvnw.cmd test
```

Run backend:

```powershell
.\mvnw.cmd spring-boot:run
```

Run backend on port 8081:

```powershell
.\mvnw.cmd spring-boot:run "-Dspring-boot.run.arguments=--server.port=8081"
```