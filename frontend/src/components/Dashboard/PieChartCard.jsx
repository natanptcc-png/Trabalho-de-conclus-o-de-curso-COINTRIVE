import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";

import { Doughnut } from "react-chartjs-2";
import { useMemo } from "react";

ChartJS.register(
    ArcElement,
    Tooltip,
    Legend
);

const centerTextPlugin = {
    id: "centerText",

    afterDraw(chart) {

        const { ctx, chartArea } = chart;

        if (!chartArea) return;

        const total = chart.data.datasets[0].data.reduce(
            (acc, value) => acc + value,
            0
        );

        const centerX = (chartArea.left + chartArea.right) / 2;
        const centerY = (chartArea.top + chartArea.bottom) / 2;

        ctx.save();

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        ctx.fillStyle = "#64748b";
        ctx.font = "600 13px system-ui";
        ctx.fillText("Total", centerX, centerY - 12);

        ctx.fillStyle = "#1e293b";
        ctx.font = "700 15px system-ui";

        ctx.fillText(
            `R$ ${total.toLocaleString("pt-BR", {
                minimumFractionDigits: 2
            })}`,
            centerX,
            centerY + 10
        );

        ctx.restore();
    }
};

export default function PieChartCard({ items = [] }) {

    // Calculate expense distribution
    const chartData = useMemo(() => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        const categoryExpenses = {};

        items.forEach(item => {
            if (item.type === "Gastos") {
                const txDate = new Date(item.date);
                if (txDate >= startOfMonth && txDate <= endOfMonth) {
                    const amount = parseFloat(item.amount.replace(/[^\d.-]/g, ""));
                    if (!categoryExpenses[item.category]) {
                        categoryExpenses[item.category] = 0;
                    }
                    categoryExpenses[item.category] += Math.abs(amount);
                }
            }
        });

        const labels = Object.keys(categoryExpenses);
        const data = Object.values(categoryExpenses);

        return { labels, data };
    }, [items]);

    const colors = [
        "#4dbf51",
        "#2196F3",
        "#FF9800",
        "#E91E63",
        "#9C27B0",
        "#00BCD4",
        "#8BC34A",
        "#FFC107",
    ];

    const data = {
        labels: chartData.labels.length === 0 ? ["Sem dados"] : chartData.labels,
        datasets: [
            {
                data: chartData.data.length === 0 ? [1] : chartData.data,
                backgroundColor: chartData.labels.length === 0 
                    ? ["#e6e9ef"]
                    : chartData.labels.map((_, i) => colors[i % colors.length]),
                borderWidth: 0,
                hoverOffset: 6
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,

        cutout: "65%",

        layout: {
            padding: 0
        },

        plugins: {

            legend: {
                position: "bottom",

                labels: {
                    usePointStyle: true,
                    pointStyle: "rect",

                    boxWidth: 14,
                    boxHeight: 14,

                    padding: 14,

                    font: {
                        size: 13
                    }
                }
            },

            tooltip: {
                callbacks: {
                    label: (context) =>
                        `${context.label}: R$ ${context.raw.toLocaleString(
                            "pt-BR",
                            {
                                minimumFractionDigits: 2
                            }
                        )}`
                }
            }
        }
    };

    return (
        <div className="chart-wrapper">

            <h2>Distribuição de Gastos</h2>

            <div className="pie-container">

                <Doughnut
                    data={data}
                    options={options}
                    plugins={[centerTextPlugin]}
                />

            </div>

        </div>
    );
}