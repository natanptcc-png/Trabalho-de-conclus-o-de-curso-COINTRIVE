import "./index.css";
import { useMemo, useState } from "react";
import { Bar, Pie } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from "chart.js";
import * as XLSX from "xlsx";
import { showToast } from "../../utils/toast";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Reports({ items, userProfile }) {
    const [selectedPeriod, setSelectedPeriod] = useState("Este Mês");
    const periodOptions = ["Este Mês", "Último Mês", "Último Ano", "Todo Período"];

    // Filter items by period
    const filteredItems = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        const oneYearAgo = new Date(now);
        oneYearAgo.setFullYear(now.getFullYear() - 1);

        return items.filter(t => {
            const txDate = new Date(t.date);
            if (selectedPeriod === "Este Mês") {
                return txDate >= startOfMonth && txDate <= endOfMonth;
            }
            if (selectedPeriod === "Último Mês") {
                return txDate >= startOfLastMonth && txDate <= endOfLastMonth;
            }
            if (selectedPeriod === "Último Ano") {
                return txDate >= oneYearAgo && txDate <= now;
            }
            return true; // Todo Período
        });
    }, [items, selectedPeriod]);

    // Calculate statistics
    const stats = useMemo(() => {
        let totalIncome = 0;
        let totalExpenses = 0;
        const categoryExpenses = {};

        filteredItems.forEach(item => {
            const amount = parseFloat(item.amount.replace(/[^\d.-]/g, ""));
            if (item.type === "Renda") {
                totalIncome += amount;
            } else if (item.type === "Gastos") {
                totalExpenses += Math.abs(amount);
                if (!categoryExpenses[item.category]) {
                    categoryExpenses[item.category] = 0;
                }
                categoryExpenses[item.category] += Math.abs(amount);
            }
        });

        const netSavings = totalIncome - totalExpenses;
        const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : 0;

        return { totalIncome, totalExpenses, netSavings, savingsRate, categoryExpenses };
    }, [filteredItems]);

    // Group expenses by week for income vs expenses chart
    const weeklyData = useMemo(() => {
        const weeks = {};
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        filteredItems.forEach(item => {
            const txDate = new Date(item.date);
            const diffTime = Math.abs(txDate - startOfMonth);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            const week = Math.ceil(diffDays / 7);
            const weekKey = `Week ${week}`;

            if (!weeks[weekKey]) {
                weeks[weekKey] = { income: 0, expenses: 0 };
            }

            const amount = parseFloat(item.amount.replace(/[^\d.-]/g, ""));
            if (item.type === "Renda") {
                weeks[weekKey].income += amount;
            } else if (item.type === "Gastos") {
                weeks[weekKey].expenses += Math.abs(amount);
            }
        });

        return weeks;
    }, [filteredItems]);

    // Prepare chart data
    const incomeVsExpensesChart = {
        labels: Object.keys(weeklyData),
        datasets: [
            {
                label: "Renda",
                data: Object.values(weeklyData).map(w => w.income),
                backgroundColor: "#10b981",
                borderRadius: 8,
            },
            {
                label: "Gastos",
                data: Object.values(weeklyData).map(w => w.expenses),
                backgroundColor: "#ef4444",
                borderRadius: 8,
            },
        ],
    };

    const expenseDistributionChart = {
        labels: Object.keys(stats.categoryExpenses),
        datasets: [
            {
                data: Object.values(stats.categoryExpenses),
                backgroundColor: [
                    "#f59e0b",
                    "#ef4444",
                    "#8b5cf6",
                    "#ec4899",
                    "#06b6d4",
                    "#10b981",
                    "#3b82f6",
                    "#f97316",
                    "#6366f1",
                ],
                borderColor: getComputedStyle(document.documentElement).getPropertyValue('--bg-card') || 'white',
                borderWidth: 2,
            },
        ],
    };

    const rootStyles = getComputedStyle(document.body);
    const primaryText = (rootStyles.getPropertyValue('--text-primary') || '#1e293b').trim();
    const bgCard = (rootStyles.getPropertyValue('--bg-card') || '#ffffff').trim();

    const barOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { labels: { color: primaryText } },
            tooltip: { titleColor: primaryText, bodyColor: primaryText, backgroundColor: bgCard }
        },
        scales: {
            x: { ticks: { color: primaryText }, grid: { color: 'rgba(0,0,0,0.06)' } },
            y: { ticks: { color: primaryText }, grid: { color: 'rgba(0,0,0,0.06)' } }
        }
    };

    const pieOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: { labels: { color: primaryText } },
            tooltip: { titleColor: primaryText, bodyColor: primaryText, backgroundColor: bgCard }
        }
    };

    const handleDownloadReport = () => {
        const data = [
            {
                "Período": selectedPeriod,
                "Data de Geração": new Date().toLocaleDateString("pt-BR"),
                "Renda Total": `R$ ${stats.totalIncome.toFixed(2)}`,
                "Gastos Totais": `R$ ${stats.totalExpenses.toFixed(2)}`,
                "Poupança Líquida": `R$ ${stats.netSavings.toFixed(2)}`,
                "Taxa de Poupança": `${stats.savingsRate}%`,
            },
        ];

        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, "Resumo");

        const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
        const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `relatorio-${selectedPeriod.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.xlsx`;
        link.click();
        window.URL.revokeObjectURL(url);

        showToast({ type: "success", message: "Relatório baixado com sucesso." });
    };

    return (
        <div className="reports-container">
            <div className="reports-header">
                <h1>Relatórios</h1>
                <div className="period-selector">
                    <select value={selectedPeriod} onChange={(e) => setSelectedPeriod(e.target.value)}>
                        {periodOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                    <button className="btn primary" onClick={handleDownloadReport}>Baixar Relatório</button>
                </div>
            </div>

            <div className="overview-cards">
                <div className="card">
                    <h3>Renda Total</h3>
                    <p className="value income">R$ {stats.totalIncome.toFixed(2)}</p>
                </div>
                <div className="card">
                    <h3>Gastos Totais</h3>
                    <p className="value expense">R$ {stats.totalExpenses.toFixed(2)}</p>
                </div>
                <div className="card">
                    <h3>Poupança Líquida</h3>
                    <p className="value savings">R$ {stats.netSavings.toFixed(2)}</p>
                </div>
                <div className="card">
                    <h3>Taxa de Poupança</h3>
                    <p className="value">{stats.savingsRate}%</p>
                </div>
            </div>

            <div className="charts-grid">
                <div className="chart-container">
                    <h2>Renda vs Gastos</h2>
                    <Bar data={incomeVsExpensesChart} options={barOptions} />
                </div>

                <div className="chart-container">
                    <h2>Distribuição de Gastos</h2>
                    <Pie data={expenseDistributionChart} options={pieOptions} />
                </div>
            </div>

            <div className="category-breakdown">
                <h2>Gastos por Categoria</h2>
                <div className="category-list">
                    {Object.entries(stats.categoryExpenses)
                        .sort(([, a], [, b]) => b - a)
                        .map(([category, amount]) => (
                            <div key={category} className="category-item">
                                <span>{category}</span>
                                <span>R$ {amount.toFixed(2)}</span>
                            </div>
                        ))}
                </div>
            </div>
        </div>
    );
}
