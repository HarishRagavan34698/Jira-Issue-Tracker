package org.example.controller;

import org.example.model.JiraIssue;
import org.example.repository.IssueRepository;
import org.example.service.JiraSyncService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/jira")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"})
public class JiraController {

    private final JiraSyncService jiraSyncService;
    private final IssueRepository issueRepository;

    public JiraController(JiraSyncService jiraSyncService, IssueRepository issueRepository) {
        this.jiraSyncService = jiraSyncService;
        this.issueRepository = issueRepository;
    }

    @GetMapping("/sync/{projectKey}")
    public ResponseEntity<Map<String, Object>> syncProject(@PathVariable String projectKey) {
        try {
            int count = jiraSyncService.syncIssuesFromJira(projectKey);
            return ResponseEntity.ok(Map.of(
                    "projectKey", projectKey,
                    "message", "Project synchronized successfully",
                    "count", count
            ));
        } catch (Exception ex) {
            return ResponseEntity.internalServerError().body(Map.of(
                    "projectKey", projectKey,
                    "message", ex.getMessage()
            ));
        }
    }

    @GetMapping("/issues")
    public List<JiraIssue> getIssues() {
        return issueRepository.findAll();
    }

    @GetMapping("/metrics/status")
    public List<Map<String, Object>> getStatusMetrics() {
        List<JiraIssue> allIssues = issueRepository.findAll();

        Map<String, Long> grouped = allIssues.stream()
                .collect(Collectors.groupingBy(issue -> Optional.ofNullable(issue.getStatus()).orElse("Unknown"), Collectors.counting()));

        return grouped.entrySet().stream()
                .map(entry -> Map.<String, Object>of(
                        "name", entry.getKey(),
                        "value", entry.getValue()
                ))
                .collect(Collectors.toList());
    }

    @GetMapping("/metrics/priority")
    public List<Map<String, Object>> getPriorityMetrics() {
        List<JiraIssue> allIssues = issueRepository.findAll();

        Map<String, Long> grouped = allIssues.stream()
                .collect(Collectors.groupingBy(issue -> Optional.ofNullable(issue.getPriority()).orElse("Medium"), Collectors.counting()));

        return grouped.entrySet().stream()
                .map(entry -> Map.<String, Object>of(
                        "name", entry.getKey(),
                        "value", entry.getValue()
                ))
                .collect(Collectors.toList());
    }
}