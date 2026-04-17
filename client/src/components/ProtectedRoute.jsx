import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children }) {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <main className="boot-shell">
        <section className="boot-panel">
          <div className="boot-mark">Session Check</div>
          <h1>Authenticating terminal access.</h1>
          <p>Loading the operator session and synchronizing access controls.</p>
        </section>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;
