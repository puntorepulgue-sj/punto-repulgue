document.addEventListener('DOMContentLoaded', () => {
    // Configuración
    const TELEFONO_WHATSAPP = '5492644172479';
    const COSTO_ENVIO_DELIVERY = 1500;

    // Estado del carrito
    let carrito = {};

    // Elementos del DOM
    const orderBar = document.getElementById('order-bar');
    const orderSummaryText = document.getElementById('order-summary-text');
    const orderTotalPrice = document.getElementById('order-total-price');
    const sendOrderBtn = document.getElementById('send-order-btn');

    // Modal Checkout
    const checkoutModal = document.getElementById('checkout-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const checkoutForm = document.getElementById('checkout-form');
    
    // Opciones Entrega y Campos
    const radioRetiro = document.getElementById('entrega-retiro');
    const radioDelivery = document.getElementById('entrega-delivery');
    const direccionContainer = document.getElementById('direccion-container');
    const clienteDireccionInput = document.getElementById('cliente-direccion');
    const gaseosaOptionGroup = document.getElementById('gaseosa-option-group');

    // Desglose Totales Modal
    const modalSubtotalEl = document.getElementById('modal-subtotal');
    const modalEnvioEl = document.getElementById('modal-envio');
    const modalTotalFinalEl = document.getElementById('modal-total-final');

    // Modal Éxito
    const successModal = document.getElementById('success-modal');
    const closeSuccessModalBtn = document.getElementById('close-success-modal');

    // 1. Manejo de Incremento / Decremento en las Tarjetas
    const cards = document.querySelectorAll('.card');

    cards.forEach(card => {
        const nombre = card.dataset.nombre;
        const precio = parseInt(card.dataset.precio, 10);
        const minusBtn = card.querySelector('.minus');
        const plusBtn = card.querySelector('.plus');
        const qtyCount = card.querySelector('.qty-count');

        plusBtn.addEventListener('click', () => {
            if (!carrito[nombre]) {
                carrito[nombre] = { precio, cantidad: 0 };
            }
            carrito[nombre].cantidad += 1;
            qtyCount.textContent = carrito[nombre].cantidad;
            actualizarEstadoCarrito();
        });

        minusBtn.addEventListener('click', () => {
            if (carrito[nombre] && carrito[nombre].cantidad > 0) {
                carrito[nombre].cantidad -= 1;
                qtyCount.textContent = carrito[nombre].cantidad;
                if (carrito[nombre].cantidad === 0) {
                    delete carrito[nombre];
                }
                actualizarEstadoCarrito();
            }
        });
    });

    // 2. Cálculo del Subtotal y Actualización de la Barra Flotante
    function obtenerSubtotal() {
        return Object.values(carrito).reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    }

    function obtenerCantidadTotal() {
        return Object.values(carrito).reduce((acc, item) => acc + item.cantidad, 0);
    }

    function tieneComboConGaseosa() {
        return Object.keys(carrito).some(nombre => 
            nombre.toLowerCase().includes('gaseosa') || nombre.toLowerCase().includes(' full ')
        );
    }

    function actualizarEstadoCarrito() {
        const cantTotal = obtenerCantidadTotal();
        const subtotal = obtenerSubtotal();

        if (cantTotal > 0) {
            orderSummaryText.textContent = `${cantTotal} ítem${cantTotal > 1 ? 's' : ''} seleccionado${cantTotal > 1 ? 's' : ''}`;
            orderTotalPrice.textContent = `Total: $${subtotal.toLocaleString('es-AR')}`;
            orderBar.classList.remove('hidden');
        } else {
            orderBar.classList.add('hidden');
        }
    }

    // 3. Función para reiniciar todo a 0
    function vaciarCarrito() {
        carrito = {};
        document.querySelectorAll('.qty-count').forEach(el => {
            el.textContent = '0';
        });
        actualizarEstadoCarrito();
        checkoutForm.reset();
        radioRetiro.checked = true;
        actualizarOpcionesEnvio();
    }

    // 4. Alternar visibilidad de campos de envío en el Formulario
    function actualizarOpcionesEnvio() {
        const esDelivery = radioDelivery.checked;
        
        if (esDelivery) {
            direccionContainer.style.display = 'flex';
            clienteDireccionInput.setAttribute('required', 'true');
        } else {
            direccionContainer.style.display = 'none';
            clienteDireccionInput.removeAttribute('required');
        }
        actualizarTotalesModal();
    }

    radioRetiro.addEventListener('change', actualizarOpcionesEnvio);
    radioDelivery.addEventListener('change', actualizarOpcionesEnvio);

    // 5. Actualizar Desglose de Totales en el Modal
    function actualizarTotalesModal() {
        const subtotal = obtenerSubtotal();
        const costoEnvio = radioDelivery.checked ? COSTO_ENVIO_DELIVERY : 0;
        const totalFinal = subtotal + costoEnvio;

        modalSubtotalEl.textContent = `$${subtotal.toLocaleString('es-AR')}`;
        modalEnvioEl.textContent = `$${costoEnvio.toLocaleString('es-AR')}`;
        modalTotalFinalEl.textContent = `$${totalFinal.toLocaleString('es-AR')}`;
    }

    // 6. Apertura y Cierre de Modales
    sendOrderBtn.addEventListener('click', () => {
        if (tieneComboConGaseosa()) {
            gaseosaOptionGroup.style.display = 'flex';
        } else {
            gaseosaOptionGroup.style.display = 'none';
        }

        actualizarOpcionesEnvio();
        checkoutModal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        checkoutModal.classList.add('hidden');
    });

    closeSuccessModalBtn.addEventListener('click', () => {
        successModal.classList.add('hidden');
        vaciarCarrito();
    });

    // 7. Envío del Formulario a WhatsApp y Reset del Pedido
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nombreCliente = document.getElementById('cliente-nombre').value.trim();
        const esDelivery = radioDelivery.checked;
        const tipoEntregaTexto = esDelivery ? 'Delivery (Gran San Juan)' : 'Retiro en Local';
        const direccion = esDelivery ? document.getElementById('cliente-direccion').value.trim() : '';
        const formaPago = document.getElementById('cliente-pago').value;
        const notas = document.getElementById('cliente-notas').value.trim();
        const gaseosaElegida = document.getElementById('cliente-gaseosa').value;

        const subtotal = obtenerSubtotal();
        const costoEnvio = esDelivery ? COSTO_ENVIO_DELIVERY : 0;
        const totalFinal = subtotal + costoEnvio;

        // Construir mensaje detallado para WhatsApp
        let mensaje = `*NUEVO PEDIDO - PUNTO REPULGUE*\n\n`;
        mensaje += `👤 *Cliente:* ${nombreCliente}\n`;
        mensaje += `🛵 *Entrega:* ${tipoEntregaTexto}\n`;
        if (esDelivery) {
            mensaje += `📍 *Dirección:* ${direccion}\n`;
        }
        mensaje += `💳 *Pago:* ${formaPago}\n\n`;

        mensaje += `📋 *DETALLE DEL PEDIDO:*\n`;
        Object.entries(carrito).forEach(([nombre, item]) => {
            mensaje += `• ${item.cantidad}x ${nombre} ($${(item.precio * item.cantidad).toLocaleString('es-AR')})\n`;
        });

        if (tieneComboConGaseosa()) {
            mensaje += `\n🥤 *Gaseosa elegida:* ${gaseosaElegida}\n`;
        }

        if (notas) {
            mensaje += `\n📝 *Aclaraciones:* ${notas}\n`;
        }

        mensaje += `\n-----------------------------\n`;
        mensaje += `Subtotal: $${subtotal.toLocaleString('es-AR')}\n`;
        mensaje += `Envío: $${costoEnvio.toLocaleString('es-AR')}\n`;
        mensaje += `*TOTAL FINAL: $${totalFinal.toLocaleString('es-AR')}*\n`;

        const url = `https://wa.me/${TELEFONO_WHATSAPP}?text=${encodeURIComponent(mensaje)}`;

        // Ocultar modal checkout
        checkoutModal.classList.add('hidden');

        // Detectar si es dispositivo móvil para elegir el método de redirección adecuado
        const esMovil = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (esMovil) {
            // En celular vaciamos y redirigimos inmediatamente (evita bloqueo de emergentes)
            vaciarCarrito();
            window.location.href = url;
        } else {
            // En PC mostramos el modal de éxito y abrimos en una nueva pestaña
            successModal.classList.remove('hidden');
            setTimeout(() => {
                window.open(url, '_blank');
                vaciarCarrito();
            }, 800);
        }
    });
});