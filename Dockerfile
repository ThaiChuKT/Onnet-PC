# ---- Frontend build stage ----
FROM node:22-alpine AS frontend-build
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend ./
RUN npm run build

# ---- Backend build stage ----
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

COPY mvnw .
COPY .mvn .mvn
COPY pom.xml .
RUN chmod +x ./mvnw || true
RUN sed -i 's/\r$//' ./mvnw || true
RUN ./mvnw dependency:go-offline -B

COPY src src
COPY --from=frontend-build /app/frontend/dist src/main/resources/static
RUN chmod +x ./mvnw || true
RUN sed -i 's/\r$//' ./mvnw || true
RUN ./mvnw package -DskipTests

# ---- Runtime stage ----
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8080}"]
