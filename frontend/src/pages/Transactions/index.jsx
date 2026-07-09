import "./index.css";
import TransactionMemo from "../../components/Transactions/TransactionMemo";
import NewTransactionModal from "../../components/Transactions/NewTransactionModal";
import categories from "../../data/categories";
import CategorySelect from "../../components/Transactions/CategorySelect";
import { useState, useMemo } from "react";

export default function Transactions() {

    const [query, setQuery] = useState("");
    const [searchFocused, setSearchFocused] = useState(false);
    const [activeTab, setActiveTab] = useState("Todos");
    const [activeCategory, setActiveCategory] = useState("Todas as Categorias");
    const [dateFilter, setDateFilter] = useState("Este Mês");
    const [modalOpen, setModalOpen] = useState(false);
    const [page, setPage] = useState(1);

    const dateOptions = ["Este Mês", "Último Mês", "Último Ano", "Todo Período"];

    const [items, setItems] = useState(() => {
        // seed with some sample data
        return [
            { id: 1, date: "2026-01-02", description: "Salary", category: "Renda", type: "Renda", amount: "+ R$ 8.500,00", payment: "Salário" },
            { id: 2, date: "2026-01-03", description: "Supermarket", category: "Comida", type: "Gastos", amount: "- R$ 156,80", payment: "Débito" },
            { id: 3, date: "2026-01-03", description: "Uber", category: "Transporte", type: "Gastos", amount: "- R$ 45,90", payment: "Débito" },
        ];
    });

    const addItem = (tx) => {
        // normalize and store
        const normalized = {
            ...tx,
            type: tx.type,
            category: tx.category,
            amount: tx.amount.startsWith("+") || tx.amount.startsWith("-") ? tx.amount : (tx.type === "Renda" ? `+ R$ ${tx.amount}` : `- R$ ${tx.amount}`),
            date: tx.date,
        };
        setItems(prev => [normalized, ...prev]);
        setPage(1);
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
                    <button className="btn export">Exportar</button>
                    <button className="btn primary" onClick={() => setModalOpen(true)}>+ Nova Transação</button>
                </div>
            </div>

            <div className="transactions-controls">
                <div className="tabs">
                    <button className={`tab ${activeTab==="Todos"?"active":""}`} onClick={()=>{setActiveTab("Todos"); setPage(1);}}>Todos</button>
                    <button className={`tab ${activeTab==="Renda"?"active":""}`} onClick={()=>{setActiveTab("Renda"); setPage(1);}}>Renda</button>
                    <button className={`tab ${activeTab==="Gastos"?"active":""}`} onClick={()=>{setActiveTab("Gastos"); setPage(1);}}>Gastos</button>
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
                        </tr>
                    </thead>
                    <tbody>
                        {pageItems.map(tx => (
                            <TransactionMemo key={tx.id} {...tx} />
                        ))}
                    </tbody>
                </table>

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

            <NewTransactionModal open={modalOpen} onClose={() => setModalOpen(false)} onAdd={addItem} />

            {/* Mobile floating action button */}
            <button
                className="mobile-fab"
                aria-label="Nova Transação"
                onClick={() => setModalOpen(true)}
            >
                +
            </button>

        </div>
    );
}
