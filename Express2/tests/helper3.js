'use strict';
const fs = require('fs');
const { parse } = require('csv-parse');

module.exports = {
    loadCsvFile: loadCsvFile
};

// Funkcja do wczytywania pliku CSV
function loadCsvFile(requestParams, context, ee, next) {
    try {
        // Ścieżka do pliku CSV
        const filePath = './abc.csv'; // Ustaw właściwą ścieżkę do pliku CSV
        
        // Wczytujemy zawartość pliku CSV
        fs.readFile(filePath, 'utf-8', (err, csvData) => {
            if (err) {
                console.error('Wystąpił błąd podczas wczytywania pliku CSV:', err);
                // W przypadku błędu, kontynuujemy wykonywanie testu
                return next();
            }

            // Parsowanie danych CSV
            parse(csvData, { columns: true }, (parseErr, records) => {
                if (parseErr) {
                    console.error('Wystąpił błąd podczas parsowania pliku CSV:', parseErr);
                    // W przypadku błędu parsowania, kontynuujemy wykonywanie testu
                    return next();
                }
                
                // Przypisujemy wczytane dane jako dane do przesyłania
                requestParams.body = records;
                console.log(requestParams.body);

                // Kontynuujemy wykonywanie testu
                return next();
            });
        });
    } catch (error) {
        console.error('Wystąpił błąd podczas wczytywania pliku CSV:', error);
        // W przypadku błędu, kontynuujemy wykonywanie testu
        return next();
    }
}