import { useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="app-shell">
      <Navbar activeTab={activeTab} onSelectTab={setActiveTab} />
      <main className="main">
        <Dashboard activeTab={activeTab} />
      </main>
    </div>
  );
}
