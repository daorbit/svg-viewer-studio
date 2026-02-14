const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://easy-dev-be.vercel.app/api';

interface AuthResponse {
  _id: string;
  username: string;
  email: string;
  token: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
}

interface SignInData {
  email: string;
  password: string;
}

interface SignUpData {
  username: string;
  email: string;
  password: string;
}

interface Note {
  _id: string;
  title: string;
  content: string;
  user: string;
  isDraft: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface Snippet {
  _id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  user: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface NotesPaginationInfo extends PaginationInfo {
  totalNotes: number;
}

interface SnippetsPaginationInfo extends PaginationInfo {
  totalSnippets: number;
}

interface PaginatedSnippetsResponse {
  snippets: Snippet[];
  pagination: SnippetsPaginationInfo;
}

interface PaginatedNotesResponse {
  notes: Note[];
  pagination: NotesPaginationInfo;
}

interface CreateNoteData {
  title: string;
  content: string;
  isDraft?: boolean;
  tags?: string[];
}

interface UpdateNoteData {
  title?: string;
  content?: string;
  isDraft?: boolean;
  tags?: string[];
}

interface CreateSnippetData {
  title: string;
  description: string;
  code: string;
  language: string;
  tags?: string[];
}

interface UpdateSnippetData {
  title?: string;
  description?: string;
  code?: string;
  language?: string;
  tags?: string[];
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  async signIn(data: SignInData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signin`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Sign in failed');
    }

    return response.json();
  }

  async signUp(data: SignUpData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Sign up failed');
    }

    return response.json();
  }

  async getMe(): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to get user info');
    }

    return response.json();
  }

  // Notes API methods
  async getNotes(page: number = 1, limit: number = 10): Promise<PaginatedNotesResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/notes?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notes');
    }

    return response.json();
  }

  async getNote(id: string): Promise<Note> {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch note');
    }

    return response.json();
  }

  async createNote(data: CreateNoteData): Promise<Note> {
    const response = await fetch(`${API_BASE_URL}/notes`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create note');
    }

    return response.json();
  }

  async updateNote(id: string, data: UpdateNoteData): Promise<Note> {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update note');
    }

    return response.json();
  }

  async deleteNote(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/notes/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete note');
    }
  }

  async saveDraft(id: string): Promise<Note> {
    const response = await fetch(`${API_BASE_URL}/notes/${id}/save`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to save draft');
    }

    return response.json();
  }

  // Snippets API methods
  async getSnippets(page: number = 1, limit: number = 10, filters?: {
    language?: string;
    tag?: string;
    search?: string;
  }): Promise<PaginatedSnippetsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.language) params.append('language', filters.language);
    if (filters?.tag) params.append('tag', filters.tag);
    if (filters?.search) params.append('search', filters.search);

    const response = await fetch(`${API_BASE_URL}/snippets?${params}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch snippets');
    }

    return response.json();
  }

  async getSnippet(id: string): Promise<Snippet> {
    const response = await fetch(`${API_BASE_URL}/snippets/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch snippet');
    }

    return response.json();
  }

  async createSnippet(data: CreateSnippetData): Promise<Snippet> {
    const response = await fetch(`${API_BASE_URL}/snippets`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create snippet');
    }

    return response.json();
  }

  async updateSnippet(id: string, data: UpdateSnippetData): Promise<Snippet> {
    const response = await fetch(`${API_BASE_URL}/snippets/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update snippet');
    }

    return response.json();
  }

  async deleteSnippet(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/snippets/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete snippet');
    }
  }

  async getSnippetLanguages(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/snippets/meta/languages`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch languages');
    }

    return response.json();
  }

  async getSnippetTags(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/snippets/meta/tags`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tags');
    }

    return response.json();
  }

  async processText(action: string, text: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/ai/process-text`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ action, text }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to process text');
    }

    const data = await response.json();
    return data.processedText;
  }

  async convertExcelToPdf(file: File): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/converter/excel-to-pdf`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to convert Excel to PDF');
    }

    return response.blob();
  }
}

export const apiService = new ApiService();
export default apiService;