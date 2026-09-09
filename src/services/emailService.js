import api from "./api";

export const sendApplicationEmail = (data) => api.post("/email/send-application", data);
export const sendFollowUpEmail = (data) => api.post("/email/send-follow-up", data);
