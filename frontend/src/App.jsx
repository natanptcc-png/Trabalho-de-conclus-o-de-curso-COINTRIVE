import { useState, useEffect } from "react";

import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import PageTransition from "./components/common/PageTransition";
import LeftNav from "./components/LeftNav";

import "./App.css";

function App() {

    const [menuOpen, setMenuOpen] = useState(false);
    const [activePage, setActivePage] = useState("dashboard");

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
                    setActivePage={setActivePage}
                />

            <main className="dashboard-area">

                <header className="mobile-header">

                    <button
                        className="mobile-avatar"
                        onClick={() => setMenuOpen(true)}
                    >
                        PS
                    </button>

                    <span>Painel</span>

                </header>

                <PageTransition show={activePage === "dashboard"}>
                    <Dashboard />
                </PageTransition>

                <PageTransition show={activePage === "transactions"}>
                    <Transactions />
                </PageTransition>

            </main>

        </div>

    );
}

export default App;