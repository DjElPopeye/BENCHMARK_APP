import L from 'leaflet';

const map = L.map('map').setView([4.6097, -74.0817], 13);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

const statusText = document.getElementById('status-text');
let userMarker;

function ubicarUsuario() {
  if (!navigator.geolocation) return;
  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      map.setView([lat, lng], 16);
      if (userMarker) userMarker.setLatLng([lat, lng]);
      else userMarker = L.marker([lat, lng]).addTo(map).bindPopup("¡Estás aquí!").openPopup();
      statusText.innerText = "Ubicación encontrada.";
    }
  );
}

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
    statusText.innerText = "Buscando comida cerca de ti...";
  }
});

ubicarUsuario();
