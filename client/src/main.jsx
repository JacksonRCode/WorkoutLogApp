// main.jsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthProvider";
import { ProtectedRoute } from "./components/ProtectedRoute";
import App from "./App.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import HomePage from "./pages/HomePage.jsx";
import CreateProgramPage from "./pages/CreateProgramPage.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            {/* Guarded from public access */}
            <Route element={<ProtectedRoute />}>
              <Route index element={<HomePage />} />
              <Route path="programs" element={<Dashboard />} />
              <Route path="programs/create" element={<CreateProgramPage />} />
            </Route>
            {/* Publicly accessible */}
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignUpPage />} />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>,
);
