import { Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

function PrivateRoute({ isAuthenticated, children }) {
    return isAuthenticated ? children : <Navigate to="/" replace />;
}

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
    isAuthenticated,
    onLogin,
    onPassReset,
    onSignup,
    onUpdateProfile,
    onChangePassword,
    users,
}) {
    return (
        <Routes>
            <Route
                path="/"
                element={
                    isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login onLogin={onLogin} onPassReset={onPassReset} users={users} />
                }
            />
            <Route
                path="/dashboard"
                element={
                    <PrivateRoute isAuthenticated={isAuthenticated}>
                        <Dashboard items={items} userProfile={userProfile} onNavigate={onNavigate} />
                    </PrivateRoute>
                }
            />
            <Route
                path="/transactions"
                element={
                    <PrivateRoute isAuthenticated={isAuthenticated}>
                        <Transactions items={items} onAdd={addItem} onUpdate={updateItem} onDelete={deleteItem} />
                    </PrivateRoute>
                }
            />
            <Route
                path="/reports"
                element={
                    <PrivateRoute isAuthenticated={isAuthenticated}>
                        <Reports items={items} userProfile={userProfile} />
                    </PrivateRoute>
                }
            />
            <Route
                path="/settings"
                element={
                    <PrivateRoute isAuthenticated={isAuthenticated}>
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
                            onUpdateProfile={onUpdateProfile}
                            onChangePassword={onChangePassword}
                        />
                    </PrivateRoute>
                }
            />
            <Route
                path="/signup"
                element={
                    isAuthenticated ? <Navigate to="/dashboard" replace /> : <Signup onSignup={onSignup} users={users} />
                }
            />
            <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/"} replace />} />
        </Routes>
    );
}
