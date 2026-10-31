
package com.example.gestionrh.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.gestionrh.exception.RessourceIntrouvableException;
import com.example.gestionrh.model.Conge;
import com.example.gestionrh.repository.CongeRepository;

@Service
public class CongeService {

	private final CongeRepository congeRepository;

	// Injection du repository
	public CongeService(CongeRepository congeRepository) {
		this.congeRepository = congeRepository;
	}

	// Afficher tous les congés
	public List<Conge> getAllConges() {
		return congeRepository.findAll();
	}

	// Rechercher un congé par son ID
	public Conge getCongeById(Long id) {
		return congeRepository.findById(id)
				.orElseThrow(() -> new RessourceIntrouvableException("Congé introuvable avec l'ID : " + id));
	}

	// Ajouter un congé
	public Conge saveConge(Conge conge) {
		return congeRepository.save(conge);
	}

	// Modifier un congé
	public Conge updateConge(Long id, Conge nouveauConge) {

		Conge conge = getCongeById(id);

		conge.setType(nouveauConge.getType());
		conge.setDateDebut(nouveauConge.getDateDebut());
		conge.setDateFin(nouveauConge.getDateFin());
		conge.setStatut(nouveauConge.getStatut());
		conge.setEmploye(nouveauConge.getEmploye());

		return congeRepository.save(conge);
	}

	// Supprimer un congé
	public void deleteConge(Long id) {
		Conge conge = getCongeById(id);
		congeRepository.delete(conge);
	}
}
