import "./index.css";

import { LayoutDashboard, ArrowLeftRight, Summary, Settings, SkipBack } from "lucide-react"

export default function LeftNav({ menuOpen, setMenuOpen, setActivePage }) {

    return (
        <>
            {menuOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() => setMenuOpen(false)}
                />
            )}

            <nav
                className={`nav-wrapper ${
                    menuOpen ? "open" : ""
                }`}
            >

                <div className="nav-top">

                    <div className="brand-logo">
                        <img src="/business/Logo.png" alt="Contrive" />
                    </div>

                    <div className="profile">

                        <div className="avatar">
                            PS
                        </div>

                        <div className="username">
                            PEDRO SILVA
                        </div>

                    </div>

                </div>

                <div className="nav-menu">

                    <button
                        className="nav-item"
                        onClick={() => setActivePage && setActivePage("dashboard")}
                    >
                        <LayoutDashboard className="nav-icon" /> Dashboard
                    </button>

                    <button
                        className="nav-item"
                        onClick={() => setActivePage && setActivePage("transactions")}
                    >
                       <ArrowLeftRight className='nav-icon' /> Transações
                    </button>

                    <button
                        className="nav-item"
                        onClick={() => setActivePage && setActivePage("reports")}
                    >
                       <Summary className='nav-icon' /> Relatórios
                    </button>

                    <button 
                        className="nav-item"
                        onClick={() => setActivePage && setActivePage("settings")}
                    >
                        <Settings className='nav-icon' /> Configurações
                    </button>

                </div>

                <div className="nav-footer">

                    <hr />

                    <button className="nav-item sign-off">
                        <SkipBack className='nav-icon' /> Sair
                    </button>

                </div>

            </nav>
        </>
    );
}