export default function TransactionMemo({ id, date, description, category, type, amount, payment }) {

    const tagClass = type === "Renda" ? "tag income" : "tag expense";

    const displayDate = (d) => {
        if (!d) return "";
        if (d.includes('-')) {
            const [y,m,day] = d.split('-');
            return `${day}/${m}/${y}`;
        }
        if (d.includes('/')) {
            return d;
        }
        const parsed = new Date(d);
        if (!isNaN(parsed)) {
            return parsed.toLocaleDateString('pt-BR');
        }
        return d;
    }

    return (
        <tr className="transaction-row" key={id}>
            <td>
                <div className="mobile-label">DATA</div>
                {displayDate(date)}
            </td>
            <td>
                <div className="mobile-label">DESCRIÇÃO</div>
                {description}
            </td>
            <td>
                <div className="mobile-label">CATEGORIA</div>
                <span className="tag">{category}</span>
            </td>
            <td>
                <div className="mobile-label">TIPO</div>
                <span className={tagClass}>{type}</span>
            </td>
            <td>
                <div className="mobile-label">VALOR</div>
                {amount}
            </td>
            <td>
                <div className="mobile-label">MÉTODO</div>
                {payment}
            </td>
        </tr>
    );

}
