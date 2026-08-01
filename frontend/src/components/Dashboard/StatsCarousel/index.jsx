import { useState, useEffect, useRef, useMemo } from "react";
import "./index.css";

export default function StatsCarousel({ items = [], walletValue }) {
  // Calculate current month stats
  const stats = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0,
      23,
      59,
      59,
      999,
    );

    let totalIncome = 0;
    let totalExpenses = 0;

    items.forEach((item) => {
      const txDate = new Date(item.date);
      if (txDate >= startOfMonth && txDate <= endOfMonth) {
        const amount = parseFloat(item.amount.replace(/[^\d.-]/g, ""));
        if (item.type === "Renda") {
          totalIncome += amount;
        } else if (item.type === "Gastos") {
          totalExpenses += Math.abs(amount);
        }
      }
    });

    // Ensure walletValue is a number
    let netSavings =
      typeof walletValue === "number"
        ? walletValue
        : parseFloat(walletValue) || 0;

    if (netSavings < 0) {
      netSavings = 0.0;
    }

    return {
      income: totalIncome,
      expenses: totalExpenses,
      wallet: netSavings,
    };
  }, [items, walletValue]);

  const cards = [
    {
      title: "RENDA",
      value: `R$ ${stats.income.toFixed(2).replace(".", ",")}`,
      icon: "/icons/renda.png",
      className: "income",
    },
    {
      title: "GASTOS",
      value: `R$ ${stats.expenses.toFixed(2).replace(".", ",")}`,
      icon: "/icons/gastos.png",
      className: "expense",
    },
    {
      title: "CARTEIRA",
      value: `R$ ${stats.wallet.toFixed(2).replace(".", ",")}`,
      icon: "/icons/carteira.png",
      className: "wallet",
    },
  ];

  const [current, setCurrent] = useState(0);
  const intervalRef = useRef(null);

  const startAutoPlay = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      setCurrent((prev) => (prev + 1) % cards.length);
    }, 5000);
  };

  useEffect(() => {
    startAutoPlay();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const handleDotClick = (index) => {
    setCurrent(index);
    startAutoPlay();
  };

  return (
    <>
      <div className="carousel-wrapper">
        <div className="carousel-container">
          <div
            className="carousel-track"
            style={{
              transform: `translateX(-${current * 100}%)`,
            }}
          >
            {cards.map((card, index) => (
              <div key={index} className={`card stat-card ${card.className}`}>
                <img src={card.icon} alt={card.title} />

                <div className="card-content">
                  <h4>{card.title}</h4>
                  <span>{card.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="carousel-dots">
        {cards.map((_, index) => (
          <button
            key={index}
            className={`dot ${current === index ? "active" : ""}`}
            onClick={() => handleDotClick(index)}
            aria-label={`Ir para o card ${index + 1}`}
          />
        ))}
      </div>
    </>
  );
}