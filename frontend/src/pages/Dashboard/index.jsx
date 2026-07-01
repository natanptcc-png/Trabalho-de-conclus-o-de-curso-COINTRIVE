import "./index.css";
import StatsCarousel from "../../components/Dashboard/StatsCarousel";
import ExpensesList from "../../components/Dashboard/ExpensesList";
import PieChartCard from "../../components/Dashboard/PieChartCard";

export default function Dashboard() {
    return (
        <div className="dashboard-container">

            <div className="welcome-container">

                <h1>Dashboard</h1>
                <p>👋Bem vindo de volta Pedro!</p>

            </div>

            <StatsCarousel />

            <div className="content-grid">

                <div className="card expenses-card">
                    <ExpensesList />
                </div>

                <div className="card chart-card">
                    <PieChartCard />
                </div>

                <div className="card chart-card">
                    <PieChartCard />
                </div>

                <div className="card chart-card">
                    <PieChartCard />
                </div>

            </div>
        </div>
    );
}