package org.example.service;

import org.example.model.JiraIssue;
import org.example.repository.IssueRepository;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class JiraSyncService {

    private final IssueRepository issueRepository;
    private final WebClient webClient;

    public JiraSyncService(IssueRepository issueRepository, WebClient jiraWebClient) {
        this.issueRepository = issueRepository;
        this.webClient = jiraWebClient;
    }

    @SuppressWarnings("unchecked")
    public int syncIssuesFromJira(String projectKey) {
        issueRepository.deleteByProjectKey(projectKey);

        Map<String, Object> response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .path("/rest/api/3/search/jql")
                        .queryParam("jql", "project = \"" + projectKey + "\"")
                        .queryParam("fields", "summary,status,priority,assignee,project")
                        .queryParam("maxResults", 100)
                        .build())
                .retrieve()
                .onStatus(HttpStatusCode::isError, clientResponse -> clientResponse.bodyToMono(String.class)
                        .flatMap(body -> Mono.error(new IllegalStateException("Jira API error " + clientResponse.statusCode() + ": " + body))))
                .bodyToMono(Map.class)
                .block();

        if (response == null || !response.containsKey("issues")) {
            return 0;
        }

        List<Map<String, Object>> issues = (List<Map<String, Object>>) response.get("issues");
        List<JiraIssue> savedIssues = new ArrayList<>();
        for (Map<String, Object> rawIssue : issues) {
            JiraIssue issue = mapIssueToEntity(rawIssue, projectKey);
            savedIssues.add(issueRepository.save(issue));
        }

        return savedIssues.size();
    }

    JiraIssue mapIssueToEntity(Map<String, Object> rawIssue, String projectKey) {
        JiraIssue issue = new JiraIssue();
        issue.setId(String.valueOf(rawIssue.getOrDefault("id", UUID.randomUUID())));
        issue.setIssueKey(getString(rawIssue.get("key")));

        Map<String, Object> fields = asMap(rawIssue.get("fields"));
        if (fields != null) {
            issue.setSummary(getString(fields.get("summary")));

            Map<String, Object> statusMap = asMap(fields.get("status"));
            issue.setStatus(statusMap != null ? getString(statusMap.get("name")) : "Unknown");

            Map<String, Object> priorityMap = asMap(fields.get("priority"));
            issue.setPriority(priorityMap != null ? getString(priorityMap.get("name")) : "Medium");

            Map<String, Object> assigneeMap = asMap(fields.get("assignee"));
            issue.setAssignee(assigneeMap != null ? getString(assigneeMap.get("displayName")) : "Unassigned");

            Map<String, Object> projectMap = asMap(fields.get("project"));
            issue.setProjectKey(projectMap != null ? getString(projectMap.get("key")) : projectKey);
        } else {
            issue.setProjectKey(projectKey);
        }

        return issue;
    }

    private Map<String, Object> asMap(Object value) {
        if (value instanceof Map<?, ?> map) {
            return (Map<String, Object>) map;
        }
        return null;
    }

    private String getString(Object value) {
        return value == null ? null : String.valueOf(value);
    }
}