import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { showToast } from "../utils/toast";
import "./Auth.css";

export default function Login({ onLogin }) {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const cardRef = useRef(null);

    useEffect(() => {
        const el = cardRef.current;
        if (!el) return;
        // trigger animation on next frame
        requestAnimationFrame(() => el.classList.add("mounted"));
        return () => el.classList.remove("mounted");
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();

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

    return (
        <div className="auth-page">
            <div className="auth-panel">
                <section className="auth-info">
                    <div className="auth-info-brand logo-brand">
                        <div className="logo-badge">
                            <img src="/business/Logo.png" id="business-logo" alt="Cointrive logo" />
                        </div>
                        <div>
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
                                placeholder=" "
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
                                placeholder=" "
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
                </section>
            </div>
        </div>
    );
}
