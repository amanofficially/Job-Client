import api from "./api";

export const analyzeJob = (jobDescription) => api.post("/ai/analyze-job", { jobDescription });

export const generateEmail = (jobAnalysis, tone) => api.post("/ai/generate-email", { jobAnalysis, tone });

export const improveEmail = (subject, body, instruction) =>
  api.post("/ai/improve-email", { subject, body, instruction });

export const generateFollowUpEmail = (applicationId) =>
  api.post("/ai/follow-up-email", { applicationId });
