import "./index.css";

import { LayoutDashboard, ArrowLeftRight, Summary, Settings, SkipBack } from "lucide-react"

export default function LeftNav({ menuOpen, setMenuOpen, onNavigate, onLogout, userProfile }) {

    const firstName = (userProfile?.firstName || "").trim();
    const firstNamePiece = firstName.split(/\s+/).filter(Boolean)[0] || firstName;

    const getFirstLastName = (lastName) => {
        if (!lastName) return "";
        const skip = ["do", "dos", "de"];
        const parts = lastName.split(/\s+/).filter(Boolean);
        const chosen = parts.find(p => !skip.includes(p.toLowerCase()));
        return (chosen || parts[0] || "").trim();
    };

    const lastFirst = getFirstLastName(userProfile?.lastName || "");
    const displayName = `${firstNamePiece} ${lastFirst}`.trim().toUpperCase();

    const initials = `${(firstNamePiece.charAt(0)||"").toUpperCase()}${(lastFirst.charAt(0)||"").toUpperCase()}`;

    const getAvatarColor = (name) => {
        if (!name) return "hsl(220 30% 80%)";
        const ch = name.charCodeAt(0);
        const index = (ch - 65 + 26) % 26;
        const hue = Math.round((index / 26) * 360);
        return `hsl(${hue} 30% 80%)`;
    };

    const avatarBg = getAvatarColor(firstNamePiece || "A");

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

                        <div className="avatar" style={{ background: avatarBg, color: '#1e293b', fontWeight: 700 }}>
                            {initials}
                        </div>

                        <div className="username">
                            {displayName}
                        </div>

                    </div>

                </div>

                <div className="nav-menu">

                    <button
                        className="nav-item"
                        onClick={() => onNavigate && onNavigate("dashboard")}
                    >
                        <LayoutDashboard className="nav-icon" /> Dashboard
                    </button>

                    <button
                        className="nav-item"
                        onClick={() => onNavigate && onNavigate("transactions")}
                    >
                       <ArrowLeftRight className='nav-icon' /> Transações
                    </button>

                    <button
                        className="nav-item"
                        onClick={() => onNavigate && onNavigate("reports")}
                    >
                       <Summary className='nav-icon' /> Relatórios
                    </button>

                    <button 
                        className="nav-item"
                        onClick={() => onNavigate && onNavigate("settings")}
                    >
                        <Settings className='nav-icon' /> Configurações
                    </button>

                </div>

                <div className="nav-footer">

                    <hr />

                    <button type="button" className="nav-item sign-off" onClick={() => onLogout && onLogout()}>
                        <SkipBack className='nav-icon' /> Sair
                    </button>

                </div>

            </nav>
        </>
    );
}