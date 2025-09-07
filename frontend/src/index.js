import React from "react";
import ReactDOM from "react-dom/client";
import AppRoutes from "./App"; // Ensure correct path
import { AuthProvider } from "./context/AuthContext"; // Import AuthProvider

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <AuthProvider>
      {" "}
      {/* ✅ Wrap entire app */}
      <AppRoutes />
    </AuthProvider>
  </React.StrictMode>
);
