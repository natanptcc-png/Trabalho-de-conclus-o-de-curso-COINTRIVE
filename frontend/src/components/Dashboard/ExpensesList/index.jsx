import "./index.css"

export default function ExpensesList({ items = [], onNavigate }) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const expenses = items
        .filter(item => item.type === "Gastos")
        .filter(item => {
            const txDate = new Date(item.date);
            return txDate >= startOfMonth && txDate <= endOfMonth;
        })
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    const formatDate = (date) => {
        if (date.includes('-')) {
            const [y, m, d] = date.split('-');
            return `${d}/${m}/${y}`;
        }
        return date;
    };

    const extractAmount = (amount) => {
        return amount.replace(/[^\d.,]/g, "");
    };

    return (
        <>
                <div className="expenses-header">
                <h2>Gastos Recentes</h2>
                <button className="btn-text" onClick={() => onNavigate && onNavigate("transactions")}>Ver tudo</button>
            </div>

            <ul className="compact-list">
                {expenses.length === 0 ? (
                    <li className="empty">Nenhum gasto registrado este mês</li>
                ) : (
                    expenses.map((exp, index) => (
                        <li key={index} className="compact-item">
                            <div className="left">
                                <div className="desc">{exp.description}</div>
                                <div className="meta">{formatDate(exp.date)}</div>
                            </div>
                            <div className="amount">R$ {extractAmount(exp.amount)}</div>
                        </li>
                    ))
                )}
            </ul>
        </>
    );
}