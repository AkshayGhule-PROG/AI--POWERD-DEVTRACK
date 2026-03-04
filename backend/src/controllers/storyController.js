const Epic = require('../models/Epic');
const Story = require('../models/Story');
const Project = require('../models/Project');
const AuditLog = require('../models/AuditLog');
const aiService = require('../services/aiService');

// @desc    Get epics and stories for a project
// @route   GET /api/stories/project/:projectId
// @access  Private
const getStoriesByProject = async (req, res) => {
  const { epicId, status, type } = req.query;
  const filter = { project: req.params.projectId };
  if (epicId) filter.epic = epicId;
  if (status) filter.status = status;
  if (type) filter.type = type;

  const stories = await Story.find(filter)
    .populate('epic', 'title epicKey color')
    .populate('assignee', 'name email avatar')
    .populate('reporter', 'name email avatar')
    .sort({ order: 1, createdAt: -1 });

  res.status(200).json({ success: true, count: stories.length, data: stories });
};

// @desc    Get epics for a project
// @route   GET /api/stories/epics/:projectId
// @access  Private
const getEpics = async (req, res) => {
  const epics = await Epic.find({ project: req.params.projectId }).sort({ order: 1 });
  res.status(200).json({ success: true, count: epics.length, data: epics });
};

// @desc    Generate stories using AI
// @route   POST /api/stories/generate/:projectId
// @access  Private (Scrum Master)
const generateStories = async (req, res) => {
  const { moduleName, documentId, additionalContext } = req.body;

  if (!moduleName) {
    return res.status(400).json({ success: false, message: 'Module name is required' });
  }

  const project = await Project.findById(req.params.projectId);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

  const result = await aiService.generateStories({
    projectId: project._id.toString(),
    projectName: project.name,
    moduleName,
    documentId,
    additionalContext,
    budget: project.budget,
    deadline: project.deadline,
  });

  await AuditLog.create({
    project: project._id,
    user: req.user.id,
    action: 'stories_generated',
    entity: 'project',
    entityId: project._id,
    details: { moduleName, generatedCount: result.stories?.length || 0 },
    ipAddress: req.ip,
  });

  res.status(200).json({ success: true, data: result });
};

// @desc    Save/approve generated stories
// @route   POST /api/stories/save/:projectId
// @access  Private (Scrum Master)
const saveGeneratedStories = async (req, res) => {
  const { epics, stories, tasks } = req.body;

  const project = await Project.findById(req.params.projectId);
  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

  const savedEpics = [];
  const epicMap = {};

  // Save epics
  for (const epicData of (epics || [])) {
    const epic = await Epic.create({
      project: project._id,
      title: epicData.title,
      description: epicData.description,
      sprint: epicData.sprint || 'backlog',
      priority: epicData.priority || 'medium',
      epicKey: `${project.key}-EPIC-${Date.now()}`,
      aiGenerated: true,
      status: 'approved',
    });
    savedEpics.push(epic);
    epicMap[epicData.tempId || epicData.title] = epic._id;
  }

  // Save stories and tasks
  const savedStories = [];
  for (const storyData of [...(stories || []), ...(tasks || [])]) {
    const epicRef = storyData.epicTempId
      ? epicMap[storyData.epicTempId]
      : savedEpics[0]?._id;

    const story = await Story.create({
      project: project._id,
      epic: epicRef,
      type: storyData.type || 'story',
      title: storyData.title,
      description: storyData.description,
      acceptanceCriteria: (storyData.acceptanceCriteria || []).map((c) => ({
        criterion: typeof c === 'string' ? c : c.criterion,
        met: false,
      })),
      sprint: storyData.sprint || 'backlog',
      priority: storyData.priority || 'medium',
      storyPoints: storyData.storyPoints || 0,
      storyKey: `${project.key}-${Date.now()}`,
      aiGenerated: true,
      status: 'approved',
      reporter: req.user.id,
    });
    savedStories.push(story);
  }

  // Update project counts
  await updateProjectCounts(project._id);

  res.status(201).json({
    success: true,
    data: { epics: savedEpics, stories: savedStories },
  });
};

// @desc    Create story manually
// @route   POST /api/stories
// @access  Private
const createStory = async (req, res) => {
  const story = await Story.create({ ...req.body, reporter: req.user.id });
  await updateProjectCounts(story.project);
  res.status(201).json({ success: true, data: story });
};

// @desc    Update story
// @route   PUT /api/stories/:id
// @access  Private
const updateStory = async (req, res) => {
  const story = await Story.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('assignee', 'name email avatar').populate('epic', 'title');

  if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

  await updateProjectCounts(story.project);

  // Emit socket event
  const io = req.app.get('io');
  if (io) {
    io.to(`project:${story.project}`).emit('story:updated', story);
  }

  await AuditLog.create({
    project: story.project,
    user: req.user.id,
    action: 'story_edited',
    entity: 'story',
    entityId: story._id,
    details: { changes: Object.keys(req.body) },
    ipAddress: req.ip,
  });

  res.status(200).json({ success: true, data: story });
};

// @desc    Delete story
// @route   DELETE /api/stories/:id
// @access  Private
const deleteStory = async (req, res) => {
  const story = await Story.findById(req.params.id);
  if (!story) return res.status(404).json({ success: false, message: 'Story not found' });

  await story.deleteOne();
  await updateProjectCounts(story.project);

  await AuditLog.create({
    project: story.project,
    user: req.user.id,
    action: 'story_deleted',
    entity: 'story',
    entityId: story._id,
    ipAddress: req.ip,
  });

  res.status(200).json({ success: true, message: 'Story deleted' });
};

// Helper: update project story counts
const updateProjectCounts = async (projectId) => {
  const total = await Story.countDocuments({ project: projectId, type: { $in: ['story', 'task'] } });
  const completed = await Story.countDocuments({ project: projectId, status: 'done' });
  const inProgress = await Story.countDocuments({ project: projectId, status: 'in_progress' });
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  await Project.findByIdAndUpdate(projectId, {
    totalStories: total,
    completedStories: completed,
    inProgressStories: inProgress,
    completionPercentage,
  });

  // Update epics
  const epics = await Epic.find({ project: projectId });
  for (const epic of epics) {
    const epicTotal = await Story.countDocuments({ epic: epic._id });
    const epicDone = await Story.countDocuments({ epic: epic._id, status: 'done' });
    await Epic.findByIdAndUpdate(epic._id, {
      totalStories: epicTotal,
      completedStories: epicDone,
      completionPercentage: epicTotal > 0 ? Math.round((epicDone / epicTotal) * 100) : 0,
    });
  }
};

module.exports = {
  getStoriesByProject,
  getEpics,
  generateStories,
  saveGeneratedStories,
  createStory,
  updateStory,
  deleteStory,
};
