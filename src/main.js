import L from 'leaflet';

// 1. Efectos de Sonido
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

// 2. Inicializar Mapa (Usamos OpenStreetMap en lugar de Carto para evitar el error de API KEY que reportaste)
const map = L.map('main-map', { zoomControl: false }).setView([4.5980, -74.0760], 16);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

const userLocation = [4.5960, -74.0750];
const vendorLocation = [4.6000, -74.0770];

const userIcon = L.divIcon({ className: 'custom-pin', html: '<div style="background:#00BFFF; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow:0 0 5px rgba(0,0,0,0.5);"></div>' });
const vendorIcon = L.divIcon({ className: 'custom-pin', html: '<div style="background:#D05B39; width:20px; height:20px; border-radius:50%; border:3px solid white; box-shadow:0 0 5px rgba(0,0,0,0.5);"></div>' });

L.marker(userLocation, { icon: userIcon }).addTo(map).bindTooltip("Tu ubicación actual", { permanent: true, direction: 'bottom', className: 'map-tooltip-blue' });
L.marker(vendorLocation, { icon: vendorIcon }).addTo(map).bindTooltip("Arepas Don Leo", { permanent: true, direction: 'bottom', className: 'map-tooltip-orange' });

const routeLine = L.polyline([userLocation, [4.5960, -74.0770], vendorLocation], { color: '#C89B3C', weight: 5, opacity: 0.8 }).addTo(map);

// 3. Control de Navegación por Vistas
window.switchView = function(viewId, btnElement) {
  playPop();
  document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
  
  document.getElementById(viewId).classList.add('active');
  btnElement.classList.add('active');
}

window.goHome = function() {
  playPop();
  document.getElementById('view-map').classList.remove('active');
  document.getElementById('view-home').classList.add('active');
  document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.nav-item')[0].classList.add('active');
}

window.goToMapRoute = function() {
  playPop();
  document.querySelectorAll('.view').forEach(view => view.classList.remove('active'));
  document.getElementById('view-map').classList.add('active');
  document.getElementById('sheet-checkout').classList.remove('active');
  document.getElementById('sheet-route').classList.add('active');
  setTimeout(() => { map.invalidateSize(); map.fitBounds(routeLine.getBounds(), { padding: [50, 50] }); }, 100);
}

window.showCheckout = function() {
  playPop();
  document.getElementById('sheet-route').classList.remove('active');
  document.getElementById('sheet-checkout').classList.add('active');
}

// 4. Pagos y Antifraude
window.processPayment = function() {
  playSuccessChime();
  const orderNumber = Math.floor(100 + Math.random() * 900);
  document.getElementById('success-amount').innerText = "$16.500 COP";
  document.getElementById('order-number-display').innerText = orderNumber;
  document.getElementById('success-screen').classList.add('show');
}

window.closeSuccessScreen = function() {
  playPop();
  document.getElementById('success-screen').classList.remove('show');
  goHome();
}

window.openProduct = function(name, price) {
  playPop();
  goToMapRoute();
}

// 5. Modal de Facturas
window.showInvoice = function(vendor, date, time, method, total) {
   playPop();
   document.getElementById('inv-vendor').innerText = vendor;
   document.getElementById('inv-date').innerText = date;
   document.getElementById('inv-time').innerText = time;
   document.getElementById('inv-method').innerText = method;
   document.getElementById('inv-total').innerText = total;
   document.getElementById('invoice-modal').classList.add('show');
}

window.closeInvoice = function() {
    playPop();
    document.getElementById('invoice-modal').classList.remove('show');
}

// Estilos del mapa
const style = document.createElement('style');
style.innerHTML = `
  .map-tooltip-blue { background-color: #00BFFF; color: white; border: none; border-radius: 15px; font-weight: bold; }
  .map-tooltip-blue::before { border-bottom-color: #00BFFF; }
  .map-tooltip-orange { background-color: #D05B39; color: white; border: none; border-radius: 15px; font-weight: bold; }
  .map-tooltip-orange::before { border-bottom-color: #D05B39; }
`;
document.head.appendChild(style);
