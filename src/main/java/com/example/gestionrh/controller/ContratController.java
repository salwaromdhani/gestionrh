
package com.example.gestionrh.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.gestionrh.model.Contrat;
import com.example.gestionrh.service.ContratService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/contrats")
@CrossOrigin(origins = "*")
public class ContratController {

	private final ContratService contratService;

	// Injection du service
	public ContratController(ContratService contratService) {
		this.contratService = contratService;
	}

	// Afficher tous les contrats
	@GetMapping
	public List<Contrat> getAllContrats() {
		return contratService.getAllContrats();
	}

	// Rechercher un contrat par ID
	@GetMapping("/{id}")
	public Contrat getContratById(@PathVariable Long id) {
		return contratService.getContratById(id);
	}

	// Ajouter un contrat
	@PostMapping
	public ResponseEntity<Contrat> saveContrat(@Valid @RequestBody Contrat contrat) {

		Contrat nouveauContrat = contratService.saveContrat(contrat);

		return new ResponseEntity<>(nouveauContrat, HttpStatus.CREATED);
	}

	// Modifier un contrat
	@PutMapping("/{id}")
	public Contrat updateContrat(@PathVariable Long id, @Valid @RequestBody Contrat contrat) {

		return contratService.updateContrat(id, contrat);
	}

	// Supprimer un contrat
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteContrat(@PathVariable Long id) {

		contratService.deleteContrat(id);

		return ResponseEntity.noContent().build();
	}
}
