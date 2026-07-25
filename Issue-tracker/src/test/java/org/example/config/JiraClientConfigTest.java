package org.example.config;

import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;

import static org.assertj.core.api.Assertions.assertThat;

class JiraClientConfigTest {

    @Test
    void shouldCreateJiraWebClientBeanFromConfigurationValues() {
        JiraClientConfig config = new JiraClientConfig();

        WebClient webClient = config.jiraWebClient(
                "https://example.atlassian.net",
                "test@example.com",
                "test-token"
        );

        assertThat(webClient).isNotNull();
    }
}
