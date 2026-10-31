
package com.example.gestionrh.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

	// Gérer les ressources introuvables
	@ExceptionHandler(RessourceIntrouvableException.class)
	public ResponseEntity<String> handleRessourceIntrouvable(RessourceIntrouvableException exception) {

		return new ResponseEntity<>(exception.getMessage(), HttpStatus.NOT_FOUND);
	}

	// Gérer les autres erreurs
	@ExceptionHandler(Exception.class)
	public ResponseEntity<String> handleGlobalException(Exception exception) {

		return new ResponseEntity<>("Une erreur interne est survenue.", HttpStatus.INTERNAL_SERVER_ERROR);
	}
}
