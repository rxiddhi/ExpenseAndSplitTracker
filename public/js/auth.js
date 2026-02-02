document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('auth-form');
    const toggleBtn = document.getElementById('toggle-auth');
    const formTitle = document.getElementById('form-title');
    const nameGroup = document.getElementById('name-group');
    const toggleText = document.getElementById('toggle-text');

    // Check URL params for mode
    const urlParams = new URLSearchParams(window.location.search);
    let isRegister = urlParams.get('mode') === 'register';

    updateUI();

    toggleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        isRegister = !isRegister;
        updateUI();
    });

    function updateUI() {
        if (isRegister) {
            formTitle.textContent = 'Register';
            nameGroup.style.display = 'block';
            toggleText.textContent = 'Already have an account?';
            toggleBtn.textContent = 'Login';
            document.getElementById('name').required = true;
        } else {
            formTitle.textContent = 'Login';
            nameGroup.style.display = 'none';
            toggleText.textContent = "Don't have an account?";
            toggleBtn.textContent = 'Register';
            document.getElementById('name').required = false;
        }
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            let result;

            if (isRegister) {
                const name = document.getElementById('name').value;
                result = await api.post('/auth/register', { email, password, name });
            } else {
                result = await api.post('/auth/login', { email, password });
            }

            if (result.success) {
                // Store token and user info
                localStorage.setItem('token', result.data.token);
                localStorage.setItem('user', JSON.stringify(result.data.user));

                // Redirect
                window.location.href = 'index.html';
            }
        } catch (error) {
            showAlert(error.message);
        }
    });
});
