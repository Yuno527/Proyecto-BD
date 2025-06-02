document.getElementById('registerForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const errorElement = document.getElementById('error-message');
    errorElement.textContent = '';
    
    const regData = {
        nombre: document.getElementById('regNombre').value.trim(),
        contraseña: document.getElementById('regPassword').value,
        direccion: document.getElementById('regDireccion').value.trim(),
        edad: parseInt(document.getElementById('regEdad').value)
    };

    // Validación del lado del cliente
    if(!regData.nombre || !regData.contraseña || !regData.direccion || !regData.edad) {
        errorElement.textContent = 'Todos los campos son requeridos';
        return;
    }

    if(regData.nombre.length < 3) {
        errorElement.textContent = 'El nombre debe tener al menos 3 caracteres';
        return;
    }

    if(regData.contraseña.length < 6) {
        errorElement.textContent = 'La contraseña debe tener al menos 6 caracteres';
        return;
    }

    if(regData.edad < 12 || regData.edad > 120) {
        errorElement.textContent = 'La edad debe estar entre 12 y 120 años';
        return;
    }

    try {
        const response = await fetch('php/register.php', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(regData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Error en la solicitud');
        }

        if (data.success) {
            alert('Usuario registrado correctamente. Por favor inicia sesión.');
            window.location.href = 'login.html';
        } else {
            errorElement.textContent = data.message || 'Error en el registro';
        }
    } catch (error) {
        console.error('Error:', error);
        errorElement.textContent = 'Error en el servidor. Por favor intenta más tarde.';
    }
});