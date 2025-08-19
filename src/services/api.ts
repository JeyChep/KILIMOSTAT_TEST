import { Domain, ApiResponse } from '../types';

const API_BASE_URL = 'http://localhost:8000/api'; // Replace with your Django API URL

class ApiService {
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  async getDomains(params?: {
    search?: string;
    subsector?: string;
    ordering?: string;
    limit?: number;
    offset?: number;
  }): Promise<ApiResponse<Domain>> {
    const searchParams = new URLSearchParams();
    
    if (params?.search) searchParams.append('search', params.search);
    if (params?.subsector) searchParams.append('subsector', params.subsector);
    if (params?.ordering) searchParams.append('ordering', params.ordering);
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.offset) searchParams.append('offset', params.offset.toString());

    const queryString = searchParams.toString();
    const endpoint = `/domains/${queryString ? `?${queryString}` : ''}`;
    
    return this.request<ApiResponse<Domain>>(endpoint);
  }

  async getDomain(id: number): Promise<Domain> {
    return this.request<Domain>(`/domains/${id}/`);
  }

  async createDomain(domain: Omit<Domain, 'id'>): Promise<Domain> {
    return this.request<Domain>('/domains/', {
      method: 'POST',
      body: JSON.stringify(domain),
    });
  }

  async updateDomain(id: number, domain: Partial<Domain>): Promise<Domain> {
    return this.request<Domain>(`/domains/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(domain),
    });
  }

  async deleteDomain(id: number): Promise<void> {
    return this.request<void>(`/domains/${id}/`, {
      method: 'DELETE',
    });
  }

  async exportDomains(ids?: number[]): Promise<Blob> {
    const params = new URLSearchParams();
    if (ids && ids.length > 0) {
      ids.forEach(id => params.append('ids', id.toString()));
    }
    
    const queryString = params.toString();
    const endpoint = `/domains/export/${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Export Error: ${response.status} ${response.statusText}`);
    }
    
    return response.blob();
  }
}

export const apiService = new ApiService();