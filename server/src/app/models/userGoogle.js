const mongoose = require('../../database')

const UserGoogleSchema = new mongoose.Schema({
    googleId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    createdAt: { type: Date, default: Date.now },
    savings: { type: mongoose.Schema.Types.Decimal128, initialize: 0 },
    monthlyIconme: { type: mongoose.Schema.Types.Decimal128, initialize: 0 },
    photoProfileUrl: String,
    photoBannerUrl: String,
    keyPhotoProfile: String,
    keyPhotoBanner: String,
})

UserGoogleSchema.pre('save', async function (next) {
    next()
})

const UserGoogle = mongoose.model('UserGoogle', UserGoogleSchema)

module.exports = UserGoogle