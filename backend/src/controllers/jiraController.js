const axios = require('axios');
const Project = require('../models/Project');
const Epic = require('../models/Epic');
const Story = require('../models/Story');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const getJiraClient = async (userId) => {
  const user = await User.findById(userId).select('+jiraApiToken');
  if (!user.jiraApiToken || !user.jiraEmail || !user.jiraDomain) {
    const err = new Error('Jira credentials not configured. Please add your Jira email, domain, and API token in Settings.');
    err.statusCode = 400;
    throw err;
  }
  return {
    baseURL: `https://${user.jiraDomain}/rest/api/3`,
    auth: { username: user.jiraEmail, password: user.jiraApiToken },
  };
};

// @desc    Test Jira connection
// @route   GET /api/jira/test
// @access  Private
const testConnection = async (req, res) => {
  const client = await getJiraClient(req.user.id);
  const response = await axios.get(`${client.baseURL}/myself`, { auth: client.auth });
  res.status(200).json({ success: true, data: response.data });
};

// @desc    Get Jira projects
// @route   GET /api/jira/projects
// @access  Private
const getJiraProjects = async (req, res) => {
  const client = await getJiraClient(req.user.id);
  const response = await axios.get(`${client.baseURL}/project`, { auth: client.auth });
  res.status(200).json({ success: true, data: response.data });
};

// @desc    Connect project to Jira
// @route   POST /api/jira/connect/:projectId
// @access  Private
const connectProject = async (req, res) => {
  const { jiraProjectKey } = req.body;
  if (!jiraProjectKey) return res.status(400).json({ success: false, message: 'Jira project key is required' });

  const project = await Project.findByIdAndUpdate(
    req.params.projectId,
    { jiraProjectKey, jiraConnected: true },
    { new: true }
  );

  res.status(200).json({ success: true, data: project });
};

// @desc    Push stories to Jira
// @route   POST /api/jira/push/:projectId
// @access  Private
const pushToJira = async (req, res) => {
  const { epicIds, storyIds } = req.body;
  const project = await Project.findById(req.params.projectId);

  if (!project.jiraConnected || !project.jiraProjectKey) {
    return res.status(400).json({ success: false, message: 'Project is not connected to Jira' });
  }

  const client = await getJiraClient(req.user.id);
  const results = { epics: [], stories: [], errors: [] };

  // Push epics
  for (const epicId of (epicIds || [])) {
    try {
      const epic = await Epic.findById(epicId);
      if (!epic || epic.pushedToJira) continue;

      const payload = {
        fields: {
          project: { key: project.jiraProjectKey },
          summary: epic.title,
          description: {
            type: 'doc',
            version: 1,
            content: [{ type: 'paragraph', content: [{ type: 'text', text: epic.description || '' }] }],
          },
          issuetype: { name: 'Epic' },
          priority: { name: epic.priority?.charAt(0).toUpperCase() + epic.priority?.slice(1) || 'Medium' },
        },
      };

      const response = await axios.post(`${client.baseURL}/issue`, payload, { auth: client.auth });
      await Epic.findByIdAndUpdate(epicId, {
        jiraEpicId: response.data.id,
        jiraEpicKey: response.data.key,
        pushedToJira: true,
        pushedAt: new Date(),
        status: 'approved',
      });
      results.epics.push({ id: epicId, jiraKey: response.data.key });
    } catch (err) {
      results.errors.push({ id: epicId, type: 'epic', error: err.response?.data?.errorMessages?.[0] || err.message });
    }
  }

  // Push stories
  for (const storyId of (storyIds || [])) {
    try {
      const story = await Story.findById(storyId).populate('epic');
      if (!story || story.pushedToJira) continue;

      const acText = story.acceptanceCriteria.map((a) => `• ${a.criterion}`).join('\n');

      const payload = {
        fields: {
          project: { key: project.jiraProjectKey },
          summary: story.title,
          description: {
            type: 'doc',
            version: 1,
            content: [
              { type: 'paragraph', content: [{ type: 'text', text: story.description || '' }] },
              ...(acText ? [{ type: 'paragraph', content: [{ type: 'text', text: `Acceptance Criteria:\n${acText}` }] }] : []),
            ],
          },
          issuetype: { name: story.type === 'task' ? 'Task' : 'Story' },
          priority: { name: story.priority?.charAt(0).toUpperCase() + story.priority?.slice(1) || 'Medium' },
          story_points: story.storyPoints,
          ...(story.epic?.jiraEpicKey && { customfield_10014: story.epic.jiraEpicKey }),
        },
      };

      const response = await axios.post(`${client.baseURL}/issue`, payload, { auth: client.auth });
      await Story.findByIdAndUpdate(storyId, {
        jiraIssueId: response.data.id,
        jiraIssueKey: response.data.key,
        pushedToJira: true,
        pushedAt: new Date(),
        status: 'to_do',
      });
      results.stories.push({ id: storyId, jiraKey: response.data.key });
    } catch (err) {
      results.errors.push({ id: storyId, type: 'story', error: err.response?.data?.errorMessages?.[0] || err.message });
    }
  }

  await AuditLog.create({
    project: project._id,
    user: req.user.id,
    action: 'stories_pushed_jira',
    entity: 'project',
    entityId: project._id,
    details: results,
    ipAddress: req.ip,
  });

  res.status(200).json({ success: true, data: results });
};

module.exports = { testConnection, getJiraProjects, connectProject, pushToJira };
