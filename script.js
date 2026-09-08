const pedido = {};

document.addEventListener('DOMContentLoaded', () => {
    // Manejo de botones + y -
    document.querySelectorAll('.card').forEach(card => {
        const sabor = card.dataset.nombre;
        const countSpan = card.querySelector('.qty-count');

        card.querySelector('.plus').addEventListener('click', (e) => {
            e.preventDefault();
            pedido[sabor] = (pedido[sabor] || 0) + 1;
            countSpan.textContent = pedido[sabor];
            actualizarBarra();
        });

        card.querySelector('.minus').addEventListener('click', (e) => {
            e.preventDefault();
            if (pedido[sabor] && pedido[sabor] > 0) {
                pedido[sabor]--;
                if (pedido[sabor] === 0) delete pedido[sabor];
                countSpan.textContent = pedido[sabor] || 0;
                actualizarBarra();
            }
        });
    });

    // Abrir Modal de Checkout
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

    // Procesar Formulario y Generar Mensaje para WhatsApp
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

            // Formato de Mensaje Estructurado
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
                mensaje += `• ${cantidad}x ${sabor}\n`;
            }
            
            mensaje += `-------------------------\n`;
            mensaje += `📦 *Total Unidades:* ${totalEmpanadas}\n`;
            if (aplicaPromo) {
                mensaje += `🎉 *Promoción:* ¡Aplica Promo Docena!\n`;
            }

            const urlWA = `https://wa.me/5492644172479?text=${encodeURIComponent(mensaje)}`;
            
            // Cerrar modal y abrir WhatsApp
            modal.classList.add('hidden');
            window.open(urlWA, '_blank');
        });
    }
});

function actualizarBarra() {
    const totalEmpanadas = Object.values(pedido).reduce((a, b) => a + b, 0);
    const orderBar = document.getElementById('order-bar');
    const summaryText = document.getElementById('order-summary-text');
    const promoTag = document.getElementById('order-promo-tag');
    const floatWaBtn = document.getElementById('main-whatsapp-float');

    if (totalEmpanadas > 0) {
        orderBar.classList.remove('hidden');
        summaryText.textContent = `${totalEmpanadas} empanada${totalEmpanadas > 1 ? 's' : ''} seleccionada${totalEmpanadas > 1 ? 's' : ''}`;

        if (floatWaBtn) floatWaBtn.style.bottom = '85px';

        let aplicaPromo = totalEmpanadas >= 12;
        promoTag.textContent = aplicaPromo ? '¡Aplica Promo Docena!' : '';
    } else {
        orderBar.classList.add('hidden');
        if (floatWaBtn) floatWaBtn.style.bottom = '25px';
    }
}