import axios from 'axios';

// В dev используйте proxy в `frontend/package.json` и относительные URL (baseURL пустой),
// так куки Better Auth работают корректно. В проде задайте REACT_APP_API_URL.
const baseURL = process.env.REACT_APP_API_URL ?? '';

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});
