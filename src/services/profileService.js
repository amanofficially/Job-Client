import api from "./api";

export const getProfile = () => api.get("/profile");
export const updateProfile = (data) => api.put("/profile", data);
export const updateSettings = (data) => api.put("/profile/settings", data);

export const uploadResume = (file) => {
  const formData = new FormData();
  formData.append("resume", file);
  return api.post("/profile/resume", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
