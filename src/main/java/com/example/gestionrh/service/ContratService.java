
package com.example.gestionrh.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.gestionrh.exception.RessourceIntrouvableException;
import com.example.gestionrh.model.Contrat;
import com.example.gestionrh.repository.ContratRepository;

@Service
public class ContratService {

	private final ContratRepository contratRepository;

	// Injection du repository
	public ContratService(ContratRepository contratRepository) {
		this.contratRepository = contratRepository;
	}

	// Afficher tous les contrats
	public List<Contrat> getAllContrats() {
		return contratRepository.findAll();
	}

	// Rechercher un contrat par son ID
	public Contrat getContratById(Long id) {
		return contratRepository.findById(id)
				.orElseThrow(() -> new RessourceIntrouvableException("Contrat introuvable avec l'ID : " + id));
	}

	// Ajouter un contrat
	public Contrat saveContrat(Contrat contrat) {
		return contratRepository.save(contrat);
	}

	// Modifier un contrat
	public Contrat updateContrat(Long id, Contrat nouveauContrat) {

		Contrat contrat = getContratById(id);

		contrat.setType(nouveauContrat.getType());
		contrat.setDateDebut(nouveauContrat.getDateDebut());
		contrat.setDateFin(nouveauContrat.getDateFin());
		contrat.setSalaire(nouveauContrat.getSalaire());
		contrat.setEmploye(nouveauContrat.getEmploye());

		return contratRepository.save(contrat);
	}

	// Supprimer un contrat
	public void deleteContrat(Long id) {
		Contrat contrat = getContratById(id);
		contratRepository.delete(contrat);
	}
}
