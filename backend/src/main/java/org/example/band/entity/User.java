package org.example.band.entity;

import java.util.ArrayList;
import java.util.List;

import org.example.band.enums.Provider;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseTimeEntity {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	@Column(nullable = false)
	private String email;

	private String name;

	private String profileImage;

	@Enumerated(EnumType.STRING)
	private Provider provider;

	@Column(nullable = false)
	private String providerId;

	@OneToMany(mappedBy = "user")
	private List<Project> projects = new ArrayList<>();

	@Builder
	public User(String email, String name, String profileImage, Provider provider, String providerId) {
		this.email = email;
		this.name = name;
		this.profileImage = profileImage;
		this.provider = provider;
		this.providerId = providerId;
	}

	// Project 연관관계 편의 메서드
	public void addProject(Project project) {
		this.projects.add(project);
		if (project.getUser() != this) {
			project.setUser(this);
		}
	}

	// Project 연관관계 편의 메서드
	public void removeProject(Project project) {
		this.projects.remove(project);
		if (project.getUser() == this) {
			project.setUser(null);
		}
	}
}