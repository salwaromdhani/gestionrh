
package com.example.gestionrh.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.gestionrh.model.Competence;
import com.example.gestionrh.service.CompetenceService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/competences")
@CrossOrigin(origins = "*")
public class CompetenceController {

	private final CompetenceService competenceService;

	// Injection du service
	public CompetenceController(CompetenceService competenceService) {
		this.competenceService = competenceService;
	}

	// Afficher toutes les compétences
	@GetMapping
	public List<Competence> getAllCompetences() {
		return competenceService.getAllCompetences();
	}

	// Rechercher une compétence par ID
	@GetMapping("/{id}")
	public Competence getCompetenceById(@PathVariable Long id) {
		return competenceService.getCompetenceById(id);
	}

	// Ajouter une compétence
	@PostMapping
	public ResponseEntity<Competence> saveCompetence(@Valid @RequestBody Competence competence) {

		Competence nouvelleCompetence = competenceService.saveCompetence(competence);

		return new ResponseEntity<>(nouvelleCompetence, HttpStatus.CREATED);
	}

	// Modifier une compétence
	@PutMapping("/{id}")
	public Competence updateCompetence(@PathVariable Long id, @Valid @RequestBody Competence competence) {

		return competenceService.updateCompetence(id, competence);
	}

	// Supprimer une compétence
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteCompetence(@PathVariable Long id) {

		competenceService.deleteCompetence(id);

		return ResponseEntity.noContent().build();
	}
}
