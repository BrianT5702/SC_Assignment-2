package com.aka.bookstore;

import org.springframework.stereotype.Service;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;
import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;

@Service
public class BookService {
    private static final String DATA_FILE = "books.json";
    private final Map<Long, Book> books = new HashMap<>();
    private final AtomicLong idCounter = new AtomicLong();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @PostConstruct
    private void loadFromFile() {
        File file = new File(DATA_FILE);
        if (file.exists()) {
            try {
                List<Book> bookList = objectMapper.readValue(file, new TypeReference<List<Book>>(){});
                long maxId = 0;
                for (Book book : bookList) {
                    books.put(book.getId(), book);
                    if (book.getId() > maxId) maxId = book.getId();
                }
                idCounter.set(maxId);
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private void saveToFile() {
        try {
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(new File(DATA_FILE), books.values());
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public Book addBook(Book book) {
        long id = idCounter.incrementAndGet();
        book.setId(id);
        books.put(id, book);
        saveToFile();
        return book;
    }

    public List<Book> getAllBooks() {
        return new ArrayList<>(books.values());
    }

    public Optional<Book> getBookById(Long id) {
        return Optional.ofNullable(books.get(id));
    }

    public Optional<Book> updateBook(Long id, Book updatedBook) {
        Book existing = books.get(id);
        if (existing != null) {
            existing.setTitle(updatedBook.getTitle());
            existing.setAuthor(updatedBook.getAuthor());
            existing.setPrice(updatedBook.getPrice());
            existing.setQuantity(updatedBook.getQuantity());
            saveToFile();
            return Optional.of(existing);
        }
        return Optional.empty();
    }

    public boolean deleteBook(Long id) {
        boolean removed = books.remove(id) != null;
        if (removed) saveToFile();
        return removed;
    }
} 