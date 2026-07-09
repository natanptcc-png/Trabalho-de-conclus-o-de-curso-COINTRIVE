import { useState, useEffect } from "react";
import { ToastContainer } from "react-toastify";

import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import PageTransition from "./components/common/PageTransition";
import LeftNav from "./components/LeftNav";

import "./App.css";

function App() {

    const [menuOpen, setMenuOpen] = useState(false);
    const [activePage, setActivePage] = useState("dashboard");

    // Global transaction data
    const [items, setItems] = useState(() => {
        const stored = localStorage.getItem("transactions");
        if (stored) return JSON.parse(stored);
        return [
            { id: 1, date: "2026-01-02", description: "Salary", category: "Renda", type: "Renda", amount: "+ R$ 8.500,00", payment: "Salário", isPaid: null },
            { id: 2, date: "2026-01-03", description: "Supermarket", category: "Comida", type: "Gastos", amount: "- R$ 156,80", payment: "Débito", isPaid: null },
            { id: 3, date: "2026-01-03", description: "Uber", category: "Transporte", type: "Gastos", amount: "- R$ 45,90", payment: "Débito", isPaid: null },
        ];
    });

    // Global user profile
    const [userProfile, setUserProfile] = useState(() => {
        const stored = localStorage.getItem("userProfile");
        if (stored) return JSON.parse(stored);
        return {
            firstName: "Daniel",
            lastName: "Silva",
            email: "daniel@email.com",
            phone: "+55 11 99999-9999",
            bio: "Personal finance enthusiast",
            currency: "BRL",
        };
    });

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
        dashboard: "Painel",
        transactions: "Transações",
        reports: "Relatórios",
        settings: "Configurações",
    };

    // Persist transactions to localStorage
    useEffect(() => {
        localStorage.setItem("transactions", JSON.stringify(items));
    }, [items]);

    // Persist user profile to localStorage
    useEffect(() => {
        localStorage.setItem("userProfile", JSON.stringify(userProfile));
    }, [userProfile]);

    // Persist notifications to localStorage
    useEffect(() => {
        localStorage.setItem("notifications", JSON.stringify(notifications));
    }, [notifications]);

    // Persist notification settings to localStorage
    useEffect(() => {
        localStorage.setItem("notificationSettings", JSON.stringify(notificationSettings));
    }, [notificationSettings]);

    // Transaction management functions
    const addItem = (tx) => {
        const normalized = {
            ...tx,
            id: items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1,
            type: tx.type,
            category: tx.category,
            amount: tx.amount.startsWith("+") || tx.amount.startsWith("-") ? tx.amount : (tx.type === "Renda" ? `+ R$ ${tx.amount}` : `- R$ ${tx.amount}`),
            date: tx.date,
            isPaid: tx.category === "Contas" ? false : null,
        };
        setItems(prev => [normalized, ...prev]);
        return normalized;
    };

    const updateItem = (id, updates) => {
        setItems(prev =>
            prev.map(item =>
                item.id === id ? { ...item, ...updates } : item
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
                        {userProfile.firstName.charAt(0)}{userProfile.lastName.charAt(0)}
                    </button>

                    <span>{pageHeaders[activePage]}</span>

                    <button 
                        className="notification-bell"
                        onClick={() => setActivePage("settings")}
                        title="Notificações"
                    >
                        🔔
                        {notifications.filter(n => !n.read).length > 0 && (
                            <span className="badge">{notifications.filter(n => !n.read).length}</span>
                        )}
                    </button>

                </header>

                <PageTransition show={activePage === "dashboard"}>
                    <Dashboard items={items} userProfile={userProfile} />
                </PageTransition>

                <PageTransition show={activePage === "transactions"}>
                    <Transactions 
                        items={items} 
                        onAdd={addItem} 
                        onUpdate={updateItem}
                        onDelete={deleteItem}
                    />
                </PageTransition>

                <PageTransition show={activePage === "reports"}>
                    <Reports items={items} userProfile={userProfile} />
                </PageTransition>

                <PageTransition show={activePage === "settings"}>
                    <Settings 
                        userProfile={userProfile}
                        setUserProfile={setUserProfile}
                        notifications={notifications}
                        notificationSettings={notificationSettings}
                        setNotificationSettings={setNotificationSettings}
                        deleteNotification={deleteNotification}
                        markNotificationAsRead={markNotificationAsRead}
                        markAllNotificationsAsRead={markAllNotificationsAsRead}
                        items={items}
                        onUpdate={updateItem}
                    />
                </PageTransition>

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