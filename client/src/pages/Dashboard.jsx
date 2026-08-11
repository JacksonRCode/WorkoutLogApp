import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { apiService } from "../api/apiService.js";
import { useAuth } from "../context/AuthContext";
// import AddProgramForm from '../components/AddProgramForm';
import ProgramCard from "../components/ProgramCard";

function Dashboard() {
  const { token, user } = useAuth();
  const [loadingP, setLoadingP] = useState(true);
  const [programs, setPrograms] = useState([]);
  // const [showAddForm, setShowAddForm] = useState(false);

  const handleDeleteProgram = async (programId) => {
    try {
      await apiService.removeProgram(programId);
      setPrograms(programs.filter((p) => p.program_id !== programId));
    } catch (err) {
      console.error("Deletion failed:", err.message);
      alert("Could not delete program");
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        const response = await apiService.getPrograms();
        setPrograms([...response.data].reverse());
        setLoadingP(false);
      } catch (err) {
        if (token) {
          alert("Failed to load programs");
          console.error(`Error: ${err.message}`);
        }
        setLoadingP(false);
      }
    };
    fetchData();
  }, [token]);

  if (loadingP) {
    return <p>Loading your programs...</p>;
  }

  return (
    <div>
      <div style={{ padding: "20px" }}>
        <div style={{ marginBottom: "20px" }}>
          <Link
            to="/"
            style={{
              display: "inline-block",
              padding: "8px 16px",
              backgroundColor: "#6c757d",
              color: "white",
              textDecoration: "none",
              borderRadius: "4px",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            Go Home
          </Link>
        </div>
      </div>
      <div style={{ padding: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-start",
            gap: "20px",
            alignItems: "center",
          }}
        >
          <h2>{user ? `${user.f_name}'s` : "Your"} workout programs</h2>
          <Link to="/programs/create">Create new program</Link>
        </div>
        <div className="program-list">
          {programs.length > 0 ? (
            programs.map((program) => (
              <ProgramCard
                key={program.program_id}
                program={program}
                deleteProgram={handleDeleteProgram}
              />
            ))
          ) : (
            <p>No programs found. Time to create one!</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
