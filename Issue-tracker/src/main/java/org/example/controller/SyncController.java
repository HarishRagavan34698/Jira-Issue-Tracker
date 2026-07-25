//package org.example.controller;
//
//import org.example.model.JiraIssue;
//import org.example.service.JiraSyncService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.web.bind.annotation.*;
//import reactor.core.publisher.Mono;
//import java.util.List;
//
//@RestController
//@RequestMapping("/api/issues")
//public class SyncController {
//
//    @Autowired
//    private JiraSyncService jiraSyncService;
//
//    // Trigger sync pipeline from Jira into Mongo
//    @PostMapping("/sync/{projectKey}")
//    public Mono<String> triggerSync(@PathVariable String projectKey) {
//        return jiraSyncService.syncIssues(projectKey)
//                .thenReturn("Sync completed successfully for project: " + projectKey);
//    }
//
//    // Read synced items from MongoDB directly for your frontend visualizations
//    @GetMapping("/{projectKey}")
//    public List<JiraIssue> getIssues(@PathVariable String projectKey) {
//        return jiraSyncService.getIssuesFromDb(projectKey);
//    }
//}