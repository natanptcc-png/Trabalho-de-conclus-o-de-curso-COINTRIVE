const categories = [
    "Todas as Categorias",
    "Alimentos",
    "Aluguel",
    "Auxílio",
    "Comércio",
    "Comissão",
    "Contas",
    "Educação",
    "Empréstimo",
    "Entretenimento",
    "Pensão",
    "Reembolso",
    "Salário",
    "Saúde",
    "Saldo/Carteira",
    "Transporte",
    "Utilidades",
    "Outros",
];

const renda_categories = [
    "Todas as Categorias",
    "Auxílio",
    "Comércio",
    "Comissão",
    "Empréstimo",
    "Pensão",
    "Reembolso",
    "Salário",
    "Saldo/Carteira",
    "Outros",
];

const gasto_categories = [
    "Todas as Categorias",
    "Alimentos",
    "Aluguel",
    "Contas",
    "Educação",
    "Entretenimento",
    "Saúde",
    "Transporte",
    "Utilidades",
    "Outros",
];

function selectCategory(type) {
    if (type === "Renda") {
        return renda_categories
    } else if (type === "Gastos") {
        return gasto_categories
    } else {
        return categories
    }
}

export default selectCategory;
