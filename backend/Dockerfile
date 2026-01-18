FROM maven:3.9.8-eclipse-temurin-21 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:21-jre-jammy

# Instaliramo ca-certificates samo da budemo sigurni, ali bez ručnog linkanja
RUN apt-get update && \
    apt-get install -y ca-certificates && \
    update-ca-certificates && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

# ČISTI ENTRYPOINT - bez prisiljavanja na putanje koje ne postoje
ENTRYPOINT ["java", "-Xmx400m", "-Xms256m", "-jar", "app.jar"]