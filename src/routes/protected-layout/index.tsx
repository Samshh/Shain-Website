
import { auth } from "@/firebase";
import { getUserRole } from "@/services/user";
import { onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AuthLoading } from "@/components/auth-loading";
import { RoleLoading } from "@/components/role-loading";

type LoadingState = "checking-auth" | "loading-role" | "complete";

export default function ProtectedLayout() {
  const [role, setRole] = useState<string | null>(null);
  const [loadingState, setLoadingState] =
    useState<LoadingState>("checking-auth");
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          setLoadingState("loading-role");
          const userRole = await getUserRole();
          setRole(userRole);
        } else {
          setRole(null);
        }
        setLoadingState("complete");
      } catch (err) {
        console.error("Error getting user role:", err);
        setError("Failed to load user permissions");
        setRole(null);
        setLoadingState("complete");
      }
    });

    return () => unsubscribe();
  }, []);

  // Show different loading states
  if (loadingState === "checking-auth") {
    return <AuthLoading />;
  }

  if (loadingState === "loading-role") {
    return <RoleLoading />;
  }

  // Handle authentication errors
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-800">
            Authentication Error
          </h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!role) {
    return <Navigate to="/" state={{ from: location }} replace />;
  }

  // Role-based route protection
  const path = location.pathname;

  if (path.startsWith("/admin") && role !== "admin") {
    return <Navigate to="/" replace />;
  }

  if (path.startsWith("/branch-manager") && role !== "branch_manager") {
    return <Navigate to="/" replace />;
  }

  // Render protected content with fade-in animation
  return (
    <div className="animate-in fade-in duration-300">
      <Outlet />
    </div>
  );
}
