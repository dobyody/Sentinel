const fs = require('fs');

// Base bounding box roughly for Chisinau
// Lat: 46.95 to 47.05
// Lng: 28.75 to 28.95
const data = JSON.parse(fs.readFileSync('./src/data/mockHazards.json', 'utf8'));

// Shuffle array
for (let i = data.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [data[i], data[j]] = [data[j], data[i]];
}

const newData = data.map((item, index) => {
    // Generate new random coordinates within Chisinau bounds to spread them out realistically
    const lat = 46.95 + (Math.random() * 0.1); 
    const lng = 28.75 + (Math.random() * 0.2); 
    
    return {
        ...item,
        id: index + 1, // Reassign IDs after shuffle
        latitude: lat,
        longitude: lng
    };
});

fs.writeFileSync('./src/data/mockHazards.json', JSON.stringify(newData, null, 2));
