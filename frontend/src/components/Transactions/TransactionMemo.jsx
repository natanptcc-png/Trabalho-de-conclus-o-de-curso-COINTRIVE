import { Trash2, SquarePen, BadgeDollarSign, Info } from "lucide-react"
import "./TM_styles.css"

export default function TransactionMemo({ id, date, description, category, type, amount, payment, isPaid, onEdit, onDelete, onPaidChange, onActionsView }) {

    const tagClass = type === "Renda" ? "tag income" : "tag expense";

    const displayDate = (d) => {
        if (!d) return "";
        if (/^\d{4}-\d{2}-\d{2}$/.test(d)) {
            const [y, m, day] = d.split('-');
            return `${day}/${m}/${y}`;
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
                {type === "Renda" ? "+" : "-"} R$ {amount}
            </td>
            <td>
                <div className="mobile-label">MÉTODO</div>
                {payment}
            </td>
            <td>
                <div className="mobile-label">AÇÕES</div>
                <button
                    type="button"
                    className="actions-info-btn aib-mob"
                    onClick={onActionsView}
                    title="O que faz cada botão?"
                >
                    <Info className="licon" />
                </button>
                <div className="transaction-actions">
                    <button className="action-btn edit" onClick={onEdit} title="Editar"><SquarePen className="licon" /></button>
                    <button className="action-btn delete" onClick={onDelete} title="Deletar"><Trash2 className="licon" /></button>
                    { type === "Gastos" && <button className={`action-btn ${isPaid ? "paid" : "notpaid"}`} onClick={onPaidChange} title={isPaid ? "Pago" : "Não Pago"}><BadgeDollarSign className="licon" /></button>}
                </div>
            </td>
        </tr>
    );

}
