export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface UserProfile {
  userId: string;
  goal: "cut" | "bulk" | "recomp" | "strength" | "endurance";
  experience: "beginner" | "intermediate" | "advanced";
  daysPerWeek: number;
  sessionLength: number;
  equipment: "full_gym" | "home" | "dumbbells";
  injuries?: string;
  preferredSplit: "full_body" | "upper_lower" | "ppl" | "custom";
  age?: number;
  gender?: "male" | "female";
  heightCm?: number;
  weightKg?: number;
  updatedAt: string;
}

export interface PlanOverview {
  goal: string;
  frequency: string;
  split: string;
  notes: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: string;
  rest: string;
  rpe: number;
  notes?: string;
  alternatives?: string[];
}

export interface DaySchedule {
  day: string;
  focus: string;
  exercises: Exercise[];
}

export interface TrainingPlan {
  id: string;
  userId: string;
  overview: PlanOverview;
  weeklySchedule: DaySchedule[];
  progression: string;
  version: number;
  createdAt: string;
}

export interface SessionExerciseInput {
  exerciseName: string;
  setsCompleted: number;
  repsCompleted: string;
  weightKg?: number;
  rpeActual?: number;
}

export interface WorkoutSession {
  id: string;
  planId: string;
  dayName: string;
  notes?: string;
  completedAt: string;
  exercises: SessionExerciseInput[];
}

export interface ProgressPoint {
  date: string;
  weightKg: number | null;
  sets: number;
  reps: string;
  rpeActual: number | null;
}

export interface NutritionGoals {
  caloriesTarget: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
  calculatedAt: string;
}
