const mongoose = require('mongoose');

const EpicSchema = new mongoose.Schema(
  {
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Epic title is required'],
      trim: true,
    },
    description: {
      type: String,
    },
    epicKey: {
      type: String,
      trim: true,
    },
    jiraEpicId: {
      type: String,
    },
    jiraEpicKey: {
      type: String,
    },
    status: {
      type: String,
      enum: ['draft', 'approved', 'in_progress', 'done', 'cancelled'],
      default: 'draft',
    },
    priority: {
      type: String,
      enum: ['highest', 'high', 'medium', 'low', 'lowest'],
      default: 'medium',
    },
    sprint: {
      type: String,
      enum: ['S1', 'S2', 'S3', 'S4', 'backlog'],
      default: 'backlog',
    },
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalStories: { type: Number, default: 0 },
    completedStories: { type: Number, default: 0 },
    color: {
      type: String,
      default: '#6366f1',
    },
    aiGenerated: {
      type: Boolean,
      default: false,
    },
    generatedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Document',
    },
    pushedToJira: {
      type: Boolean,
      default: false,
    },
    pushedAt: {
      type: Date,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

module.exports = mongoose.model('Epic', EpicSchema);
