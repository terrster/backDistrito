const AWS = require('./aws');

const bucket = () => new AWS.S3({
  params: { Bucket: `${process.env.AWS_BUCKET}` },
});

module.exports = { bucket };
