
package com.example.gestionrh.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.gestionrh.exception.RessourceIntrouvableException;
import com.example.gestionrh.model.Employe;
import com.example.gestionrh.repository.EmployeRepository;

@Service
public class EmployeService {

	private final EmployeRepository employeRepository;

	// Injection du repository
	public EmployeService(EmployeRepository employeRepository) {
		this.employeRepository = employeRepository;
	}

	// Afficher tous les employés
	public List<Employe> getAllEmployes() {
		return employeRepository.findAll();
	}

	// Rechercher un employé par son ID
	public Employe getEmployeById(Long id) {
		return employeRepository.findById(id)
				.orElseThrow(() -> new RessourceIntrouvableException("Employé introuvable avec l'ID : " + id));
	}

	// Ajouter un employé
	public Employe saveEmploye(Employe employe) {
		return employeRepository.save(employe);
	}

	// Modifier un employé
	public Employe updateEmploye(Long id, Employe nouvelEmploye) {

		Employe employe = getEmployeById(id);

		employe.setNom(nouvelEmploye.getNom());
		employe.setPrenom(nouvelEmploye.getPrenom());
		employe.setEmail(nouvelEmploye.getEmail());
		employe.setSalaire(nouvelEmploye.getSalaire());
		employe.setDepartement(nouvelEmploye.getDepartement());
		employe.setPoste(nouvelEmploye.getPoste());

		return employeRepository.save(employe);
	}

	// Supprimer un employé
	public void deleteEmploye(Long id) {
		Employe employe = getEmployeById(id);
		employeRepository.delete(employe);
	}
}
