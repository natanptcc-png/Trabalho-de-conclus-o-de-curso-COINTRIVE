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
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingPayload, setPendingPayload] = useState(null);
    const [visible, setVisible] = useState(open);
    const [closing, setClosing] = useState(false);
    const timeoutRef = useRef();

    const resetForm = () => {
        setForm({
            description: "",
            type: "Gastos",
            category: "Comida",
            amount: "",
            payment: "Débito",
            date: "",
        });
        setConfirmOpen(false);
        setPendingPayload(null);
    };

    useEffect(() => {
        if (open) {
            clearTimeout(timeoutRef.current);
            setVisible(true);
            setClosing(false);
        } else if (visible) {
            setClosing(true);
            timeoutRef.current = setTimeout(() => {
                setVisible(false);
                setClosing(false);
                resetForm();
            }, 260);
        }
        return () => clearTimeout(timeoutRef.current);
    }, [open]);

    const handleClose = () => {
        // run closing animation then notify parent
        setConfirmOpen(false);
        setPendingPayload(null);
        setClosing(true);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setVisible(false);
            setClosing(false);
            resetForm();
            onClose && onClose();
        }, 260);
    };

    const parseDateValue = (value) => {
        return value;
    };

    const formatAmountValue = (value) => {
        if (!value) return "";
        const normalized = value.toString().replace(',', '.');
        const match = normalized.match(/^(-?\d+)(?:\.(\d*))?$/);
        if (!match) return value;
        const integerPart = match[1];
        let decimalPart = match[2] ?? '';
        if (decimalPart.length === 0) decimalPart = '00';
        else if (decimalPart.length === 1) decimalPart = `${decimalPart}0`;
        else decimalPart = decimalPart.slice(0, 2);
        return `${integerPart}.${decimalPart}`;
    };

    const submit = (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            id: Date.now(),
            amount: formatAmountValue(form.amount),
            date: parseDateValue(form.date),
        };
        setPendingPayload(payload);
        setConfirmOpen(true);
    };

    const confirmSubmit = () => {
        if (!pendingPayload) return;
        onAdd && onAdd(pendingPayload);
        setConfirmOpen(false);
        setClosing(true);
        clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setVisible(false);
            setClosing(false);
            resetForm();
            onClose && onClose();
        }, 260);
    };

    const cancelConfirmation = () => {
        setConfirmOpen(false);
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
                            <input
                                type="text"
                                value={form.amount}
                                onChange={e => setForm({ ...form, amount: e.target.value })}
                                onBlur={e => setForm({ ...form, amount: formatAmountValue(e.target.value) })}
                                required
                            />
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
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', position: 'relative' }}>
                            <input
                                type="date"
                                value={form.date}
                                onChange={e => setForm({ ...form, date: e.target.value })}
                                required
                                style={{ flex: 1 }}
                            />
                        </div>
                    </label>

                    <div className="modal-actions">
                        <button type="button" className="btn" onClick={handleClose}>Cancelar</button>
                        <button type="submit" className="btn primary">Adicionar Transação</button>
                    </div>
                </form>
            </div>

            {confirmOpen && (
                <div className="modal-overlay open" style={{ zIndex: 2400 }}>
                    <div className="modal open" style={{ width: 'min(560px, calc(100% - 32px))' }}>
                        <h3>Confirmar criação</h3>
                        <p>Tem certeza de que deseja criar esta transação?</p>
                        <div className="modal-actions">
                            <button type="button" className="btn" onClick={cancelConfirmation}>Voltar</button>
                            <button type="button" className="btn primary" onClick={confirmSubmit}>Confirmar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
