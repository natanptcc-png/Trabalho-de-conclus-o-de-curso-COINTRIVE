import { useState, useEffect, useRef } from "react";
import categories from "../../data/categories";

export default function NewTransactionModal({ open, onClose, onAdd }) {

    const [form, setForm] = useState({
        description: "",
        type: "Gastos",
        category: "Comida",
        amount: "",
        payment: "Débito",
        date: "",
    });

    const [visible, setVisible] = useState(open);
    const [closing, setClosing] = useState(false);
    const timeoutRef = useRef();

    useEffect(() => {
        if (open) {
            // open immediately
            clearTimeout(timeoutRef.current);
            setVisible(true);
            setClosing(false);
        } else if (visible) {
            // trigger close animation
            setClosing(true);
            timeoutRef.current = setTimeout(() => {
                setVisible(false);
                setClosing(false);
            }, 260);
        }
        return () => clearTimeout(timeoutRef.current);
    }, [open]);

    const handleClose = () => {
        // run closing animation then notify parent
        setClosing(true);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setVisible(false);
            setClosing(false);
            onClose && onClose();
        }, 260);
    };

    const submit = (e) => {
        e.preventDefault();
        const payload = { ...form, id: Date.now() };
        onAdd && onAdd(payload);
        // close with animation
        setClosing(true);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setVisible(false);
            setClosing(false);
            onClose && onClose();
        }, 260);
    };

    if (!visible) return null;

    const overlayClass = `modal-overlay ${!closing ? 'open' : 'closing'}`;
    const modalClass = `modal ${!closing ? 'open' : 'closing'}`;

    return (
        <div className={overlayClass}>
            <div className={modalClass}>
                <h3>Nova Transação</h3>
                <form onSubmit={submit} className="modal-form">
                    <label>
                        DESCRIÇÃO
                        <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} required />
                    </label>

                    <div className="row">
                        <label>
                            TIPO
                            <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                                <option>Renda</option>
                                <option>Gastos</option>
                            </select>
                        </label>

                        <label>
                            CATEGORIA
                            <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                                {categories.filter(c=>c!=='Todas as Categorias').map(c => <option key={c}>{c}</option>)}
                            </select>
                        </label>
                    </div>

                    <div className="row">
                        <label>
                            VALOR (R$)
                            <input type="number" step="0.01" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required />
                        </label>

                        <label>
                            MÉTODO DE PAGAMENTO
                            <select value={form.payment} onChange={e => setForm({...form, payment: e.target.value})}>
                                <option>Débito</option>
                                <option>Crédito</option>
                                <option>Conta Bancária</option>
                                <option>Dinheiro</option>
                            </select>
                        </label>
                    </div>

                    <label>
                        DATA
                        <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} required />
                    </label>

                    <div className="modal-actions">
                        <button type="button" className="btn" onClick={handleClose}>Cancelar</button>
                        <button type="submit" className="btn primary">Adicionar Transação</button>
                    </div>
                </form>
            </div>
        </div>
    );
}
