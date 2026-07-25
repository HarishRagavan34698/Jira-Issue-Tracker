package org.example.service;

import org.example.model.JiraIssue;
import org.example.repository.IssueRepository;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;

import java.lang.reflect.Proxy;
import java.util.LinkedHashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class JiraSyncServiceTest {

    @Test
    void mapsJiraIssueFieldsIntoPersistableEntity() {
        IssueRepository repository = (IssueRepository) Proxy.newProxyInstance(
                IssueRepository.class.getClassLoader(),
                new Class<?>[]{IssueRepository.class},
                (proxy, method, args) -> {
                    if ("deleteByProjectKey".equals(method.getName())) {
                        return null;
                    }
                    if ("save".equals(method.getName())) {
                        return args[0];
                    }
                    return null;
                });
        JiraSyncService service = new JiraSyncService(repository, WebClient.builder().build());

        Map<String, Object> rawIssue = new LinkedHashMap<>();
        rawIssue.put("id", "10001");
        rawIssue.put("key", "KAN-2");

        Map<String, Object> fields = new LinkedHashMap<>();
        fields.put("summary", "Need to fix a registration mismatch");
        fields.put("status", Map.of("name", "In Progress"));
        fields.put("priority", Map.of("name", "High"));
        fields.put("assignee", Map.of("displayName", "Ada Lovelace"));
        rawIssue.put("fields", fields);

        JiraIssue issue = service.mapIssueToEntity(rawIssue, "KAN");

        assertEquals("10001", issue.getId());
        assertEquals("KAN-2", issue.getIssueKey());
        assertEquals("Need to fix a registration mismatch", issue.getSummary());
        assertEquals("In Progress", issue.getStatus());
        assertEquals("High", issue.getPriority());
        assertEquals("Ada Lovelace", issue.getAssignee());
        assertEquals("KAN", issue.getProjectKey());
    }
}
