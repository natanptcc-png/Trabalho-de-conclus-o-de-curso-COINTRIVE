import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";

export default function Router({
    items,
    userProfile,
    setUserProfile,
    notifications,
    notificationSettings,
    setNotificationSettings,
    addItem,
    updateItem,
    deleteItem,
    deleteNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    theme,
    setTheme,
    onNavigate,
}) {
    return (
        <Routes>
            <Route path="/" element={<Dashboard items={items} userProfile={userProfile} onNavigate={onNavigate} />} />
            <Route path="/dashboard" element={<Dashboard items={items} userProfile={userProfile} onNavigate={onNavigate} />} />
            <Route path="/transactions" element={<Transactions items={items} onAdd={addItem} onUpdate={updateItem} onDelete={deleteItem} />} />
            <Route path="/reports" element={<Reports items={items} userProfile={userProfile} />} />
            <Route path="/settings" element={
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
                    theme={theme}
                    setTheme={setTheme}
                />
            } />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
    );
}
