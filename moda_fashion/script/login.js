document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = '';
    
    const loginData = {
        nombre: document.getElementById('loginNombre').value.trim(),
        contraseña: document.getElementById('loginPassword').value
    };

    // Validación básica del lado del cliente
    if(!loginData.nombre || !loginData.contraseña) {
        errorElement.textContent = 'Todos los campos son requeridos';
        return;
    }

    try {
        const response = await fetch('php/login.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(loginData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error en la solicitud');
        }

        if (data.success) {
            localStorage.setItem('usuario', JSON.stringify(data.usuario));
            window.location.href = 'index.html';
        } else {
            errorElement.textContent = data.message || 'Credenciales incorrectas';
        }
    } catch (error) {
        console.error('Error:', error);
        errorElement.textContent = 'Error en el servidor. Por favor intenta más tarde.';
    }
});