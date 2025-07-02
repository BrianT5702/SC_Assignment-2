package com.aka.bookstore;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;

@SpringBootApplication
public class BookstoreApplication {

	public static void main(String[] args) {
		SpringApplication.run(BookstoreApplication.class, args);
	}

	@EventListener(ApplicationReadyEvent.class)
	public void printAppUrl() {
		System.out.println("\n----------------------------------------------------------");
		System.out.println("Application is running at: http://localhost:8081");
		System.out.println("----------------------------------------------------------\n");
	}

}
