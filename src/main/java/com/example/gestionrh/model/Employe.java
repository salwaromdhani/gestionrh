
package com.example.gestionrh.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@Entity
public class Employe {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotBlank(message = "Le nom est obligatoire")
	@Size(min = 2, max = 100)
	private String nom;

	@NotBlank(message = "Le prénom est obligatoire")
	private String prenom;

	@NotBlank(message = "L'email est obligatoire")
	@Email(message = "Email invalide")
	@Column(unique = true)
	private String email;

	@NotNull(message = "Le salaire est obligatoire")
	private Double salaire;

	@ManyToOne
	@JoinColumn(name = "departement_id")
	@JsonIgnoreProperties("employes")
	private Departement departement;

	@ManyToOne
	@JoinColumn(name = "poste_id")
	@JsonIgnoreProperties("employes")
	private Poste poste;

	@OneToMany(mappedBy = "employe")
	@JsonIgnoreProperties("employe")
	private List<Contrat> contrats;

	@OneToMany(mappedBy = "employe")
	@JsonIgnoreProperties("employe")
	private List<Conge> conges;

	@ManyToMany
	@JoinTable(name = "employe_competence", joinColumns = @JoinColumn(name = "employe_id"), inverseJoinColumns = @JoinColumn(name = "competence_id"))
	@JsonIgnoreProperties("employes")
	private List<Competence> competences;

	public Employe() {
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getNom() {
		return nom;
	}

	public void setNom(String nom) {
		this.nom = nom;
	}

	public String getPrenom() {
		return prenom;
	}

	public void setPrenom(String prenom) {
		this.prenom = prenom;
	}

	public String getEmail() {
		return email;
	}

	public void setEmail(String email) {
		this.email = email;
	}

	public Double getSalaire() {
		return salaire;
	}

	public void setSalaire(Double salaire) {
		this.salaire = salaire;
	}

	public Departement getDepartement() {
		return departement;
	}

	public void setDepartement(Departement departement) {
		this.departement = departement;
	}

	public Poste getPoste() {
		return poste;
	}

	public void setPoste(Poste poste) {
		this.poste = poste;
	}

	public List<Contrat> getContrats() {
		return contrats;
	}

	public void setContrats(List<Contrat> contrats) {
		this.contrats = contrats;
	}

	public List<Conge> getConges() {
		return conges;
	}

	public void setConges(List<Conge> conges) {
		this.conges = conges;
	}

	public List<Competence> getCompetences() {
		return competences;
	}

	public void setCompetences(List<Competence> competences) {
		this.competences = competences;
	}
}
