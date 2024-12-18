const fs = require('fs');
const FormData = require('form-data');

function addMultipartFormData(requestParams, context, ee, next) {
    const form = new FormData();
    form.append('csvFile', fs.createReadStream('./abc.csv'));
    requestParams.body = form;
    console.log(form);
    return next(); 
}

module.exports = {
  addMultipartFormData,
}