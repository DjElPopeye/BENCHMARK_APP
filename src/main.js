import L from 'leaflet';

// Síntesis de audio para microinteracciones (El "Pop" táctil y la Alerta de Pago)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playPop() {
  if(audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(600, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.5, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.1);
}
function playSuccessChime() {
  if(audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  osc.type = 'square';
  osc.frequency.setValueAtTime(800, audioCtx.currentTime);
  osc.connect(audioCtx.destination);
  osc.start();
  osc.stop(audioCtx.currentTime + 0.3);
}

// 1. Base de datos Piloto Chapinero (Representando los 15 vendedores)
const vendedores = [
  {
    id: 1, name: "Hamburguesas El Gordo", type: "Para el bajón", rating: "4.9", badges: ["🔥 Alta Demanda", "Salsa Legendaria"], lat: 4.6320, lng: -74.0600,
    menu: [
      { 
        id: 'm1', item: "Burger Clásica", basePrice: 12000, 
        paidExtras: [{ name: "Tocineta", price: 2000 }, { name: "Queso Extra", price: 1500 }],
        freeModifiers: ["Sin cebolla", "Salsa de ajo", "Solo salsa rosada"]
      }
    ]
  },
  {
    id: 2, name: "Arepas Rellenas Doña Rosa", type: "Fritos", rating: "4.8", badges: ["Porciones Gigantes"], lat: 4.6280, lng: -74.0640,
    menu: [
      { 
        id: 'm2', item: "Arepa Desmechada", basePrice: 9500, 
        paidExtras: [{ name: "Suero Costeño", price: 1500 }, { name: "Adición de Carne", price: 3000 }],
        freeModifiers: ["Bien tostada", "Sin mantequilla"]
      }
    ]
  }
];

// 2. Inicializar Mapa con tiles Oscuros
const map = L.map('map', { zoomControl: false }).setView([4.6297, -74.0640], 14);
L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);

// Renderizar Vendedores (Llama si hay alta demanda)
vendedores.forEach(v => {
  const isHot = v.badges.includes("🔥 Alta Demanda");
  const iconHtml = `<div style="font-size: 24px; animation: ${isHot ? 'pulse 1s infinite' : 'none'}">${isHot ? '🔥🍔' : '🍔'}</div>`;
  const customIcon = L.divIcon({ className: 'custom-icon', html: iconHtml });
  
  const marker = L.marker([v.lat, v.lng], { icon: customIcon }).addTo(map);
  marker.on('click', () => { playPop(); openVendorModal(v); });
  
  // Agregar al feed
  document.getElementById('feed-vendedores').innerHTML += `
    <div class="vendor-card" onclick="playPop(); openVendorFromFeed(${v.id})">
      <h3 style="color: #FFDB58;">${v.name}</h3>
      <p>⭐ ${v.rating} • <span class="neon-text-magenta">${v.badges.join(', ')}</span></p>
    </div>
  `;
});

// 3. Lógica de Navegación
window.switchTab = function(tabId, btnElement) {
  playPop();
  document.querySelectorAll('.tab-view').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  btnElement.classList.add('active');
  if(tabId === 'tab-explorar') setTimeout(() => map.invalidateSize(), 100);
}

// 4. Modales y Arma tu Plato
window.closeModal = function(modalId) { playPop(); document.getElementById(modalId).classList.remove('show'); }
window.openVendorFromFeed = function(id) { openVendorModal(vendedores.find(v => v.id === id)); }

let currentItem = null;
let orderTotal = 0;

function openVendorModal(v) {
  document.getElementById('vendor-name').innerText = v.name;
  document.getElementById('vendor-badges').innerHTML = v.badges.map(b => `<span class="chip">${b}</span>`).join('');
  const menuContainer = document.getElementById('vendor-menu');
  menuContainer.innerHTML = '';
  
  v.menu.forEach(m => {
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.innerHTML = `<div><h4>${m.item}</h4></div><div class="price-highlight">$${m.basePrice}</div>`;
    div.onclick = () => { playPop(); openCustomizeModal(m); };
    menuContainer.appendChild(div);
  });
  document.getElementById('vendor-modal').classList.add('show');
}

function openCustomizeModal(item) {
  currentItem = item;
  orderTotal = item.basePrice;
  document.getElementById('product-name').innerText = item.item;
  updateTotalDisplay();
  
  // Renderizar Adicionales con Costo (Checkboxes para el prototipo)
  const paidContainer = document.getElementById('paid-extras');
  paidContainer.innerHTML = item.paidExtras.map((ext, i) => `
    <div class="control-row">
      <label><input type="checkbox" class="extra-cb" data-price="${ext.price}"> ${ext.name}</label>
      <span style="color:#FFDB58">+$${ext.price}</span>
    </div>
  `).join('');

  // Escuchar cambios de precio
  document.querySelectorAll('.extra-cb').forEach(cb => {
    cb.addEventListener('change', (e) => {
      playPop();
      orderTotal += e.target.checked ? parseInt(e.target.dataset.price) : -parseInt(e.target.dataset.price);
      updateTotalDisplay();
    });
  });

  // Renderizar Modificadores Gratuitos
  const freeContainer = document.getElementById('free-modifiers');
  freeContainer.innerHTML = item.freeModifiers.map(mod => `
    <div class="control-row"><label><input type="checkbox" onclick="playPop()"> ${mod}</label></div>
  `).join('');

  document.getElementById('customize-modal').classList.add('show');
}

function updateTotalDisplay() {
  document.getElementById('product-price').innerText = `Total: $${orderTotal}`;
}

// 5. Motor de Pagos, Split y Pantalla Antifraude
document.getElementById('confirm-order-btn').onclick = () => {
  const orderNumber = Math.floor(100 + Math.random() * 900); // 3 dígitos vibrantes
  const isDelivery = document.querySelector('input[name="delivery-type"]:checked').value === 'delivery';
  const finalTotal = isDelivery ? orderTotal + 4000 : orderTotal;

  // Cerrar modales
  closeModal('customize-modal');
  closeModal('vendor-modal');

  // Trigger Pantalla Verde Antifraude
  playSuccessChime();
  document.getElementById('success-amount').innerText = `$${finalTotal} COP`;
  document.getElementById('order-number-display').innerText = orderNumber;
  document.getElementById('success-screen').classList.add('show');

  // Actualizar Fila Virtual (Pick-up)
  document.getElementById('active-order-container').className = '';
  document.getElementById('active-order-container').innerHTML = `
    <div class="pickup-screen">
      <h3 style="color: black;">ORDEN #${orderNumber}</h3>
      <p>Muéstrale esta pantalla al vendedor</p>
      ${isDelivery ? '<p style="margin-top:10px; font-size:0.8rem">🏍️ Repartidor en camino</p>' : '<p style="margin-top:10px; font-size:0.8rem">🚶‍♂️ Fila Virtual Activa: Acércate al puesto</p>'}
    </div>
  `;
};

window.closeSuccessScreen = function() {
  document.getElementById('success-screen').classList.remove('show');
  switchTab('tab-pedido', document.querySelectorAll('.nav-item')[2]);
};
