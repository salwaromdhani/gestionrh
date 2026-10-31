
package com.example.gestionrh.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.gestionrh.exception.RessourceIntrouvableException;
import com.example.gestionrh.model.Competence;
import com.example.gestionrh.repository.CompetenceRepository;

@Service
public class CompetenceService {

	private final CompetenceRepository competenceRepository;

	// Injection du repository
	public CompetenceService(CompetenceRepository competenceRepository) {
		this.competenceRepository = competenceRepository;
	}

	// Afficher toutes les compétences
	public List<Competence> getAllCompetences() {
		return competenceRepository.findAll();
	}

	// Rechercher une compétence par son ID
	public Competence getCompetenceById(Long id) {
		return competenceRepository.findById(id)
				.orElseThrow(() -> new RessourceIntrouvableException("Compétence introuvable avec l'ID : " + id));
	}

	// Ajouter une compétence
	public Competence saveCompetence(Competence competence) {
		return competenceRepository.save(competence);
	}

	// Modifier une compétence
	public Competence updateCompetence(Long id, Competence nouvelleCompetence) {

		Competence competence = getCompetenceById(id);

		competence.setNom(nouvelleCompetence.getNom());
		competence.setDescription(nouvelleCompetence.getDescription());
		competence.setNiveau(nouvelleCompetence.getNiveau());

		return competenceRepository.save(competence);
	}

	// Supprimer une compétence
	public void deleteCompetence(Long id) {
		Competence competence = getCompetenceById(id);
		competenceRepository.delete(competence);
	}
}
