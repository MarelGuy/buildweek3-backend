const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

const { extname } = require("path");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: process.env.FOLDER_NAME,
    allowedFormats: ["jpg", "png", "jpeg"],
  },
});
const uploadCloudinary = multer({ storage: storage });
const uploadCloudinaryWithLimit = multer({
  storage: storage,
  fileFilter: function (req, file, callback) {
    const ext = extname(file.originalname);
    const mime = file.mimetype;
    if (
      ext !== ".jpg" &&
      ext !== ".jpeg" &&
      ext !== ".png" &&
      mime !== "image/png" &&
      mime !== "image/jpg" &&
      mime !== "image/jpeg"
    ) {
      return callback(new Error("Only images under 200kb are allowed"));
    }
    callback(null, true);
  },
  limits: { fileSize: 200000 },
});

module.exports = { uploadCloudinary, uploadCloudinaryWithLimit };
