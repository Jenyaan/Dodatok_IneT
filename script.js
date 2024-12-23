
document.addEventListener('DOMContentLoaded', () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                const { latitude, longitude } = position.coords;
                const map = L.map('map').setView([latitude, longitude], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
                }).addTo(map);

                L.marker([latitude, longitude]).addTo(map)
                .bindPopup('You are here!')
                .openPopup();

                window.map = map;
            },
            error => {
                console.error(`Geolocation error: ${error.message}`);
                const map = L.map('map').setView([51.505, -0.09], 13);
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: 'Map data © <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors',
                }).addTo(map);

                window.map = map;
            }
        );
    } else {
        alert('Geolocation is not supported by your browser.');
    }
});

function saveLocation(position) {
    const locations = JSON.parse(localStorage.getItem('geoLocations')) || [];
    const { latitude, longitude } = position.coords;
    const timestamp = new Date().toISOString();

    locations.push({ latitude, longitude, timestamp });
    localStorage.setItem('geoLocations', JSON.stringify(locations));
    console.log(`Saved location: Latitude = ${latitude}, Longitude = ${longitude}, Time = ${timestamp}`);
    
    L.marker([latitude, longitude]).addTo(window.map)
        .bindPopup(`Latitude: ${latitude}, Longitude: ${longitude}, Time: ${timestamp}`)
        .openPopup();
}

function getLocation(interval) {
    navigator.geolocation.getCurrentPosition(
        position => {
            saveLocation(position);
        },
        error => {
            console.error(`Geolocation error: ${error.message}`);
        }
    );
    setInterval(() => {
        navigator.geolocation.getCurrentPosition(
            position => {
                saveLocation(position);
            },
            error => {
                console.error(`Geolocation error: ${error.message}`);
            }
        );
    }, interval);
}

function generateGPX() {
    const locations = JSON.parse(localStorage.getItem('geoLocations')) || [];

    let gpxData = '<?xml version="1.0" encoding="UTF-8"?>\n';
    gpxData += '<gpx version="1.1" creator="Geolocation Visualization">\n';

    locations.forEach(location => {
        gpxData += `  <wpt lat="${location.latitude}" lon="${location.longitude}">\n`;
        gpxData += `    <ele>0</ele>\n`;
        gpxData += `    <time>${location.timestamp}</time>\n`;
        gpxData += '  </wpt>\n';
    });

    gpxData += '</gpx>';

    const blob = new Blob([gpxData], { type: 'application/gpx+xml' });
    const url = URL.createObjectURL(blob);

    const tempLink = document.createElement('a');
    tempLink.href = url;
    tempLink.download = 'locations.gpx';
    tempLink.style.display = 'none'; 
    document.body.appendChild(tempLink);

    tempLink.click();

    document.body.removeChild(tempLink);
    URL.revokeObjectURL(url);
}

function clearGeoData() {
    localStorage.removeItem('geoLocations');
}

const startButton = document.getElementById('startTracking');
const clearButton = document.getElementById('clearTracking');
const downloadButton = document.getElementById('downloadGPX');

startButton.addEventListener('click', () => {
    clearGeoData();
    const interval = parseInt(document.getElementById('interval').value, 10) * 1000;
    getLocation(interval);
});

clearButton.addEventListener('click', () => {
    clearGeoData();
});


downloadButton.addEventListener('click', generateGPX);
