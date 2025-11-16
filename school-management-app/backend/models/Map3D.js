const mongoose = require('mongoose');

const map3DSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  modelUrl: {
    type: String,
    required: true // URL to 3D model file (GLB, GLTF, etc.)
  },
  thumbnailUrl: {
    type: String
  },
  fileSize: {
    type: Number // in bytes
  },
  fileFormat: {
    type: String,
    enum: ['glb', 'gltf', 'obj', 'fbx'],
    default: 'glb'
  },
  isActive: {
    type: Boolean,
    default: false // Only one map can be active at a time
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  metadata: {
    cameraPosition: {
      x: { type: Number, default: 5 },
      y: { type: Number, default: 5 },
      z: { type: Number, default: 5 }
    },
    cameraTarget: {
      x: { type: Number, default: 0 },
      y: { type: Number, default: 0 },
      z: { type: Number, default: 0 }
    },
    scale: {
      type: Number,
      default: 1
    },
    lighting: {
      ambient: { type: Number, default: 0.5 },
      directional: { type: Number, default: 1 }
    }
  },
  markers: [{
    name: String,
    description: String,
    position: {
      x: Number,
      y: Number,
      z: Number
    },
    type: {
      type: String,
      enum: ['room', 'building', 'facility', 'other']
    }
  }]
}, {
  timestamps: true
});

// Ensure only one map is active
map3DSchema.pre('save', async function(next) {
  if (this.isActive) {
    await mongoose.model('Map3D').updateMany(
      { _id: { $ne: this._id } },
      { isActive: false }
    );
  }
  next();
});

module.exports = mongoose.model('Map3D', map3DSchema);
