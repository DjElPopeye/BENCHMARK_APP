import L from 'leaflet';

// Inicializar el mapa centrado en una zona concurrida de Bogotá (Chapinero/Centro)
const map = L.map('map').setView([4.6297, -74.0617], 14);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

const statusText = document.getElementById('status-text');

// 1. Base de datos de vendedores de prueba
const vendedores = [
  {
    id: 1,
    name: "Arepas Rellenas Doña Rosa",
    type: "Comida Típica",
    rating: "4.8",
    lat: 4.6280,
    lng: -74.0640,
    menu: [
      { item: "Arepa de Chócolo con Queso", price: "$6.000" },
      { item: "Arepa Rellena de Carne Desmechada", price: "$9.500" },
      { item: "Gaseosa 400ml", price: "$3.000" }
    ]
  },
  {
    id: 2,
    name: "Empanadas El Kiosko",
    type: "Fritos rápidos",
    rating: "4.5",
    lat: 4.6320,
    lng: -74.0600,
    menu: [
      { item: "Empanada de Carne y Papa", price: "$3.500" },
      { item: "Empanada de Pollo y Champiñones", price: "$4.000" },
      { item: "Avena Casera Helada", price: "$3.500" }
    ]
  }
];

// 2. Lógica de la interfaz del menú
const modal = document.getElementById('vendor-modal');
const closeModal = document.getElementById('close-modal');
const vendorName = document.getElementById('vendor-name');
const vendorRating = document.getElementById('vendor-rating');
const vendorType = document.getElementById('vendor-type');
const vendorMenu = document.getElementById('vendor-menu');
const orderBtn = document.getElementById('order-btn');

closeModal.onclick = () => modal.classList.remove('show');

// 3. Pintar los vendedores en el mapa
vendedores.forEach(v => {
  const marker = L.marker([v.lat, v.lng]).addTo(map);
  
  // Qué pasa al tocar un vendedor
  marker.on('click', () => {
    vendorName.innerText = v.name;
    vendorRating.innerText = `⭐ ${v.rating}`;
    vendorType.innerText = v.type;
    
    // Generar la lista de platos
    vendorMenu.innerHTML = '';
    v.menu.forEach(m => {
      vendorMenu.innerHTML += `
        <div class="menu-item">
          <h4>${m.item}</h4>
          <p>${m.price}</p>
        </div>
      `;
    });
    
    // Mostrar la ventana deslizante
    modal.classList.add('show');
  });
});

// Lógica de compra
orderBtn.onclick = () => {
  alert(`¡Pedido confirmado en ${vendorName.innerText}! El vendedor preparará tu comida.`);
  modal.classList.remove('show');
};

// 4. Lógica original del GPS y Modo Vendedor
const vendorButton = document.getElementById('toggle-vendor-mode');
let isVendor = false;

vendorButton.addEventListener('click', () => {
  isVendor = !isVendor;
  if (isVendor) {
    vendorButton.classList.add('active');
    vendorButton.innerText = "Activo (Vendiendo)";
    statusText.innerText = "Ubicación visible para compradores.";
  } else {
    vendorButton.classList.remove('active');
    vendorButton.innerText = "Modo Vendedor";
    statusText.innerText = "Explorando antojos en Bogotá...";
  }
});

// Ubicar al usuario
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      map.setView([lat, lng], 14);
      L.marker([lat, lng]).addTo(map).bindPopup("Tu ubicación").openPopup();
    }
  );
}
