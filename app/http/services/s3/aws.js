const AWS = require('aws-sdk');

const credentials = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_KEY,
};
AWS.config.update(credentials);
AWS.config.region = process.env.AWS_REGION;
module.exports = AWS;
