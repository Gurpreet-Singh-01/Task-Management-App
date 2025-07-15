const multer = require('multer');

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
    fileFilter: (req, file, cb) => {
        const fileTypes = /jpeg|jpg|png/;
        const mimetype = fileTypes.test(file.mimetype);
        if(mimetype) {
            return cb(null, true);
        }
        return cb(new Error('Only .jpeg, .jpg, and .png files are allowed!'));
    }
})

module.exports = upload;