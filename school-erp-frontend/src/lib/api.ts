import axios, { AxiosRequestConfig, AxiosError, InternalAxiosRequestConfig } from 'axios';

const fallbackPort = process.env.NEXT_PUBLIC_API_PORT || '5000';
const fallbackBaseUrl = typeof window !== 'undefined'
  ? `http://${window.location.hostname}:${fallbackPort}`
  : `http://localhost:${fallbackPort}`;
const BASE_URL = (process.env.NEXT_PUBLIC_API_URL || fallbackBaseUrl).replace(/\/$/, '');
// console.log(BASE_URL, '====>>>BASE_URL');

export interface RequestOptions extends AxiosRequestConfig {
  requireAuth?: boolean;
}

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor
axiosClient.interceptors.request.use(
  (config) => {
    // Cast config to our extended type to read custom options
    const customConfig = config as InternalAxiosRequestConfig & { requireAuth?: boolean };
    const requireAuth = customConfig.requireAuth ?? true;

    // If data is FormData, remove Content-Type so browser sets boundary correctly
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    if (requireAuth && typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.set('Authorization', `Bearer ${token}`);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor
axiosClient.interceptors.response.use(
  (response) => {
    if (response.status === 204) {
      return {} as any;
    }

    const jsonResponse = response.data;

    // Unwrap the standardized backend response { success: true, data: T }
    if (jsonResponse && typeof jsonResponse === 'object' && 'success' in jsonResponse) {
      return jsonResponse.data;
    }

    return jsonResponse;
  },
  (error: AxiosError<any>) => {
    let errorMsg = 'An error occurred';

    // Ignore aborted requests (e.g., when a component unmounts)
    if (axios.isCancel(error)) {
      return Promise.reject(error);
    }

    if (error.response) {
      const { status, data } = error.response;

      // Handle GlobalExceptionFilter format (data.error.message)
      errorMsg = data?.error?.message || data?.message || errorMsg;
      if (Array.isArray(errorMsg)) {
        errorMsg = errorMsg.join(', ');
      }

      if (status === 401 && typeof window !== 'undefined') {
        // Instead of directly manipulating localStorage, we dispatch a custom event.
        // The AuthContext will listen to this event and perform the full React state cleanup.
        window.dispatchEvent(new Event('auth:unauthorized'));
      }
    } else if (error.request) {
      errorMsg = 'Network error, please check your connection.';
    } else {
      errorMsg = error.message;
    }

    return Promise.reject(new Error(errorMsg));
  }
);

/**
 * Generic API request wrapper
 */
export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const url = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;

  // Pass along url and all custom options to the axios client
  const config = { ...options, url } as any;

  // Because our response interceptor unwraps the payload,
  // the resolved value is directly the data of type T.
  const response = await axiosClient.request<T>(config);
  return response as unknown as T;
}

export const api = {
  get: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'POST',
      data: body,
    }),

  put: <T = any>(endpoint: string, body?: any, options?: RequestOptions) =>
    apiRequest<T>(endpoint, {
      ...options,
      method: 'PUT',
      data: body,
    }),

  delete: <T = any>(endpoint: string, options?: RequestOptions) =>
    apiRequest<T>(endpoint, { ...options, method: 'DELETE' }),

  /**
   * SWR Fetcher integration.
   * Usage: const { data } = useSWR('/endpoint', api.fetcher)
   */
  fetcher: <T = any>(url: string) => api.get<T>(url),
};
