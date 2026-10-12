package com.campusflow.security;

import com.campusflow.entity.Role;
import com.campusflow.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public final class SecurityUtils {

    private SecurityUtils() {
    }

    public static CustomUserDetails getCurrentUserDetails() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof CustomUserDetails)) {
            throw new UnauthorizedException("User is not authenticated");
        }
        return (CustomUserDetails) authentication.getPrincipal();
    }

    public static Long getCurrentUserId() {
        return getCurrentUserDetails().getId();
    }

    public static String getCurrentUserEmail() {
        return getCurrentUserDetails().getUsername();
    }

    public static Role getCurrentUserRole() {
        return getCurrentUserDetails().getRole();
    }

    public static boolean hasRole(Role role) {
        try {
            return getCurrentUserRole() == role;
        } catch (Exception e) {
            return false;
        }
    }
}
