import axios from 'axios'

const API_URL = 'http://localhost:81/api/regression'

class RegressionService {
    uploadCSV(file, xColumnIndex, yColumnIndex) {
        const formData = new FormData()
        formData.append('csvFile', file)

        return axios.post(API_URL, formData, {
            params: { xColumnIndex, yColumnIndex },
            headers: { 'Content-Type': 'multipart/form-data' }
        })
    }
}

export default new RegressionService();