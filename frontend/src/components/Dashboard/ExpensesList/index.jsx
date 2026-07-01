import "./index.css"

export default function ExpensesList() {
    const expenses = [
        {
            item: "Netflix", custo: "69,00" , data: "22-06-2026"
        },
        {
            item: "Internet", custo: "180,00" , data: "12-06-2026"
        },
        {
            item: "Eletricidade", custo: "200,00" , data: "15-06-2026"
        },
        {
            item: "Spotify", custo: "59,99" , data: "25-06-2026"
        }
    ];

    return (
        <>
            <h2>Gastos Recentes</h2>

            <ul>
                {expenses.map((exp, index) => (
                    <div key={index}>
                        <li>
                            <span style={{lineHeight: '2', fontSize: '1.5em'}}><b>{exp.item}</b></span> <br /> 
                            <i><strong> R${exp.custo} </strong></i> <br />
                            {exp.data}
                        </li>
                    </div>
                ))}
            </ul>
        </>
    );
}