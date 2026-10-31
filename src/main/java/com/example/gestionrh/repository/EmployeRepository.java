package com.example.gestionrh.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.gestionrh.model.Employe;

public interface EmployeRepository extends JpaRepository<Employe, Long> {

	// 1. Rechercher les employés par département
	List<Employe> findByDepartementId(Long departementId);

	// 2. Rechercher les employés par poste
	List<Employe> findByPosteId(Long posteId);

	// 3. Rechercher les employés par compétence
	@Query("SELECT e FROM Employe e JOIN e.competences c WHERE c.nom = :nom")
	List<Employe> findEmployesByCompetenceNom(@Param("nom") String nom);
}