// Datos simulados
        const transactions = [
            { description: "Salario", amount: 2000, type: "income", date: "2023-10-01" },
            { description: "Alquiler", amount: 800, type: "expense", date: "2023-10-05" },
            { description: "Luz", amount: 100, type: "expense", date: "2023-10-10" },
            { description: "Bonificación", amount: 300, type: "income", date: "2023-10-15" },
            { description: "Comida", amount: 150, type: "expense", date: "2023-10-20" },
            { description: "Internet", amount: 60, type: "expense", date: "2023-10-25" }
        ];

        // Calcular totales
        let incomeTotal = 0;
        let expenseTotal = 0;

        transactions.forEach(t => {
            if (t.type === "income") incomeTotal += t.amount;
            else expenseTotal += t.amount;
        });

        const balanceTotal = incomeTotal - expenseTotal;
        const avgDaily = (incomeTotal - expenseTotal) / new Date(2023, 10, 0).getDate();

        document.getElementById("total-income").textContent = `$${incomeTotal.toFixed(2)}`;
        document.getElementById("total-expense").textContent = `$${expenseTotal.toFixed(2)}`;
        document.getElementById("total-balance").textContent = `$${balanceTotal.toFixed(2)}`;
        document.getElementById("avg-daily").textContent = `$${avgDaily.toFixed(2)}`;

        // Mostrar resumen en lista
        const summaryList = document.getElementById("transaction-summary-list");
        summaryList.innerHTML = "";
        transactions.forEach(t => {
            const li = document.createElement("li");
            li.textContent = `${t.description}: ${t.type === "income" ? "+" : "-"}$${t.amount.toFixed(2)} (${t.date})`;
            summaryList.appendChild(li);
        });

        // Gráfico de Torta: Ingresos vs Gastos
        const pieCtx = document.getElementById("pieChart").getContext("2d");
        new Chart(pieCtx, {
            type: "pie",
            data: {
                labels: ["Ingresos", "Gastos"],
                datasets: [{
                    label: "Distribución",
                    data: [incomeTotal, expenseTotal],
                    backgroundColor: ["#27ae60", "#e74c3c"],
                    borderColor: ["#ffffff", "#ffffff"],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: "right"
                    },
                    title: {
                        display: true,
                        text: "Ingresos vs Gastos"
                    }
                }
            }
        });

        // Preparar datos para gráfico de barras (por día)
        const dailyData = {};
        transactions.forEach(t => {
            dailyData[t.date] = (dailyData[t.date] || 0) + (t.type === "income" ? t.amount : -t.amount);
        });

        const barLabels = Object.keys(dailyData).sort();
        const barValues = barLabels.map(date => dailyData[date]);

        // Gráfico de Barras: Balance por día
        const barCtx = document.getElementById("barChart").getContext("2d");
        new Chart(barCtx, {
            type: "bar",
            data: {
                labels: barLabels,
                datasets: [{
                    label: "Balance Diario",
                    data: barValues,
                    backgroundColor: barValues.map(v => v >= 0 ? "#27ae60" : "#e74c3c"),
                    borderRadius: 5
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    title: {
                        display: true,
                        text: "Balance Diario"
                    }
                }
            }
        });