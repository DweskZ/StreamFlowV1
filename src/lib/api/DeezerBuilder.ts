// lib/api/DeezerUrlBuilder.ts

export interface DeezerParams {
  name?: string;
  limit?: number;
  searchQuery?: string;
}

export class DeezerUrlBuilder {
  private readonly BASE_URL: string = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';
  private readonly endpoint: string;
  private readonly params: DeezerParams;

  constructor(params: DeezerParams = {}, endpoint: string = '/chart') {
    this.params = params;
    this.endpoint = endpoint;
  }

  build(): string {
    let url = `${this.BASE_URL}/api${this.endpoint}`;

    if (this.endpoint.includes('/search')) {
      const query = this.params.searchQuery || this.params.name || '';
      url += `?q=${encodeURIComponent(query)}`;
      if (this.params.limit) url += `&limit=${this.params.limit}`;
    } else if (this.endpoint.includes('/chart')) {
      if (this.params.limit) url += `?limit=${this.params.limit}`;
    }

    return url;
  }
}
