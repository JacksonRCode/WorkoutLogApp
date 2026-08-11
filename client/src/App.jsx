// App.jsx
import { Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

function App() {
  // Global state for controlling login context
  const { token, logout, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div
        className="App"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "10px 20px",
        }}
      >
        {/* Logout handler   */}
        <h1 style={{ margin: "0px" }}>Workout Logger</h1>
        {token ? (
          <button onClick={logout}>Logout</button>
        ) : (
          <p>Please sign in</p>
        )}
      </div>
      <div style={{ padding: "20px" }}>
        <Outlet />
      </div>
    </div>
  );
}

export default App;
