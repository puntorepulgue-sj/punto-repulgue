let pedido = {};

document.addEventListener('DOMContentLoaded', () => {
    // 1. Manejo de botones + y - en las tarjetas
    document.querySelectorAll('.card').forEach(card => {
        const sabor = card.dataset.nombre;
        const countSpan = card.querySelector('.qty-count');

        const plusBtn = card.querySelector('.plus');
        const minusBtn = card.querySelector('.minus');

        if (plusBtn) {
            plusBtn.addEventListener('click', (e) => {
                e.preventDefault();
                pedido[sabor] = (pedido[sabor] || 0) + 1;
                countSpan.textContent = pedido[sabor];
                actualizarBarra();
            });
        }

        if (minusBtn) {
            minusBtn.addEventListener('click', (e) => {
                e.preventDefault();
                if (pedido[sabor] && pedido[sabor] > 0) {
                    pedido[sabor]--;
                    if (pedido[sabor] === 0) delete pedido[sabor];
                    countSpan.textContent = pedido[sabor] || 0;
                    actualizarBarra();
                }
            });
        }
    });

    // 2. Abrir Modal de Checkout
    const sendOrderBtn = document.getElementById('send-order-btn');
    const modal = document.getElementById('checkout-modal');
    const closeModal = document.getElementById('close-modal');

    if (sendOrderBtn) {
        sendOrderBtn.addEventListener('click', (e) => {
            e.preventDefault();
            modal.classList.remove('hidden');
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    }

    // 3. Procesar Formulario de Entrega y Enviar a WhatsApp
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = document.getElementById('cliente-nombre').value.trim();
            const direccion = document.getElementById('cliente-direccion').value.trim();
            const pago = document.getElementById('cliente-pago').value;
            const notas = document.getElementById('cliente-notas').value.trim();

            const totalEmpanadas = Object.values(pedido).reduce((a, b) => a + b, 0);
            let aplicaPromo = totalEmpanadas >= 12;

            // Construir Mensaje para WhatsApp
            let mensaje = `*NUEVO PEDIDO - PUNTO REPULGUE*\n\n`;
            mensaje += `👤 *Cliente:* ${nombre}\n`;
            mensaje += `📍 *Dirección:* ${direccion}\n`;
            mensaje += `💳 *Pago:* ${pago}\n`;
            if (notas) {
                mensaje += `📝 *Notas:* ${notas}\n`;
            }
            
            mensaje += `\n-------------------------\n`;
            mensaje += `📋 *DETALLE DEL PEDIDO:*\n`;
            for (const [sabor, cantidad] of Object.entries(pedido)) {
                if (cantidad > 0) {
                    mensaje += `• ${cantidad}x${sabor}\n`;
                }
            }
            
            mensaje += `-------------------------\n`;
            mensaje += `📦 *Total Unidades:* ${totalEmpanadas}\n`;
            if (aplicaPromo) {
                mensaje += `🎉 *Promoción:* ¡Aplica Promo Docena!\n`;
            }

            const urlWA = `https://wa.me/5492644172479?text=${encodeURIComponent(mensaje)}`;

            // PASO A: Resetear la página e interfaz a 0 inmediatamente
            resetearPedido();

            // PASO B: Ocultar modal de formulario
            modal.classList.add('hidden');

            // PASO C: Mostrar modal de éxito
            const confirmModal = document.getElementById('success-modal');
            if (confirmModal) {
                confirmModal.classList.remove('hidden');
            }

            // PASO D: Redirigir/Abrir WhatsApp con un leve retraso para asegurar renderizado de interfaz
            setTimeout(() => {
                window.open(urlWA, '_blank');
            }, 100);
        });
    }

    // 4. Cerrar el modal de confirmación
    const closeSuccessBtn = document.getElementById('close-success-modal');
    if (closeSuccessBtn) {
        closeSuccessBtn.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('success-modal').classList.add('hidden');
        });
    }
});

// Función global para actualizar la barra inferior flotante
function actualizarBarra() {
    const totalEmpanadas = Object.values(pedido).reduce((a, b) => a + b, 0);
    const orderBar = document.getElementById('order-bar');
    const summaryText = document.getElementById('order-summary-text');
    const promoTag = document.getElementById('order-promo-tag');
    const floatWaBtn = document.getElementById('main-whatsapp-float');

    if (totalEmpanadas > 0) {
        if (orderBar) orderBar.classList.remove('hidden');
        if (summaryText) {
            summaryText.textContent = `${totalEmpanadas} empanada${totalEmpanadas > 1 ? 's' : ''} seleccionada${totalEmpanadas > 1 ? 's' : ''}`;
        }

        if (floatWaBtn) floatWaBtn.style.bottom = '85px';

        let aplicaPromo = totalEmpanadas >= 12;
        if (promoTag) {
            promoTag.textContent = aplicaPromo ? '¡Aplica Promo Docena!' : '';
        }
    } else {
        if (orderBar) orderBar.classList.add('hidden');
        if (floatWaBtn) floatWaBtn.style.bottom = '25px';
    }
}

// Función encargada de limpiar estado y contadores
function resetearPedido() {
    // Vaciar objeto de pedido
    pedido = {};

    // Poner contadores de las tarjetas visualmente en 0
    document.querySelectorAll('.qty-count').forEach(span => {
        span.textContent = '0';
    });

    // Limpiar campos del formulario
    const form = document.getElementById('checkout-form');
    if (form) form.reset();

    // Ocultar barra flotante
    actualizarBarra();
}