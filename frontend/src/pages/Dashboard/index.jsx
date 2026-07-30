import "./index.css";
import StatsCarousel from "../../components/Dashboard/StatsCarousel";
import ExpensesList from "../../components/Dashboard/ExpensesList";
import PieChartCard from "../../components/Dashboard/PieChartCard";
import TopExpenses from "../../components/Dashboard/TopExpenses";

export default function Dashboard({ items, userProfile, onNavigate }) {
    return (
        <div className="dashboard-container">

            <div className="welcome-container">

                <h1>Dashboard</h1>
                <p>👋 Bem-vindo de volta {userProfile?.firstName}!</p>

            </div>

            <StatsCarousel items={items} />

            <div className="content-grid">

                <div className="card expenses-card">
                    <ExpensesList items={items} onNavigate={onNavigate} />
                </div>

                <div className="card chart-card">
                    <TopExpenses items={items} />
                </div>

                <div className="card chart-card pie-full">
                    <PieChartCard items={items} />
                </div>

            </div>
        </div>
    );
}