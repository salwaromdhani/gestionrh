
package com.example.gestionrh.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.gestionrh.exception.RessourceIntrouvableException;
import com.example.gestionrh.model.Poste;
import com.example.gestionrh.repository.PosteRepository;

@Service
public class PosteService {

	private final PosteRepository posteRepository;

	// Injection du repository
	public PosteService(PosteRepository posteRepository) {
		this.posteRepository = posteRepository;
	}

	// Afficher tous les postes
	public List<Poste> getAllPostes() {
		return posteRepository.findAll();
	}

	// Rechercher un poste par son ID
	public Poste getPosteById(Long id) {
		return posteRepository.findById(id)
				.orElseThrow(() -> new RessourceIntrouvableException("Poste introuvable avec l'ID : " + id));
	}

	// Ajouter un poste
	public Poste savePoste(Poste poste) {
		return posteRepository.save(poste);
	}

	// Modifier un poste
	public Poste updatePoste(Long id, Poste nouveauPoste) {

		Poste poste = getPosteById(id);

		poste.setIntitule(nouveauPoste.getIntitule());
		poste.setDescription(nouveauPoste.getDescription());
		poste.setSalaireMinimum(nouveauPoste.getSalaireMinimum());
		poste.setSalaireMaximum(nouveauPoste.getSalaireMaximum());

		return posteRepository.save(poste);
	}

	// Supprimer un poste
	public void deletePoste(Long id) {
		Poste poste = getPosteById(id);
		posteRepository.delete(poste);
	}
}
