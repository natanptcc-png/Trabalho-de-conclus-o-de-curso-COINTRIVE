import "./index.css";
import TransactionMemo from "../../components/Transactions/TransactionMemo";
import NewTransactionModal from "../../components/Transactions/NewTransactionModal";
import categories from "../../data/categories";
import CategorySelect from "../../components/Transactions/CategorySelect";
import { useState, useMemo, useEffect } from "react";
import * as XLSX from "xlsx/dist/xlsx.full.min.js";
import { showToast } from "../../utils/toast";

export default function Transactions({ items, onAdd, onUpdate, onDelete }) {

    const [query, setQuery] = useState("");
    const [searchFocused, setSearchFocused] = useState(false);
    const [activeTab, setActiveTab] = useState("Todos");
    const [activeCategory, setActiveCategory] = useState("Todas as Categorias");
    const [dateFilter, setDateFilter] = useState("Este Mês");
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [page, setPage] = useState(1);
    const [deleteConfirmId, setDeleteConfirmId] = useState(null);
    const [deleteConfirmDescription, setDeleteConfirmDescription] = useState("");

    useEffect(() => {
        if (deleteConfirmId) {
            document.body.classList.add("modal-open");
        } else {
            document.body.classList.remove("modal-open");
        }
        return () => {
            document.body.classList.remove("modal-open");
        };
    }, [deleteConfirmId]);

    const dateOptions = ["Este Mês", "Último Mês", "Último Ano", "Todo Período"];

    const handleAddItem = async (tx) => {
        try {
            const normalized = await onAdd(tx);
            setPage(1);
            showToast({ type: "success", title: "Transação criada", message: `${normalized.description} foi adicionada com sucesso.` });
            setModalOpen(false);
        } catch (error) {
            showToast({ type: "error", title: "Erro", message: error?.message || "Não foi possível criar a transação." });
        }
    };

    const handleEditItem = async (tx) => {
        try {
            await onUpdate(editingId, tx);
            showToast({ type: "success", title: "Transação atualizada", message: `${tx.description} foi atualizada com sucesso.` });
            setModalOpen(false);
            setEditingId(null);
        } catch (error) {
            showToast({ type: "error", title: "Erro", message: error?.message || "Não foi possível atualizar a transação." });
        }
    };

    const handleDeleteItem = (id, description) => {
        setDeleteConfirmId(id);
        setDeleteConfirmDescription(description || "esta transação");
    };

    const confirmDeleteItem = async () => {
        if (!deleteConfirmId) return;
        try {
            await onDelete(deleteConfirmId);
            showToast({ type: "info", message: "Transação deletada com sucesso." });
        } catch (error) {
            showToast({ type: "error", title: "Erro", message: error?.message || "Não foi possível excluir a transação." });
        } finally {
            setDeleteConfirmId(null);
            setDeleteConfirmDescription("");
        }
    };

    const cancelDeleteConfirmation = () => {
        setDeleteConfirmId(null);
        setDeleteConfirmDescription("");
    };

    const handleExport = () => {
        const rows = filtered.map(tx => ({
            Data: tx.date,
            Descrição: tx.description,
            Categoria: tx.category,
            Tipo: tx.type,
            Valor: tx.amount,
            Método: tx.payment,
            Pago: tx.isPaid
        }));

        const worksheet = XLSX.utils.json_to_sheet(rows);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Transações");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `transacoes-${new Date().toISOString().slice(0, 10)}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);

        showToast({ type: "success", title: "Exportação concluída", message: `${rows.length} transações foram exportadas.` });
    };

    // filtering logic
    const filtered = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);

        return items.filter(t => {
            if (activeTab === "Renda" && t.type !== "Renda") return false;
            if (activeTab === "Gastos" && t.type !== "Gastos") return false;
            if (activeCategory !== "Todas as Categorias" && t.category !== activeCategory) return false;
            if (query && !(t.description + " " + t.category).toLowerCase().includes(query.toLowerCase())) return false;

            const txDate = new Date(t.date);
            if (dateFilter === "Este Mês") {
                return txDate >= startOfMonth && txDate <= endOfMonth;
            }
            if (dateFilter === "Último Mês") {
                return txDate >= startOfLastMonth && txDate <= endOfLastMonth;
            }
            if (dateFilter === "Último Ano") {
                return txDate >= oneYearAgo && txDate <= now;
            }
            return true; // Todo Período
        });
    }, [items, activeTab, activeCategory, query, dateFilter]);

    // pagination
    const pageSize = 10;
    const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
    const pageItems = filtered.slice((page-1)*pageSize, page*pageSize);

    return (
        <div className="transactions-container">

            <div className="transactions-header">
                <h1>Transações</h1>

                <div className="actions">
                    <button className="btn export" onClick={handleExport}>Exportar</button>
                    <button className="btn primary" onClick={() => { setEditingId(null); setModalOpen(true); }}>+ Nova Transação</button>
                </div>
            </div>

            <div className="transactions-controls">
                <div className="tabs-row">
                    <div className="tabs">
                        <button className={`tab ${activeTab==="Todos"?"active":""}`} onClick={()=>{setActiveTab("Todos"); setPage(1);}}>Todos</button>
                        <button className={`tab ${activeTab==="Renda"?"active":""}`} onClick={()=>{setActiveTab("Renda"); setPage(1);}}>Renda</button>
                        <button className={`tab ${activeTab==="Gastos"?"active":""}`} onClick={()=>{setActiveTab("Gastos"); setPage(1);}}>Gastos</button>
                    </div>

                    <button
                        className="mobile-fab mobile-fab-inline"
                        aria-label="Nova Transação"
                        onClick={() => { setEditingId(null); setModalOpen(true); }}
                    >
                        +
                    </button>
                </div>

                <div className="filters">
                    <div className={`floating ${query ? 'filled' : ''} ${searchFocused ? 'focused' : ''}`}>
                        <input
                            placeholder=""
                            value={query}
                            onFocus={() => setSearchFocused(true)}
                            onBlur={() => setSearchFocused(false)}
                            onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                        />
                        <label>Procure por transação, categoria...</label>
                    </div>

                    <CategorySelect options={categories} value={activeCategory} onChange={(v) => { setActiveCategory(v); setPage(1); }} />

                    <CategorySelect options={dateOptions} value={dateFilter} onChange={(v) => { setDateFilter(v); setPage(1); }} />
                </div>
            </div>

            <div className="transactions-table-wrapper">
                <table className="transactions-table">
                    <thead>
                        <tr>
                            <th>DATA</th>
                            <th>DESCRIÇÃO</th>
                            <th>CATEGORIA</th>
                            <th>TIPO</th>
                            <th>VALOR</th>
                            <th>MÉTODO DE PAGAMENTO</th>
                            <th>AÇÕES</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pageItems.map(tx => (
                             <TransactionMemo 
                                key={tx.id} 
                                {...tx} 
                                onEdit={() => { setEditingId(tx.id); setModalOpen(true); }}
                                onDelete={() => handleDeleteItem(tx.id, tx.description)}
                            />
                            
                        ))}
                        
                    </tbody>
                    
                </table>

                {
                    pageItems.length <= 0 &&

                    <div className="table-footer">
                        <p style={{textAlign: "center", width: "100%"}}>Nenhuma transação ativa, que tal criar uma em <b>"Nova Transação"</b>?</p>
                    </div>
                }

                <div className="table-footer">Mostrando {filtered.length} transações</div>

                {pageCount > 1 && (
                    <div className="pagination" style={{display:'flex',gap:8,justifyContent:'flex-end',paddingTop:10}}>
                        <button className="btn" onClick={()=>setPage(p=>Math.max(1,p-1))}>&lt;</button>
                        {Array.from({length:pageCount}).map((_,i) => (
                            <button key={i} className={`btn ${page===i+1? 'primary' : ''}`} onClick={()=>setPage(i+1)}>{i+1}</button>
                        ))}
                        <button className="btn" onClick={()=>setPage(p=>Math.min(pageCount,p+1))}>&gt;</button>
                    </div>
                )}
            </div>

            <NewTransactionModal 
                open={modalOpen} 
                onClose={() => { setModalOpen(false); setEditingId(null); }}
                onAdd={handleAddItem}
                editingItem={editingId ? items.find(i => i.id === editingId) : null}
                onUpdate={handleEditItem}
            />

            {deleteConfirmId && (
                <div className="modal-overlay open" style={{ zIndex: 2400 }}>
                    <div className="modal open" style={{ width: 'min(560px, calc(100% - 32px))' }}>
                        <h3>Excluir Transação</h3>
                        <p>Tem certeza que deseja excluir <strong>{deleteConfirmDescription}</strong>?</p>
                        <div className="modal-actions">
                            <button type="button" className="btn" onClick={cancelDeleteConfirmation}>Cancelar</button>
                            <button type="button" className="btn primary" onClick={confirmDeleteItem}>Excluir</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
