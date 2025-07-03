# Use an official OpenJDK runtime as a parent image
FROM openjdk:24-jdk-slim

# Set the working directory inside the container
WORKDIR /app

# Copy the built jar file from your host to the container
COPY target/*.jar app.jar

# Expose the port your Spring Boot app runs on (change if not 8081)
EXPOSE 8081

# Run the jar file
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
