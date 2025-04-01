const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "koncerti", // Mapa v Cloudinary
        format: async (req, file) => "jpeg", // Format slike
        public_id: (req, file) => file.originalname.split(".")[0], // Ime datoteke
    },
});

const upload = multer({ storage: storage });

module.exports = upload;
