import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from "react";
import axios from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const idleTimer = useRef(null);
  const TIMEOUT = 10 * 60 * 1000; // 10 minutes

  // ✅ Logout handler
  const handleLogout = useCallback(
    (expired = false) => {
      localStorage.removeItem("token");
      setUser(null);
      setToken("");
      stopIdleTimer(); // cleanup timers
      if (expired) {
        alert("Session expired due to inactivity. Please log in again.");
      }
    },
    [] // no deps: stopIdleTimer defined later will use resetIdleTimer safely
  );

  // ✅ Reset idle timer
  const resetIdleTimer = useCallback(() => {
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      handleLogout(true);
    }, TIMEOUT);
  }, [TIMEOUT, handleLogout]);

  // ✅ Start idle timer
  const startIdleTimer = useCallback(() => {
    resetIdleTimer();
    window.addEventListener("mousemove", resetIdleTimer);
    window.addEventListener("keydown", resetIdleTimer);
    window.addEventListener("click", resetIdleTimer);
  }, [resetIdleTimer]);

  // ✅ Stop idle timer
  const stopIdleTimer = useCallback(() => {
    clearTimeout(idleTimer.current);
    window.removeEventListener("mousemove", resetIdleTimer);
    window.removeEventListener("keydown", resetIdleTimer);
    window.removeEventListener("click", resetIdleTimer);
  }, [resetIdleTimer]);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["token"] = token;
      startIdleTimer();
    }
    return () => stopIdleTimer();
  }, [token, startIdleTimer, stopIdleTimer]);

  const login = (token, userData) => {
    localStorage.setItem("token", token);
    setUser(userData);
    setToken(token);
    resetIdleTimer();
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout: handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
