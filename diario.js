        // Simular almacenamiento local simple
        let transactions = [];

        // Cargar formulario al hacer clic en "+"
        document.getElementById("add-transaction").addEventListener("click", () => {
            document.getElementById("overlay").style.display = "block";
            document.getElementById("transaction-form").style.display = "block";
        });

        // Cerrar el formulario si se hace clic fuera
        document.getElementById("overlay").addEventListener("click", (e) => {
            if (e.target === document.getElementById("overlay")) {
                closeForm();
            }
        });

        function closeForm() {
            document.getElementById("overlay").style.display = "none";
            document.getElementById("transaction-form").style.display = "none";
            document.getElementById("transaction-form").reset();
        }

        // Manejar envío del formulario
        document.getElementById("transaction-form").addEventListener("submit", function (e) {
            e.preventDefault();

            const description = this.description.value.trim();
            const amount = parseFloat(this.amount.value);
            const type = this.type.value;
            const date = new Date().toISOString().split('T')[0]; // Fecha actual

            if (!description || isNaN(amount) || !['income', 'expense'].includes(type)) {
                alert("Por favor completa todos los campos correctamente.");
                return;
            }

            transactions.push({
                description,
                amount,
                type,
                date
            });

            closeForm();
            renderDailyTransactions();
        });

        // Eliminar una transacción
        window.deleteTransaction = function(index) {
            transactions.splice(index, 1);
            renderDailyTransactions();
        };

        function renderDailyTransactions() {
            const today = new Date().toISOString().split('T')[0];
            const selectedDate = document.getElementById('daily-date').value || today;

            const dailyTransactions = transactions.filter(transaction => transaction.date === selectedDate);

            const container = document.getElementById('transactions-diario');
            container.innerHTML = '';

            let income = 0;
            let expenses = 0;

            if (dailyTransactions.length === 0) {
                const li = document.createElement('li');
                li.textContent = 'No hay transacciones para esta fecha.';
                container.appendChild(li);
            } else {
                dailyTransactions.forEach((transaction, index) => {
                    const li = document.createElement('li');
                    li.className = transaction.type === 'income' ? 'income' : 'expense';
                    li.innerHTML = `
                        <span>${transaction.description}</span>
                        <span>${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}</span>
                        <button onclick="deleteTransaction(${index})">Eliminar</button>
                    `;
                    container.appendChild(li);

                    if (transaction.type === 'income') {
                        income += transaction.amount;
                    } else {
                        expenses += transaction.amount;
                    }
                });
            }

            document.getElementById('income-diario').textContent = `$${income.toFixed(2)}`;
            document.getElementById('expenses-diario').textContent = `$${expenses.toFixed(2)}`;
            document.getElementById('total-diario').textContent = `$${(income - expenses).toFixed(2)}`;
        }

        // Escuchar cambios en el filtro de fecha
        document.getElementById('daily-date').addEventListener('change', renderDailyTransactions);

        // Inicializar
        renderDailyTransactions();
