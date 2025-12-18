// URL de tu Apps Script
const API_URL = 'https://script.google.com/macros/s/AKfycbwuR6_u4dMFlgyRp6fiworpJCtRjBCdTos2zVfbeRrdmu7dOsaYwUwcvFebogJMbWM/exec';

let productoSeleccionado = null;

window.addEventListener('load', cargarProductos);

// Usar JSONP en lugar de fetch para evitar CORS
function cargarProductos() {
    const script = document.createElement('script');
    script.src = API_URL + '?format=json&callback=procesarProductos';
    document.body.appendChild(script);
}

// Callback que recibe los datos
function procesarProductos(data) {
    document.getElementById('loading').style.display = 'none';

    if (data.productos && data.productos.length > 0) {
        mostrarProductos(data.productos);
    } else {
        document.getElementById('productos').innerHTML = '<div class="loading">😔 No hay productos disponibles</div>';
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
                <div class="producto-precio">$${Number(producto.precio).toLocaleString('es-CO')}</div>
                <div class="producto-stock">📦 ${producto.cantidad} disponibles</div>
                <button class="btn-comprar" onclick='abrirModal(${JSON.stringify(producto).replace(/'/g, "&apos;")})'>
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
        <p><strong>Precio:</strong> $${Number(producto.precio).toLocaleString('es-CO')}</p>
    `;
    
    document.getElementById('modal').style.display = 'block';
}

function cerrarModal() {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('input-nombre').value = '';
    document.getElementById('input-telefono').value = '';
    document.getElementById('input-ciudad').value = '';
}

function confirmarPedido() {
    const nombre = document.getElementById('input-nombre').value.trim();
    const telefono = document.getElementById('input-telefono').value.trim();
    const ciudad = document.getElementById('input-ciudad').value.trim();

    if (!nombre || !telefono || !ciudad) {
        alert('⚠️ Por favor completa todos los campos');
        return;
    }

    // Crear formulario oculto para enviar POST
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = API_URL;
    form.target = 'hidden_iframe';
    
    const campos = {
        action: 'registrarPedidoBot',
        cliente: nombre,
        telefono: telefono,
        ciudad: ciudad,
        nombreProducto: productoSeleccionado.nombre,
        producto: `1x ${productoSeleccionado.nombre}`,
        precio: productoSeleccionado.precio
    };

    for (let key in campos) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = campos[key];
        form.appendChild(input);
    }

    document.body.appendChild(form);

    // Crear iframe oculto
    if (!document.getElementById('hidden_iframe')) {
        const iframe = document.createElement('iframe');
        iframe.name = 'hidden_iframe';
        iframe.id = 'hidden_iframe';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
    }

    form.submit();
    
    alert('✅ ¡Pedido registrado! Te contactaremos pronto.');
    cerrarModal();
    
    setTimeout(() => {
        cargarProductos();
        document.body.removeChild(form);
    }, 1000);
}

window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target === modal) {
        cerrarModal();
    }
}
