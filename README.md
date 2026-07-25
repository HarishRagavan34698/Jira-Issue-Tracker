# Jira Issue Tracker & Analytics Dashboard

A full-stack application that syncs tasks from the Jira REST API, stores them in PostgreSQL using a Spring Boot backend, and visualizes issue metrics via interactive charts on a React frontend.

## Architecture

- **Backend:** Spring Boot (Spring Data JPA, WebClient)
- **Database:** PostgreSQL
- **Frontend:** React (Dashboard & Charts)
- **Integration:** Jira REST API

---

## Getting Started Locally

### 1. Start the Database
Ensure Docker is running, then spin up PostgreSQL:
```bash
docker compose up -d
