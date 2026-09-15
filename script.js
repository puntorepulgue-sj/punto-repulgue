document.addEventListener('DOMContentLoaded', () => {
    const cards = document.querySelectorAll('.card');
    const orderBar = document.getElementById('order-bar');
    const orderSummaryText = document.getElementById('order-summary-text');
    const orderTotalPrice = document.getElementById('order-total-price');
    const sendOrderBtn = document.getElementById('send-order-btn');
    const whatsappFloat = document.getElementById('main-whatsapp-float');

    const checkoutModal = document.getElementById('checkout-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const checkoutForm = document.getElementById('checkout-form');
    const gaseosaGroup = document.getElementById('gaseosa-option-group');
    
    const successModal = document.getElementById('success-modal');
    const closeSuccessModalBtn = document.getElementById('close-success-modal');

    // Estructura: { nombre: { cantidad: Number, precioUnitario: Number } }
    const cart = {};
    const WHATSAPP_PHONE = "5492644172479";

    cards.forEach(card => {
        const nombre = card.getAttribute('data-nombre');
        const precioUnitario = parseFloat(card.getAttribute('data-precio')) || 0;
        const btnMinus = card.querySelector('.minus');
        const btnPlus = card.querySelector('.plus');
        const qtyCount = card.querySelector('.qty-count');

        btnPlus.addEventListener('click', () => {
            const currentQty = (cart[nombre] ? cart[nombre].cantidad : 0) + 1;

            cart[nombre] = {
                cantidad: currentQty,
                precioUnitario: precioUnitario
            };

            qtyCount.textContent = currentQty;
            updateOrderBar();
        });

        btnMinus.addEventListener('click', () => {
            if (cart[nombre] && cart[nombre].cantidad > 0) {
                cart[nombre].cantidad -= 1;
                
                if (cart[nombre].cantidad === 0) {
                    delete cart[nombre];
                }
                
                qtyCount.textContent = cart[nombre] ? cart[nombre].cantidad : 0;
                updateOrderBar();
            }
        });
    });

    // Recalcular la barra inferior de total
    function updateOrderBar() {
        let totalItems = 0;
        let grandTotal = 0;

        for (const item in cart) {
            totalItems += cart[item].cantidad;
            grandTotal += cart[item].cantidad * cart[item].precioUnitario;
        }

        if (totalItems > 0) {
            orderBar.classList.remove('hidden');
            if (whatsappFloat) whatsappFloat.style.bottom = "85px";

            orderSummaryText.textContent = totalItems === 1 ? '1 producto seleccionado' : `${totalItems} productos seleccionados`;
            orderTotalPrice.textContent = `Total: $${grandTotal.toLocaleString('es-AR')}`;

            // Mostrar selección de gaseosa si hay combo con bebida
            const tieneGaseosaCombo = Object.keys(cart).some(item => item.includes('Gaseosa'));
            if (gaseosaGroup) {
                gaseosaGroup.style.display = tieneGaseosaCombo ? 'block' : 'none';
            }
        } else {
            orderBar.classList.add('hidden');
            if (whatsappFloat) whatsappFloat.style.bottom = "25px";
        }
    }

    sendOrderBtn.addEventListener('click', () => {
        checkoutModal.classList.remove('hidden');
    });

    closeModalBtn.addEventListener('click', () => {
        checkoutModal.classList.add('hidden');
    });

    // Enviar pedido a WhatsApp
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nombre = document.getElementById('cliente-nombre').value.trim();
        const direccion = document.getElementById('cliente-direccion').value.trim();
        const pago = document.getElementById('cliente-pago').value;
        const notas = document.getElementById('cliente-notas').value.trim();
        const tieneGaseosaCombo = Object.keys(cart).some(item => item.includes('Gaseosa'));
        const gaseosaElegida = tieneGaseosaCombo ? document.getElementById('cliente-gaseosa').value : null;

        let totalFinal = 0;
        let mensaje = `*¡Hola Punto Repulgue! Quiero hacer un pedido:* 🥟🥪\n\n`;
        mensaje += `*Detalle del Pedido:*\n`;

        for (const [item, data] of Object.entries(cart)) {
            const subtotal = data.cantidad * data.precioUnitario;
            totalFinal += subtotal;
            mensaje += `• ${data.cantidad}x ${item} ($${data.precioUnitario.toLocaleString('es-AR')} c/u) = *$${subtotal.toLocaleString('es-AR')}*\n`;
        }

        mensaje += `\n💰 *TOTAL DEL PEDIDO: $${totalFinal.toLocaleString('es-AR')}*\n`;

        if (gaseosaElegida) {
            mensaje += `🥤 *Gaseosa elegida:* ${gaseosaElegida}\n`;
        }

        mensaje += `\n*Datos para la entrega:*\n`;
        mensaje += `👤 *Nombre:* ${nombre}\n`;
        mensaje += `📍 *Dirección:* ${direccion}\n`;
        mensaje += `💳 *Forma de pago:* ${pago}\n`;

        if (notas) {
            mensaje += `📝 *Aclaraciones:* ${notas}\n`;
        }

        const encodedMessage = encodeURIComponent(mensaje);
        const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;

        window.open(whatsappUrl, '_blank');

        checkoutModal.classList.add('hidden');
        successModal.classList.remove('hidden');

        resetCart();
    });

    closeSuccessModalBtn.addEventListener('click', () => {
        successModal.classList.add('hidden');
    });

    function resetCart() {
        for (const key in cart) {
            delete cart[key];
        }
        document.querySelectorAll('.qty-count').forEach(el => el.textContent = '0');
        checkoutForm.reset();
        updateOrderBar();
    }
});