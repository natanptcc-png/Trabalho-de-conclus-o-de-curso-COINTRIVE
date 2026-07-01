import { useState, useEffect, useRef } from "react";
import "./index.css";

export default function StatsCarousel() {
    const cards = [
        {
            title: "RENDA",
            value: "R$ 8.500,00",
            icon: "/icons/renda.png",
            className: "income"
        },
        {
            title: "GASTOS",
            value: "R$ 3.200,00",
            icon: "/icons/gastos.png",
            className: "expense"
        },
        {
            title: "CARTEIRA",
            value: "R$ 4.300,00",
            icon: "/icons/carteira.png",
            className: "wallet"
        }
    ];

    const [current, setCurrent] = useState(0);
    const intervalRef = useRef(null);

    const startAutoPlay = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        intervalRef.current = setInterval(() => {
            setCurrent(prev => (prev + 1) % cards.length);
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
                            transform: `translateX(-${current * 100}%)`
                        }}
                    >
                        {cards.map((card, index) => (
                            <div
                                key={index}
                                className={`card stat-card ${card.className}`}
                            >
                                <img
                                    src={card.icon}
                                    alt={card.title}
                                />

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
                        className={`dot ${
                            current === index ? "active" : ""
                        }`}
                        onClick={() => handleDotClick(index)}
                        aria-label={`Ir para o card ${index + 1}`}
                    />
                ))}
            </div>
        </>
    );
}