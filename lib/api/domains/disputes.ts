import { api } from "../client";

export interface Dispute {
  id: string;
  reason: string;
  description?: string;
  status: "open" | "under_review" | "resolved" | "closed";
  resolution?: string;
  projectId: string;
  raisedById: string;
  createdAt: string;
  updatedAt: string;
  projects?: { id: string; title: string; client: string; status: string };
  users?: { id: string; name: string; email: string };
}

export const disputesAPI = {
  create: (data: { reason: string; description?: string; projectId: string }) =>
    api.post<Dispute>("/disputes", data),

  getAll: () => api.get<Dispute[]>("/disputes"),

  getOne: (id: string) => api.get<Dispute>(`/disputes/${id}`),

  resolve: (id: string, data: { resolution: string; status: "resolved" | "closed" }) =>
    api.patch<Dispute>(`/disputes/${id}/resolve`, data),
};
