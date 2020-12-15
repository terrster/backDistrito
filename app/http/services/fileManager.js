'use strict'

const fs = require('fs');
const path = require("path");
require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`
});
const S3 = require('../services/s3/buckets');
const uploadDir = "../../../public/tmpFiles/";

const uploadToServer = (files) => {
    let filesUploadedToServer = {};

    Object.keys(files).map((key) => {
        if(files[key].length > 1){
            Object.keys(files[key]).map((index) => {
                let newName = `${new Date().getTime()}-${files[key][index].name}`;
                let filePath = path.resolve(__dirname, uploadDir + newName);
                files[key][index].mv(filePath);

                if(!filesUploadedToServer[key]){
                    filesUploadedToServer[key] = [{
                        name: newName,
                        base64: files[key][index].data,
                        content: files[key][index].mimetype
                    }];
                }
                else{
                    let index = Object.keys(filesUploadedToServer[key])[Object.keys(filesUploadedToServer[key]).length - 1];
                    filesUploadedToServer[key][parseInt(index) + 1] = {
                        name: newName,
                        base64: files[key][index].data,
                        content: files[key][index].mimetype
                    };
                }
            });
        }
        else{
            let newName = `${new Date().getTime()}-${files[key].name}`;
            let filePath = path.resolve(__dirname, uploadDir + newName);
            files[key].mv(filePath);

            filesUploadedToServer[key] = [{
                name: newName,
                base64: files[key].data,
                content: files[key].mimetype
            }];
        }
    });

    return filesUploadedToServer;
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
};

const uploadToS3 = async(filesUploadedToServer) => {
    let filesUploadedToS3 = {};

    const uploadFilesToS3 = Object.keys(filesUploadedToServer).map(async(key) => {
        if(filesUploadedToServer[key].length > 1){
            let filesUploadedToS3Multiple = {};

            const uploadFilesToS3Multiple = Object.keys(filesUploadedToServer[key]).map(async(index) => {
                let url = await uploadFileS3(filesUploadedToServer[key][index].name, filesUploadedToServer[key][index].base64, filesUploadedToServer[key][index].content);

                if(!filesUploadedToS3Multiple[key]){
                    filesUploadedToS3Multiple[key] = [url];
                }
                else{
                    let index = Object.keys(filesUploadedToS3Multiple[key])[Object.keys(filesUploadedToS3Multiple[key]).length - 1];
                    filesUploadedToS3Multiple[key][parseInt(index) + 1] = url;                        
                }
            });

            await Promise.all(uploadFilesToS3Multiple);
            filesUploadedToS3 = {...filesUploadedToS3, ...filesUploadedToS3Multiple};
        }
        else{
            let url = await uploadFileS3(filesUploadedToServer[key][0].name, filesUploadedToServer[key][0].base64, filesUploadedToServer[key][0].content);
            filesUploadedToS3[key] = [url];
        }
    });

    await Promise.all(uploadFilesToS3);

    return filesUploadedToS3;
};

const deleteFromServer = (filesUploadedToServer) => {
    Object.keys(filesUploadedToServer).map((key) => {
        if(filesUploadedToServer[key].length > 1){
            Object.keys(filesUploadedToServer[key]).map((index) => {
                let filePath = path.resolve(__dirname, uploadDir + filesUploadedToServer[key][index].name);
                fs.unlinkSync(filePath);
            });
        }
        else{
            let filePath = path.resolve(__dirname, uploadDir + filesUploadedToServer[key][0].name);
            fs.unlinkSync(filePath);
        }
    });
};

module.exports = {
    uploadToServer,
    uploadToS3,
    deleteFromServer
};