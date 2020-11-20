'use strict'

const fs = require('fs');
const path = require("path");
require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`
});
const S3 = require('../services/s3/buckets');
const uploadDir = "../../../public/tmpFiles/";

const moveFile = async(file) => {
    return new Promise((resolve, reject) => {
        let filePath = path.resolve(__dirname, uploadDir + file.name);
        const callback = (error, success) => {
            if(error){
                console.log("Something went wrong trying to upload the files to the server");
            }
            resolve(filePath);
            };
            file.mv(filePath, callback);
    });
};

const getContentType = async(file) => {
    try{
        let rc = 'application/octet-stream';
        const fn = file.name.toLowerCase();
        if (fn.indexOf('.pdf') >= 0) rc = 'application/pdf';
        else if (fn.indexOf('.zip') >= 0) rc = 'application/zip';
        else if (fn.indexOf('.png') >= 0) rc = 'image/png';
        else if (fn.indexOf('.jpg') >= 0 || fn.indexOf('.jpeg') >= 0) rc = 'image/jpg';
        else if (fn.indexOf('.tiff') >= 0 || fn.indexOf('.tif') >= 0) rc = 'image/tiff';

        return rc;

    }
    catch(error){
        console.log("Something went wrong trying to get the content types");
    }
};

const getBase64 = async(filePath) => {
    const bitmap = fs.readFileSync(filePath);
    return Buffer.from(bitmap, 'base64');
};

const setNewName = async(file) => {
    try{
        return `${new Date().getTime()}-${file.name}`;
    }
    catch(error){
        console.log("Something went wrong trying to set the new files names");
    }
};

const uploadFile = async(fileName, fileBase64, contentType) => {
    try{
        return new Promise(async(resolve, reject) => {
            let result = await uploadFileS3(fileName, fileBase64, contentType);
            const callback = (error, success) => {
                if(error){
                    console.log("Something went wrong trying to upload the files to S3");
                }
                resolve(result);
            };
            callback();
        });
    }
    catch(error){
        console.log(error);
    }
};

const uploadFileS3 = async(name, base64, contentType) => {
    return new Promise((resolve, reject) => {
      const params = {
        Key: `${name}`, ACL: 'public-read', Body: base64, ContentType: contentType,
      };
      const bucket = S3.bucket();
      const callback = (error, data) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(data.Location);
      }
      bucket.upload(params, callback);
    });
}

const deleteFromServer = async() => {
    try{
        fs.readdir(path.resolve(__dirname, uploadDir), (error, files) => {
            if(error) throw error;
            
            for(const file of files) {
                fs.unlink(path.join(path.resolve(__dirname, uploadDir), file), error => {
                    if (error) throw error;
                });
            }
        });
    }
    catch(error){
        console.log("Something went wrong trying to delete the files from the server");
    }
}

const UploadFilesToS3 = async(file) => {
    return new Promise(async(resolve, reject) => {
        try{
            const filePath = await moveFile(file);
            const contentType = await getContentType(file);
            const fileBase64 = await getBase64(filePath);
            const fileName = await setNewName(file);
            const url = await uploadFile(fileName, fileBase64, contentType);
            
            resolve(url);
        }
        catch(error){
            console.log("Something went wrong trying to upload files");
        }
    });
}

module.exports = {
    uploadFileS3,
    UploadFilesToS3,
    deleteFromServer
};