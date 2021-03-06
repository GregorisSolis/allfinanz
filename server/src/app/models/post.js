const mongoose = require('mongoose');
const aws = require('aws-sdk')
const fs = require('fs')
const path = require('path')
const { promisify } = require('util')

const s3 = new aws.S3(
	process.env.AWS_ACCESS_KEY_ID,
	process.env.AWS_SECRET_ACCESS_KEY,
	process.env.AWS_DEFAULT_REGION
);


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
})

PostSchema.pre('save', function () {
	if (!this.url) {
		this.url = `${process.env.APP_URL}/files/${this.key}`
	}
})

PostSchema.pre('remove', function () {

	if (process.env.STORAGE_TYPE === "s3") {
		return s3
			.deleteObject({
				Bucket: process.env.AWS_BUCKET,
				Key: this.key
			})
			.promise()
			.then(response => {
				//console.log(response.status);
			})
			.catch(response => {
				//console.log(response.status);
			});
	} else {
		return promisify(fs.unlink)(
			path.resolve(__dirname, "..", "..", "tmp", "uploads", this.key))
	}
})

module.exports = mongoose.model('Post', PostSchema)