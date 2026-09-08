const pedido = {};

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.card').forEach(card => {
        const sabor = card.dataset.nombre;
        const countSpan = card.querySelector('.qty-count');

        card.querySelector('.plus').addEventListener('click', (e) => {
            e.preventDefault();
            pedido[sabor] = (pedido[sabor] || 0) + 1;
            countSpan.textContent = pedido[sabor];
            actualizarPedido();
        });

        card.querySelector('.minus').addEventListener('click', (e) => {
            e.preventDefault();
            if (pedido[sabor] && pedido[sabor] > 0) {
                pedido[sabor]--;
                if (pedido[sabor] === 0) delete pedido[sabor];
                countSpan.textContent = pedido[sabor] || 0;
                actualizarPedido();
            }
        });
    });
});

function actualizarPedido() {
    const totalEmpanadas = Object.values(pedido).reduce((a, b) => a + b, 0);
    const orderBar = document.getElementById('order-bar');
    const summaryText = document.getElementById('order-summary-text');
    const promoTag = document.getElementById('order-promo-tag');
    const sendBtn = document.getElementById('send-order-btn');
    const floatWaBtn = document.getElementById('main-whatsapp-float');

    if (totalEmpanadas > 0) {
        orderBar.classList.remove('hidden');
        summaryText.textContent = `${totalEmpanadas} empanada${totalEmpanadas > 1 ? 's' : ''} seleccionada${totalEmpanadas > 1 ? 's' : ''}`;

        // Mueve el botón flotante de WhatsApp hacia arriba cuando la barra flotante está visible
        if (floatWaBtn) floatWaBtn.style.bottom = '85px';

        let aplicaPromo = totalEmpanadas >= 12;
        promoTag.textContent = aplicaPromo ? '¡Aplica Promo Docena!' : '';

        let mensaje = `*NUEVO PEDIDO DESDE LA WEB*\n\n`;
        mensaje += `*Detalle del pedido:*\n`;
        for (const [sabor, cantidad] of Object.entries(pedido)) {
            mensaje += `- ${cantidad}x ${sabor}\n`;
        }
        mensaje += `\n*Total unidades:* ${totalEmpanadas}`;
        if (aplicaPromo) {
            mensaje += `\n*Beneficio:* Promo Docena`;
        }

        const urlWA = `https://wa.me/5492644172479?text=${encodeURIComponent(mensaje)}`;
        sendBtn.href = urlWA;
    } else {
        orderBar.classList.add('hidden');
        if (floatWaBtn) floatWaBtn.style.bottom = '25px';
    }
}