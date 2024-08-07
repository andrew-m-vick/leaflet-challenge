// URL for the JSON data
const earthquakeDataUrl = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_month.geojson';

// Fetch the JSON data
fetch(earthquakeDataUrl)
    .then(response => response.json())
    .then(earthquakeData => {
        // Create the base Leaflet map (centered on Houston)
        const map = L.map('map').setView([29.7604, -95.3698], 5); // Houston coordinates

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);

        // Function to determine marker size based on magnitude (exponential scaling)
        function getMarkerSize(magnitude) {
            return Math.pow(1.7, magnitude); // Adjust the base (1.5) for different scaling
        }

        // Function to determine marker color based on depth
        function getMarkerColor(depth) {
            return depth > 90 ? '#800026' :
                   depth > 70 ? '#BD0026' :
                   depth > 50 ? '#E31A1C' :
                   depth > 30 ? '#FC4E2A' :
                   depth > 10 ? '#FD8D3C' :
                                '#FEB24C';
        }

        // Add earthquake markers to the map
        earthquakeData.features.forEach(earthquake => {
            L.circleMarker([earthquake.geometry.coordinates[1], earthquake.geometry.coordinates[0]], {
                radius: getMarkerSize(earthquake.properties.mag),
                fillColor: getMarkerColor(earthquake.geometry.coordinates[2]),
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(map)
            .bindPopup(`
                <b>Magnitude:</b> ${earthquake.properties.mag}<br>
                <b>Location:</b> ${earthquake.properties.place}<br>
                <b>Depth:</b> ${earthquake.geometry.coordinates[2]} km
            `);
        });

        // Create legend (correct logic for depth-based colors)
        const legend = L.control({ position: 'bottomright' });
        legend.onAdd = function() {
            const div = L.DomUtil.create('div', 'info legend');
            const depths = [0, 10, 30, 50, 70, 90];
            div.innerHTML += '<b>Depth (km):</b><br>';

            for (let i = 0; i < depths.length; i++) {
                div.innerHTML += 
                    `<i style="background:${getMarkerColor(depths[i] + 1)}"></i> ${
                        depths[i]}${depths[i + 1] ? '&ndash;' + depths[i + 1] + '<br>' : '+'}<br>`;
            }

            return div;
        };
        legend.addTo(map); 
    })
    .catch(error => {
        console.error('Error fetching earthquake data:', error);
    });