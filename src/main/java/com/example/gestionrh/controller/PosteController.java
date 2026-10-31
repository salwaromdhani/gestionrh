
package com.example.gestionrh.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.gestionrh.model.Poste;
import com.example.gestionrh.service.PosteService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/postes")
@CrossOrigin(origins = "*")
public class PosteController {

	private final PosteService posteService;

	// Injection du service
	public PosteController(PosteService posteService) {
		this.posteService = posteService;
	}

	// Afficher tous les postes
	@GetMapping
	public List<Poste> getAllPostes() {
		return posteService.getAllPostes();
	}

	// Rechercher un poste par ID
	@GetMapping("/{id}")
	public Poste getPosteById(@PathVariable Long id) {
		return posteService.getPosteById(id);
	}

	// Ajouter un poste
	@PostMapping
	public ResponseEntity<Poste> savePoste(@Valid @RequestBody Poste poste) {

		Poste nouveauPoste = posteService.savePoste(poste);

		return new ResponseEntity<>(nouveauPoste, HttpStatus.CREATED);
	}

	// Modifier un poste
	@PutMapping("/{id}")
	public Poste updatePoste(@PathVariable Long id, @Valid @RequestBody Poste poste) {

		return posteService.updatePoste(id, poste);
	}

	// Supprimer un poste
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deletePoste(@PathVariable Long id) {

		posteService.deletePoste(id);

		return ResponseEntity.noContent().build();
	}
}
