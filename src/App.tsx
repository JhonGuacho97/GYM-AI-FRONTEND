import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./pages/Home";
import Onboarding from "./pages/Onboarding";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import Account from "./pages/Account";
import LogSession from "./pages/LogSession";
import Progress from "./pages/Progress";
import Nutrition from "./pages/Nutrition";
import FoodTracker from "./pages/FoodTracker";
import BodyTracking from "./pages/BodyTracking";
import EditProfile from "./pages/EditProfile";
import Navbar from "./components/layout/Navbar";
import { NeonAuthUIProvider } from "@neondatabase/neon-js/auth/react";
import { authClient } from "./lib/auth";
import AuthProvider from "./context/AuthContext";

function App() {
  return (
    <NeonAuthUIProvider authClient={authClient} defaultTheme="dark">
      <AuthProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route index element={<Home />} />
                <Route path="/onboarding"    element={<Onboarding />} />
                <Route path="/profile"       element={<Profile />} />
                <Route path="/edit-profile"  element={<EditProfile />} />
                <Route path="/log"           element={<LogSession />} />
                <Route path="/progress"      element={<Progress />} />
                <Route path="/nutrition"     element={<Nutrition />} />
                <Route path="/food"          element={<FoodTracker />} />
                <Route path="/body"          element={<BodyTracking />} />
                <Route path="/auth/:pathname"    element={<Auth />} />
                <Route path="/account/:pathname" element={<Account />} />
              </Routes>
            </main>
          </div>
        </BrowserRouter>
      </AuthProvider>
    </NeonAuthUIProvider>
  );
}

export default App;
