import axios from "axios";

const API = axios.create({ baseURL: "http://localhost:5000/api" });

API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (user?.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth
export const register = (data) => API.post("/auth/register", data);
export const login = (data) => API.post("/auth/login", data);

// Resume
export const uploadResume = (formData) =>
  API.post("/resume/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
export const getHistory = () => API.get("/resume/history");
export const getResumeById = (id) => API.get(`/resume/${id}`);

// Analyze (basic keyword matching)
export const analyzeResume = (data) => API.post("/analyze", data);

// AI Rewrite (LLM-powered optimization)
export const aiRewriteResume = (data) => API.post("/ai-rewrite", data);

// Stripe
export const createCheckout = () => API.post("/stripe/create-checkout");
export const checkSubscription = () => API.get("/stripe/check-subscription");
export const openCustomerPortal = () => API.post("/stripe/customer-portal");

// PDF
export const generatePDF = (data) =>
  API.post("/pdf/generate", data, { responseType: "blob" });
