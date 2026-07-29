import "./index.css";
import { useState, useEffect } from "react";
import { showToast } from "../../utils/toast";

export default function Settings({
    userProfile,
    setUserProfile,
    notifications,
    notificationSettings,
    setNotificationSettings,
    deleteNotification,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    items,
    onUpdate,
    theme,
    setTheme,
    onUpdateProfile,
    onChangePassword,
}) {
    const [editMode, setEditMode] = useState(false);
    const [tempProfile, setTempProfile] = useState(userProfile);

    useEffect(() => {
        setTempProfile(userProfile);
    }, [userProfile]);
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwords, setPasswords] = useState({ current: "", new: "", confirm: "" });

    const handleProfileChange = (field, value) => {
        setTempProfile(prev => ({ ...prev, [field]: value }));
    };

    const handleSaveProfile = async () => {
        if (!tempProfile.firstName.trim() || !tempProfile.lastName.trim()) {
            showToast({ type: "error", message: "Nome e sobrenome são obrigatórios." });
            return;
        }

        if (onUpdateProfile) {
            const result = await onUpdateProfile({
                firstName: tempProfile.firstName.trim(),
                lastName: tempProfile.lastName.trim(),
                phone: tempProfile.phone || '',
                bio: tempProfile.bio || '',
                currency: tempProfile.currency || 'BRL',
            });

            if (!result.success) {
                showToast({ type: "error", message: result.message || "Falha ao atualizar perfil." });
                return;
            }

            setUserProfile(result.user);
            setTempProfile(result.user);
        } else {
            setUserProfile(tempProfile);
        }

        setEditMode(false);
        showToast({ type: "success", message: "Perfil atualizado com sucesso." });
    };

    const handlePasswordChange = async () => {
        if (!passwords.current || !passwords.new || !passwords.confirm) {
            showToast({ type: "error", message: "Todos os campos são obrigatórios." });
            return;
        }
        if (passwords.new !== passwords.confirm) {
            showToast({ type: "error", message: "As senhas não correspondem." });
            return;
        }
        if (passwords.new.length < 8) {
            showToast({ type: "error", message: "A senha deve ter pelo menos 8 caracteres." });
            return;
        }

        if (onChangePassword) {
            const result = await onChangePassword({
                currentPassword: passwords.current,
                newPassword: passwords.new,
            });

            if (!result.success) {
                showToast({ type: "error", message: result.message || "Falha ao alterar senha." });
                return;
            }
        }

        showToast({ type: "success", message: "Senha alterada com sucesso." });
        setShowPasswordForm(false);
        setPasswords({ current: "", new: "", confirm: "" });
    };

    const handleToggleNotification = (type) => {
        setNotificationSettings(prev => ({
            ...prev,
            [type]: !prev[type],
        }));
    };

    const handleToggleTheme = () => {
        setTheme((t) => (t === "dark" ? "light" : "dark"));
    };

    const handleToggleContasPaid = (itemId) => {
        const item = items.find(i => i.id === itemId);
        if (item) {
            onUpdate(itemId, { isPaid: !item.isPaid });
            showToast({
                type: "success", 
                message: item.isPaid ? `${item.description} marcada como não paga.` : `${item.description} marcada como paga.` 
            });
        }
    };

    const contasItems = items.filter(i => i.category === "Contas").sort((a, b) => new Date(a.date) - new Date(b.date));
    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="settings-container">
            <div className="settings-header">
                <h1>Configurações</h1>
            </div>

            <div className="settings-grid">
                {/* Profile Section */}
                <section className="settings-section">
                    <div className="section-header">
                        <h2>Perfil</h2>
                        <button
                            className="btn-text"
                            onClick={() => {
                                setEditMode(!editMode);
                                setTempProfile(userProfile);
                            }}
                        >
                            {editMode ? "Cancelar" : "Editar"}
                        </button>
                    </div>

                    <div className="profile-info">
                        {!editMode ? (
                            <>
                                <div className="info-item">
                                    <label>Nome</label>
                                    <p>{userProfile.firstName}</p>
                                </div>
                                <div className="info-item">
                                    <label>Sobrenome</label>
                                    <p>{userProfile.lastName}</p>
                                </div>
                                <div className="info-item">
                                    <label>Email</label>
                                    <input type="email" value={userProfile.email} readOnly />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="form-group">
                                    <label>Nome</label>
                                    <input
                                        type="text"
                                        value={tempProfile.firstName}
                                        onChange={(e) => handleProfileChange("firstName", e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Sobrenome</label>
                                    <input
                                        type="text"
                                        value={tempProfile.lastName}
                                        onChange={(e) => handleProfileChange("lastName", e.target.value)}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        value={tempProfile.email}
                                        disabled
                                    />
                                </div>
                                <div className="form-actions">
                                    <button className="btn primary" onClick={handleSaveProfile}>
                                        Salvar
                                    </button>
                                    <button
                                        className="btn"
                                        onClick={() => {
                                            setEditMode(false);
                                            setTempProfile(userProfile);
                                        }}
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </section>

                {/* Password Section */}
                <section className="settings-section">
                    <div className="section-header">
                        <h2>Segurança</h2>
                        <button
                            className="btn-text"
                            onClick={() => setShowPasswordForm(!showPasswordForm)}
                        >
                            {showPasswordForm ? "Cancelar" : "Alterar Senha"}
                        </button>
                    </div>

                    {showPasswordForm && (
                        <div className="password-form">
                            <div className="form-group">
                                <label>Senha Atual</label>
                                <input
                                    type="password"
                                    value={passwords.current}
                                    onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                                />
                            </div>
                            <div className="form-group">
                                <label>Nova Senha</label>
                                <input
                                    type="password"
                                    value={passwords.new}
                                    onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirmar Senha</label>
                                <input
                                    type="password"
                                    value={passwords.confirm}
                                    onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                                />
                            </div>
                            <div className="form-actions">
                                <button className="btn primary" onClick={handlePasswordChange}>
                                    Alterar Senha
                                </button>
                            </div>
                        </div>
                    )}
                </section>

                {/* Notifications Settings Section */}
                <section className="settings-section">
                    <h2>Configurações de Notificações</h2>
                    <div className="notification-settings">
                        <div className="setting-item">
                            <div className="setting-label">
                                <h3>Gastos em Excesso no Mês</h3>
                                <p>Alertas quando seus gastos ultrapassam o limite</p>
                            </div>
                            <label className="toggle">
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.excessExpenses}
                                    onChange={() => handleToggleNotification("excessExpenses")}
                                />
                                <span></span>
                            </label>
                        </div>

                        <div className="setting-item">
                            <div className="setting-label">
                                <h3>Contas Próximas do Vencimento</h3>
                                <p>Alertas para contas com data próxima</p>
                            </div>
                            <label className="toggle">
                                <input
                                    type="checkbox"
                                    checked={notificationSettings.contasAlerts}
                                    onChange={() => handleToggleNotification("contasAlerts")}
                                />
                                <span></span>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Appearance Section */}
                <section className="settings-section">
                    <h2>Aparência</h2>
                    <div className="notification-settings">
                        <div className="setting-item">
                            <div className="setting-label">
                                <h3>Modo Escuro</h3>
                                <p>Ative para usar o tema escuro em toda a aplicação</p>
                            </div>
                            <label className="toggle">
                                <input type="checkbox" checked={theme === "dark"} onChange={handleToggleTheme} />
                                <span></span>
                            </label>
                        </div>
                    </div>
                </section>

                {/* Contas Management Section */}
                {contasItems.length > 0 && (
                    <section className="settings-section">
                        <h2>Contas para Pagar</h2>
                        <div className="contas-list">
                            {contasItems.map(item => (
                                <div key={item.id} className={`conta-item ${item.isPaid ? "paid" : ""}`}>
                                    <div className="conta-info">
                                        <h4>{item.description}</h4>
                                        <p>Vencimento: {new Date(item.date).toLocaleDateString("pt-BR")}</p>
                                        <p className="amount">{item.amount}</p>
                                    </div>
                                    <button
                                        className={`btn-toggle-paid ${item.isPaid ? "paid" : ""}`}
                                        onClick={() => handleToggleContasPaid(item.id)}
                                    >
                                        {item.isPaid ? "✓ Pago" : "Marcar como Pago"}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Notifications List */}
                <section className="settings-section">
                    <div className="section-header">
                        <h2>Centro de Notificações {unreadCount > 0 && <span className="badge">{unreadCount}</span>}</h2>
                        {notifications.length > 0 && (
                            <button className="btn-text" onClick={markAllNotificationsAsRead}>
                                Marcar tudo como lido
                            </button>
                        )}
                    </div>

                    <div className="notifications-list">
                        {notifications.length === 0 ? (
                            <p className="empty-state">Nenhuma notificação</p>
                        ) : (
                            notifications.map(notif => (
                                <div key={notif.id} className={`notification-card ${notif.read ? "read" : ""}`}>
                                    <div className="notification-content">
                                        <h4>{notif.title}</h4>
                                        <p>{notif.message}</p>
                                        <small>{new Date(notif.timestamp).toLocaleString("pt-BR")}</small>
                                    </div>
                                    <div className="notification-actions">
                                        {!notif.read && (
                                            <button
                                                className="btn-icon"
                                                onClick={() => markNotificationAsRead(notif.id)}
                                                title="Marcar como lido"
                                            >
                                                ✓
                                            </button>
                                        )}
                                        <button
                                            className="btn-icon danger"
                                            onClick={() => deleteNotification(notif.id)}
                                            title="Deletar"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
}
