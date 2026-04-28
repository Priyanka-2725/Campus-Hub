package com.campushub.util;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

public final class AvatarUtil {

    private static final String DICEBEAR_BASE_URL = "https://api.dicebear.com/7.x/initials/svg?seed=";

    private AvatarUtil() {
    }

    public static String generateAvatarUrl(String seed) {
        return DICEBEAR_BASE_URL + URLEncoder.encode(seed, StandardCharsets.UTF_8);
    }
}
