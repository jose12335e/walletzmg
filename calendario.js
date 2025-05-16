// Referencia a la colección de transacciones
const transactionsRef = db.collection("transactions");

let selectedDate = new Date().toISOString().split('T')[0];

// Escuchar cambios en tiempo real
transactionsRef.onSnapshot(snapshot => {
    const allTransactions = [];
    snapshot.forEach(doc => allTransactions.push({ id: doc.id, ...doc.data() }));

    // Recargar calendario y transacciones si hay cambios
    const today = new Date();
    generateCalendar(today.getFullYear(), today.getMonth(), allTransactions);
    if (document.getElementById("calendar-view").classList.contains("active")) {
        renderTransactionsForDate(selectedDate, allTransactions);
    }
});

// Cargar calendario dinámico
function generateCalendar(year, month, transactions = []) {
    const calendar = document.getElementById("calendar-view");
    calendar.innerHTML = "";

    const firstDay = new Date(year, month).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    dayNames.forEach(day => {
        const div = document.createElement("div");
        div.className = "calendar-day header";
        div.textContent = day;
        calendar.appendChild(div);
    });

    for (let i = 0; i < firstDay; i++) {
        const empty = document.createElement("div");
        calendar.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const div = document.createElement("div");
        div.className = "calendar-day";
        div.textContent = day;

        // Detectar tipos de transacción desde el arreglo pasado como parámetro
        const dailyTransactions = transactions.filter(t => t.date === dateStr);
        const hasIncome = dailyTransactions.some(t => t.type === "income");
        const hasExpense = dailyTransactions.some(t => t.type === "expense");

        if (hasIncome && !hasExpense) {
            div.classList.add("income-only");
        } else if (!hasIncome && hasExpense) {
            div.classList.add("expense-only");
        } else if (hasIncome && hasExpense) {
            div.classList.add("both");
        }

        div.dataset.date = dateStr;

        if (dateStr === selectedDate) {
            div.classList.add("selected");
        }

        div.addEventListener("click", () => {
            document.querySelectorAll(".calendar-day").forEach(d => d.classList.remove("selected"));
            div.classList.add("selected");
            selectedDate = dateStr;
            renderTransactionsForDate(dateStr, transactions);
        });

        calendar.appendChild(div);
    }
}

// Renderizar transacciones del día seleccionado
function renderTransactionsForDate(date = selectedDate, transactions = []) {
    const container = document.getElementById("transactions-calendar");
    container.innerHTML = "";

    let income = 0;
    let expenses = 0;

    const dailyTransactions = transactions.filter(t => t.date === date);

    if (dailyTransactions.length === 0) {
        const li = document.createElement("li");
        li.textContent = "No hay transacciones para este día.";
        container.appendChild(li);
    } else {
        dailyTransactions.forEach(t => {
            const li = document.createElement("li");
            li.className = t.type === "income" ? "income" : "expense";
            li.innerHTML = `
                <span>${t.description}</span>
                <span>${t.type === "income" ? "+" : "-"}$${t.amount.toFixed(2)}</span>
                <button onclick="deleteTransaction('${t.id}')">Eliminar</button>
            `;
            container.appendChild(li);

            if (t.type === "income") income += t.amount;
            if (t.type === "expense") expenses += t.amount;
        });
    }

    document.getElementById("income-calendar").textContent = `$${income.toFixed(2)}`;
    document.getElementById("expenses-calendar").textContent = `$${expenses.toFixed(2)}`;
    document.getElementById("total-calendar").textContent = `$${(income - expenses).toFixed(2)}`;
}

// Eliminar una transacción
window.deleteTransaction = function(transactionId) {
    db.collection("transactions").doc(transactionId).delete()
        .then(() => console.log("Transacción eliminada"))
        .catch(err => console.error("Error al eliminar:", err));
};

// Abrir modal
document.getElementById("add-transaction").addEventListener("click", () => {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("transaction-form").style.display = "block";

    // Asignar fecha actual al formulario
    document.getElementById("transaction-form").setAttribute("data-date", selectedDate);
});

// Cerrar modal
function closeForm() {
    document.getElementById("overlay").style.display = "none";
    document.getElementById("transaction-form").style.display = "none";
    document.getElementById("transaction-form").reset();
}

document.getElementById("overlay").addEventListener("click", (e) => {
    if (e.target === document.getElementById("overlay")) closeForm();
});

// Agregar nueva transacción
document.getElementById("transaction-form").addEventListener("submit", function(e) {
    e.preventDefault();

    const description = this.description.value.trim();
    const amount = parseFloat(this.amount.value);
    const type = this.type.value;
    const date = this.getAttribute("data-date");

    if (!description || isNaN(amount) || !['income', 'expense'].includes(type)) {
        alert("Completa todos los campos.");
        return;
    }

    transactionsRef.add({
        description,
        amount,
        type,
        date
    });

    closeForm();
});

// Configurar selector de mes
flatpickr("#monthPicker", {
    locale: "es",
    dateFormat: "Y-m",
    onChange: function(selectedDates) {
        const [year, month] = selectedDates[0].toISOString().split("T")[0].split("-");
        transactionsRef.get().then(snapshot => {
            const allTransactions = [];
            snapshot.forEach(doc => allTransactions.push({ id: doc.id, ...doc.data() }));
            generateCalendar(parseInt(year), parseInt(month) - 1, allTransactions);
            renderTransactionsForDate(`${year}-${month}-01`, allTransactions);
        });
    }
});

// Inicialización
document.addEventListener("DOMContentLoaded", () => {
    transactionsRef.get().then(snapshot => {
        const allTransactions = [];
        snapshot.forEach(doc => allTransactions.push({ id: doc.id, ...doc.data() }));
        const today = new Date();
        generateCalendar(today.getFullYear(), today.getMonth(), allTransactions);
        renderTransactionsForDate(selectedDate, allTransactions);
    });
});