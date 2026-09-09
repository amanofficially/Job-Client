import api from "./api";

export const createApplication = (data) => api.post("/applications", data);
export const getApplications = (params) => api.get("/applications", { params });
export const getApplicationById = (id) => api.get(`/applications/${id}`);
export const updateApplication = (id, data) => api.put(`/applications/${id}`, data);
export const deleteApplication = (id) => api.delete(`/applications/${id}`);
export const updateStatus = (id, status, note) => api.patch(`/applications/${id}/status`, { status, note });
export const addTimelineEvent = (id, data) => api.post(`/applications/${id}/timeline`, data);
