// IMPORTANTE: Cambia esta URL por tu Apps Script
const API_URL = 'https://script.google.com/macros/s/AKfycbwP8rTzYGaJ0NJveHomc3MgW6EFtR9Id4z3cFaabb4XdggBQLx7/B9pBUxaCCSGlQneQ/exec';


let productoSeleccionado = null;

window.addEventListener('load', cargarProductos);

async function cargarProductos() {
    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        document.getElementById('loading').style.display = 'none';

        if (data.productos && data.productos.length > 0) {
            mostrarProductos(data.productos);
        } else {
            document.getElementById('productos').innerHTML = '<div class="loading">😔 No hay productos disponibles</div>';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('loading').innerHTML = '❌ Error al cargar productos';
    }
}

function mostrarProductos(productos) {
    const container = document.getElementById('productos');
    container.innerHTML = '';

    productos.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'producto-card';
        
        card.innerHTML = `
            <img src="${producto.foto || 'https://via.placeholder.com/300x250?text=Sin+Imagen'}" 
                 alt="${producto.nombre}" 
                 class="producto-imagen"
                 onerror="this.src='https://via.placeholder.com/300x250?text=PlayStation'">
            <div class="producto-info">
                <div class="producto-nombre">${producto.nombre}</div>
                <div class="producto-precio">$${producto.precio}</div>
                <div class="producto-stock">📦 ${producto.cantidad} disponibles</div>
                <button class="btn-comprar" onclick='abrirModal(${JSON.stringify(producto)})'>
                    🛒 Comprar Ahora
                </button>
            </div>
        `;
        
        container.appendChild(card);
    });
}

function abrirModal(producto) {
    productoSeleccionado = producto;
    
    document.getElementById('modal-producto').innerHTML = `
        <p><strong>Producto:</strong> ${producto.nombre}</p>
        <p><strong>Precio:</strong> $${producto.precio}</p>
    `;
    
    document.getElementById('modal').style.display = 'block';
}

function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('input-nombre').value = '';
    document.getElementById('input-telefono').value = '';
    document.getElementById('input-ciudad').value = '';
}

async function confirmarPedido() {
    const nombre = document.getElementById('input-nombre').value.trim();
    const telefono = document.getElementById('input-telefono').value.trim();
    const ciudad = document.getElementById('input-ciudad').value.trim();

    if (!nombre || !telefono || !ciudad) {
        alert('⚠️ Por favor completa todos los campos');
        return;
    }

    try {
        const response = await fetch(API_URL.replace('?format=json', ''), {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'registrarPedidoBot',
                cliente: nombre,
                telefono: telefono,
                ciudad: ciudad,
                nombreProducto: productoSeleccionado.nombre,
                producto: `1x ${productoSeleccionado.nombre}`,
                precio: productoSeleccionado.precio
            })
        });

        const result = await response.json();

        if (result.status === 'success') {
            alert('✅ ¡Pedido registrado! Te contactaremos pronto.');
            cerrarModal();
            cargarProductos();
        } else {
            alert('❌ Error al registrar el pedido. Intenta de nuevo.');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('❌ Error de conexión. Intenta de nuevo.');
    }
}

window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        cerrarModal();
    }
}
