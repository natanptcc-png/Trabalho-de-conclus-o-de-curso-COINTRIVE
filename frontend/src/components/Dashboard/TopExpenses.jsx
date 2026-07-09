import "./TopExpenses.css";
import { useMemo } from "react";

export default function TopExpenses({ items = [] }) {
    const top = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const categoryExpenses = {};

        items.forEach(item => {
            if (item.type === "Gastos") {
                const txDate = new Date(item.date);
                if (txDate >= startOfMonth && txDate <= endOfMonth) {
                    const amount = Math.abs(parseFloat(item.amount.replace(/[^\d.-]/g, "")));
                    if (!categoryExpenses[item.category]) categoryExpenses[item.category] = 0;
                    categoryExpenses[item.category] += amount;
                }
            }
        });

        const sorted = Object.entries(categoryExpenses)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([category, amount]) => ({ category, amount }));

        const total = Object.values(categoryExpenses).reduce((s, v) => s + v, 0);

        return { sorted, total };
    }, [items]);

    return (
        <div className="top-expenses">
            <h2>Top Gastos do Mês</h2>

            {top.sorted.length === 0 ? (
                <p className="empty">Nenhum gasto neste mês</p>
            ) : (
                <ul>
                    {top.sorted.map((t, i) => (
                        <li key={t.category}>
                            <div className="left">
                                <div className="rank">{i + 1}</div>
                                <div className="meta">
                                    <div className="category">{t.category}</div>
                                    <div className="amount">R$ {t.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</div>
                                </div>
                            </div>
                            <div className="bar">
                                <div style={{ width: `${top.total>0? (t.amount / top.total) * 100 : 0}%` }} />
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
