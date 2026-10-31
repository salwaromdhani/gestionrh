
package com.example.gestionrh.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.gestionrh.model.Departement;
import com.example.gestionrh.service.DepartementService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/departements")
@CrossOrigin(origins = "*")
public class DepartementController {

	private final DepartementService departementService;

	public DepartementController(DepartementService departementService) {
		this.departementService = departementService;
	}

	// Afficher tous les départements
	@GetMapping
	public List<Departement> getAllDepartements() {
		return departementService.getAllDepartements();
	}

	// Rechercher un département par ID
	@GetMapping("/{id}")
	public Departement getDepartementById(@PathVariable Long id) {
		return departementService.getDepartementById(id);
	}

	// Ajouter un département
	@PostMapping
	public ResponseEntity<Departement> saveDepartement(@Valid @RequestBody Departement departement) {

		Departement nouveauDepartement = departementService.saveDepartement(departement);

		return new ResponseEntity<>(nouveauDepartement, HttpStatus.CREATED);
	}

	// Modifier un département
	@PutMapping("/{id}")
	public Departement updateDepartement(@PathVariable Long id, @Valid @RequestBody Departement departement) {

		return departementService.updateDepartement(id, departement);
	}

	// Supprimer un département
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteDepartement(@PathVariable Long id) {

		departementService.deleteDepartement(id);

		return ResponseEntity.noContent().build();
	}
}
