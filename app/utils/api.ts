/**
 * API Utility Service
 * Handles authenticated requests to the backend API
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const TOKEN_KEY = process.env.NEXT_PUBLIC_TOKEN_KEY || 'lush_co_auth_token';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  count?: number;
}

interface ApiError {
  success: false;
  message: string;
  status?: number;
}

/**
 * Get the authentication token from localStorage
 */
function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Make an authenticated API request
 * @param endpoint - API endpoint (e.g., '/staff')
 * @param options - Fetch options (method, body, etc.)
 * @returns Promise with API response data
 */
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T> | ApiError> {
  const token = getAuthToken();

  if (!token) {
    return {
      success: false,
      message: 'Authentication required. Please log in.',
    };
  }

  const url = `${API_BASE_URL}${endpoint}`;

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    ...options.headers,
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Handle 204 No Content - backend returns this when there's no data
    if (response.status === 204) {
      return {
        success: true,
        data: undefined,
        message: 'No data available for the requested period',
      };
    }

    // Parse JSON response
    const responseData = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: responseData.message || `Request failed with status ${response.status}`,
        status: response.status,
      };
    }

    // Handle backend responses that return data at root level vs nested under 'data'
    // Case 1: Backend returns { success, data: { actual data } } - standard format
    // Case 2: Backend returns { success, ...actualData } - data at root level
    // Case 3: Backend returns { success, data: [...] } - array directly in data

    if (responseData.success) {
      // If data property doesn't exist, wrap the response
      if (!responseData.hasOwnProperty('data') && Object.keys(responseData).length > 1) {
        const { success, message, ...actualData } = responseData;
        return {
          success,
          data: actualData as T,
          message
        };
      }

      // If data exists but other root properties exist too (like year, period), wrap everything
      if (responseData.data && Object.keys(responseData).length > 2) {
        // Check if this is trends format: { success, year, data: [...] }
        const otherProps = Object.keys(responseData).filter(k => k !== 'success' && k !== 'data' && k !== 'message');
        if (otherProps.length > 0) {
          const { success, message, ...allData } = responseData;
          return {
            success,
            data: allData as T,
            message
          };
        }
      }
    }

    return responseData;
  } catch (error) {
    console.error('API request error:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Network error. Please check your connection.',
    };
  }
}

/**
 * GET request helper
 */
export async function apiGet<T>(endpoint: string): Promise<ApiResponse<T> | ApiError> {
  return apiRequest<T>(endpoint, { method: 'GET' });
}

/**
 * POST request helper
 */
export async function apiPost<T>(endpoint: string, body: unknown): Promise<ApiResponse<T> | ApiError> {
  return apiRequest<T>(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

/**
 * PUT request helper
 */
export async function apiPut<T>(endpoint: string, body: unknown): Promise<ApiResponse<T> | ApiError> {
  return apiRequest<T>(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

/**
 * DELETE request helper
 */
export async function apiDelete<T>(endpoint: string): Promise<ApiResponse<T> | ApiError> {
  return apiRequest<T>(endpoint, { method: 'DELETE' });
}
