import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { TrainingPlan, User, UserProfile } from "../types";
import { authClient } from "../lib/auth";
import { api } from "../lib/api";

interface AuthContextType {
  user: User | null;
  plan: TrainingPlan | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  saveProfile: (profile: Omit<UserProfile, "userId" | "updatedAt">) => Promise<void>;
  generatePlan: () => Promise<void>;
  refreshData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [neonUser, setNeonUser]       = useState<any>(null);
  const [plan, setPlan]               = useState<TrainingPlan | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const isRefreshingRef               = useRef(false);
  const didInitRef                    = useRef(false);

  const refreshData = useCallback(async (userId: string) => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    try {
      const [planData, profileData] = await Promise.allSettled([
        api.getCurrentPlan(userId),
        api.getProfile(userId),
      ]);

      if (planData.status === "fulfilled" && planData.value) {
        setPlan({
          id:             planData.value.id,
          userId:         planData.value.userId,
          overview:       planData.value.planJson.overview,
          weeklySchedule: planData.value.planJson.weeklySchedule,
          progression:    planData.value.planJson.progression,
          version:        planData.value.version,
          createdAt:      planData.value.createdAt,
        });
      } else {
        setPlan(null);
      }

      if (profileData.status === "fulfilled" && profileData.value) {
        const p = profileData.value;
        setUserProfile({
          userId:         p.user_id,
          goal:           p.goal,
          experience:     p.experience,
          daysPerWeek:    p.days_per_week,
          sessionLength:  p.session_length,
          equipment:      p.equipment,
          injuries:       p.injuries,
          preferredSplit: p.preferred_split,
          age:            p.age,
          gender:         p.gender,
          heightCm:       p.height_cm,
          weightKg:       p.weight_kg,
          updatedAt:      p.updated_at,
        });
      } else {
        setUserProfile(null);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
      setPlan(null);
      setUserProfile(null);
    } finally {
      isRefreshingRef.current = false;
    }
  }, []);

  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;

    async function init() {
      try {
        const result = await authClient.getSession();
        const user   = result?.data?.user ?? null;
        setNeonUser(user);
        if (user?.id) {
          await refreshData(user.id);
        }
      } catch {
        setNeonUser(null);
        setPlan(null);
        setUserProfile(null);
      } finally {
        setIsLoading(false);
      }
    }

    init();
  }, [refreshData]);

  async function saveProfile(profileData: Omit<UserProfile, "userId" | "updatedAt">) {
    if (!neonUser) throw new Error("User must be authenticated to save profile");
    await api.saveProfile(neonUser.id, profileData);
    await refreshData(neonUser.id);
  }

  async function generatePlan() {
    if (!neonUser) throw new Error("User must be authenticated to generate plan");
    await api.generatePlan(neonUser.id);
    await refreshData(neonUser.id);
  }

  const refreshDataPublic = useCallback(async () => {
    if (neonUser?.id) await refreshData(neonUser.id);
  }, [neonUser?.id, refreshData]);

  return (
    <AuthContext.Provider
      value={{
        user: neonUser,
        plan,
        userProfile,
        isLoading,
        saveProfile,
        generatePlan,
        refreshData: refreshDataPublic,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
