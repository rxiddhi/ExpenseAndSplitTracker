document.addEventListener('DOMContentLoaded', () => {
    if (!api.isAuthenticated()) {
        window.location.href = 'auth.html';
        return;
    }

    // Elements
    const groupsListEl = document.getElementById('groups-list');
    const createGroupForm = document.getElementById('create-group-form');

    const groupsSection = document.getElementById('groups-list-section');
    const detailsSection = document.getElementById('group-details-section');

    // Group Details Elements
    const groupNameTitle = document.getElementById('group-name-title');
    const memberListEl = document.getElementById('member-list');
    const groupExpensesEl = document.getElementById('group-expenses-list');
    const addMemberBtn = document.getElementById('add-member-btn');
    const newMemberEmail = document.getElementById('new-member-email');
    const groupExpenseForm = document.getElementById('group-expense-form');

    // Balances Elements
    const receivablesList = document.getElementById('receivables-list');
    const debtsList = document.getElementById('debts-list');

    // State
    let currentGroupId = null;

    // Initial Load
    fetchGroups();
    fetchBalances();

    // Listeners
    createGroupForm.addEventListener('submit', handleCreateGroup);
    addMemberBtn.addEventListener('click', handleAddMember);
    groupExpenseForm.addEventListener('submit', handleAddGroupExpense);

    // --- Group List Functions ---

    async function fetchGroups() {
        try {
            const res = await api.get('/groups');
            renderGroups(res.data);
        } catch (error) {
            console.error(error);
            groupsListEl.innerHTML = '<p class="error">Failed to load groups</p>';
        }
    }

    function renderGroups(groups) {
        if (groups.length === 0) {
            groupsListEl.innerHTML = '<p>You represent no groups yet.</p>';
            return;
        }

        groupsListEl.innerHTML = groups.map(group => `
        <li class="expense-item" style="cursor: pointer;" onclick="openGroup('${group._id}')">
          <div class="expense-info">
            <h3>${group.name}</h3>
            <div class="expense-meta">
              ${group.members.length} members
            </div>
          </div>
          <div>
            <span class="btn btn-small">View</span>
          </div>
        </li>
      `).join('');
    }

    async function handleCreateGroup(e) {
        e.preventDefault();
        const name = document.getElementById('group-name').value;

        try {
            await api.post('/groups', { name });
            document.getElementById('group-name').value = '';
            fetchGroups();
            showAlert('Group created!', 'success');
        } catch (error) {
            showAlert(error.message);
        }
    }

    // --- Single Group view functions ---

    // Exposed to global scope for onclick attributes
    window.openGroup = async (groupId) => {
        currentGroupId = groupId;
        groupsSection.style.display = 'none';
        detailsSection.style.display = 'block';

        try {
            const res = await api.get(`/groups/${groupId}`);
            const group = res.data;

            groupNameTitle.textContent = group.name;
            renderMembers(group.members);

            fetchGroupExpenses(groupId);
        } catch (error) {
            showAlert(error.message);
            closeGroup(); // Go back if error
        }
    };

    window.closeGroup = () => {
        currentGroupId = null;
        detailsSection.style.display = 'none';
        groupsSection.style.display = 'block';
    };

    function renderMembers(members) {
        memberListEl.innerHTML = members.map(m => `<li>${m.name} (${m.email})</li>`).join('');
    }

    async function handleAddMember() {
        if (!currentGroupId) return;
        const email = newMemberEmail.value;
        if (!email) return;

        try {
            await api.post(`/groups/${currentGroupId}/members`, { email });
            newMemberEmail.value = '';

            // Refresh group details
            window.openGroup(currentGroupId);
            showAlert('Member added!', 'success');
        } catch (error) {
            showAlert(error.message);
        }
    }

    async function fetchGroupExpenses(groupId) {
        try {
            const res = await api.get(`/group-expenses/group/${groupId}`);
            renderGroupExpenses(res.data);
        } catch (error) {
            console.error(error);
        }
    }

    function renderGroupExpenses(expenses) {
        if (expenses.length === 0) {
            groupExpensesEl.innerHTML = '<p>No expenses in this group yet.</p>';
            return;
        }

        groupExpensesEl.innerHTML = expenses.map(ex => `
        <li class="expense-item">
            <div class="expense-info">
              <h3>${ex.description}</h3>
              <div class="expense-meta">
                ${formatDate(ex.date)} • Paid by <strong>${ex.paidBy.name}</strong>
              </div>
            </div>
            <div class="expense-amount">
                ${formatCurrency(ex.totalAmount)}
            </div>
        </li>
      `).join('');
    }

    async function handleAddGroupExpense(e) {
        e.preventDefault();
        if (!currentGroupId) return;

        const description = document.getElementById('g-desc').value;
        const totalAmount = document.getElementById('g-amount').value;

        try {
            await api.post('/group-expenses', {
                groupId: currentGroupId,
                description,
                totalAmount
            });

            // Clear form
            document.getElementById('g-desc').value = '';
            document.getElementById('g-amount').value = '';

            // Refresh UI
            fetchGroupExpenses(currentGroupId);
            fetchBalances(); // Update balances globally
            showAlert('Expense added & split!', 'success');
        } catch (error) {
            showAlert(error.message);
        }
    }

    // --- Balances Functions ---

    async function fetchBalances() {
        try {
            const [receivablesRes, debtsRes] = await Promise.all([
                api.get('/group-expenses/balances/who-owes-me'),
                api.get('/group-expenses/balances/whom-i-owe')
            ]);

            renderReceivables(receivablesRes.data);
            renderDebts(debtsRes.data);
        } catch (error) {
            console.error('Failed to fetch balances', error);
        }
    }

    function renderReceivables(items) {
        if (items.length === 0) {
            receivablesList.innerHTML = '<li>Everyone is settled up!</li>';
            return;
        }

        receivablesList.innerHTML = items.map(item => `
        <li style="margin-bottom: 8px; font-size: 0.9rem; border-bottom: 1px dotted #ccc; padding-bottom: 5px;">
          <strong>${item.owedBy.name}</strong> owes you 
          <strong>${formatCurrency(item.amount)}</strong>
          <br><span style="font-size: 0.8rem;">for ${item.description}</span>
          <button onclick="handleSettle('${item.splitId}')" style="margin-left: 5px; font-size: 0.7rem; cursor: pointer;">Mark Settled</button>
        </li>
      `).join('');
    }

    function renderDebts(items) {
        if (items.length === 0) {
            debtsList.innerHTML = '<li>You don\'t owe anything!</li>';
            return;
        }

        debtsList.innerHTML = items.map(item => `
          <li style="margin-bottom: 8px; font-size: 0.9rem; border-bottom: 1px dotted #ccc; padding-bottom: 5px;">
            You owe <strong>${item.owedTo.name}</strong> 
            <strong>${formatCurrency(item.amount)}</strong>
            <br><span style="font-size: 0.8rem;">for ${item.description}</span>
          </li>
        `).join('');
    }

    window.handleSettle = async (splitId) => {
        if (!confirm('Mark this debt as fully paid/received?')) return;

        try {
            await api.request(`/group-expenses/settle/${splitId}`, 'PATCH');
            fetchBalances();
            showAlert('Marked as settled.', 'success');
        } catch (error) {
            showAlert(error.message);
        }
    };
});
