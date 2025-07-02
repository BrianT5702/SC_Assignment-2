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

    /**
     * Adds a new book to the inventory after validating input.
     * @param book Book to add
     * @return The added Book
     * @throws IllegalArgumentException if validation fails
     */
    public Book addBook(Book book) {
        validateBook(book);
        long id = idCounter.incrementAndGet();
        book.setId(id);
        books.put(id, book);
        saveToFile();
        return book;
    }

    /**
     * Returns all books in the inventory.
     * @return List of books
     */
    public List<Book> getAllBooks() {
        return new ArrayList<>(books.values());
    }

    /**
     * Returns a book by its ID.
     * @param id Book ID
     * @return Optional of Book
     */
    public Optional<Book> getBookById(Long id) {
        return Optional.ofNullable(books.get(id));
    }

    /**
     * Updates an existing book after validating input.
     * @param id Book ID
     * @param updatedBook Book data to update
     * @return Optional of updated Book
     * @throws IllegalArgumentException if validation fails
     */
    public Optional<Book> updateBook(Long id, Book updatedBook) {
        Book existing = books.get(id);
        if (existing != null) {
            validateBook(updatedBook);
            existing.setTitle(updatedBook.getTitle());
            existing.setAuthor(updatedBook.getAuthor());
            existing.setPrice(updatedBook.getPrice());
            existing.setQuantity(updatedBook.getQuantity());
            saveToFile();
            return Optional.of(existing);
        }
        return Optional.empty();
    }

    /**
     * Deletes a book by its ID.
     * @param id Book ID
     * @return true if deleted, false if not found
     */
    public boolean deleteBook(Long id) {
        boolean removed = books.remove(id) != null;
        if (removed) saveToFile();
        return removed;
    }

    /**
     * Validates book data. Throws IllegalArgumentException if invalid.
     */
    private void validateBook(Book book) {
        if (book.getTitle() == null || book.getTitle().trim().isEmpty()) {
            throw new IllegalArgumentException("Title cannot be empty");
        }
        if (book.getAuthor() == null || book.getAuthor().trim().isEmpty()) {
            throw new IllegalArgumentException("Author cannot be empty");
        }
        if (book.getPrice() < 0) {
            throw new IllegalArgumentException("Price cannot be negative");
        }
        if (book.getQuantity() < 0) {
            throw new IllegalArgumentException("Quantity cannot be negative");
        }
    }

    /**
     * Adds stock to a book.
     * @param id Book ID
     * @param amount Amount to add
     * @return Optional of updated Book
     */
    public Optional<Book> addStock(Long id, int amount) {
        Book book = books.get(id);
        if (book != null) {
            book.setQuantity(book.getQuantity() + amount);
            saveToFile();
            return Optional.of(book);
        }
        return Optional.empty();
    }

    /**
     * Sells books (reduces stock).
     * @param id Book ID
     * @param amount Amount to sell
     * @return Optional of updated Book
     * @throws IllegalArgumentException if not enough stock
     */
    public Optional<Book> sellBook(Long id, int amount) {
        Book book = books.get(id);
        if (book != null) {
            if (book.getQuantity() < amount) {
                throw new IllegalArgumentException("Not enough stock to sell");
            }
            book.setQuantity(book.getQuantity() - amount);
            saveToFile();
            return Optional.of(book);
        }
        return Optional.empty();
    }
} 