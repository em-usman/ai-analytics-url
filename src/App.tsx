import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignIn from "./pages/auth/SignIn";
import Dashboard from "./pages/dashboard/Dashboard";
import Customers from "./pages/dashboard/Customers";
import PromptLibrary from "./pages/dashboard/PromptLibrary";
import PrivateRoute from "./Routes/PrivateRoute";
import PublicRoute from "./Routes/PublicRoute";
import Template from "./components/DashboardUI/Template/template";
import Setting from "./components/DashboardUI/Setting/setting";
import { useEffect } from "react";
import { useGlobalData } from "./store/useGlobalData";
import SignUp from "./pages/auth/SignUp";

// ✅ NEW: Wrapper component to initialize global data
const AppContent = () => {
  const initAuthListener = useGlobalData((state) => state.initAuthListener);

  useEffect(() => {
    initAuthListener();
    // Cleanup on unmount
    return () => {
      useGlobalData.getState().reset();
    };
  }, [initAuthListener]);

  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />}>
          <Route path="customer" element={<Customers />} />
          <Route path="prompt_library" element={<PromptLibrary />} />
          <Route path="templates" element={<Template />} />
          <Route path="settings" element={<Setting />} />
        </Route>
      </Route>
    </Routes>
  );
};

// ✅ Main App component
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
