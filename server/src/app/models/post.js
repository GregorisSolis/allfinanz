const mongoose = require('mongoose');
const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3'); // ✅ Importación del SDK v3
const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

// ✅ Corrección de configuración del cliente S3 con v3
const s3 = new S3Client({
  region: process.env.AWS_DEFAULT_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

const PostSchema = new mongoose.Schema({
  name: String,
  size: Number,
  key: String,
  url: String,
  user: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// ✅ Asignar URL local si no se provee
PostSchema.pre('save', function () {
  if (!this.url) {
    this.url = `${process.env.APP_URL}/files/${this.key}`;
  }
});

// ✅ Borrado local o en S3 usando SDK v3
PostSchema.pre('remove', async function () {
  if (process.env.STORAGE_TYPE === "s3") {
    try {
      const deleteParams = {
        Bucket: process.env.AWS_BUCKET,
        Key: this.key
      };
      const command = new DeleteObjectCommand(deleteParams);
      await s3.send(command); // Enviar el comando para eliminar el archivo
    } catch (error) {
      console.error('Error al eliminar objeto en S3:', error);
    }
  } else {
    return promisify(fs.unlink)(
      path.resolve(__dirname, "..", "..", "tmp", "uploads", this.key)
    );
  }
});

module.exports = mongoose.model('Post', PostSchema);
