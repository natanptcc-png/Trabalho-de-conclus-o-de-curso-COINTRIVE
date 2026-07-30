import { useState, useEffect, useRef } from "react";
import selectCategory from "../../data/categories";

export default function NewTransactionModal({ open, onClose, onAdd, editingItem, onUpdate }) {

    const [form, setForm] = useState({
        description: "",
        type: "Gastos",
        category: "Alimentos",
        amount: "",
        payment: "Débito",
        date: "",
    });
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [pendingPayload, setPendingPayload] = useState(null);
    const [visible, setVisible] = useState(open);
    const [closing, setClosing] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const timeoutRef = useRef();

    const resetForm = () => {
        setForm({
            description: "",
            type: "Gastos",
            category: "Alimentos",
            amount: "",
            payment: "Débito",
            date: "",
        });
        setConfirmOpen(false);
        setPendingPayload(null);
        setIsEditing(false);
    };

    useEffect(() => {
        if (editingItem) {
            setIsEditing(true);
            const rawAmount = editingItem.amount.replace(/[^\d.-]/g, "");
            const amount = rawAmount.replace(/^[-+]/, "");
            setForm({
                description: editingItem.description,
                type: editingItem.type,
                category: editingItem.category,
                amount: amount,
                payment: editingItem.payment,
                date: editingItem.date,
            });
        }
    }, [editingItem]);

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

    useEffect(() => {
        if (visible) {
            document.body.classList.add("modal-open");
        } else {
            document.body.classList.remove("modal-open");
        }
        return () => {
            document.body.classList.remove("modal-open");
        };
    }, [visible]);

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
        if (!value) return new Date().toISOString().slice(0, 10);
        const raw = String(value);
        const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
        return match ? match[1] : raw;
    };

    const formatAmountValue = (value) => {
        if (!value) return "";
    
        const normalized = value.toString().replace(",", ".");
        const match = normalized.match(/^(\d+)(?:\.(\d*))?$/);
    
        if (!match) return value;
    
        let integer = match[1].replace(/^0+/, "") || "0";
        let decimal = match[2] ?? "";
    
        // User entered only whole numbers
        if (!match[2]) {
            if (integer.length === 11) {
                decimal = integer.slice(-2);
                integer = integer.slice(0, -2);
            } else if (integer.length === 10) {
                decimal = integer.slice(-1) + "0";
                integer = integer.slice(0, -1);
            } else {
                decimal = "00";
            }
        }
    
        integer = String(parseInt(integer, 10) || 0);
    
        // Ensure exactly 2 decimal places
        if (decimal.length === 0) decimal = "00";
        else if (decimal.length === 1) decimal += "0";
        else decimal = decimal.slice(0, 2);
    
        return `${integer}.${decimal}`;
    };
    
    const submit = (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            amount: formatAmountValue(form.amount),
            date: parseDateValue(form.date),
        };
        setPendingPayload(payload);
        setConfirmOpen(true);
    };

    const confirmSubmit = () => {
        if (!pendingPayload) return;
        
        if (isEditing && onUpdate) {
            onUpdate(pendingPayload);
        } else if (onAdd) {
            onAdd(pendingPayload);
        }
        
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
    const modalTitle = isEditing ? "Editar Transação" : "Nova Transação";
    const submitButtonText = isEditing ? "Atualizar Transação" : "Adicionar Transação";

    return (
        <div className={overlayClass}>
            <div className={modalClass}>
                <h3>{modalTitle}</h3>
                <form onSubmit={submit} className="modal-form">
                    <label>
                        NOME
                        <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} maxLength={31} required />
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
                                {selectCategory(form.type).filter(c=>c!=='Todas as Categorias').map(c => <option key={c}>{c}</option>)}
                            </select>
                        </label>
                    </div>

                    <div className="row">
                        <label>
                            VALOR (R$)
                            <input
                                type="text"
                                inputMode="decimal"
                                value={form.amount}
                                maxLength={11}
                                onChange={(e) => {
                                    let value = e.target.value;

                                    // Remove everything except numbers, "." and ","
                                    value = value.replace(/[^\d.,]/g, "");

                                    // Allow only one decimal separator
                                    const parts = value.split(/[.,]/);
                                    if (parts.length > 2) {
                                        value = parts[0] + "." + parts.slice(1).join("");
                                    }

                                    setForm({ ...form, amount: value });
                                }}
                                onBlur={(e) =>
                                    setForm({
                                        ...form,
                                        amount: formatAmountValue(e.target.value),
                                    })
                                }
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
                        <button type="submit" className="btn primary">{submitButtonText}</button>
                    </div>
                </form>
            </div>

            {confirmOpen && (
                <div className="modal-overlay open" style={{ zIndex: 2400 }}>
                    <div className="modal open" style={{ width: 'min(560px, calc(100% - 32px))' }}>
                        <h3>{isEditing ? "Confirmar atualização" : "Confirmar criação"}</h3>
                        <p>{isEditing ? "Tem certeza que deseja atualizar esta transação?" : "Tem certeza de que deseja criar esta transação?"}</p>
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
