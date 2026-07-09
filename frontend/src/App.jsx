import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";
import { Bell } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

import Router from "./Router";
import Skeleton from "./components/common/Skeleton";
import LeftNav from "./components/LeftNav";

const mockData = {
    items: [
        { id: 1, date: "2026-01-02", description: "Salary", category: "Renda", type: "Renda", amount: "+ R$ 8.500,00", payment: "Salário", isPaid: null },
        { id: 2, date: "2026-01-03", description: "Supermarket", category: "Comida", type: "Gastos", amount: "- R$ 156,80", payment: "Débito", isPaid: null },
        { id: 3, date: "2026-01-03", description: "Uber", category: "Transporte", type: "Gastos", amount: "- R$ 45,90", payment: "Débito", isPaid: null },
    ],
    userProfile: {
        firstName: "Daniel",
        lastName: "Silva",
        email: "daniel@email.com",
        phone: "+55 11 99999-9999",
        bio: "Personal finance enthusiast",
        currency: "BRL",
    }
};

import "./App.css";

function App() {

    const [menuOpen, setMenuOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const location = useLocation();

    // Global transaction data
    const [items, setItems] = useState(mockData.items);

    // Global user profile
    const [userProfile, setUserProfile] = useState(mockData.userProfile);

    // Global notifications
    const [notifications, setNotifications] = useState(() => {
        const stored = localStorage.getItem("notifications");
        if (stored) return JSON.parse(stored);
        return [];
    });

    // Notification settings
    const [notificationSettings, setNotificationSettings] = useState(() => {
        const stored = localStorage.getItem("notificationSettings");
        if (stored) return JSON.parse(stored);
        return {
            excessExpenses: true,
            contasAlerts: true,
        };
    });

    const pageHeaders = {
        dashboard: "Dashboard",
        transactions: "Transações",
        reports: "Relatórios",
        settings: "Configurações",
    };

    // Persist notifications to localStorage
    useEffect(() => {
        localStorage.setItem("notifications", JSON.stringify(notifications));
    }, [notifications]);

    // Persist notification settings to localStorage
    useEffect(() => {
        localStorage.setItem("notificationSettings", JSON.stringify(notificationSettings));
    }, [notificationSettings]);

    // initial skeleton on first load
    useEffect(() => {
        const t = setTimeout(() => setLoading(false), 700);
        return () => clearTimeout(t);
    }, []);

    // navigation wrapper to show skeleton between pages
    const switchPage = (page) => {
        setLoading(true);
        setTimeout(() => {
            const route = page.startsWith("/") ? page : `/${page}`;
            navigate(route);
            setTimeout(() => setLoading(false), 250);
        }, 220);
    };

    const currentPageKey = location.pathname === "/" ? "dashboard" : location.pathname.replace(/^[\/]/, "");
    const pageHeader = pageHeaders[currentPageKey] || "Dashboard";

    // Theme (light | dark)
    const [theme, setTheme] = useState(() => {
        const stored = localStorage.getItem("theme");
        return stored || "light";
    });

    useEffect(() => {
        localStorage.setItem("theme", theme);
        if (theme === "dark") {
            document.body.classList.add("dark-theme");
        } else {
            document.body.classList.remove("dark-theme");
        }
    }, [theme]);

    const formatTransactionAmount = (tx) => {
        const rawAmount = String(tx.amount ?? "").trim();
        const cleanedAmount = rawAmount.replace(/[^\d.-]/g, "");
        const normalizedAmount = cleanedAmount.startsWith("+") || cleanedAmount.startsWith("-")
            ? cleanedAmount
            : cleanedAmount;

        if (!normalizedAmount) {
            return rawAmount;
        }

        return normalizedAmount.startsWith("+") || normalizedAmount.startsWith("-")
            ? `${normalizedAmount.startsWith("+") ? "+ R$" : "- R$"} ${normalizedAmount.replace(/^[-+]/, "").trim()}`
            : tx.type === "Renda"
                ? `+ R$ ${normalizedAmount}`
                : `- R$ ${normalizedAmount}`;
    };

    // Transaction management functions
    const addItem = (tx) => {
        const normalized = {
            ...tx,
            id: items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1,
            type: tx.type,
            category: tx.category,
            amount: formatTransactionAmount(tx),
            date: tx.date,
            isPaid: tx.category === "Contas" ? false : null,
        };
        setItems(prev => [normalized, ...prev]);
        return normalized;
    };

    const updateItem = (id, updates) => {
        setItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, ...updates, amount: formatTransactionAmount({...item, ...updates}) } : item
            )
        );
    };

    const deleteItem = (id) => {
        setItems(prev => prev.filter(item => item.id !== id));
    };

    // Notification functions
    const addNotification = (notification) => {
        const newNotif = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toISOString(),
            read: false,
            ...notification,
        };
        setNotifications(prev => [newNotif, ...prev]);
        return newNotif;
    };

    const deleteNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const markNotificationAsRead = (id) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const markAllNotificationsAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    // Check for notifications that should be triggered
    useEffect(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        // Check for excess expenses
        if (notificationSettings.excessExpenses) {
            let monthlyExpenses = 0;
            items.forEach(item => {
                const txDate = new Date(item.date);
                if (item.type === "Gastos" && txDate >= startOfMonth && txDate <= endOfMonth) {
                    monthlyExpenses += Math.abs(parseFloat(item.amount.replace(/[^\d.-]/g, "")));
                }
            });

            // If expenses exceed 5000, create notification (only if not already notified this month)
            if (monthlyExpenses > 5000) {
                const existingNotif = notifications.find(n =>
                    n.type === "excessExpenses" && 
                    new Date(n.timestamp).getMonth() === now.getMonth()
                );
                if (!existingNotif) {
                    addNotification({
                        type: "excessExpenses",
                        title: "⚠️ Alerta de Gastos",
                        message: `Seus gastos este mês (R$ ${monthlyExpenses.toFixed(2)}) ultrapassaram R$ 5.000.`,
                    });
                }
            }
        }

        // Check for Contas upcoming
        if (notificationSettings.contasAlerts) {
            const daysFromNow = 3; // Alert if within 3 days
            const alertDate = new Date(now);
            alertDate.setDate(alertDate.getDate() + daysFromNow);

            items.forEach(item => {
                if (item.category === "Contas" && !item.isPaid) {
                    const txDate = new Date(item.date);
                    if (txDate <= alertDate && txDate >= now) {
                        const existingNotif = notifications.find(n =>
                            n.type === "contasAlert" && n.itemId === item.id
                        );
                        if (!existingNotif) {
                            addNotification({
                                type: "contasAlert",
                                itemId: item.id,
                                title: "📅 Conta Próxima do Vencimento",
                                message: `${item.description} vence em ${txDate.toLocaleDateString("pt-BR")}.`,
                            });
                        }
                    }
                }
            });
        }
    }, [items, notificationSettings]);

    const getAvatarColor = (firstName) => {
        if (!firstName) return "hsl(220,30%,80%)";
        const ch = firstName.trim().charCodeAt(0);
        const index = (ch - 65 + 26) % 26; // map to 0-25
        const hue = Math.round((index / 26) * 360);
        return `hsl(${hue} 30% 80%)`;
    };

    const getFirstLastName = (lastName) => {
        if (!lastName) return "";
        const skip = ["do", "dos", "de"];
        const parts = lastName.split(/\s+/).filter(Boolean);
        const chosen = parts.find(p => !skip.includes(p.toLowerCase()));
        return (chosen || parts[0] || "").trim();
    };

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
                        onNavigate={switchPage}
                        userProfile={userProfile}
                    />

            <main className="dashboard-area">

                <div className="desktop-notif">
                    <button
                        className="notification-bell desktop"
                        onClick={() => switchPage("settings")}
                        title="Notificações"
                    >
                        <Bell />
                        {notifications.filter(n => !n.read).length > 0 && (
                            <span className="badge">{notifications.filter(n => !n.read).length}</span>
                        )}
                    </button>
                </div>

                <header className="mobile-header">

                    {(() => {
                        const first = (userProfile.firstName || "").trim();
                        const lastFirst = getFirstLastName(userProfile.lastName || "");
                        const initials = `${(first.charAt(0)||"").toUpperCase()}${(lastFirst.charAt(0)||"").toUpperCase()}`;
                        const bg = getAvatarColor(first);
                        return (
                            <button
                                className="mobile-avatar"
                                onClick={() => setMenuOpen(true)}
                                style={{ background: bg, color: "var(--text-primary)", fontWeight: 700 }}
                            >
                                {initials}
                            </button>
                        );
                    })()}

                    <span>{pageHeader}</span>

                    <button 
                        className="notification-bell"
                        onClick={() => switchPage("settings")}
                        title="Notificações"
                    >
                        <Bell />
                        {notifications.filter(n => !n.read).length > 0 && (
                            <span className="badge">{notifications.filter(n => !n.read).length}</span>
                        )}
                    </button>

                </header>

                {loading ? <Skeleton /> : (
                    <Router
                        items={items}
                        userProfile={userProfile}
                        setUserProfile={setUserProfile}
                        notifications={notifications}
                        notificationSettings={notificationSettings}
                        setNotificationSettings={setNotificationSettings}
                        addItem={addItem}
                        updateItem={updateItem}
                        deleteItem={deleteItem}
                        deleteNotification={deleteNotification}
                        markNotificationAsRead={markNotificationAsRead}
                        markAllNotificationsAsRead={markAllNotificationsAsRead}
                        theme={theme}
                        setTheme={setTheme}
                        onNavigate={switchPage}
                    />
                )}

            </main>

            <ToastContainer
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop
                closeOnClick
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />

        </div>

    );
}

export default App;