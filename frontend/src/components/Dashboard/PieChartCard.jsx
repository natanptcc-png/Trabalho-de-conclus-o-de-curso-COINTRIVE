import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend
} from "chart.js";

import { Doughnut } from "react-chartjs-2";

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

export default function PieChartCard() {

    const data = {
        labels: [
            "Netflix",
            "Internet",
            "Eletricidade",
            "Spotify"
        ],

        datasets: [
            {
                data: [69.99, 180, 200, 59.99],

                backgroundColor: [
                    "#4dbf51",
                    "#2196F3",
                    "#FF9800",
                    "#E91E63"
                ],

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