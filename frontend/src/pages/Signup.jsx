import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { showToast } from "../utils/toast";
import "./Auth.css";

export default function Signup({ onSignup }) {
    const navigate = useNavigate();
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const cardRef = useRef(null);

    useEffect(() => {
        const el = cardRef.current;
        if (!el) return;
        requestAnimationFrame(() => el.classList.add("mounted"));
        return () => el.classList.remove("mounted");
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!firstName.trim()) {
            showToast({ type: "error", message: "Nome é obrigatório." });
            return;
        }
        if (!lastName.trim()) {
            showToast({ type: "error", message: "Sobrenome é obrigatório." });
            return;
        }
        if (!email.trim()) {
            showToast({ type: "error", message: "Email é obrigatório." });
            return;
        }
        if (password.length < 8) {
            showToast({ type: "error", message: "A senha deve ter pelo menos 8 caracteres." });
            return;
        }
        if (password !== confirm) {
            showToast({ type: "error", message: "As senhas não correspondem." });
            return;
        }

        const normalizedEmail = email.trim().toLowerCase();
        const result = await onSignup({
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            email: normalizedEmail,
            password,
        });
        if (result.success) {
            showToast({ type: "success", message: "Conta criada com sucesso." });
            navigate("/dashboard");
            return;
        }

        showToast({ type: "error", message: result.message || "Falha ao criar conta." });
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
                            <h1>Cadastrar Conta</h1>
                            <p className="auth-subtitle">Crie sua conta e comece a controlar seu dinheiro hoje.</p>
                        </div>
                    </div>

                    <form className="auth-form" onSubmit={handleSubmit}>
                        <div className="auth-field">
                            <input
                                id="signup-first-name"
                                className="auth-input"
                                type="text"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Daniel"
                            />
                            <label htmlFor="signup-first-name">Nome</label>
                        </div>

                        <div className="auth-field">
                            <input
                                id="signup-last-name"
                                className="auth-input"
                                type="text"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Silva Santos"
                            />
                            <label htmlFor="signup-last-name">Sobrenome</label>
                        </div>

                        <div className="auth-field">
                            <input
                                id="signup-email"
                                className="auth-input"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="daniel@example.com"
                            />
                            <label htmlFor="signup-email">Email</label>
                        </div>

                        <div className="auth-field">
                            <input
                                id="signup-password"
                                className="auth-input"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="S#nh4F0rt3"
                            />
                            <label htmlFor="signup-password">Senha</label>
                        </div>

                        <div className="auth-field">
                            <input
                                id="signup-confirm"
                                className="auth-input"
                                type="password"
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                placeholder="S#nh4F0rt3"
                            />
                            <label htmlFor="signup-confirm">Confirmar senha</label>
                        </div>

                        <div className="auth-actions">
                            <button className="auth-btn" type="submit">Criar Conta</button>
                        </div>
                    </form>

                    <div className="auth-footer">
                        Já possui conta? <Link to="/">Entrar</Link>
                    </div>
                </section>
            </div>
        </div>
    );
}
