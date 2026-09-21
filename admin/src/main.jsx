import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import axios from 'axios'

// Setup Axios Interceptors
axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.DEV ? 'http://localhost:5000' : (import.meta.env.VITE_BACKEND_URL || '');

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers['Authorization'] = 'Bearer ' + token;
          return axios(originalRequest);
        }).catch(err => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post('/api/super-admin/auth/refresh');
        const token = data.token;
        
        const userInfo = JSON.parse(localStorage.getItem('superAdminInfo'));
        if (userInfo) {
          userInfo.token = token;
          localStorage.setItem('superAdminInfo', JSON.stringify(userInfo));
          // Dispatch custom event to let AuthContext know
          window.dispatchEvent(new CustomEvent('token_refreshed', { detail: token }));
        }

        axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        originalRequest.headers['Authorization'] = 'Bearer ' + token;
        
        processQueue(null, token);
        return axios(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('superAdminInfo');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

const queryClient = new QueryClient()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
)

// Trigger HMR
