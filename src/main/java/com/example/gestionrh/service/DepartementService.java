
package com.example.gestionrh.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.gestionrh.exception.RessourceIntrouvableException;
import com.example.gestionrh.model.Departement;
import com.example.gestionrh.repository.DepartementRepository;

@Service
public class DepartementService {

	private final DepartementRepository departementRepository;

	// Injection du repository
	public DepartementService(DepartementRepository departementRepository) {
		this.departementRepository = departementRepository;
	}

	// Afficher tous les départements
	public List<Departement> getAllDepartements() {
		return departementRepository.findAll();
	}

	// Rechercher un département par son ID
	public Departement getDepartementById(Long id) {
		return departementRepository.findById(id)
				.orElseThrow(() -> new RessourceIntrouvableException("Département introuvable avec l'ID : " + id));
	}

	// Ajouter un département
	public Departement saveDepartement(Departement departement) {
		return departementRepository.save(departement);
	}

	// Modifier un département
	public Departement updateDepartement(Long id, Departement nouveauDepartement) {

		Departement departement = getDepartementById(id);

		departement.setNom(nouveauDepartement.getNom());
		departement.setDescription(nouveauDepartement.getDescription());

		return departementRepository.save(departement);
	}

	// Supprimer un département
	public void deleteDepartement(Long id) {
		Departement departement = getDepartementById(id);
		departementRepository.delete(departement);
	}
}
