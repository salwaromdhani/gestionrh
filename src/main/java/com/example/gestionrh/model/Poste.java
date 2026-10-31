
package com.example.gestionrh.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;

@Entity
public class Poste {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@NotBlank(message = "L'intitulé du poste est obligatoire")
	@Size(min = 2, max = 100)
	private String intitule;

	private String description;

	private Double salaireMinimum;

	private Double salaireMaximum;

	@OneToMany(mappedBy = "poste")
	@JsonIgnoreProperties({ "poste", "departement", "contrats", "conges", "competences" })
	private List<Employe> employes;

	public Poste() {
	}

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getIntitule() {
		return intitule;
	}

	public void setIntitule(String intitule) {
		this.intitule = intitule;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public Double getSalaireMinimum() {
		return salaireMinimum;
	}

	public void setSalaireMinimum(Double salaireMinimum) {
		this.salaireMinimum = salaireMinimum;
	}

	public Double getSalaireMaximum() {
		return salaireMaximum;
	}

	public void setSalaireMaximum(Double salaireMaximum) {
		this.salaireMaximum = salaireMaximum;
	}

	public List<Employe> getEmployes() {
		return employes;
	}

	public void setEmployes(List<Employe> employes) {
		this.employes = employes;
	}
}
