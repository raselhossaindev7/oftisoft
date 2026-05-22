import { api } from "@/lib/api";

export interface Milestone {
    id: string;
    title: string;
    description?: string;
    status: 'pending' | 'in_progress' | 'review' | 'completed';
    dueDate?: string;
    deliverables?: any;
    sortOrder: number;
    projectId: string;
    createdAt: string;
    updatedAt: string;
}

export interface Project {
    id: string;
    title: string;
    description?: string;
    client: string;
    status: string;
    progress: number;
    dueDate?: string;
    members: number;
    budget?: number;
    paymentStatus: string;
    userId?: string;
    notes?: string;
    tags?: string[];
    orderId?: string;
    deliveryFiles?: string[];
    requirements?: any;
    revisionCount?: number;
    maxRevisions?: number;
    completedAt?: string;
    cancelledAt?: string;
    cancelReason?: string;
    milestones?: Milestone[];
    orders?: any;
    createdAt: string;
    updatedAt: string;
}

export const projectsAPI = {
    getProjects: async (status?: string): Promise<Project[]> => {
        const params: any = {};
        if (status) params.status = status;
        const response = await api.get('/projects', { params });
        return response.data;
    },
    getProject: async (id: string): Promise<Project> => {
        const response = await api.get(`/projects/${id}`);
        return response.data;
    },
    createProject: async (data: Partial<Project>): Promise<Project> => {
        const response = await api.post('/projects', data);
        return response.data;
    },
    updateProject: async (id: string, data: Partial<Project>): Promise<Project> => {
        const response = await api.patch(`/projects/${id}`, data);
        return response.data;
    },
    deleteProject: async (id: string): Promise<void> => {
        await api.delete(`/projects/${id}`);
    },
    getStats: async (): Promise<any> => {
        const response = await api.get('/projects/stats');
        return response.data;
    },
    updatePaymentStatus: async (id: string, paymentStatus: string): Promise<Project> => {
        const response = await api.patch(`/projects/${id}/payment-status`, { paymentStatus });
        return response.data;
    },
    deliverProject: async (id: string, files: string[], message?: string): Promise<Project> => {
        const response = await api.post(`/projects/${id}/deliver`, { files, message });
        return response.data;
    },
    acceptDelivery: async (id: string): Promise<Project> => {
        const response = await api.post(`/projects/${id}/accept-delivery`);
        return response.data;
    },
    requestRevision: async (id: string, reason: string): Promise<Project> => {
        const response = await api.post(`/projects/${id}/request-revision`, { reason });
        return response.data;
    },
    getServiceOrders: async (): Promise<any[]> => {
        const response = await api.get('/projects/service-orders');
        return response.data;
    },
    acceptOrderAsProject: async (orderId: string): Promise<Project> => {
        const response = await api.post(`/projects/service-orders/${orderId}/accept`);
        return response.data;
    },
    cancelProject: async (id: string, reason: string): Promise<Project> => {
        const response = await api.post(`/projects/${id}/cancel`, { reason });
        return response.data;
    },
    setRequirements: async (id: string, requirements: any): Promise<Project> => {
        const response = await api.patch(`/projects/${id}/requirements`, { requirements });
        return response.data;
    },
};

export const uploadFile = async (file: File): Promise<{ url: string; key: string }> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Quotes API
export interface QuoteProposal {
    price: number;
    estimatedDays: number;
    validUntil: string;
    content: string;
    milestones: Array<{
        id: string;
        title: string;
        week: number;
        status: string;
    }>;
}

export interface Quote {
    id: string;
    serviceType: string;
    description: string;
    budget: string;
    status: string;
    proposal?: QuoteProposal;
    createdAt: string;
    updatedAt: string;
}

export const quotesAPI = {
    getQuotes: async (): Promise<Quote[]> => {
        const response = await api.get('/quotes');
        return response.data;
    },
    getQuote: async (id: string): Promise<Quote> => {
        const response = await api.get(`/quotes/${id}`);
        return response.data;
    },
    createQuote: async (data: Partial<Quote>): Promise<Quote> => {
        const response = await api.post('/quotes', data);
        return response.data;
    },
    updateQuote: async (id: string, data: Partial<Quote>): Promise<Quote> => {
        const response = await api.patch(`/quotes/${id}`, data);
        return response.data;
    },
    updateStatus: async (id: string, status: string): Promise<Quote> => {
        const response = await api.patch(`/quotes/${id}/status`, { status });
        return response.data;
    },
    deleteQuote: async (id: string): Promise<void> => {
        await api.delete(`/quotes/${id}`);
    },
    downloadProposal: async (id: string): Promise<void> => {
        const response = await api.get(`/quotes/${id}/download`, {
            responseType: 'blob',
        });
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `proposal_${id}.pdf`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(url);
    }
};

