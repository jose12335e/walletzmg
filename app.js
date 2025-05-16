// =============================
// 1. Inicialización de Firebase
// =============================
const transactionsRef = db.collection("transactions");

// =============================
// 2. Configuración de Vistas
// =============================
const views = ['diario', 'calendario', 'semanal', 'mensual', 'resumen', 'reporte'];

function hideAllViews() {
    views.forEach(view => {
        const element = document.getElementById(`view-${view}`);
        if (element) element.classList.remove('active');
    });
}

function showView(viewName) {
    hideAllViews();
    const element = document.getElementById(`view-${viewName}`);
    if (element) element.classList.add('active');

    // Cargar contenido según la vista
    if (viewName === 'diario') loadDailyTransactions();
    if (viewName === 'resumen') loadGeneralSummary();
}

document.querySelectorAll('[id^="btn-"]').forEach(button => {
    const viewName = button.id.replace('btn-', '');
    if (views.includes(viewName)) {
        button.addEventListener('click', () => showView(viewName));
    }
});

// =============================
// 3. Modal de Agregar Transacción
// =============================
document.getElementById("add-transaction").addEventListener("click", () => {
    document.getElementById("overlay").style.display = "block";
    document.getElementById("transaction-form").style.display = "block";
});

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

    // Guardar en Firebase
    transactionsRef.add({
        description,
        amount,
        type,
        date
    });

    closeForm();
});

// =============================
// 4. Renderizado de Transacciones
// =============================
window.deleteTransaction = function(index) {
    const transactionId = transactions[index].id; // ID de Firestore
    db.collection("transactions").doc(transactionId).delete();
}

function renderTransactions(transactions) {
    const transactionList = document.getElementById('transactions');
    transactionList.innerHTML = '';

    let income = 0;
    let expenses = 0;

    if (transactions.length === 0) {
        const li = document.createElement('li');
        li.textContent = "No hay transacciones registradas.";
        transactionList.appendChild(li);
    } else {
        transactions.forEach((transaction, index) => {
            const li = document.createElement('li');
            li.className = transaction.type === 'income' ? 'income' : 'expense';
            li.innerHTML = `
                <span>${transaction.description}</span>
                <span>${transaction.type === 'income' ? '+' : '-'}$${transaction.amount.toFixed(2)}</span>
                <button onclick="deleteTransaction(${index})">Eliminar</button>
            `;
            transactionList.appendChild(li);

            if (transaction.type === 'income') {
                income += transaction.amount;
            } else {
                expenses += transaction.amount;
            }
        });
    }

    document.getElementById('income').textContent = `$${income.toFixed(2)}`;
    document.getElementById('expenses').textContent = `$${expenses.toFixed(2)}`;
    document.getElementById('total').textContent = `$${(income - expenses).toFixed(2)}`;
}

// =============================
// 5. Cargar transacciones del día
// =============================
function loadDailyTransactions() {
    const today = new Date().toISOString().split('T')[0];

    transactionsRef.where("date", "==", today)
        .onSnapshot(snapshot => {
            const transactions = [];
            snapshot.forEach(doc => {
                const data = doc.data();
                data.id = doc.id;
                transactions.push(data);
            });
            renderTransactions(transactions);
        });
}

// =============================
// 6. Cargar resúmenes generales
// =============================
function loadGeneralSummary() {
    transactionsRef.get().then(snapshot => {
        let income = 0;
        let expenses = 0;

        snapshot.forEach(doc => {
            const t = doc.data();
            if (t.type === 'income') income += t.amount;
            if (t.type === 'expense') expenses += t.amount;
        });

        document.getElementById('income').textContent = `$${income.toFixed(2)}`;
        document.getElementById('expenses').textContent = `$${expenses.toFixed(2)}`;
        document.getElementById('total').textContent = `$${(income - expenses).toFixed(2)}`;
    });
}

// =============================
// 7. Escuchar cambios en tiempo real
// =============================
transactionsRef.onSnapshot(() => {
    if (document.getElementById('view-resumen')?.classList.contains('active')) {
        loadGeneralSummary();
    }
});

// =============================
// 8. Navegación entre vistas
// =============================
const routes = {
    'btn-diario': 'diario.html',
    'btn-calendario': 'calendario.html',
    'btn-semanal': 'semanal.html',
    'btn-metas': 'metas.html',
    'btn-resumen': 'resumen.html',
    'btn-reporte': 'reporte.html'
};

Object.keys(routes).forEach(id => {
    const button = document.getElementById(id);
    if (button) {
        button.addEventListener('click', () => {
            window.location.href = routes[id];
        });
    }
});

// =============================
// 9. Inicialización
// =============================
loadGeneralSummary();
showView('resumen'); // Vista por defecto