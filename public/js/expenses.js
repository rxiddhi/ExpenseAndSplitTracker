document.addEventListener('DOMContentLoaded', () => {
    if (!api.isAuthenticated()) {
        window.location.href = 'auth.html';
        return;
    }

    // Set default date to today
    document.getElementById('date').valueAsDate = new Date();

    // State
    let currentPage = 1;
    const limit = 10;
    let currentCategory = '';

    // Elements
    const expenseForm = document.getElementById('expense-form');
    const expenseList = document.getElementById('expense-list');
    const filterCategory = document.getElementById('filter-category');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const pageInfo = document.getElementById('page-info');
    const monthlyTotalEl = document.getElementById('monthly-total');

    // Load initial data
    fetchExpenses();
    fetchMonthlySummary();

    // Event Listeners
    expenseForm.addEventListener('submit', handleAddExpense);

    filterCategory.addEventListener('change', (e) => {
        currentCategory = e.target.value;
        currentPage = 1;
        fetchExpenses();
    });

    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            fetchExpenses();
        }
    });

    nextBtn.addEventListener('click', () => {
        currentPage++;
        fetchExpenses();
    });

    // Functions
    async function fetchExpenses() {
        try {
            let query = `?page=${currentPage}&limit=${limit}`;
            if (currentCategory) query += `&category=${currentCategory}`;

            const res = await api.get(`/expenses${query}`);
            const { data, pagination } = res;

            renderExpenses(data);
            updatePagination(pagination);
        } catch (error) {
            console.error(error);
            expenseList.innerHTML = '<p class="error">Failed to load expenses</p>';
        }
    }

    async function fetchMonthlySummary() {
        try {
            const today = new Date();
            const res = await api.get(`/expenses/summary?year=${today.getFullYear()}`);

            const currentMonth = today.getMonth() + 1;
            const monthData = res.data.find(m => m.month === currentMonth);

            monthlyTotalEl.textContent = formatCurrency(monthData ? monthData.totalAmount : 0);
        } catch (error) {
            console.error(error);
        }
    }

    async function handleAddExpense(e) {
        e.preventDefault();

        const data = {
            title: document.getElementById('title').value,
            amount: parseFloat(document.getElementById('amount').value),
            category: document.getElementById('category').value,
            date: document.getElementById('date').value,
            paymentMethod: document.getElementById('payment-method').value
        };

        try {
            await api.post('/expenses', data);

            // Reset form
            expenseForm.reset();
            document.getElementById('date').valueAsDate = new Date();

            // Reload data
            fetchExpenses();
            fetchMonthlySummary();

            showAlert('Expense added successfully', 'success');
        } catch (error) {
            showAlert(error.message);
        }
    }

    async function handleDelete(id) {
        if (!confirm('Are you sure you want to delete this expense?')) return;

        try {
            await api.delete(`/expenses/${id}`);
            fetchExpenses();
            fetchMonthlySummary();
            showAlert('Expense deleted', 'success');
        } catch (error) {
            showAlert(error.message);
        }
    }

    // Expose delete function to global scope for onclick handlers
    window.handleDelete = handleDelete;

    function renderExpenses(expenses) {
        if (expenses.length === 0) {
            expenseList.innerHTML = '<p style="text-align: center; color: #777; padding: 20px;">No expenses found.</p>';
            return;
        }

        expenseList.innerHTML = expenses.map(expense => `
      <li class="expense-item">
        <div class="expense-info">
          <h3>${expense.title} <span style="font-size: 0.8rem; border: 1px solid #777; padding: 2px 6px; color: #000;">${expense.category}</span></h3>
          <div class="expense-meta">
            ${formatDate(expense.date)} • ${expense.paymentMethod}
          </div>
        </div>
        <div style="text-align: right;">
          <div class="expense-amount">-${formatCurrency(expense.amount)}</div>
          <button onclick="handleDelete('${expense._id}')" style="background: none; border: 1px solid #000; font-size: 0.8rem; cursor: pointer;">Delete</button>
        </div>
      </li>
    `).join('');
    }

    function updatePagination(pagination) {
        currentPage = pagination.page;
        pageInfo.textContent = `Page ${pagination.page} of ${pagination.pages || 1}`;

        prevBtn.disabled = currentPage <= 1;
        nextBtn.disabled = currentPage >= pagination.pages;
    }
});
