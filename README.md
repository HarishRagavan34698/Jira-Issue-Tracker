# Issue Tracker

## Backend

The Spring Boot backend now connects to:
- Jira REST API through a configured WebClient
- PostgreSQL via Spring Data JPA

### Run locally

1. Start PostgreSQL:
   ```bash
   docker compose up -d
   ```
2. Start the backend:
   ```bash
   cd Issue-tracker
   mvn spring-boot:run
   ```
3. Test health endpoint:
   ```bash
   curl http://localhost:8081/api/ping
   ```
4. Trigger Jira sync:
   ```bash
   curl http://localhost:8081/api/jira/sync/KAN
   ```

### Environment variables

- `SPRING_DATASOURCE_URL`
- `SPRING_DATASOURCE_USERNAME`
- `SPRING_DATASOURCE_PASSWORD`
- `JIRA_BASE_URL`
- `JIRA_USERNAME`
- `JIRA_API_TOKEN`
