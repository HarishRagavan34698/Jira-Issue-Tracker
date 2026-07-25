import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081';

export const getIssues = () => axios.get(`${API_BASE_URL}/api/jira/issues`);
export const getStatusMetrics = () => axios.get(`${API_BASE_URL}/api/jira/metrics/status`);
export const getPriorityMetrics = () => axios.get(`${API_BASE_URL}/api/jira/metrics/priority`);
export const syncIssues = (projectKey) => axios.get(`${API_BASE_URL}/api/jira/sync/${projectKey}`);
