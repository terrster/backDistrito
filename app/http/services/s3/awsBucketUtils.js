const fs = require('fs');
const path = require('path');
const S3 = require('./buckets');

async function uploadFile(name, base64, contentType) {
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
    };
    bucket.upload(params, callback);
  });
}

const moveFile = (file) => new Promise((resolve, reject) => {
  const filePath = path.resolve(__dirname, `images/${file.name}`);
  file.mv(filePath, (error) => {
    if (error) {
      reject(error);
      return;
    }
    resolve(filePath);
  });
});

const getContentType = (fileName) => {
  let rc = 'application/octet-stream';
  const fn = fileName.toLowerCase();
  if (fn.indexOf('.pdf') >= 0) rc = 'application/pdf';
  else if (fn.indexOf('.zip') >= 0) rc = 'application/zip';
  else if (fn.indexOf('.png') >= 0) rc = 'image/png';
  else if (fn.indexOf('.jpg') >= 0 || fn.indexOf('.jpeg') >= 0) rc = 'image/jpg';
  else if (fn.indexOf('.tiff') >= 0 || fn.indexOf('.tif') >= 0) rc = 'image/tiff';
  return rc;
};

const getBase64 = (filePath) => new Promise((resolve, reject) => {
  try {
    const bitmap = fs.readFileSync(filePath);
    resolve(Buffer.from(bitmap, 'base64'));
  } catch (error) {
    reject(error);
  }
});
module.exports = {
  uploadFile, moveFile, getContentType, getBase64,
};
