import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import LoginPage from "./components/Login";
import Dashboard from "./components/Dashboard";
import Reports from "./components/Reports";
import ViewCustomer from "./components/ViewCustomer";
import AllCustomer from "./components/AllCustomer";
import AddCustomer from "./components/AddCustomer";

const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<LoginPage />} />

        {/* Private Routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/viewcustomer/:cId"
          element={
            <PrivateRoute>
              <ViewCustomer />
            </PrivateRoute>
          }
        />

        <Route
          path="/all-customers"
          element={
            <PrivateRoute>
              <AllCustomer />
            </PrivateRoute>
          }
        />

        <Route
          path="/addcustomer"
          element={
            <PrivateRoute>
              <AddCustomer />
            </PrivateRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <Reports />
            </PrivateRoute>
          }
        />

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
