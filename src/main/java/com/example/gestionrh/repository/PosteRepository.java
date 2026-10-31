package com.example.gestionrh.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.gestionrh.model.Poste;

public interface PosteRepository extends JpaRepository<Poste, Long> {

}