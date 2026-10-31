
package com.example.gestionrh.controller;

import java.util.List;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.CrossOrigin;

import com.example.gestionrh.model.Employe;
import com.example.gestionrh.service.EmployeService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/employes")
@CrossOrigin(origins = "*")
public class EmployeController {

	private final EmployeService employeService;

	public EmployeController(EmployeService employeService) {
		this.employeService = employeService;
	}

	// Afficher tous les employés
	@GetMapping
	public List<Employe> getAllEmployes() {
		return employeService.getAllEmployes();
	}

	// Rechercher un employé par ID
	@GetMapping("/{id}")
	public Employe getEmployeById(@PathVariable Long id) {
		return employeService.getEmployeById(id);
	}

	// Ajouter un employé
	@PostMapping
	public ResponseEntity<Employe> saveEmploye(@Valid @RequestBody Employe employe) {

		Employe nouvelEmploye = employeService.saveEmploye(employe);

		return new ResponseEntity<>(nouvelEmploye, HttpStatus.CREATED);
	}

	// Modifier un employé
	@PutMapping("/{id}")
	public Employe updateEmploye(@PathVariable Long id, @Valid @RequestBody Employe employe) {

		return employeService.updateEmploye(id, employe);
	}

	// Supprimer un employé
	@DeleteMapping("/{id}")
	public ResponseEntity<Void> deleteEmploye(@PathVariable Long id) {

		employeService.deleteEmploye(id);

		return ResponseEntity.noContent().build();
	}
}
