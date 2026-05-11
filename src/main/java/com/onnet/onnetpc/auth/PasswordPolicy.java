package com.onnet.onnetpc.auth;

import com.onnet.onnetpc.common.exception.ApiException;
import org.springframework.http.HttpStatus;

public final class PasswordPolicy {

    private PasswordPolicy() {
    }

    public static void validate(String password) {
        if (password == null || password.length() < 8) {
            throw invalidPassword();
        }
        boolean hasUpper = false;
        boolean hasNumber = false;
        boolean hasSpecial = false;
        for (char ch : password.toCharArray()) {
            if (Character.isUpperCase(ch)) {
                hasUpper = true;
            } else if (Character.isDigit(ch)) {
                hasNumber = true;
            } else if (!Character.isLetterOrDigit(ch)) {
                hasSpecial = true;
            }
        }
        if (!hasUpper || !hasNumber || !hasSpecial) {
            throw invalidPassword();
        }
    }

    private static ApiException invalidPassword() {
        return new ApiException(
            HttpStatus.BAD_REQUEST,
            "Password must be at least 8 characters and include an uppercase letter, a number, and a special character"
        );
    }
}
