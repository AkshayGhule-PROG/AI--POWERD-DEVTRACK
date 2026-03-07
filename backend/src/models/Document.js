const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['pdf', 'docx', 'txt', 'doc', 'md'],
      required: true,
    },
    filePath: {
      type: String,
    },
    fileSize: {
      type: Number,
    },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'processed', 'failed'],
      default: 'uploaded',
    },
    ingestionStatus: {
      chunks: { type: Number, default: 0 },
      embeddings: { type: Number, default: 0 },
      processingTime: { type: Number, default: 0 }, // ms
      errorMessage: { type: String },
    },
    extractedText: {
      type: String,
      select: false,
    },
    version: {
      type: Number,
      default: 1,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    vectorNamespace: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Document', DocumentSchema);
