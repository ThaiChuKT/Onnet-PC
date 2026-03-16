package com.onnet.onnetpc.users.service;

import com.onnet.onnetpc.common.exception.ApiException;
import com.onnet.onnetpc.users.User;
import com.onnet.onnetpc.users.dto.ChangePasswordRequest;
import com.onnet.onnetpc.users.dto.ProfileResponse;
import com.onnet.onnetpc.users.dto.UpdateProfileRequest;
import com.onnet.onnetpc.users.repository.UserRepository;
import java.time.Instant;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public ProfileResponse getProfile(String email) {
        User user = findUserByEmail(email);
        return new ProfileResponse(user.getId(), user.getFullName(), user.getEmail(), user.getPhone(), user.getAvatar());
    }

    @Transactional
    public ProfileResponse updateProfile(String email, UpdateProfileRequest request) {
        User user = findUserByEmail(email);
        user.setFullName(request.fullName());
        user.setPhone(request.phone());
        user.setAvatar(request.avatar());
        user.setUpdatedAt(Instant.now());
        User saved = userRepository.save(user);
        return new ProfileResponse(saved.getId(), saved.getFullName(), saved.getEmail(), saved.getPhone(), saved.getAvatar());
    }

    @Transactional
    public void changePassword(String email, ChangePasswordRequest request) {
        User user = findUserByEmail(email);
        if (!passwordEncoder.matches(request.oldPassword(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Old password is incorrect");
        }
        if (!request.newPassword().equals(request.confirmPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "New password confirmation does not match");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setUpdatedAt(Instant.now());
        userRepository.save(user);
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email.toLowerCase(Locale.ROOT))
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }
}
