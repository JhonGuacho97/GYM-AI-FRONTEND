import type { SessionExerciseInput, UserProfile } from "../types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function post(path: string, body: object) {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok)
    throw new Error((await res.json().catch(() => ({}))).error || "Request failed");
  return res.json();
}

async function patch(path: string, body: object) {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok)
    throw new Error((await res.json().catch(() => ({}))).error || "Request failed");
  return res.json();
}

async function get(path: string) {
  const res = await fetch(`${BASE_URL}/api${path}`);
  if (!res.ok)
    throw new Error((await res.json().catch(() => ({}))).error || "Request failed");
  return res.json();
}

async function del(path: string) {
  const res = await fetch(`${BASE_URL}/api${path}`, { method: "DELETE" });
  if (!res.ok)
    throw new Error((await res.json().catch(() => ({}))).error || "Request failed");
  return res.json();
}

export const api = {
  // ── Perfil ──────────────────────────────────────────────────────────────────
  saveProfile: (userId: string, profile: Omit<UserProfile, "userId" | "updatedAt">) =>
    post("/profile", { userId, ...profile }),

  getProfile: (userId: string) => get(`/profile?userId=${userId}`),

  updateBodyData: (userId: string, data: {
    age: number; gender: string; heightCm: number; weightKg: number;
  }) => patch("/profile/body", { userId, ...data }),

  // ── Plan ────────────────────────────────────────────────────────────────────
  generatePlan: (userId: string) => post("/plan/generate", { userId }),
  getCurrentPlan: (userId: string) => get(`/plan/current?userId=${userId}`),

  // ── Sesiones ────────────────────────────────────────────────────────────────
  saveSession: (
    userId: string, planId: string, dayName: string,
    exercises: SessionExerciseInput[], notes?: string,
  ) => post("/sessions", { userId, planId, dayName, exercises, notes }),

  getSessions: (userId: string) => get(`/sessions?userId=${userId}`),

  getExerciseProgress: (userId: string, exercise: string) =>
    get(`/sessions/progress?userId=${userId}&exercise=${encodeURIComponent(exercise)}`),

  // ── Nutrición ───────────────────────────────────────────────────────────────
  calculateNutrition: (userId: string) => post("/nutrition/calculate", { userId }),
  getNutrition: (userId: string) => get(`/nutrition?userId=${userId}`),
  generateMealPlan: (userId: string, days: number) =>
    post("/nutrition/meal-plan", { userId, days }),

  // ── Food tracker ────────────────────────────────────────────────────────────
  estimateFood: (description: string) => post("/food/estimate", { description }),

  saveFood: (userId: string, food: {
    name: string; calories: number; protein_g: number;
    carbs_g: number; fat_g: number; meal_type: string;
  }) => post("/food", { userId, ...food }),

  getTodayFoods: (userId: string) => get(`/food/today?userId=${userId}`),
  deleteFood: (id: string) => del(`/food/${id}`),

  // ── Mediciones corporales ───────────────────────────────────────────────────
  saveMeasurement: (userId: string, data: {
    weightKg: number; bodyFatPct?: number; waistCm?: number; notes?: string;
  }) => post("/measurements", { userId, ...data }),

  getMeasurements: (userId: string) => get(`/measurements?userId=${userId}`),
  deleteMeasurement: (id: string) => del(`/measurements/${id}`),
  analyzeMeasurements: (userId: string) => post("/measurements/analyze", { userId }),
};
