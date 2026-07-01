import { useState, useEffect } from "react";

import Dashboard from "./pages/Dashboard";
import LeftNav from "./components/Dashboard/LeftNav";

import "./App.css";

function App() {

    const [menuOpen, setMenuOpen] = useState(false);

    useEffect(() => {

        document.body.style.overflow =
            menuOpen ? "hidden" : "auto";

        return () => {
            document.body.style.overflow = "auto";
        };

    }, [menuOpen]);

    return (

        <div className="screens">

            <LeftNav
                menuOpen={menuOpen}
                setMenuOpen={setMenuOpen}
            />

            <main className="dashboard-area">

                <header className="mobile-header">

                    <button
                        className="mobile-avatar"
                        onClick={() => setMenuOpen(true)}
                    >
                        PS
                    </button>

                    <span>Dashboard</span>

                </header>

                <Dashboard />

            </main>

        </div>

    );
}

export default App;