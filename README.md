# Issue Tracker

## Backend

The Spring Boot backend now connects to:
- Jira REST API through a configured WebClient
- PostgreSQL via Spring Data JPA

### Run locally

1. Start PostgreSQL:
   ```bash
   docker compose up -d