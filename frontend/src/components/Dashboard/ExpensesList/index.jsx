import "./index.css"

export default function ExpensesList({ items = [] }) {
    const expenses = items
        .filter(item => item.type === "Gastos")
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
            <h2>Gastos Recentes</h2>

            <ul>
                {expenses.length === 0 ? (
                    <li style={{ textAlign: "center", color: "#94a3b8" }}>Nenhum gasto registrado</li>
                ) : (
                    expenses.map((exp, index) => (
                        <div key={index}>
                            <li>
                                <span style={{lineHeight: '2', fontSize: '1.5em'}}><b>{exp.description}</b></span> <br /> 
                                <i><strong> R$ {extractAmount(exp.amount)} </strong></i> <br />
                                {formatDate(exp.date)}
                            </li>
                        </div>
                    ))
                )}
            </ul>
        </>
    );
}