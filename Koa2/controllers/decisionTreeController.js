const { DecisionTreeClassifier } = require('ml-cart');
const { parse } = require('csv-parse');
const { promisify } = require('util');
const fs = require('fs').promises;
const parseAsync = promisify(parse);

exports.performDecisionTreeClassification = async (ctx) => {
    try {
        console.time('performDecisionTree');

        if (!ctx.request.files || !ctx.request.files.csvFile) {
            ctx.throw(400, 'Bad Request: Missing CSV file');
            return;
        }

        const csvFile = ctx.request.files.csvFile;
        const csvData = await fs.readFile(csvFile.filepath, 'utf-8');

        const featureColumnIndexes = ctx.query.featureColumnIndexes.split(',').map(index => parseInt(index.trim(), 10));
        const labelColumnIndex = parseInt(ctx.query.labelColumnIndex, 10);

        let records;
        try {
            records = await parseAsync(csvData, { columns: true, skip_empty_lines: true });
        } catch (err) {
            console.error('Error parsing CSV:', err);
            ctx.status = 400;
            ctx.body = 'Bad Request: Invalid CSV Format';
            return;
        }
        
        const allIndexesAreNumbers = featureColumnIndexes.every(item => !isNaN(item));
        if (!allIndexesAreNumbers || isNaN(labelColumnIndex)) {
            ctx.throw(400, 'Bad Request: Please provide valid featureColumnIndexes and labelColumnIndex');
            return;
        }

        // Znajdź nazwy kolumn na podstawie indeksów
        const columnNames = Object.keys(records[0]);
        const featureColumnNames = featureColumnIndexes.map(index => columnNames[index]);
        const labelColumnName = columnNames[labelColumnIndex];
        const numberOfFeatures = columnNames.length - 1;
        if (featureColumnNames.includes(undefined) || !labelColumnName) {
            ctx.throw(400, 'Bad Request: Invalid column indexes');
            return;
        }

        // Konwertuj dane na właściwe formaty
        const X = records.map(record => featureColumnNames.map(featureColumnName => parseFloat(record[featureColumnName]))).filter(row => row.every(value => !isNaN(value))); // Filtruj, aby usunąć wiersze zawierające NaN
        const distinctClasses = [...new Set(records.map(record => record[labelColumnName]))];
        const Y = records.map(record => distinctClasses.indexOf(record[labelColumnName])); // Konwertuj etykiety na indeksy

        if (X.length === 0 || Y.length === 0) {
            ctx.throw(400, { message: 'No valid data found for training.' });
            return;
        }

        // Opcje klasyfikatora
        const options = {
            gainFunction: 'gini', // lub 'entropy'
            maxDepth: 10,
            minNumSamples: 3,
        };

        try {
            // Sprawdź, czy X i Y są prawidłowo sformatowane
            if (!Array.isArray(X) || X.length === 0 || !Array.isArray(X[0])) {
                throw new Error('Invalid data format for X');
            }
            if (!Array.isArray(Y) || Y.length === 0) {
                throw new Error('Invalid data format for Y');
            }
          
            // Trenowanie klasyfikatora
            const classifier = new DecisionTreeClassifier(options);
            classifier.train(X, Y);
          
            // Dokonanie predykcji
            const predictions = X.map(x => classifier.predict([x]));
            
            // Przekształcenie predykcji na jednowymiarową listę
            const flatPredictions = predictions.map(prediction => prediction[0]);
            // Obliczenie dokładności predykcji
            const correctPredictions = flatPredictions.reduce((acc, current, index) => acc + (current === Y[index] ? 1 : 0), 0);
            const accuracy = correctPredictions / Y.length * 100;
            const accuracyPer = accuracy.toFixed(2) + '%';
            console.log(accuracyPer);
        
            ctx.body = {
                message: "Classification completed",
                predictions,
                featureColumnNames,
                labelColumnName,
                X,
                Y,
                numberOfFeatures,
                accuracyPer
            };
        } catch (error) {
            console.error('Error during classification:', error);
            ctx.throw(500, { message: 'Error during classification process.' });
        }
        console.timeEnd('performDecisionTree');

    } catch (error) {
        console.error(error);
        ctx.status = 500;
        ctx.body = 'Internal Server Error';
      }
};