const Sprint = require('../models/Sprint');
const Story = require('../models/Story');
const Project = require('../models/Project');

const getSprints = async (req, res) => {
  const sprints = await Sprint.find({ project: req.params.projectId }).sort({ order: 1 });
  res.status(200).json({ success: true, data: sprints });
};

const createSprint = async (req, res) => {
  const count = await Sprint.countDocuments({ project: req.params.projectId });
  const sprint = await Sprint.create({
    ...req.body,
    project: req.params.projectId,
    name: req.body.name || `Sprint ${count + 1}`,
    order: count + 1,
  });
  res.status(201).json({ success: true, data: sprint });
};

const updateSprint = async (req, res) => {
  const sprint = await Sprint.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!sprint) return res.status(404).json({ success: false, message: 'Sprint not found' });

  if (req.body.status === 'active') {
    await Sprint.updateMany(
      { project: sprint.project, _id: { $ne: sprint._id }, status: 'active' },
      { status: 'completed' }
    );
  }

  res.status(200).json({ success: true, data: sprint });
};

const deleteSprint = async (req, res) => {
  const sprint = await Sprint.findById(req.params.id);
  if (!sprint) return res.status(404).json({ success: false, message: 'Sprint not found' });
  await sprint.deleteOne();
  res.status(200).json({ success: true, message: 'Sprint deleted' });
};

module.exports = { getSprints, createSprint, updateSprint, deleteSprint };
