document.addEventListener('DOMContentLoaded', () => {
    // Referencias a elementos del DOM
    const cards = document.querySelectorAll('.card');
    const orderBar = document.getElementById('order-bar');
    const orderSummaryText = document.getElementById('order-summary-text');
    const orderPromoTag = document.getElementById('order-promo-tag');
    const sendOrderBtn = document.getElementById('send-order-btn');
    const whatsappFloat = document.getElementById('main-whatsapp-float');

    // Modales
    const checkoutModal = document.getElementById('checkout-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const checkoutForm = document.getElementById('checkout-form');
    
    const successModal = document.getElementById('success-modal');
    const closeSuccessModalBtn = document.getElementById('close-success-modal');

    // Objeto para llevar el estado del carrito: { "Carne Tradicional": 3, "Humita": 2 }
    const cart = {};

    // Número de teléfono de destino (formato internacional sin +)
    const WHATSAPP_PHONE = "5492644172479";

    // Manejo de clicks en botones + y - de los productos
    cards.forEach(card => {
        const nombre = card.getAttribute('data-nombre');
        const btnMinus = card.querySelector('.minus');
        const btnPlus = card.querySelector('.plus');
        const qtyCount = card.querySelector('.qty-count');

        btnPlus.addEventListener('click', () => {
            const currentQty = (cart[nombre] || 0) + 1;
            cart[nombre] = currentQty;
            qtyCount.textContent = currentQty;
            updateOrderBar();
        });

        btnMinus.addEventListener('click', () => {
            if (cart[nombre] && cart[nombre] > 0) {
                cart[nombre] -= 1;
                if (cart[nombre] === 0) {
                    delete cart[nombre];
                }
                qtyCount.textContent = cart[nombre] || 0;
                updateOrderBar();
            }
        });
    });

    // Actualizar resumen y visibilidad de la barra flotante
    function updateOrderBar() {
        const totalEmpanadas = Object.values(cart).reduce((a, b) => a + b, 0);

        if (totalEmpanadas > 0) {
            orderBar.classList.remove('hidden');
            
            // Subir el botón flotante de WhatsApp para que no se superponga con la barra
            if (whatsappFloat) {
                whatsappFloat.style.bottom = "85px";
            }

            // Texto de cantidad
            const textoEmpanadas = totalEmpanadas === 1 ? '1 empanada seleccionada' : `${totalEmpanadas} empanadas seleccionadas`;
            orderSummaryText.textContent = textoEmpanadas;

            // Indicador visual de docenas / promociones
            const docenas = Math.floor(totalEmpanadas / 12);
            const sobrantes = totalEmpanadas % 12;

            if (docenas > 0) {
                if (sobrantes === 0) {
                    orderPromoTag.textContent = `🎉 ¡Completaste ${docenas} ${docenas === 1 ? 'docena' : 'docenas'}!`;
                } else {
                    const faltantes = 12 - sobrantes;
                    orderPromoTag.textContent = `💡 Llevás ${docenas} ${docenas === 1 ? 'docena' : 'docenas'}. ¡Sumá ${faltantes} más para otra docena!`;
                }
            } else {
                const faltantes = 12 - totalEmpanadas;
                orderPromoTag.textContent = `💡 ¡Sumá ${faltantes} más para completar tu 1ª docena!`;
            }
        } else {
            orderBar.classList.add('hidden');
            if (whatsappFloat) {
                whatsappFloat.style.bottom = "25px";
            }
        }
    }

    // Abrir Modal de Datos de Entrega
    sendOrderBtn.addEventListener('click', () => {
        checkoutModal.classList.remove('hidden');
    });

    // Cerrar Modal Checkout
    closeModalBtn.addEventListener('click', () => {
        checkoutModal.classList.add('hidden');
    });

    // Formulario de Checkout: Generar mensaje e iniciar flujo por WhatsApp
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const nombre = document.getElementById('cliente-nombre').value.trim();
        const direccion = document.getElementById('cliente-direccion').value.trim();
        const pago = document.getElementById('cliente-pago').value;
        const notas = document.getElementById('cliente-notas').value.trim();

        // Construcción del mensaje para el Bot de WhatsApp
        let mensaje = `*¡Hola Punto Repulgue! Quiero realizar un pedido:* 🥟\n\n`;
        mensaje += `*Detalle de Empanadas:*\n`;

        for (const [sabor, cantidad] of Object.entries(cart)) {
            mensaje += `• ${cantidad}x ${sabor}\n`;
        }

        const totalUnidades = Object.values(cart).reduce((a, b) => a + b, 0);
        mensaje += `\n*Total de unidades:* ${totalUnidades}\n`;

        mensaje += `\n*Datos para la entrega:*\n`;
        mensaje += `👤 *Nombre:* ${nombre}\n`;
        mensaje += `📍 *Dirección:* ${direccion}\n`;
        mensaje += `💳 *Forma de pago:* ${pago}\n`;

        if (notas) {
            mensaje += `📝 *Notas:* ${notas}\n`;
        }

        // Codificar mensaje para la URL
        const encodedMessage = encodeURIComponent(mensaje);
        const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedMessage}`;

        // Abrir WhatsApp en pestaña nueva
        window.open(whatsappUrl, '_blank');

        // Cerrar modal checkout y abrir modal de éxito
        checkoutModal.classList.add('hidden');
        successModal.classList.remove('hidden');

        // Resetear carrito y formulario
        resetCart();
    });

    // Cerrar Modal de Éxito
    closeSuccessModalBtn.addEventListener('click', () => {
        successModal.classList.add('hidden');
    });

    // Resetear todo el estado
    function resetCart() {
        for (const key in cart) {
            delete cart[key];
        }
        document.querySelectorAll('.qty-count').forEach(el => el.textContent = '0');
        checkoutForm.reset();
        updateOrderBar();
    }
});