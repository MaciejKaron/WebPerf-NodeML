<template>
  <div class="container mt-5">
    <div class="row">
      <div class="col-12">
        <div v-if="loadingModel" class="progress progress-bar progress-bar-striped progress-bar-animated mb-2">
          Loading Model
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-3">
        <select v-model="selectedModel" class="custom-select">
          <option disabled value="">Choose model</option>
          <option value="mobilenet">mobilenet</option>
          <option value="vgg">vgg</option>
        </select>
      </div>
      <div class="col-6">
        <input @change="onImageSelected" class="form-control border-0" type="file" />
      </div>
      <div class="col-3 d-flex justify-content-end align-items-center">
        <button @click="predict" class="btn btn-dark">Predict</button>
      </div>
    </div>

    <hr />

    <div class="row">
      <div class="col">
        <h2 class="ml-3">Predictions</h2>
        <ol>
          <li v-for="(prediction, index) in predictions" :key="index">
            {{ prediction.className }}: {{ prediction.probability.toFixed(6) }}
          </li>
        </ol>
      </div>
    </div>

    <hr />

    <div class="row">
      <div class="col-12">
        <h2 class="ml-3">Image</h2>
        <img v-if="selectedImage" :src="selectedImage" style="max-width: 300px; max-height: 300px" class="ml-3" />
      </div>
    </div>

    <br>
    <br>
    <br>

    <div class="row">
      <div class="col-6">
        <input @change="onCSVSelected" class="form-control border-0" type="file" />
      </div>
      <div class="col-6 d-flex justify-content-end align-items-center">
        <button @click="uploadCSV" class="btn btn-dark">Upload CSV</button>
      </div>
    </div>

    <div class="row">
      <div class="col-6">
        <label for="xColumnIndex">Choose X Column Index:</label>
        <input v-model="selectedXColumnIndex" type="number" class="form-control" id="xColumnIndex" />
      </div>
      <div class="col-6">
        <label for="yColumnIndex">Choose Y Column Index:</label>
        <input v-model="selectedYColumnIndex" type="number" class="form-control" id="yColumnIndex" />
      </div>
    </div>

    <div class="row">
      <div class="col">
        <h2 class="ml-3">Predictions</h2>
        <p class="ml-3">Regression Equation: {{ regressionEquation }}</p>
        <p class="ml-3">Prediction {{ xColumn }} of {{  yColumn }}:</p>
        <!-- {{ regressionPredictions }} -->
      </div>
    </div>

    <div class="row">
      <div class="col">
        <h2 class="ml-3">Regression Chart</h2>
        <canvas id="regressionChart" width="300" height="300"></canvas>
      </div>
    </div>

    <div class="row">
      <div class="col-6">
        <label for="featureColumnIndexes">Enter Feature Column Index(es):</label>
        <!-- Użytkownik może wpisać indeksy kolumn, np. 1, 2, 3 -->
        <input v-model="selectedFeatureColumnIndexes" type="text" class="form-control" id="featureColumnIndexes" placeholder="e.g. 0, 1, 2, 3"/>
      </div>
      <div class="col-6">
        <label for="labelColumnIndex">Choose Label Column Index:</label>
        <input v-model="selectedLabelColumnIndex" type="number" class="form-control" id="labelColumnIndex" />
      </div>
    </div>

    <div class="row">
      <div class="col d-flex justify-content-end align-items-center">
        <button @click="uploadCSVForDecisionTree" class="btn btn-dark">Classify with Decision Tree</button>
      </div>
    </div>

    <div class="row">
      <div class="col">
        <h2 class="ml-3">Predictions</h2>
        <h3 class="ml-3">Accuracy in percent: {{ accuracyPer }}</h3>
        <p class="ml-3">Prediction {{ featureColumnNames }} of {{  labelColumnName }}:</p>
        {{ labels }}
        <br>
        <br>
        {{ decisionTreePredictions }}
      </div>
    </div>

  </div>
</template>
  
  <script>
  import ModelLoader from "@/services/ModelLoader.service"
import RegressionService from "@/services/Regression.service";
import Chart from 'chart.js/auto'
import DecisionTreeService from "@/services/DecisionTree.service"
  export default {
    name: "ModelLoader-comp",
    data() {
      return {
        selectedModel: '',
        selectedImage: null,
        predictions: [],
        loadingModel: false,
        model: null,

        selectedCSV: null,
        selectedXColumnIndex: null,
          selectedYColumnIndex: null,
          regressionEquation: '',
          regressionPredictions: [],
          xColumn: '',
          yColumn: '',
          xValues: null,
          yValues: null,

          selectedFeatureColumnIndex: null,
          selectedLabelColumnIndex: null,
          selectedFeatureColumnIndexes : '',
          featureColumnNames: '',
          labelColumnName: '',
          labels: null,
          decisionTreePredictions: null,
          numberOfFeatures: null,
          accuracyPer: '',
      };
    },
    methods: {
      async loadModel() {
        this.loadingModel = true;
          try {
            this.model = await ModelLoader.loadModel(this.selectedModel)
            console.log(this.model);
          }catch (error) {
            console.error("Error loading model:", error);
          } finally {
            this.loadingModel = false; // Zakończenie ładowania modelu
  }
      },
      onImageSelected(event) {
        const file = event.target.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          this.selectedImage = e.target.result;
        };
        reader.readAsDataURL(file);
      },
      predict() {
        if (this.selectedModel && this.selectedImage) {
          var data = {
            image: this.selectedImage,
            model: this.selectedModel
          }
            ModelLoader.predict(data)
                .then(response => {
                    this.predictions = response.data
                    console.log(this.predictions);
              // console.log(this.selectedImage);
            })   
        }else {
          console.error("Model or image not loaded");
        }
  
      },

        onCSVSelected(event) {
            const file = event.target.files[0]
            this.selectedCSV = file;
            // console.log(file);
      },

      async uploadCSV() {
        if (this.selectedCSV || this.selectedXColumnIndex || this.selectedYColumnIndex) {
          try {
            const response = await RegressionService.uploadCSV(this.selectedCSV, this.selectedXColumnIndex, this.selectedYColumnIndex)
            console.log('CSV uploaded and regression performed:', response.data);
            this.regressionEquation = response.data.equation;
            this.regressionPredictions = response.data.predictions;
            this.xColumn = response.data.xColumnIndex;
            this.yColumn = response.data.yColumnIndex;
            this.xValues = response.data.xValues;
            this.yValues = response.data.yValues;
            // console.log(this.xValues);
            // console.log(this.yValues);
            this.drawRegressionChart();
          } catch (error) {
            console.error('Error during CSV  upload and regression:', error)
          }
        } else {
          console.error('Please select CSV file and provide X and Y column indexes')
        }
      },

      drawRegressionChart() {
        const ctx = document.getElementById('regressionChart').getContext('2d');

  // Dane do wykresu
  const data = {
    labels: this.regressionPredictions.map(entry => entry.xValue),
    datasets: [
      {
        label: 'Actual Data',
        data: this.yValues.map((yValue, index) => ({ x: this.xValues[index], y: yValue })),
        pointBackgroundColor: 'blue',
      },
      {
        label: 'Regression Line',
        data: this.regressionPredictions.map(entry => entry.YofXvalue),
        borderColor: 'red',
        fill: false,
        type: 'line', // Dodajemy typ 'line' dla linii regresji
      },
    ],
  };

  // Opcje konfiguracyjne
  const options = {
    scales: {
      x: {
        type: 'linear',
        position: 'bottom',
      },
      y: {
        beginAtZero: true,
      },
    },
  };

  // eslint-disable-next-line no-unused-vars
  const myChart = new Chart(ctx, {
    type: 'scatter',
    data: data,
    options: options,
  });
        },

        async uploadCSVForDecisionTree() {
          if (this.selectedCSV || this.selectedFeatureColumnIndexes || this.selectedLabelColumnIndex) {
            try {
              const response = await DecisionTreeService.uploadCSVForDecisionTree(this.selectedCSV, this.selectedFeatureColumnIndexes, this.selectedLabelColumnIndex);
              console.log('CSV uploaded and decision tree classification performed:', response.data);
              this.featureColumnNames = response.data.featureColumnNames
              this.labelColumnName = response.data.labelColumnName
              this.labels = response.data.Y
              this.decisionTreePredictions = response.data.predictions
              this.numberOfFeatures = response.data.numberOfFeatures
              this.accuracyPer = response.data.accuracyPer
            
            } catch (error) {
              console.error('Error during CSV upload and decision tree classification:', error);
            }
          } else {
            console.error('Please select a CSV file and provide feature and label column indexes');
          }
        },
  

    },
    watch: {
      selectedModel(newModel) {
        if (newModel) {
          this.loadModel();
        }
      }
    }
  };
  </script>

  <style scoped>
  
  </style>