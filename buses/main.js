// Step 1: Display a Map using Leaflet.js
var map = L.map('theMap').setView([44.6488, -63.5752], 12); // Halifax coordinates
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Step 2: Fetch Real-time Transit Data
async function fetchTransitData() {
    try {
        const response = await fetch('https://prog2700.onrender.com/hrmbuses');
        const jsonData = await response.json();

        // Convert JSON data to an array if it's not already
        const data = Array.isArray(jsonData) ? jsonData : [jsonData];



// Parse the JSON string into a JavaScript object
var newdata = data[0].entity;

// Filter the entity array to get routeId <= 10
// Get newdata where routeId is less than or equal to 10
var filteredNewData = newdata.filter(function(entity) {
    return parseInt(entity.vehicle.trip.routeId) <= 10;
});

console.log("Filtered Data=" + JSON.stringify(filteredNewData));

          const geoJSONData = {
            type: 'FeatureCollection',
            features: filteredNewData.map(entity => ({
                type: 'Feature',
                properties: {
                    id: entity.id,
                    routeId: entity.vehicle.trip.routeId,
                    speed: entity.vehicle.position.speed,
                    occupancyStatus: entity.vehicle.occupancyStatus,
                    bearing: entity.vehicle.position.bearing

                },
                geometry: {
                    type: 'Point',
                    coordinates: [entity.vehicle.position.longitude, entity.vehicle.position.latitude]
                }
            }))
        };

        console.log("GeoJSON Data=" + JSON.stringify(geoJSONData));

        // Step 4: Plot Markers on the Map
        if (markersLayer) {
            map.removeLayer(markersLayer);
        }
        markersLayer = L.geoJSON(geoJSONData, {
            pointToLayer: function (feature, latlng) {
                return L.marker(latlng, {
                    icon: customIcon,
                    rotationAngle: feature.properties.bearing // Add rotation angle
                }).bindPopup(`Bus ID: ${feature.properties.id}<br>Route ID: 
                ${feature.properties.routeId}<br>Occupancy: 
                ${feature.properties.occupancyStatus}<br>Speed: 
                ${feature.properties.speed} km/h<br>Longitude: 
                ${feature.geometry.coordinates[0]}<br>Latitude: 
                ${feature.geometry.coordinates[1]}<br>Bearing:
                ${feature.properties.bearing}
                `); // Optional: add marker popup
            }
        }).addTo(map);
        
    } catch (error) {
        console.error('Error fetching transit data:', error);
    }
}

// Step 5: Implement Auto-refresh Functionality
var refreshInterval = 20000; // 20 seconds
var markersLayer;
var customIcon = L.icon({ // Optional: customize vehicle icon
    iconUrl: 'bus.png',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16]
});

function autoRefreshMap() {
    fetchTransitData();
    setTimeout(autoRefreshMap, refreshInterval);
}

autoRefreshMap(); // Start auto-refreshing