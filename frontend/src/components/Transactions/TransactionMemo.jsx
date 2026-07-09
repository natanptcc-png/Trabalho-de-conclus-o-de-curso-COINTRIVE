export default function TransactionMemo({ id, date, description, category, type, amount, payment }) {

    const tagClass = type === "Renda" ? "tag income" : "tag expense";

    // format date from YYYY-MM-DD to DD/MM/YYYY for display if needed
    const displayDate = (d) => {
        if (!d) return "";
        if (d.includes('-')) {
            const [y,m,day] = d.split('-');
            return `${day}/${m}/${y}`;
        }
        return d;
    }

    return (
        <tr className="transaction-row" key={id}>
            <td>{displayDate(date)}</td>
            <td>{description}</td>
            <td><span className={`tag`}>{category}</span></td>
            <td><span className={tagClass}>{type}</span></td>
            <td>{amount}</td>
            <td>{payment}</td>
        </tr>
    );

}
