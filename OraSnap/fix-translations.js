// Quick fix script to add missing translation keys
const fs = require('fs');

// Add missing keys to English translations
const enPath = './src/locales/en.json';
const esPath = './src/locales/es.json';

const enData = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const esData = JSON.parse(fs.readFileSync(esPath, 'utf8'));

// Add missing keys
const newKeys = {
  "common": {
    ...enData.common,
    "save": "Save",
    "message": "Message",
    "online": "ONLINE",
    "topRated": "TOP RATED",
    "verifiedPro": "Verified Pro",
    "thisWeek": "This Week",
    "responds": "Responds",
    "hour": "hour",
    "hours": "hours"
  }
};

const newKeysEs = {
  "common": {
    ...esData.common,
    "save": "Guardar",
    "message": "Mensaje",
    "online": "EN LÍNEA",
    "topRated": "MÁS VALORADO",
    "verifiedPro": "Pro Verificado",
    "thisWeek": "Esta Semana",
    "responds": "Responde",
    "hour": "hora",
    "hours": "horas"
  }
};

// Update files
fs.writeFileSync(enPath, JSON.stringify({...enData, ...newKeys}, null, 2));
fs.writeFileSync(esPath, JSON.stringify({...esData, ...newKeysEs}, null, 2));

console.log('Translation keys updated!');