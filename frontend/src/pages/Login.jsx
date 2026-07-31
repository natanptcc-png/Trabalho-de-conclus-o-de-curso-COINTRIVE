import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { showToast } from "../utils/toast";
import "./Auth.css";
import { X } from "lucide-react";

export default function Login({ onLogin, onPassReset }) {

    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [resetEmail, setResetEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const cardRef = useRef(null);

    const [actionsInfoOpen, setActionsInfoOpen] = useState(false);
    const [actionsInfoClosing, setActionsInfoClosing] = useState(false);

    useEffect(() => {
        const el = cardRef.current;
        if (!el) return;
        // trigger animation on next frame
        requestAnimationFrame(() => el.classList.add("mounted"));
        return () => el.classList.remove("mounted");
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

        setActionsInfoOpen(false);  

        if (!email.trim() || !password) {
            showToast({ type: "error", message: "Email e senha são obrigatórios." });
            return;
        }

        const result = await onLogin({ email: email.trim().toLowerCase(), password });
        if (result.success) {
            showToast({ type: "success", message: "Login realizado com sucesso." });
            navigate("/dashboard");
            return;
        }

        showToast({ type: "error", message: result.message || "Falha no login." });
    };

    const handlePassReset = async (ev) => {
        ev.preventDefault();

        if (!resetEmail.trim() || !newPassword) {
            showToast({type: "error", message: "Email e senha são obrigatórios."});
            return;
        }

        const result = await onPassReset({ email: resetEmail.trim().toLowerCase(), password: newPassword });
        if (result.success) {
            showToast({type: "success", message: "Reset realizado com sucesso."});
            closeActionsInfo();
            return;
        }

        showToast({type: "error", message: result.message || "Falha no login."});
    }

    const closeActionsInfo = () => {
        setActionsInfoClosing(true);
    
        setTimeout(() => {
            setActionsInfoClosing(false);
            setActionsInfoOpen(false);
        }, 250); // match the CSS animation duration
    };

    return (
        <div className="auth-page">
            <div className="auth-panel">
                <section className="auth-info">
                    <div className="auth-info-brand logo-brand">
                        <div className="logo-badge">
                            <img src="/business/Logo.png" id="business-logo" alt="Cointrive logo" />
                        </div>
                        <div>
                            <h1>
                                Cointrive
                            </h1>
                            <p>
                                Somos um aplicativo de gestão financeira para facilitar a sua gestão pessoal com uma interface simples, 
                                coloque suas transações no mês para saber quanto de renda e gasto houve no mês, veja relatórios do seu 
                                mês ou ao todo, entre outros!
                            </p>
                            <p>
                                Este foi um Trabalho de Conclusão de Curso para o ensino técnico com ensino médio de Desenvolvimento de Sistemas.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="auth-card" ref={cardRef}>
                    <div className="auth-brand">
                        <div>
                            <h1>Login</h1>
                            <p className="auth-subtitle">Entre para gerenciar suas finanças pessoais com segurança.</p>
                        </div>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-field">
                            <input
                                id="login-email"
                                className="auth-input"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="daniel@example.com"
                            />
                            <label htmlFor="login-email">Email</label>
                        </div>

                        <div className="auth-field">
                            <input
                                id="login-password"
                                className="auth-input"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="S#nh4F0rt3"
                            />
                            <label htmlFor="login-password">Senha</label>
                        </div>

                        <div className="auth-actions">
                            <button className="auth-btn" type="submit">Entrar</button>
                        </div>
                    </form>

                    <div className="auth-footer">
                        Não possui conta? <Link to="/signup">Criar conta</Link>
                    </div>
                    <div className="auth-footer">
                        <p onClick={() => setActionsInfoOpen(true)} title="Abrir pop-up para alterar senha">Esqueci minha Senha</p>
                    </div>
                </section>
            </div>

            {   actionsInfoOpen &&

                <div
                className={`modal-overlay ${
                    actionsInfoClosing ? "closing" : "open"
                }`}
                >
                    <div
                        className={`modal ${
                            actionsInfoClosing ? "closing" : "open"
                        }`}
                        onClick={(e)=>e.stopPropagation()}
                    >        
                        <div className="modal-actions">
                            <button
                                className="btn primary"
                                onClick={closeActionsInfo}
                            >
                                <X className="licon" />
                            </button>
                        </div>

                        <h3 style={{marginTop: "-40px"}}>Altere a sua Senha</h3>

                        <p>
                            Devido a falta de feature para
                        </p>
                        <p  >
                            alterar a senha, coloque o email e senha para alterar
                        </p>

                        <div
                            style={{
                                display: "flex",
                                flexDirection: "column",
                                gap: "16px",
                                marginTop: "20px"
                            }}
                        >
                            <div>
                                <form className="auth-form" onSubmit={handlePassReset}>
                                    <div className="auth-field">
                                        <input
                                            id="email-login-reset"
                                            className="auth-input"
                                            type="email"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            placeholder="daniel@example.com"
                                        />
                                        <label htmlFor="email-login-reset">Email</label>
                                    </div>

                                    <div className="auth-field">
                                        <input
                                            id="login-reset"
                                            className="auth-input"
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="N3WP4ssw0RD"
                                        />
                                        <label htmlFor="login-reset">Nova Senha</label>
                                    </div>

                                    <div className="auth-actions">
                                        <button className="auth-btn" type="submit">Resetar Senha</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            }
        </div>
    );
}
