const Project = require('../models/Project');
const Epic = require('../models/Epic');
const Story = require('../models/Story');
const Sprint = require('../models/Sprint');
const AuditLog = require('../models/AuditLog');

// @desc    Get project dashboard data
// @route   GET /api/dashboard/:projectId
// @access  Private
const getDashboard = async (req, res) => {
  const project = await Project.findById(req.params.projectId)
    .populate('owner', 'name email avatar')
    .populate('members.user', 'name email avatar');

  if (!project) return res.status(404).json({ success: false, message: 'Project not found' });

  const [epics, stories, sprints, recentActivity] = await Promise.all([
    Epic.find({ project: project._id }).sort({ order: 1 }),
    Story.find({ project: project._id })
      .populate('assignee', 'name email avatar')
      .sort('-updatedAt'),
    Sprint.find({ project: project._id }).sort({ order: 1 }),
    AuditLog.find({ project: project._id })
      .populate('user', 'name email avatar')
      .sort('-createdAt')
      .limit(15),
  ]);

  // Stats
  const totalStories = stories.length;
  const doneStories = stories.filter((s) => s.status === 'done').length;
  const inProgressStories = stories.filter((s) => s.status === 'in_progress').length;
  const toDoStories = stories.filter((s) => s.status === 'to_do').length;
  const notStarted = stories.filter((s) => s.codeStatus === 'not_started').length;
  const codeDone = stories.filter((s) => s.codeStatus === 'done').length;
  const codePartial = stories.filter((s) => s.codeStatus === 'partial').length;

  // Risk alerts
  const risks = [];
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  stories.forEach((s) => {
    if (s.status === 'in_progress' && (!s.updatedAt || s.updatedAt < threeDaysAgo)) {
      risks.push({ type: 'stale_story', message: `Story "${s.title}" has had no updates for 3+ days`, storyId: s._id });
    }
    if (s.dueDate && new Date(s.dueDate) < new Date() && s.status !== 'done') {
      risks.push({ type: 'overdue', message: `Story "${s.title}" is overdue`, storyId: s._id });
    }
  });

  if (project.deadline && new Date(project.deadline) < new Date() && project.completionPercentage < 100) {
    risks.push({ type: 'project_overdue', message: 'Project deadline has passed with incomplete stories' });
  }

  // Module heatmap: by epic
  const heatmap = epics.map((epic) => {
    const epicStories = stories.filter(
      (s) => s.epic && s.epic.toString() === epic._id.toString()
    );
    const done = epicStories.filter((s) => s.status === 'done').length;
    const total = epicStories.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return {
      epicId: epic._id,
      title: epic.title,
      total,
      done,
      completionPercentage: pct,
      status: pct === 100 ? 'green' : pct > 0 ? 'yellow' : 'red',
    };
  });

  // Sprint velocity data
  const activeSprint = sprints.find((s) => s.status === 'active');
  const burndownData = activeSprint?.burndownData || [];

  res.status(200).json({
    success: true,
    data: {
      project,
      stats: {
        total: totalStories,
        done: doneStories,
        inProgress: inProgressStories,
        toDo: toDoStories,
        completionPercentage: project.completionPercentage,
        codeStatus: { done: codeDone, partial: codePartial, notStarted },
      },
      epics,
      heatmap,
      risks,
      recentActivity,
      activeSprint,
      burndownData,
      sprints,
    },
  });
};

// @desc    Get project-level overview (admin multi-project)
// @route   GET /api/dashboard/overview
// @access  Private
const getOverview = async (req, res) => {
  const projects = await Project.find({
    $or: [{ owner: req.user.id }, { 'members.user': req.user.id }],
  }).sort('-updatedAt');

  const summaries = projects.map((p) => ({
    id: p._id,
    name: p.name,
    key: p.key,
    status: p.status,
    completionPercentage: p.completionPercentage,
    totalStories: p.totalStories,
    completedStories: p.completedStories,
    deadline: p.deadline,
    color: p.color,
  }));

  res.status(200).json({ success: true, data: summaries });
};

module.exports = { getDashboard, getOverview };
