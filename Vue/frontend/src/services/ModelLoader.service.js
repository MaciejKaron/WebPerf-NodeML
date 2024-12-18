import axios from 'axios'
const API_URL = 'http://localhost:81/api/'

class ModelLoader {

    loadModel(modelName) {
        return axios.get(API_URL + `load/${modelName}`)
    }

    predict(data) {
        return axios.post(API_URL + 'predict', data)
    }
}

export default new ModelLoader()