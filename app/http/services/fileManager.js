'use strict'

const fs = require('fs');
const path = require("path");
require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`
});
const S3 = require('../services/s3/buckets');
const uploadDir = "../../../public/tmpFiles/";

const moveFile = async(files) => {
    const UploadFiles = Object.keys(files).map(async(key) => {
        return new Promise((resolve, reject) => {
            let filePath = path.resolve(__dirname, uploadDir + files[key].name);
            const callback = (error, success) => {
                if(error){
                    console.log("Something went wrong trying to upload the files to the server");
                }
                resolve(filePath);
              };
              files[key].mv(filePath, callback);
        });
    });

    let uploadedFiles = await Promise.all(UploadFiles);

    return uploadedFiles;
};

const getContentType = async(files) => {
    let types = [];

    try{

        Object.keys(files).forEach(key => {
            let rc = 'application/octet-stream';
            const fn = files[key].name.toLowerCase();
            if (fn.indexOf('.pdf') >= 0) rc = 'application/pdf';
            else if (fn.indexOf('.zip') >= 0) rc = 'application/zip';
            else if (fn.indexOf('.png') >= 0) rc = 'image/png';
            else if (fn.indexOf('.jpg') >= 0 || fn.indexOf('.jpeg') >= 0) rc = 'image/jpg';
            else if (fn.indexOf('.tiff') >= 0 || fn.indexOf('.tif') >= 0) rc = 'image/tiff';
    
            types.push(rc);
        });
    
        return types;

    }
    catch(error){
        console.log("Something went wrong trying to get the content types");
    }
};

const getBase64 = async(filesPath) => {
    let bases = [];

    filesPath.forEach( file => {
        try{
            const bitmap = fs.readFileSync(file);
            bases.push(Buffer.from(bitmap, 'base64'));
        } 
        catch(error){
            console.log("Something went wrong trying to get the base 64");
        }
    })

    return bases;
};

const setNewName = async(files) => {
    let names = [];

    try{

        Object.keys(files).forEach(key => {
            names.push([key, `${new Date().getTime()}-${files[key].name}`]);
        });

        return names;

    }
    catch(error){
        console.log("Something went wrong trying to set the new files names");
    }

};

const uploadFile = async(filesName, filesBase64, contentsType) => {
    try{
        const UploadFiles = filesName.map(async(name, key) => {
            return await uploadFileS3(name, filesBase64[key], contentsType[key]);
        });

        let FilesUploaded = await Promise.all(UploadFiles);
        deleteFromServer();
        return FilesUploaded;
    }
    catch(error){
        console.log("Something went wrong trying to upload the files to S3");
    }
};

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

const deleteFromS3 = async(files) => {
    //return new Promise((resolve, reject) => {

        try{
            //console.log(files.file);
            const bucket = S3.bucket();
            // const callback = (error, data) => {
            // if(error){
            //     reject(error);
            //     return;
            // }
            //     console.log(data);
            //     resolve(data);
            // };
            var params = {
                Key: files.file
            };
            console.log(params);
            bucket.deleteObject(params,(err, data) => {
                console.log(err);
                console.log(data);
            });
        }
        catch(error){
            console.log("Something went wrong trying to delete a file from S3");
        }
    //});
}

const uploadFileS3 = async(name, base64, contentType) => {
    return new Promise((resolve, reject) => {
      const params = {
        Key: `${name[1]}`, ACL: 'public-read', Body: base64, ContentType: contentType,
      };
      const bucket = S3.bucket();
      const callback = (error, data) => {
        if (error) {
          reject(error);
          return;
        }
        let url = {}
        resolve({[name[0]] : data.Location});
      };
      bucket.upload(params, callback);
    });
}



const filesUploadCore = async(files) => {

    return new Promise(async(resolve, reject) => {

        try{

            const filesPath = await moveFile(files);
            const contentsType = await getContentType(files);
            const filesBase64 = await getBase64(filesPath);
            const filesName = await setNewName(files);
            const urls = await uploadFile(filesName, filesBase64, contentsType);

            resolve(urls[0]);

        }
        catch(error){
            console.log("Something went wrong in the files upload core");
        }

    });


}

//moveFile, getContentType, getBase64, setNewName, uploadFile

module.exports = {
    filesUploadCore, deleteFromS3
};