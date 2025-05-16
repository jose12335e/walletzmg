let savingsGoals = [];

        const goalForm = document.getElementById("goal-form");
        const goalsContainer = document.getElementById("goals-container");

        // Manejar el envío del formulario
        goalForm.addEventListener("submit", function(e) {
            e.preventDefault();

            const name = this["goal-name"].value.trim();
            const amount = parseFloat(this["goal-amount"].value);
            const date = this["goal-date"].value;

            if (!name || isNaN(amount) || !date) {
                alert("Por favor completa todos los campos.");
                return;
            }

            savingsGoals.push({
                name,
                amount,
                saved: 0,
                date,
            });

            this.reset();
            renderGoals();
        });

        // Eliminar una meta
        window.deleteGoal = function(index) {
            savingsGoals.splice(index, 1);
            renderGoals();
        };

        // Actualizar monto ahorrado (opcional)
        window.addSaved = function(index) {
            const amount = prompt("¿Cuánto quieres añadir a esta meta?");
            const parsedAmount = parseFloat(amount);

            if (!isNaN(parsedAmount)) {
                savingsGoals[index].saved += parsedAmount;
                renderGoals();
            }
        };

        // Renderizar las metas
        function renderGoals() {
            goalsContainer.innerHTML = "";

            if (savingsGoals.length === 0) {
                goalsContainer.innerHTML = "<p>No hay metas definidas aún.</p>";
                return;
            }

            savingsGoals.forEach((goal, index) => {
                const progress = Math.min((goal.saved / goal.amount) * 100, 100);

                const card = document.createElement("div");
                card.className = "goal-card";

                card.innerHTML = `
                    <h3>${goal.name}</h3>
                    <div class="goal-details">
                        <p>Monto objetivo: <strong>$${goal.amount.toFixed(2)}</strong></p>
                        <p>Monto ahorrado: <strong>$${goal.saved.toFixed(2)}</strong></p>
                        <p>Fecha límite: ${goal.date}</p>
                    </div>
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${progress}%;"></div>
                    </div>
                    <div class="goal-actions">
                        <button onclick="addSaved(${index})"><i class="fas fa-plus"></i> Añadir Ahorro</button>
                        <button onclick="deleteGoal(${index})"><i class="fas fa-trash-alt"></i> Eliminar</button>
                    </div>
                `;
                goalsContainer.appendChild(card);
            });
        }

        // Inicializar
        renderGoals();