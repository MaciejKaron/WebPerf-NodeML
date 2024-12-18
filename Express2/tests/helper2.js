'use strict';
const fs = require('fs');

module.exports = {
    loadJsonFile: loadJsonFile
}

// Funkcja do wczytywania pliku JSON
function loadJsonFile(requestParams, context, ee, next) {
    try {
        // Ścieżka do pliku JSON
        const filePath = './predictVGG.txt'; // Ustaw właściwą ścieżkę do pliku JSON

        // Wczytaj zawartość pliku JSON
        const jsonData = fs.readFileSync(filePath, 'utf8');
        
        // Przypisz wczytaną zawartość jako ciało żądania
        requestParams.json = JSON.parse(jsonData);
        
        // Kontynuuj wykonywanie testu
        return next();
    } catch (error) {
        console.error('Wystąpił błąd podczas wczytywania pliku JSON:', error);
        // W przypadku błędu, kontynuuj wykonywanie testu
        return next();
    }
}