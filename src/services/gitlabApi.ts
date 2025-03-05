import axios from 'axios';
import { format } from 'date-fns';

const GITLAB_API_URL = 'https://gitlab.com/api/v4';
// Note: In a production app, you should store this in an environment variable
const ACCESS_TOKEN = 'your_access_token'; 

export interface GitlabProject {
  id: number;
  name: string;
}

export interface GitlabAuthor {
  id: number;
  name: string;
}

export interface GitlabIssue {
  id: number;
  iid: number;
  title: string;
  description: string;
  state: string;
  created_at: string;
  updated_at: string;
  closed_at: string | null;
  labels: string[];
  milestone: {
    id: number;
    title: string;
  } | null;
  assignees: {
    id: number;
    name: string;
    username: string;
    avatar_url: string;
  }[];
  author: GitlabAuthor;
  project: GitlabProject;
  web_url: string;
  severity: string;
}

export const fetchIssues = async (startDate?: Date, endDate?: Date): Promise<GitlabIssue[]> => {
  try {
    // In a real app, we would use the GitLab API with date filters
    // For now, we'll filter the mock data based on the provided date range
    if (startDate && endDate) {
      // Format dates to ISO string for consistent comparison
      const start = startDate.toISOString();
      const end = endDate.toISOString();
      
      return mockIssues.filter(issue => {
        // Check if the issue was created within the date range
        const createdAt = new Date(issue.created_at).toISOString();
        
        // For open issues: check if created within range
        if (issue.state === 'opened') {
          return createdAt >= start && createdAt <= end;
        }
        
        // For closed issues: check if created OR closed within range
        if (issue.closed_at) {
          const closedAt = new Date(issue.closed_at).toISOString();
          
          // Issue was created within range
          const createdInRange = createdAt >= start && createdAt <= end;
          
          // Issue was closed within range
          const closedInRange = closedAt >= start && closedAt <= end;
          
          // Issue spans the range (created before start and closed after end)
          const spansRange = createdAt <= start && closedAt >= end;
          
          return createdInRange || closedInRange || spansRange;
        }
        
        return false;
      });
    }
    
    // If no date range is provided, return all issues
    return mockIssues;
  } catch (error) {
    console.error('Error fetching issues:', error);
    return [];
  }
};

// Mock data for development - expanded with more date variations for testing
export const mockIssues: GitlabIssue[] = [
  {
    id: 1,
    iid: 101,
    title: 'Issue 1: Bug no formulário de login',
    description: 'Usuários não conseguem fazer login quando usam caracteres especiais',
    project: { id: 1, name: 'Projeto A' },
    state: 'opened',
    severity: 'high',
    created_at: '2023-10-01T12:00:00Z',
    updated_at: '2023-10-02T14:30:00Z',
    closed_at: null,
    author: { id: 1, name: 'João Silva' },
    web_url: 'https://gitlab.com/projeto-a/issues/1',
    labels: ['bug', 'frontend'],
    milestone: { id: 1, title: 'Sprint 1' },
    assignees: [{ id: 2, name: 'Ana Costa', username: 'anacosta', avatar_url: '' }]
  },
  {
    id: 2,
    iid: 102,
    title: 'Issue 2: Melhoria na performance da API',
    description: 'Otimizar consultas ao banco de dados para reduzir tempo de resposta',
    project: { id: 2, name: 'Projeto B' },
    state: 'closed',
    severity: 'medium',
    created_at: '2023-09-25T09:30:00Z',
    updated_at: '2023-10-04T11:20:00Z',
    closed_at: '2023-10-05T15:45:00Z',
    author: { id: 3, name: 'Maria Souza' },
    web_url: 'https://gitlab.com/projeto-b/issues/2',
    labels: ['enhancement', 'backend'],
    milestone: { id: 2, title: 'Sprint 2' },
    assignees: [{ id: 4, name: 'Pedro Santos', username: 'pedrosantos', avatar_url: '' }]
  },
  {
    id: 3,
    iid: 103,
    title: 'Issue 3: Erro na página de perfil',
    description: 'Imagem de perfil não carrega corretamente em dispositivos móveis',
    project: { id: 3, name: 'Projeto C' },
    state: 'opened',
    severity: 'critical',
    created_at: '2023-10-10T08:15:00Z',
    updated_at: '2023-10-10T16:45:00Z',
    closed_at: null,
    author: { id: 5, name: 'Carlos Oliveira' },
    web_url: 'https://gitlab.com/projeto-c/issues/3',
    labels: ['bug', 'mobile'],
    milestone: { id: 3, title: 'Sprint 3' },
    assignees: [{ id: 6, name: 'Lucia Ferreira', username: 'luciaferreira', avatar_url: '' }]
  },
  {
    id: 4,
    iid: 104,
    title: 'Issue 4: Implementar autenticação de dois fatores',
    description: 'Adicionar suporte para autenticação 2FA via aplicativo ou SMS',
    project: { id: 1, name: 'Projeto A' },
    state: 'opened',
    severity: 'high',
    created_at: '2023-10-15T10:00:00Z',
    updated_at: '2023-10-16T09:30:00Z',
    closed_at: null,
    author: { id: 7, name: 'Roberto Almeida' },
    web_url: 'https://gitlab.com/projeto-a/issues/4',
    labels: ['security', 'enhancement'],
    milestone: { id: 4, title: 'Sprint 4' },
    assignees: [{ id: 8, name: 'Fernanda Lima', username: 'fernandalima', avatar_url: '' }]
  },
  {
    id: 5,
    iid: 105,
    title: 'Issue 5: Atualizar documentação da API',
    description: 'Documentação desatualizada após as últimas mudanças na API',
    project: { id: 2, name: 'Projeto B' },
    state: 'closed',
    severity: 'low',
    created_at: '2023-09-20T14:45:00Z',
    updated_at: '2023-09-28T16:20:00Z',
    closed_at: '2023-09-30T11:10:00Z',
    author: { id: 9, name: 'Gabriel Costa' },
    web_url: 'https://gitlab.com/projeto-b/issues/5',
    labels: ['documentation'],
    milestone: { id: 2, title: 'Sprint 2' },
    assignees: [{ id: 10, name: 'Juliana Martins', username: 'julianamartins', avatar_url: '' }]
  },
  // Additional issues with different date ranges for better testing
  {
    id: 6,
    iid: 106,
    title: 'Issue 6: Problema com upload de arquivos',
    description: 'Arquivos grandes não são enviados corretamente',
    project: { id: 1, name: 'Projeto A' },
    state: 'closed',
    severity: 'high',
    created_at: '2023-08-15T09:20:00Z',
    updated_at: '2023-08-20T14:30:00Z',
    closed_at: '2023-09-05T11:45:00Z',
    author: { id: 3, name: 'Maria Souza' },
    web_url: 'https://gitlab.com/projeto-a/issues/6',
    labels: ['bug', 'backend'],
    milestone: { id: 1, title: 'Sprint 1' },
    assignees: [{ id: 4, name: 'Pedro Santos', username: 'pedrosantos', avatar_url: '' }]
  },
  {
    id: 7,
    iid: 107,
    title: 'Issue 7: Implementar tema escuro',
    description: 'Adicionar suporte para tema escuro em toda a aplicação',
    project: { id: 3, name: 'Projeto C' },
    state: 'closed',
    severity: 'medium',
    created_at: '2023-11-05T10:30:00Z',
    updated_at: '2023-11-15T16:20:00Z',
    closed_at: '2023-11-20T09:15:00Z',
    author: { id: 7, name: 'Roberto Almeida' },
    web_url: 'https://gitlab.com/projeto-c/issues/7',
    labels: ['enhancement', 'frontend'],
    milestone: { id: 5, title: 'Sprint 5' },
    assignees: [{ id: 6, name: 'Lucia Ferreira', username: 'luciaferreira', avatar_url: '' }]
  },
  {
    id: 8,
    iid: 108,
    title: 'Issue 8: Otimizar carregamento de imagens',
    description: 'Implementar lazy loading para melhorar performance',
    project: { id: 2, name: 'Projeto B' },
    state: 'opened',
    severity: 'low',
    created_at: '2023-11-25T08:45:00Z',
    updated_at: '2023-11-26T14:10:00Z',
    closed_at: null,
    author: { id: 9, name: 'Gabriel Costa' },
    web_url: 'https://gitlab.com/projeto-b/issues/8',
    labels: ['enhancement', 'performance'],
    milestone: { id: 5, title: 'Sprint 5' },
    assignees: [{ id: 10, name: 'Juliana Martins', username: 'julianamartins', avatar_url: '' }]
  }
];