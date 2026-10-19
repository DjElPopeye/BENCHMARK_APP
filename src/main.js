import L from 'leaflet';

// --- 1. Base de Datos de 3 Locales Dinámicos ---
const vendorsData = [
  {
    id: 1,
    name: "Arepas Don Leo",
    rating: "4.7",
    reviews: "120",
    address: "Cl. 9 #4-20, La Candelaria, Bogotá",
    eta: "10 minutos",
    lat: 4.6000, lng: -74.0770,
    heroImg: "https://images.unsplash.com/photo-1551782450-17144efb9c50?auto=format&fit=crop&w=600&q=80",
    menu: [
      { name: "Arepa de Pabellón", price: 16500, desc: "Arepa de maíz rellena de carne, caraotas y plátano.", img: "https://images.unsplash.com/photo-1551782450-a2132b4ba21d?auto=format&fit=crop&w=300&q=80" },
      { name: "Empanada de Carne", price: 8000, desc: "Crujiente empanada frita rellena de res.", img: "https://images.unsplash.com/photo-1626074961596-f0c9780a4fb7?auto=format&fit=crop&w=300&q=80" },
      { name: "Tequeños (5 uds)", price: 14000, desc: "Bastones de masa rellenos de queso fundido.", img: "https://images.unsplash.com/photo-1628205470729-28c03cbfb33c?auto=format&fit=crop&w=300&q=80" }
    ],
    comments: [
      { user: "María G.", stars: "⭐⭐⭐⭐⭐", text: "¡Las mejores arepas de la zona!" },
      { user: "Carlos R.", stars: "⭐⭐⭐⭐⭐", text: "Empanadas deliciosas y crujientes." }
    ]
  },
  {
    id: 2,
    name: "Hamburguesas El Gordo",
    rating: "4.9",
    reviews: "340",
    address: "Cra 13 # 55-10, Chapinero, Bogotá",
    eta: "25 minutos",
    lat: 4.6400, lng: -74.0620,
    heroImg: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80",
    menu: [
      { name: "Burger Clásica", price: 15000, desc: "Carne 150g, queso cheddar, lechuga y tomate.", img: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80" },
      { name: "Doble Carne", price: 22000, desc: "Doble carne, tocineta, aros de cebolla.", img: "https://images.unsplash.com/photo-1594212686154-8c8802d08a50?auto=format&fit=crop&w=300&q=80" }
    ],
    comments: [
      { user: "Andrés F.", stars: "⭐⭐⭐⭐⭐", text: "La doble carne es una locura total." },
      { user: "Juliana P.", stars: "⭐⭐⭐⭐☆", text: "Muy buenas pero se demoran un poco." }
    ]
  },
  {
    id: 3,
    name: "Pizzas La Esquina",
    rating: "4.5",
    reviews: "85",
    address: "Cl. 85 # 11-53, Zona T, Bogotá",
    eta: "40 minutos",
    lat: 4.6670, lng: -74.0530,
    heroImg: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80",
    menu: [
      { name: "Porción Pepperoni", price: 7000, desc: "Mucha mozzarella y pepperoni crujiente.", img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=300&q=80" },
      { name: "Porción Hawaiana", price: 6500, desc: "Jamón dulce y piña caramelizada.", img: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=300&q=80" }
    ],
    comments: [
      { user: "Felipe M.", stars: "⭐⭐⭐⭐⭐", text: "Perfectas para el bajón de la rumba." },
      { user: "Sara L.", stars: "⭐⭐⭐☆☆", text: "Ricas pero estaban un poco frías." }
    ]
  }
];

let currentVendor = null;
let currentOrder = null;

// --- 2. Lógica de Audio ---
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
function playPop() {
  if(audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine'; osc.frequency.setValueAtTime(600, audioCtx.currentTime); osc.frequency.exponentialRampToValueAtTime(300, audioCtx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.5, audioCtx.currentTime); gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.start(); osc.stop(audioCtx.currentTime + 0.1);
}
function playSuccessChime() {
  if(audioCtx.state === 'suspended') audioCtx.resume();
  const osc = audioCtx.createOscillator();
  osc.type = 'square'; osc.frequency.setValueAtTime(800, audioCtx.currentTime);
  osc.connect(audioCtx.destination); osc.start(); osc.stop(audioCtx.currentTime + 0.3);
}

// --- 3. Inicializar Mapa Dinámico ---
const map = L.map('main-map', { zoomControl: false }).setView([4.5980, -74.0760], 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

const userLocation = [4.5960, -74.0750];
const userIcon = L.divIcon({ className: 'custom-pin', html: '<div style="background:#00BFFF; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow:0 0 5px rgba(0,0,0,0.5);"></div>' });
const vendorIcon = L.divIcon({ className: 'custom-pin', html: '<div style="background:#D05B39; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow:0 0 5px rgba(0,0,0,0.5);"></div>' });

const userMarker = L.marker(userLocation, { icon: userIcon }).addTo(map).bindTooltip("Tú", { permanent: true, direction: 'bottom' });
const vendorMarker = L.marker([0,0], { icon: vendorIcon }).addTo(map);
const routeLine = L.polyline([], { color: '#C89B3C', weight: 5, opacity: 0.8 }).addTo(map);

// --- 4. Carga de Interfaz (Feed -> Vendedor -> Mapa) ---
function renderFeed() {
  const container = document.getElementById('feed-container');
  container.innerHTML = vendorsData.map(v => `
    <div class="vendor-feed-card" onclick="openVendor(${v.id})">
      <img src="${v.heroImg}" class="vendor-feed-img" alt="${v.name}">
      <h2 class="vendor-feed-title">${v.name}</h2>
      <p class="rating">⭐ <strong>${v.rating}</strong> (${v.reviews} reseñas) • 📍 ${v.address.split(',')[1]}</p>
    </div>
  `).join('');
}

window.openVendor = function(id) {
  playPop();
  currentVendor = vendorsData.find(v => v.id === id);
  
  // Llenar información del local seleccionado
  document.getElementById('vendor-hero').src = currentVendor.heroImg;
  document.getElementById('vendor-title').innerText = currentVendor.name;
  document.getElementById('vendor-rating').innerText = `${currentVendor.rating} opinión`;
  document.getElementById('vendor-reviews').innerText = `(${currentVendor.reviews} reseñas)`;
  document.getElementById('vendor-address-title').innerText = `Ubicación: Local ${currentVendor.name}`;
  document.getElementById('vendor-address-desc').innerText = currentVendor.address;
  document.getElementById('map-eta').innerText = `⏱ ${currentVendor.eta}`;

  // Llenar menú exclusivo
  document.getElementById('vendor-menu-container').innerHTML = currentVendor.menu.map(m => `
    <div class="menu-card" onclick="startOrder('${m.name}', ${m.price})">
      <img src="${m.img}" alt="${m.name}">
      <h4>${m.name}<br>($${m.price.toLocaleString()} COP)</h4>
      <p>${m.desc}</p>
    </div>
  `).join('');

  // Llenar reseñas
  document.getElementById('vendor-reviews-container').innerHTML = currentVendor.comments.map(c => `
    <div class="review-card">
      <div class="reviewer"><strong>${c.user}</strong></div>
      <div class="stars">${c.stars}</div>
      <p>"${c.text}"</p>
    </div>
  `).join('');

  // Cambiar vista
  document.getElementById('view-feed').classList.remove('active');
  document.getElementById('view-vendor').classList.add('active');
}

window.startOrder = function(name, price) {
  playPop();
  currentOrder = { name, price };
  goToMapRoute();
}

window.goToMapRoute = function() {
  playPop();
  document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
  document.getElementById('view-map').classList.add('active');
  
  // Configurar ventanas inferiores
  document.getElementById('sheet-checkout').classList.remove('active');
  document.getElementById('sheet-route').classList.add('active');
  
  // Recalcular el mapa según las coordenadas exactas de ESTE vendedor
  const vLoc = [currentVendor.lat, currentVendor.lng];
  vendorMarker.setLatLng(vLoc).bindTooltip(currentVendor.name, { permanent: true, direction: 'bottom' });
  
  // Trazar línea simulada (L, en lugar de línea recta, para parecer calles)
  routeLine.setLatLngs([userLocation, [userLocation[0], vLoc[1]], vLoc]);
  
  setTimeout(() => { 
    map.invalidateSize(); 
    map.fitBounds(routeLine.getBounds(), { padding: [50, 50] }); 
  }, 100);
}

// --- 5. Navegación Inferior y Pagos ---
window.switchView = function(viewId, btnElement) {
  playPop();
  document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
  document.getElementById(viewId).classList.add('active');
  btnElement.classList.add('active');
}

window.goBackToFeed = function() {
  playPop();
  document.getElementById('view-vendor').classList.remove('active');
  document.getElementById('view-feed').classList.add('active');
}

window.goBackToVendor = function() {
  playPop();
  document.getElementById('view-map').classList.remove('active');
  document.getElementById('view-vendor').classList.add('active');
}

window.showCheckout = function() {
  playPop();
  document.getElementById('sheet-route').classList.remove('active');
  
  // Inyectar el producto elegido al checkout final
  if(currentOrder) {
    document.getElementById('checkout-items-container').innerHTML = `
      <div class="item-row"><span>1x ${currentOrder.name}</span><span>$${currentOrder.price.toLocaleString()}</span></div>
      <div class="item-row" style="color:#666; font-size:0.85rem"><span>Empaque Eco</span><span>$0</span></div>
    `;
    document.getElementById('checkout-total').innerText = `$${currentOrder.price.toLocaleString()}`;
  }
  
  document.getElementById('sheet-checkout').classList.add('active');
}

window.processPayment = function() {
  playSuccessChime();
  const orderNumber = Math.floor(100 + Math.random() * 900);
  document.getElementById('success-amount').innerText = `$${currentOrder.price.toLocaleString()} COP`;
  document.getElementById('order-number-display').innerText = orderNumber;
  document.getElementById('success-screen').classList.add('show');
}

window.closeSuccessScreen = function() {
  playPop();
  document.getElementById('success-screen').classList.remove('show');
  switchView('view-feed', document.querySelectorAll('.nav-item')[0]);
}

window.showInvoice = function(vendor, date, time, method, total) {
   playPop();
   document.getElementById('inv-vendor').innerText = vendor;
   document.getElementById('inv-date').innerText = date;
   document.getElementById('inv-time').innerText = time;
   document.getElementById('inv-method').innerText = method;
   document.getElementById('inv-total').innerText = total;
   document.getElementById('invoice-modal').classList.add('show');
}
window.closeInvoice = function() { playPop(); document.getElementById('invoice-modal').classList.remove('show'); }

// Iniciar aplicación cargando el feed
renderFeed();
