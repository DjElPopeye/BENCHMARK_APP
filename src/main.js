import L from 'leaflet';

// 1. Base de datos de 4 vendedores con menús y adicionales
const vendedores = [
  {
    id: 1, name: "Arepas Rellenas Doña Rosa", type: "Comida Típica", rating: "4.8", lat: 4.6280, lng: -74.0640,
    menu: [
      { id: 'm1', item: "Arepa de Chócolo con Queso", price: 6000, extras: [{ name: "Queso extra", p: 2000 }, { name: "Hogao", p: 1000 }] },
      { id: 'm2', item: "Arepa de Carne Desmechada", price: 9500, extras: [{ name: "Suero costeño", p: 1500 }, { name: "Plátano maduro", p: 2000 }] }
    ]
  },
  {
    id: 2, name: "Hamburguesas El Gordo", type: "Comida Rápida", rating: "4.6", lat: 4.6320, lng: -74.0600,
    menu: [
      { id: 'm3', item: "Burger Clásica Callejera", price: 12000, extras: [{ name: "Tocineta", p: 3000 }, { name: "Queso doble", p: 2500 }] },
      { id: 'm4', item: "Burger Especial", price: 15000, extras: [{ name: "Cebolla grille", p: 1000 }, { name: "Huevo", p: 1500 }] }
    ]
  },
  {
    id: 3, name: "Perros Calientes El Chori", type: "Comida Rápida", rating: "4.7", lat: 4.6250, lng: -74.0680,
    menu: [
      { id: 'm5', item: "Perro Sencillo", price: 7000, extras: [{ name: "Huevos de codorniz", p: 2000 }, { name: "Queso costeño", p: 1500 }] },
      { id: 'm6', item: "Choriperro", price: 11000, extras: [{ name: "Papita ripio extra", p: 1000 }, { name: "Tocineta", p: 3000 }] }
    ]
  },
  {
    id: 4, name: "Pizzas La Esquina", type: "Pizza por Porción", rating: "4.5", lat: 4.6350, lng: -74.0650,
    menu: [
      { id: 'm7', item: "Porción Pepperoni", price: 5000, extras: [{ name: "Borde de queso", p: 2000 }] },
      { id: 'm8', item: "Porción Hawaiana", price: 4500, extras: [{ name: "Jamón extra", p: 1500 }] }
    ]
  }
];

// 2. Inicializar Mapa
const map = L.map('map').setView([4.6297, -74.0640], 14);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

// Ubicar usuario (si falla, usa centro por defecto)
let userLatLng = [4.6297, -74.0640];
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(pos => {
    userLatLng = [pos.coords.latitude, pos.coords.longitude];
    map.setView(userLatLng, 15);
    L.circleMarker(userLatLng, { color: '#A34A33', radius: 8 }).addTo(map).bindPopup("Tu ubicación");
  });
}

// Pintar marcadores
vendedores.forEach(v => {
  const marker = L.marker([v.lat, v.lng]).addTo(map);
  marker.on('click', () => openVendorModal(v));
});

// 3. Lógica de Navegación por Pestañas
window.switchTab = function(tabId, btnElement) {
  document.querySelectorAll('.tab-view').forEach(tab => tab.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
  
  document.getElementById(tabId).classList.add('active');
  btnElement.classList.add('active');

  // Solución para que el mapa renderice correctamente al cambiar de pestaña
  if(tabId === 'tab-explorar') {
    setTimeout(() => map.invalidateSize(), 100);
  }
}

// Cargar Feed de Inicio
const feedContainer = document.getElementById('feed-vendedores');
vendedores.forEach(v => {
  feedContainer.innerHTML += `
    <div class="vendor-card" onclick="openVendorFromFeed(${v.id})">
      <h3>${v.name}</h3>
      <p>⭐ ${v.rating} • ${v.type}</p>
    </div>
  `;
});

window.openVendorFromFeed = function(id) {
  const v = vendedores.find(v => v.id === id);
  openVendorModal(v);
}

// 4. Lógica de Modales
window.closeModal = function(modalId) {
  document.getElementById(modalId).classList.remove('show');
}

let currentVendor = null;
let currentItem = null;

function openVendorModal(v) {
  currentVendor = v;
  document.getElementById('vendor-name').innerText = v.name;
  document.getElementById('vendor-rating').innerText = `⭐ ${v.rating}`;
  document.getElementById('vendor-type').innerText = v.type;
  
  const menuContainer = document.getElementById('vendor-menu');
  menuContainer.innerHTML = '';
  
  v.menu.forEach(m => {
    const div = document.createElement('div');
    div.className = 'menu-item';
    div.innerHTML = `<div><h4>${m.item}</h4></div><div class="price-highlight">$${m.price}</div>`;
    div.onclick = () => openCustomizeModal(m);
    menuContainer.appendChild(div);
  });
  
  document.getElementById('vendor-modal').classList.add('show');
}

function openCustomizeModal(item) {
  currentItem = item;
  document.getElementById('product-name').innerText = item.item;
  document.getElementById('product-price').innerText = `$${item.price}`;
  
  const extrasContainer = document.getElementById('extras-list');
  extrasContainer.innerHTML = '';
  
  if (item.extras && item.extras.length > 0) {
    item.extras.forEach((ext, index) => {
      extrasContainer.innerHTML += `
        <label class="extra-option">
          <span><input type="checkbox" value="${ext.p}"> ${ext.name}</span>
          <span>+$${ext.p}</span>
        </label>
      `;
    });
  } else {
    extrasContainer.innerHTML = '<p>No hay adicionales disponibles.</p>';
  }
  
  document.getElementById('customize-modal').classList.add('show');
}

// 5. Lógica de Compra, Cálculo de Tiempo y Calificación
document.getElementById('confirm-order-btn').onclick = () => {
  closeModal('customize-modal');
  closeModal('vendor-modal');
  
  // Cálculo de tiempo estimado (Simulado basado en distancia lineal simple o aleatorio para el prototipo)
  const dist = Math.abs(currentVendor.lat - userLatLng[0]) + Math.abs(currentVendor.lng - userLatLng[1]);
  let eta = Math.floor(dist * 10000); // Fórmula simulada
  if (eta < 5) eta = 8; // Mínimo 8 minutos
  if (eta > 45) eta = 45; // Máximo 45 minutos

  document.getElementById('status-vendor').innerText = currentVendor.name;
  document.getElementById('eta-time').innerText = `${eta} min`;
  
  // Reiniciar estrellas
  document.querySelectorAll('.stars span').forEach(s => s.classList.remove('active'));
  document.getElementById('rating-feedback').innerText = '';
  
  document.getElementById('status-modal').classList.add('show');
};

// Lógica de calificación interactiva
document.querySelectorAll('.stars span').forEach(star => {
  star.onclick = function() {
    const value = this.getAttribute('data-val');
    document.querySelectorAll('.stars span').forEach(s => {
      if (s.getAttribute('data-val') <= value) s.classList.add('active');
      else s.classList.remove('active');
    });
    document.getElementById('rating-feedback').innerText = `¡Gracias por tu calificación de ${value} estrellas!`;
  }
});
