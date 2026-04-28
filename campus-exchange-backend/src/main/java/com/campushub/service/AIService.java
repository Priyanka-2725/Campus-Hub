package com.campushub.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.campushub.dto.response.PriceSuggestionResponse;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class AIService {

    private static final Set<String> SPAM_KEYWORDS = Set.of(
            "free money",
            "click here",
            "whatsapp",
            "telegram",
            "crypto",
            "guaranteed profit",
            "lottery",
            "adult"
    );

    private final String geminiApiKey;
    private final String geminiModel;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public AIService(
            @Value("${gemini.api.key:}") String geminiApiKey,
            @Value("${gemini.model:gemini-1.5-flash}") String geminiModel,
            ObjectMapper objectMapper
    ) {
        this.geminiApiKey = geminiApiKey == null ? "" : geminiApiKey.trim();
        this.geminiModel = geminiModel;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(4))
                .build();
    }

    public String generateDescription(String title) {
        Optional<String> geminiResult = generateDescriptionWithGemini(title);
        if (geminiResult.isPresent()) {
            return geminiResult.get();
        }

        String safeTitle = title == null ? "Item" : title.trim();
        if (safeTitle.isEmpty()) {
            safeTitle = "Item";
        }

        return "Well-maintained " + safeTitle + " suitable for campus use. "
                + "Gently used, clean, and ready for quick pickup. "
                + "Feel free to message for condition details and availability.";
    }

    public PriceSuggestionResponse suggestPrice(String title, String category) {
        Optional<PriceSuggestionResponse> geminiResult = suggestPriceWithGemini(title, category);
        if (geminiResult.isPresent()) {
            return geminiResult.get();
        }

        String normalizedCategory = normalize(category);
        double basePrice = switch (normalizedCategory) {
            case "electronics" -> 220.0;
            case "books" -> 25.0;
            case "furniture" -> 120.0;
            case "sports" -> 90.0;
            case "fashion" -> 45.0;
            default -> 60.0;
        };

        String normalizedTitle = normalize(title);
        if (normalizedTitle.contains("new") || normalizedTitle.contains("sealed")) {
            basePrice *= 1.25;
        } else if (normalizedTitle.contains("used") || normalizedTitle.contains("old")) {
            basePrice *= 0.85;
        }

        double min = round2(basePrice * 0.8);
        double max = round2(basePrice * 1.2);

        return PriceSuggestionResponse.builder()
                .title(title)
                .category(category)
                .minSuggestedPrice(min)
                .maxSuggestedPrice(max)
                .build();
    }

    public boolean isSpam(String description) {
        Optional<Boolean> geminiResult = isSpamWithGemini(description);
        if (geminiResult.isPresent()) {
            return geminiResult.get();
        }

        String normalizedDescription = normalize(description);
        if (normalizedDescription.isBlank()) {
            return true;
        }

        long keywordHits = SPAM_KEYWORDS.stream()
                .filter(normalizedDescription::contains)
                .count();

        boolean hasTooManyLinks = normalizedDescription.split("http", -1).length - 1 >= 2;
        boolean hasExcessiveCaps = hasExcessiveCaps(description);

        return keywordHits > 0 || hasTooManyLinks || hasExcessiveCaps;
    }

    private boolean hasExcessiveCaps(String text) {
        if (text == null || text.isBlank()) {
            return false;
        }

        int letters = 0;
        int uppercase = 0;
        for (char ch : text.toCharArray()) {
            if (Character.isLetter(ch)) {
                letters++;
                if (Character.isUpperCase(ch)) {
                    uppercase++;
                }
            }
        }

        if (letters < 12) {
            return false;
        }

        return (uppercase * 1.0 / letters) > 0.7;
    }

    private String normalize(String text) {
        if (text == null) {
            return "";
        }
        return text.toLowerCase(Locale.ROOT).trim();
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }

    private Optional<String> generateDescriptionWithGemini(String title) {
        String safeTitle = title == null ? "Item" : title.trim();
        String prompt = "Write one concise marketplace listing description for this title: '" + safeTitle
                + "'. Keep it under 60 words. Return plain text only.";

        return callGemini(prompt).map(String::trim).filter(text -> !text.isBlank());
    }

    private Optional<PriceSuggestionResponse> suggestPriceWithGemini(String title, String category) {
        String safeTitle = title == null ? "Item" : title.trim();
        String safeCategory = category == null ? "General" : category.trim();

        String prompt = "You are pricing used campus marketplace items. For title '" + safeTitle
                + "' in category '" + safeCategory
                + "', return ONLY valid JSON with keys min and max as numbers.";

        Optional<String> response = callGemini(prompt);
        if (response.isEmpty()) {
            return Optional.empty();
        }

        try {
            JsonNode root = objectMapper.readTree(response.get());
            if (!root.has("min") || !root.has("max")) {
                return Optional.empty();
            }

            double min = round2(root.get("min").asDouble());
            double max = round2(root.get("max").asDouble());
            if (min <= 0 || max <= 0) {
                return Optional.empty();
            }

            if (min > max) {
                double temp = min;
                min = max;
                max = temp;
            }

            return Optional.of(PriceSuggestionResponse.builder()
                    .title(title)
                    .category(category)
                    .minSuggestedPrice(min)
                    .maxSuggestedPrice(max)
                    .build());
        } catch (Exception ex) {
            log.debug("Gemini price response parse failed, using fallback");
            return Optional.empty();
        }
    }

    private Optional<Boolean> isSpamWithGemini(String description) {
        if (description == null || description.isBlank()) {
            return Optional.of(true);
        }

        String prompt = "Classify this listing text as SPAM or CLEAN. Return exactly one word: SPAM or CLEAN. "
                + "Text: '''" + description + "'''";

        return callGemini(prompt)
                .map(answer -> answer.toUpperCase(Locale.ROOT).trim())
                .map(answer -> answer.contains("SPAM"));
    }

    private Optional<String> callGemini(String prompt) {
        if (geminiApiKey.isBlank()) {
            return Optional.empty();
        }

        try {
            String encodedKey = URLEncoder.encode(geminiApiKey, StandardCharsets.UTF_8);
            String endpoint = "https://generativelanguage.googleapis.com/v1beta/models/"
                    + geminiModel
                    + ":generateContent?key="
                    + encodedKey;

            Map<String, Object> payload = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(Map.of("text", prompt)))
                    )
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(endpoint))
                    .timeout(Duration.ofSeconds(6))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                log.debug("Gemini call failed with status {}, using fallback", response.statusCode());
                return Optional.empty();
            }

            JsonNode root = objectMapper.readTree(response.body());
            JsonNode candidates = root.path("candidates");
            if (!candidates.isArray() || candidates.isEmpty()) {
                return Optional.empty();
            }

            JsonNode parts = candidates.get(0).path("content").path("parts");
            if (!parts.isArray() || parts.isEmpty()) {
                return Optional.empty();
            }

            String text = parts.get(0).path("text").asText("").trim();
            return text.isBlank() ? Optional.empty() : Optional.of(text);
        } catch (Exception ex) {
            log.debug("Gemini call error, using fallback: {}", ex.getMessage());
            return Optional.empty();
        }
    }
}
