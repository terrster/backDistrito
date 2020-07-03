'use strict'

const fs = require('fs');
const path = require("path");
require('dotenv').config({
    path: `.env.${process.env.NODE_ENV}`
});
const S3 = require('../services/s3/buckets');
const uploadDir = "../../../public/tmpFiles/";

const moveFile = async(file) => {
    // const UploadFiles = Object.keys(files).map(async(key) => {
    //     if(files[key].length){
    //         let filesmv = [];
    //         for await(let file of files[key]){
    //             let file_moved = await new Promise((resolve, reject) => {
    //                 let filePath = path.resolve(__dirname, uploadDir + file.name);
    //                 const callback = (error, success) => {
    //                     if(error){
    //                         console.log("Something went wrong trying to upload the files to the server");
    //                     }
    //                     resolve(filePath);
    //                     };
    //                     file.mv(filePath, callback);
    //             });
    //             filesmv.push(file_moved);
    //         }
    //         return {[key]: filesmv};
    //     }
    //     else{
    //         return new Promise((resolve, reject) => {
    //             let filePath = path.resolve(__dirname, uploadDir + files[key].name);
    //             const callback = (error, success) => {
    //                 if(error){
    //                     console.log("Something went wrong trying to upload the files to the server");
    //                 }
    //                 resolve({[key]: filePath});
    //                 };
    //                 files[key].mv(filePath, callback);
    //         });
    //     }
    // });

    // const UploadFiles = Object.keys(files).map(async(key) => {
    //     return new Promise((resolve, reject) => {
    //         let filePath = path.resolve(__dirname, uploadDir + files[key].name);
    //         const callback = (error, success) => {
    //             if(error){
    //                 console.log("Something went wrong trying to upload the files to the server");
    //             }
    //             resolve(filePath);
    //           };
    //           files[key].mv(filePath, callback);
    //     });
    // });

    // let uploadedFiles = await Promise.all(UploadFiles);

    // return uploadedFiles;

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
    // let types = [];

    try{
    //     const GetContentTypes = Object.keys(files).map(async(key) => {       
    //         if(files[key].length){ 
    //             let obj = [];    
    //             for await(let file of files[key]){
    //                 let rc_result = await new Promise((resolve, reject) => {
    //                     let rc = 'application/octet-stream';
    //                     const fn = file.name.toLowerCase();
    //                     if (fn.indexOf('.pdf') >= 0) rc = 'application/pdf';
    //                     else if (fn.indexOf('.zip') >= 0) rc = 'application/zip';
    //                     else if (fn.indexOf('.png') >= 0) rc = 'image/png';
    //                     else if (fn.indexOf('.jpg') >= 0 || fn.indexOf('.jpeg') >= 0) rc = 'image/jpg';
    //                     else if (fn.indexOf('.tiff') >= 0 || fn.indexOf('.tif') >= 0) rc = 'image/tiff';
    //                     const callback = (error, success) => {
    //                         if(error){
    //                             console.log("Something went wrong trying to get the content type");
    //                         }
    //                         resolve(rc);
    //                     };
    //                     callback();
    //                 });
    //                 obj.push(rc_result); 
    //             }
    //             return {[key]: obj}
    //         }
    //         else{
    //             let rc_result = await new Promise((resolve, reject) => {
    //                 let rc = 'application/octet-stream';
    //                 const fn = files[key].name.toLowerCase();
    //                 if (fn.indexOf('.pdf') >= 0) rc = 'application/pdf';
    //                 else if (fn.indexOf('.zip') >= 0) rc = 'application/zip';
    //                 else if (fn.indexOf('.png') >= 0) rc = 'image/png';
    //                 else if (fn.indexOf('.jpg') >= 0 || fn.indexOf('.jpeg') >= 0) rc = 'image/jpg';
    //                 else if (fn.indexOf('.tiff') >= 0 || fn.indexOf('.tif') >= 0) rc = 'image/tiff';
    //                 const callback = (error, success) => {
    //                     if(error){
    //                         console.log("Something went wrong trying to get the content type");
    //                     }
    //                     resolve(rc);
    //                 };
    //                 callback();
    //             });

    //             return {[key]: rc_result};
    //         }
    //     });
        // Object.keys(files).forEach(key => {
        //     let rc = 'application/octet-stream';
        //     const fn = files[key].name.toLowerCase();
        //     if (fn.indexOf('.pdf') >= 0) rc = 'application/pdf';
        //     else if (fn.indexOf('.zip') >= 0) rc = 'application/zip';
        //     else if (fn.indexOf('.png') >= 0) rc = 'image/png';
        //     else if (fn.indexOf('.jpg') >= 0 || fn.indexOf('.jpeg') >= 0) rc = 'image/jpg';
        //     else if (fn.indexOf('.tiff') >= 0 || fn.indexOf('.tif') >= 0) rc = 'image/tiff';
    
        //     types.push(rc);
        // });

        // let ContentTypes = await Promise.all(GetContentTypes);

        // return ContentTypes;

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
    // let bases = [];

    // for (var i = 0; i < filesPath.length; i++) {
    //     for (var key in filesPath[i]){
    //         if(Array.isArray(filesPath[i][key])){
    //             let obj = [];    
    //             for await(let file of filesPath[i][key]){
    //                 const bitmap = fs.readFileSync(file);
    //                 obj.push(Buffer.from(bitmap, 'base64'));
    //             }
    //             bases.push({[key]: obj});
    //         }
    //         else{
    //             const bitmap = fs.readFileSync(filesPath[i][key]);
    //             bases.push({[key]: Buffer.from(bitmap, 'base64')});
    //         }
    //     }
    // }

    // Object.keys(filesPath[0]).map(async(key, name) => {
    //     console.log(filesPath[key])
        //if(filesPath[key].length){ 
            // let obj = [];    
            // for await(let file of filesPath[key]){
            //     const bitmap = fs.readFileSync(file[key]);
            //     obj.push(Buffer.from(bitmap, 'base64'));
            // }
            // bases.push({[key]: obj});
       // }
       // else{
            // const bitmap = fs.readFileSync(filesPath[key]);
            // bases.push({[key]: Buffer.from(bitmap, 'base64')});
       // }
        // try{
        //     if(Array.isArray(filesPath[key])){
        //         let obj = []; 
        //         for (let i = 0; i<filesPath[key].length; i++){
        //             const bitmap = fs.readFileSync(filesPath[key][i]);
        //             obj.push(Buffer.from(bitmap, 'base64'));
        //         }
        //         bases.push(obj);
        //     }
        //     else{
        //         const bitmap = fs.readFileSync(filesPath[key]);
        //         bases.push(Buffer.from(bitmap, 'base64'));
        //     }
        // }
        // catch(error){
        //     console.log(error);
        // }

    //});
    // filesPath.forEach( file => {
    //     try{
    //         const bitmap = fs.readFileSync(file);
    //         bases.push(Buffer.from(bitmap, 'base64'));
    //     } 
    //     catch(error){
    //         console.log("Something went wrong trying to get the base 64");
    //     }
    // });
    //
    //return bases;

    const bitmap = fs.readFileSync(filePath);
    return Buffer.from(bitmap, 'base64');
};

const setNewName = async(file) => {
    //let names = [];

    try{
        // Object.keys(files).forEach(key => {
        //     if(files[key].length){
        //         let obj = []; 
        //         for (let i = 0; i<files[key].length; i++){
        //             obj.push(`${new Date().getTime()}-${files[key][i].name}`);
        //         }
        //         names.push({[key]: obj});
        //     }
        //     else{
        //         names.push({[key]: `${new Date().getTime()}-${files[key].name}`});
        //     }
            // if(Array.isArray(files[key])){
            //     let obj = []; 
            //     for (let i = 0; i<files[key].length; i++){
            //         obj.push([key, `${new Date().getTime()}-${files[key][i].name}`]);
            //     }
            //     names.push(obj);
            // }
            // else{
            //     names.push([key, `${new Date().getTime()}-${files[key].name}`]);
            // }
        //});
        //
        //return names;
        return `${new Date().getTime()}-${file.name}`;
    }
    catch(error){
        console.log("Something went wrong trying to set the new files names");
    }

    // try{
    //     Object.keys(files).forEach(key => {
    //         names.push([key, `${new Date().getTime()}-${files[key].name}`]);
    //     });

    //     return names;

    // }
    // catch(error){
    //     console.log("Something went wrong trying to set the new files names");
    // }

};

const uploadFile = async(fileName, fileBase64, contentType) => {

    try{
        // const UploadFiles = async() => {
        //     for (var i = 0; i < filesName.length; i++) {
        //         for (var key in filesName[i]){
        //             if(Array.isArray(filesName[i][key])){
        //                 let p = 0;
        //                 let obj = [];
        //                 for await(let file of filesName[i][key]){
        //                     // console.log(file);
        //                     // console.log(filesBase64[i][key][p]);
        //                     // console.log(contentsType[i][key][p]);
        //                     console.log(file, filesBase64[i][key][p], contentsType[i][key][p])
        //                     // let upload = async() => {
        //                     //     let url = await uploadFileS3(file, filesBase64[i][key][p], contentsType[i][key][p]);
        //                     //     return url;
        //                     // }
        //                     // let result = upload();
        //                     // obj.push(result)
        //                     p++;
        //                 }
        //                 return {[key]: obj}
        //             }
        //             else{
        //                 // console.log(filesName[i][key]);
        //                 // console.log(filesBase64[i][key]);
        //                 // console.log(contentsType[i][key]);
        //                 // let url = await uploadFileS3(file, filesBase64[i][key], contentsType[i][key]);
        //                 // return {[key]: url}
        //             }
        //         }
        //     }
        // }

        // const UploadFiles = filesName.map(async(name, key) => {
        //     let index = Object.keys(name)[0];
        //     //return await uploadFileS3(name, filesBase64[key], contentsType[key]);
        //     //console.log(filesName[key][index]);
        //     if(Array.isArray(filesName[key][index])){
        //         let obj = [];
        //         let p = 0;
        //         for await(let file of filesName[key][index]){
        //             //console.log(file);
        //             // console.log(filesBase64[key][index][p]);
        //             // console.log(contentsType[key][index][p]);                    
        //             let url = await new Promise(async(resolve, reject) => {
        //                 let result = await uploadFileS3(file, filesBase64[key][index][p], contentsType[key][index][p]);
        //                 const callback = (error, success) => {
        //                     if(error){
        //                         console.log("Something went wrong trying to upload the files to S3");
        //                     }
        //                     resolve(result);
        //                 };
        //                 callback();
        //             });
        //             obj.push(url); 
        //             p++;
        //         }
        //         return {[index]: obj};
        //     }
        //     else{
        //         // console.log(filesName[key][index]);
        //         // console.log(filesBase64[key][index]);
        //         // console.log(contentsType[key][index]);
        //         return new Promise(async(resolve, reject) => {
        //             let result = await uploadFileS3(filesName[key][index], filesBase64[key][index], contentsType[key][index]);
        //             const callback = (error, success) => {
        //                 if(error){
        //                     console.log("Something went wrong trying to upload the files to S3");
        //                 }
        //                 resolve({[index]: result});
        //             };
        //             callback();
        //         });
        //     }
        // });

        // let FilesUploaded = {};
        // FilesUploaded = await Promise.all(UploadFiles);
        // //console.log(FilesUploaded.oficialID)
        // deleteFromServer();
        // return FilesUploaded;

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

    // try{
    //     const UploadFiles = filesName.map(async(name, key) => {
    //         return await uploadFileS3(name, filesBase64[key], contentsType[key]);
    //     });

    //     let FilesUploaded = await Promise.all(UploadFiles);
    //     deleteFromServer();
    //     return FilesUploaded;
    // }
    // catch(error){
    //     console.log("Something went wrong trying to upload the files to S3");
    // }
};

const uploadFileS3 = async(name, base64, contentType) => {
    // console.log(name);
    // console.log(base64);
    // console.log(contentType);
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

            const filePath = await moveFile(file);//console.log(filesPath);
            const contentType = await getContentType(file);//console.log(contentType);
            const fileBase64 = await getBase64(filePath);//console.log(fileBase64);
            const fileName = await setNewName(file);//console.log(fileName);
            const url = await uploadFile(fileName, fileBase64, contentType);//console.log(url);
            
            resolve(url);

        }
        catch(error){
            console.log("Something went wrong trying to upload files");
        }

    });

}

module.exports = {
    UploadFilesToS3,
    deleteFromServer
};