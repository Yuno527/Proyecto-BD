document.addEventListener('DOMContentLoaded', function() {
    // Alternar entre login y registro
    document.getElementById('showRegister').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('loginForm').classList.add('oculto');
        document.getElementById('registerForm').classList.remove('oculto');
    });

    document.getElementById('showLogin').addEventListener('click', function(e) {
        e.preventDefault();
        document.getElementById('registerForm').classList.add('oculto');
        document.getElementById('loginForm').classList.remove('oculto');
    });

    // Manejar login
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const nombre = document.getElementById('loginNombre').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const response = await fetch('login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nombre, password })
            });

            const data = await response.json();
            if (data.success) {
                // Guardar usuario en localStorage
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
                // Redirigir a la página principal
                window.location.href = 'index.html';
            } else {
                alert(data.message || 'Error al iniciar sesión');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al conectar con el servidor');
        }
    });

    // Manejar registro
    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        const nombre = document.getElementById('regNombre').value;
        const password = document.getElementById('regPassword').value;
        const direccion = document.getElementById('regDireccion').value;
        const edad = document.getElementById('regEdad').value;

        try {
            const response = await fetch('register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ nombre, password, direccion, edad })
            });

            const data = await response.json();
            if (data.success) {
                alert('Registro exitoso. Por favor inicia sesión.');
                document.getElementById('registerForm').classList.add('oculto');
                document.getElementById('loginForm').classList.remove('oculto');
            } else {
                alert(data.message || 'Error al registrar');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al conectar con el servidor');
        }
    });
});