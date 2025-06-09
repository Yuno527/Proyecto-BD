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
                localStorage.setItem('usuario', JSON.stringify(data.usuario));
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
        
        // Obtener valores del formulario
        const formData = {
            nombre: document.getElementById('regNombre').value.trim(),
            contraseña: document.getElementById('regPassword').value.trim(),
            direccion: document.getElementById('regDireccion').value.trim(),
            edad: parseInt(document.getElementById('regEdad').value)
        };

        // Validar que todos los campos estén llenos
        if (!formData.nombre || !formData.contraseña || !formData.direccion || !formData.edad) {
            alert('Por favor complete todos los campos');
            return;
        }

        // Validar edad
        if (isNaN(formData.edad) || formData.edad < 1) {
            alert('Por favor ingrese una edad válida');
            return;
        }

        // Mostrar mensaje de carga
        const submitButton = this.querySelector('button[type="submit"]');
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = 'Registrando...';
        submitButton.disabled = true;

        try {
            console.log('Enviando datos de registro:', formData);
            
            const response = await fetch('register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();
            console.log('Respuesta del servidor:', data);
            
            if (data.success) {
                alert('Registro exitoso. Por favor inicia sesión.');
                // Limpiar el formulario
                document.getElementById('registerForm').reset();
                // Cambiar al formulario de login
                document.getElementById('registerForm').classList.add('oculto');
                document.getElementById('loginForm').classList.remove('oculto');
            } else {
                alert(data.message || 'Error al registrar');
            }
        } catch (error) {
            console.error('Error en el registro:', error);
            alert('Error al conectar con el servidor');
        } finally {
            // Restaurar el botón
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }
    });
});