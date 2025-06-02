document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const showRegister = document.getElementById('showRegister');
    const showLogin = document.getElementById('showLogin');

    // Alternar entre login y registro
    showRegister.addEventListener('click', function(e) {
        e.preventDefault();
        loginForm.classList.add('oculto');
        registerForm.classList.remove('oculto');
    });

    showLogin.addEventListener('click', function(e) {
        e.preventDefault();
        registerForm.classList.add('oculto');
        loginForm.classList.remove('oculto');
    });

    // Manejar registro
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const userData = {
            nombre: document.getElementById('regNombre').value,
            contraseña: document.getElementById('regPassword').value,
            direccion: document.getElementById('regDireccion').value,
            edad: document.getElementById('regEdad').value
        };

        fetch('php/register.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        })
        .then(response => {
            if(!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                alert('Registro exitoso! Por favor inicia sesión.');
                registerForm.reset();
                registerForm.classList.add('oculto');
                loginForm.classList.remove('oculto');
            } else {
                alert('Error: ' + (data.message || 'Error desconocido'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error en el registro. Por favor verifica tus datos.');
        });
    });

    // Manejar login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const loginData = {
            nombre: document.getElementById('loginNombre').value,
            contraseña: document.getElementById('loginPassword').value
        };

        fetch('php/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
        })
        .then(response => {
            if(!response.ok) {
                throw new Error('Error en la respuesta del servidor');
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
                window.location.href = 'index.html';
            } else {
                alert('Error: ' + (data.message || 'Credenciales incorrectas'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error en el servidor. Por favor intenta más tarde.');
        });
    });
});