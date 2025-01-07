package org.example.band.service;

import java.util.Map;

import org.example.band.config.UserPrincipal;
import org.example.band.entity.User;
import org.example.band.enums.Provider;
import org.example.band.repository.UserRepository;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;
import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class OAuth2UserService extends DefaultOAuth2UserService {

	private final UserRepository userRepository;

	@Override
	public OAuth2User loadUser(OAuth2UserRequest userRequest)
		throws OAuth2AuthenticationException {
		OAuth2User oauth2User = super.loadUser(userRequest);

		String registrationId = userRequest.getClientRegistration().getRegistrationId();
		Provider provider = Provider.valueOf(registrationId.toUpperCase());

		// Provider enum을 사용하여 속성값 추출
		String providerId = getAttributeValue(oauth2User, provider.getAttributeKey());
		String email = getAttributeValue(oauth2User, provider.getEmailAttribute());
		String name = getAttributeValue(oauth2User, provider.getNameAttribute());
		String profileImage = getAttributeValue(oauth2User, provider.getProfileImageAttribute());

		User user = userRepository.findByEmailAndProvider(email, provider)
			.orElseGet(() -> createUser(email, name, profileImage, provider, providerId));

		return UserPrincipal.create(user, oauth2User.getAttributes());
	}

	private String getAttributeValue(OAuth2User oauth2User, String attributePath) {
		String[] attributes = attributePath.split("\\.");
		Object value = oauth2User.getAttributes();

		for (String attribute : attributes) {
			if (value == null) {
				return null;
			}
			if (value instanceof Map) {
				value = ((Map<?, ?>) value).get(attribute);
			} else {
				return null;
			}
		}

		return value != null ? value.toString() : null;
	}

	private User createUser(String email, String name, String profileImage,
		Provider provider, String providerId) {
		return userRepository.save(User.builder()
			.email(email)
			.name(name)
			.profileImage(profileImage)
			.provider(provider)
			.providerId(providerId)
			.build());
	}
}