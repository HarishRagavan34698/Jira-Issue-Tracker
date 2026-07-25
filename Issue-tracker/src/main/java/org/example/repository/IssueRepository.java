package org.example.repository;

import org.example.model.JiraIssue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IssueRepository extends JpaRepository<JiraIssue, String> {
    void deleteByProjectKey(String projectKey);
}