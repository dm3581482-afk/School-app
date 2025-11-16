const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = 'uploads/';

    if (file.fieldname === 'map3d') {
      uploadPath = 'uploads/maps/';
    } else if (file.fieldname === 'thumbnail') {
      uploadPath = 'uploads/thumbnails/';
    } else if (file.fieldname === 'attachment') {
      uploadPath = 'uploads/attachments/';
    }

    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // For 3D models
  if (file.fieldname === 'map3d') {
    const allowedTypes = /glb|gltf|obj|fbx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only 3D model files are allowed (GLB, GLTF, OBJ, FBX)'));
    }
  }

  // For images
  if (file.fieldname === 'thumbnail') {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }

  // For general attachments
  if (file.fieldname === 'attachment') {
    return cb(null, true);
  }

  cb(null, true);
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  },
  fileFilter: fileFilter
});

module.exports = upload;
