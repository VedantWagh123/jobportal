import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { AppContextProvider } from './context/AppContext.jsx'
import { AdminContextProvider } from './context/AdminContext.jsx'
import { SocketProvider } from './context/SocketContext.jsx'
import { ClerkProvider } from '@clerk/clerk-react'

// Import your publishable key
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key")
}

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient()

import axios from 'axios'

axios.defaults.withCredentials = true;

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
        const { data } = await axios.post('/api/company/refresh');
        const token = data.token;
        
        // Wait, what does the company client store? Usually `companyToken`. Let me check AdminContext.jsx in a second.
        const existingToken = localStorage.getItem('companyToken');
        if (existingToken) {
          localStorage.setItem('companyToken', token);
          window.dispatchEvent(new CustomEvent('token_refreshed_company', { detail: token }));
        }

        axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;
        originalRequest.headers['Authorization'] = 'Bearer ' + token;
        
        processQueue(null, token);
        return axios(originalRequest);
      } catch (err) {
        processQueue(err, null);
        localStorage.removeItem('companyToken');
        window.location.href = '/login';
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

createRoot(document.getElementById('root')).render(
  <QueryClientProvider client={queryClient}>
    <ClerkProvider publishableKey={PUBLISHABLE_KEY} afterSignOutUrl="/">
      <BrowserRouter>
        <SocketProvider>
          <AppContextProvider>
            <AdminContextProvider>
              <App />
            </AdminContextProvider>
          </AppContextProvider>
        </SocketProvider>
      </BrowserRouter>
    </ClerkProvider>
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>,
)
