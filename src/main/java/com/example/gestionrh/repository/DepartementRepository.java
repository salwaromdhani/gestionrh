package com.example.gestionrh.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.gestionrh.model.Departement;

public interface DepartementRepository extends JpaRepository<Departement, Long> {

}
