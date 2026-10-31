
package com.example.gestionrh.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.gestionrh.model.Conge;
import com.example.gestionrh.service.CongeService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/conges")
@CrossOrigin(origins = "*")
public class CongeController {

	private final CongeService congeService;

	// Injection du service
	public CongeController(CongeService congeService) {
		this.congeService = congeService;
	}

	// Afficher tous les congés
	@GetMapping
	public List<Conge> getAllConges() {
		return congeService.getAllConges();
	}

	// Rechercher un congé par ID
	@GetMapping("/{id}")
	public Conge getCongeById(@PathVariable Long id) {
		return congeService.getCongeById(id);
	}

	// Ajouter un congé
	@PostMapping
	public ResponseEntity<Conge> saveConge(@Valid @RequestBody Conge conge) {

		Conge nouveauConge = congeService.saveConge(conge);

		return new ResponseEntity<>(nouveauConge, HttpStatus.CREATED);
	}

	// Modifier un congé
	@PutMapping("/{id}")
	public Conge updateConge(@PathVariable Long id, @Valid @RequestBody Conge conge) {

		return congeService.updateConge(id, conge);
	}

	// Supprimer un congé
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteConge(@PathVariable Long id) {

		congeService.deleteConge(id);

		return ResponseEntity.noContent().build();
	}
}
