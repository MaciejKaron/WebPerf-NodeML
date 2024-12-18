import axios from 'axios'

const API_URL = 'http://localhost:81/api/'

class decisionTreeService {
    uploadCSVForDecisionTree(file, featureColumnIndexes, labelColumnIndex) {
        const formData = new FormData();
        formData.append('csvFile', file);

        return axios.post(`${API_URL}decision-tree`, formData, {
            params: { featureColumnIndexes, labelColumnIndex },
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    }
}

export default new decisionTreeService();