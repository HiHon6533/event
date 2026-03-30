package com.eventbooking.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.BAD_REQUEST)
public class InsufficientTicketException extends RuntimeException {
    public InsufficientTicketException(String message) {
        super(message);
    }
}
