const express = require('express');
const router = express.Router();
const XLSX = require('xlsx');
const { User, Response, Result } = require('../db');
const { analyzePersonality } = require('../personality');
const {
  invalidationQuestions,
  invalidationScale,
  attachmentQuestions,
  attachmentScale,
  emotionRegulationQuestions,
  emotionRegulationScale,
  demographicFields,
} = require('../questions');

// ─── Get all questions (for the frontend) ───
router.get('/questions', (req, res) => {
  res.json({
    demographics: demographicFields,
    sections: [
      {
        key: 'invalidation',
        title: 'Childhood Emotional Environment',
        description: 'Think about your experiences growing up (before age 18). Rate how frequently each statement applied to your family.',
        questions: invalidationQuestions,
        scale: invalidationScale,
      },
      {
        key: 'attachment',
        title: 'Relationship & Attachment Patterns',
        description: 'Think about your close relationships. Rate how much you agree with each statement.',
        questions: attachmentQuestions,
        scale: attachmentScale,
      },
      {
        key: 'emotion',
        title: 'Emotion Regulation Strategies',
        description: 'Think about how you typically handle your emotions. Rate how much you agree with each statement.',
        questions: emotionRegulationQuestions,
        scale: emotionRegulationScale,
      },
    ],
  });
});

// ─── Submit survey ───
router.post('/survey', async (req, res) => {
  try {
    const { demographics, answers } = req.body;

    // Validate demographics
    if (!demographics || !demographics.fullName || !demographics.email || !demographics.age) {
      return res.status(400).json({ error: 'Missing required demographic fields' });
    }

    // Check if email already submitted
    const existing = await User.findOne({ email: demographics.email });
    if (existing) {
      return res.status(409).json({ error: 'This email has already submitted a response. Each person can only fill the survey once.' });
    }

    // Validate answers
    if (!answers || !Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ error: 'No survey answers provided' });
    }

    // Create user
    const user = await User.create({
      fullName: demographics.fullName,
      email: demographics.email,
      age: demographics.age,
      gender: demographics.gender || '',
      education: demographics.education || '',
      occupation: demographics.occupation || '',
      city: demographics.city || '',
      state: demographics.state || '',
    });

    // Insert responses
    const responseRows = answers.map(a => ({
      userId: user._id,
      section: a.section,
      questionIndex: a.questionIndex,
      questionText: a.questionText,
      answer: a.answer,
      answerText: a.answerText || String(a.answer),
    }));

    await Response.insertMany(responseRows);

    // Analyze personality
    const result = analyzePersonality(responseRows);

    // Save result
    await Result.create({
      userId: user._id,
      invalidationScore: result.invalidationScore,
      invalidationLevel: result.invalidationLevel,
      attachmentStyle: result.attachmentStyle,
      attachmentScore: result.attachmentScore,
      reappraisalScore: result.reappraisalScore,
      suppressionScore: result.suppressionScore,
      emotionRegulationTendency: result.emotionRegulationTendency,
      personalitySummary: result.personalitySummary,
    });

    res.json({
      success: true,
      userId: user._id,
      result,
    });
  } catch (err) {
    console.error('Survey submission error:', err);
    if (err.code === 11000) {
      return res.status(409).json({ error: 'This email has already submitted a response.' });
    }
    res.status(500).json({ error: 'Failed to save survey response' });
  }
});

// ─── Get all respondents ───
router.get('/responses', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 }).lean();
    const results = await Result.find().lean();

    // Map results by userId
    const resultMap = {};
    results.forEach(r => { resultMap[r.userId.toString()] = r; });

    const combined = users.map(u => ({
      id: u._id,
      fullName: u.fullName,
      email: u.email,
      age: u.age,
      gender: u.gender,
      education: u.education,
      occupation: u.occupation,
      city: u.city,
      state: u.state,
      createdAt: u.createdAt,
      ...( resultMap[u._id.toString()] ? {
        invalidationLevel: resultMap[u._id.toString()].invalidationLevel,
        attachmentStyle: resultMap[u._id.toString()].attachmentStyle,
        emotionRegulationTendency: resultMap[u._id.toString()].emotionRegulationTendency,
        personalitySummary: resultMap[u._id.toString()].personalitySummary,
      } : {}),
    }));

    res.json({ users: combined, total: combined.length });
  } catch (err) {
    console.error('Error getting responses:', err);
    res.status(500).json({ error: 'Failed to fetch responses' });
  }
});

// ─── Get individual response ───
router.get('/responses/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const result = await Result.findOne({ userId: user._id }).lean();
    const answers = await Response.find({ userId: user._id }).sort({ section: 1, questionIndex: 1 }).lean();

    const userData = {
      id: user._id,
      fullName: user.fullName,
      email: user.email,
      age: user.age,
      gender: user.gender,
      education: user.education,
      occupation: user.occupation,
      city: user.city,
      state: user.state,
      createdAt: user.createdAt,
      ...(result ? {
        invalidationScore: result.invalidationScore,
        invalidationLevel: result.invalidationLevel,
        attachmentStyle: result.attachmentStyle,
        attachmentScore: result.attachmentScore,
        reappraisalScore: result.reappraisalScore,
        suppressionScore: result.suppressionScore,
        emotionRegulationTendency: result.emotionRegulationTendency,
        personalitySummary: result.personalitySummary,
      } : {}),
    };

    res.json({ user: userData, answers });
  } catch (err) {
    console.error('Error getting response:', err);
    res.status(500).json({ error: 'Failed to fetch response' });
  }
});

// ─── Get aggregate stats ───
router.get('/stats', async (req, res) => {
  try {
    const total = await User.countDocuments();

    const genderDist = await User.aggregate([
      { $group: { _id: '$gender', count: { $sum: 1 } } },
      { $project: { gender: '$_id', count: 1, _id: 0 } },
    ]);

    const ageDist = await User.aggregate([
      {
        $bucket: {
          groupBy: '$age',
          boundaries: [18, 21, 24, 27, 31],
          default: 'Other',
          output: { count: { $sum: 1 } },
        },
      },
      {
        $project: {
          ageGroup: {
            $switch: {
              branches: [
                { case: { $eq: ['$_id', 18] }, then: '18-20' },
                { case: { $eq: ['$_id', 21] }, then: '21-23' },
                { case: { $eq: ['$_id', 24] }, then: '24-26' },
                { case: { $eq: ['$_id', 27] }, then: '27-30' },
              ],
              default: 'Other',
            },
          },
          count: 1,
          _id: 0,
        },
      },
    ]);

    const attachmentDist = await Result.aggregate([
      { $group: { _id: '$attachmentStyle', count: { $sum: 1 } } },
      { $project: { attachmentStyle: '$_id', count: 1, _id: 0 } },
    ]);

    const invalidationDist = await Result.aggregate([
      { $group: { _id: '$invalidationLevel', count: { $sum: 1 } } },
      { $project: { invalidationLevel: '$_id', count: 1, _id: 0 } },
    ]);

    const emotionDist = await Result.aggregate([
      { $group: { _id: '$emotionRegulationTendency', count: { $sum: 1 } } },
      { $project: { emotionRegulationTendency: '$_id', count: 1, _id: 0 } },
    ]);

    const educationDist = await User.aggregate([
      { $group: { _id: '$education', count: { $sum: 1 } } },
      { $project: { education: '$_id', count: 1, _id: 0 } },
    ]);

    const locationDist = await User.aggregate([
      { $group: { _id: '$state', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      { $project: { state: '$_id', count: 1, _id: 0 } },
    ]);

    res.json({
      total,
      genderDistribution: genderDist,
      ageDistribution: ageDist,
      attachmentDistribution: attachmentDist,
      invalidationDistribution: invalidationDist,
      emotionRegulationDistribution: emotionDist,
      educationDistribution: educationDist,
      locationDistribution: locationDist,
    });
  } catch (err) {
    console.error('Error getting stats:', err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ─── Admin login ───
router.post('/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true, token: 'admin-session-' + Date.now() });
  } else {
    res.status(401).json({ error: 'Invalid password' });
  }
});

// ─── Check if email already submitted ───
router.get('/check-email/:email', async (req, res) => {
  try {
    const existing = await User.findOne({ email: req.params.email });
    res.json({ exists: !!existing });
  } catch (err) {
    res.status(500).json({ error: 'Check failed' });
  }
});

// ─── Export data as Excel ───
router.get('/export-excel', async (req, res) => {
  try {
    // Sheet 1: All respondents with demographics + results
    const users = await User.find().sort({ createdAt: -1 }).lean();
    const results = await Result.find().lean();
    const resultMap = {};
    results.forEach(r => { resultMap[r.userId.toString()] = r; });

    const summaryData = users.map((u, i) => {
      const r = resultMap[u._id.toString()] || {};
      return {
        'S.No': i + 1,
        'Full Name': u.fullName,
        'Email': u.email,
        'Age': u.age,
        'Gender': u.gender,
        'Education': u.education,
        'Occupation': u.occupation,
        'City': u.city,
        'State': u.state,
        'Invalidation Score (%)': r.invalidationScore || '',
        'Invalidation Level': r.invalidationLevel || '',
        'Attachment Style': r.attachmentStyle || '',
        'Attachment Score (/5)': r.attachmentScore || '',
        'Reappraisal Score (/7)': r.reappraisalScore || '',
        'Suppression Score (/7)': r.suppressionScore || '',
        'Emotion Regulation': r.emotionRegulationTendency || '',
        'Personality Summary': r.personalitySummary || '',
        'Submitted At': u.createdAt ? new Date(u.createdAt).toISOString() : '',
      };
    });

    // Sheet 2: All individual answers
    const allAnswers = await Response.find().sort({ userId: 1, section: 1, questionIndex: 1 }).lean();
    const userMap = {};
    users.forEach(u => { userMap[u._id.toString()] = u; });

    const answersData = allAnswers.map((a, i) => {
      const usr = userMap[a.userId.toString()] || {};
      return {
        'S.No': i + 1,
        'Respondent Name': usr.fullName || '',
        'Email': usr.email || '',
        'Section': a.section === 'invalidation' ? 'Childhood Emotional Invalidation'
                 : a.section === 'attachment' ? 'Attachment Style'
                 : 'Emotion Regulation',
        'Q.No': a.questionIndex + 1,
        'Question': a.questionText,
        'Answer Value': a.answer,
        'Answer Label': a.answerText,
      };
    });

    // Build workbook
    const wb = XLSX.utils.book_new();

    const ws1 = XLSX.utils.json_to_sheet(summaryData.length > 0 ? summaryData : [{ 'No Data': 'No responses yet' }]);
    ws1['!cols'] = [
      { wch: 5 }, { wch: 20 }, { wch: 25 }, { wch: 5 }, { wch: 10 },
      { wch: 18 }, { wch: 18 }, { wch: 15 }, { wch: 15 },
      { wch: 18 }, { wch: 16 }, { wch: 16 }, { wch: 18 },
      { wch: 18 }, { wch: 18 }, { wch: 20 }, { wch: 50 }, { wch: 22 },
    ];
    XLSX.utils.book_append_sheet(wb, ws1, 'Respondent Summary');

    const ws2 = XLSX.utils.json_to_sheet(answersData.length > 0 ? answersData : [{ 'No Data': 'No responses yet' }]);
    ws2['!cols'] = [
      { wch: 5 }, { wch: 20 }, { wch: 25 }, { wch: 30 },
      { wch: 5 }, { wch: 50 }, { wch: 12 }, { wch: 20 },
    ];
    XLSX.utils.book_append_sheet(wb, ws2, 'Individual Answers');

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    res.setHeader('Content-Disposition', 'attachment; filename="MindScope_Survey_Data.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(buffer);
  } catch (err) {
    console.error('Export error:', err);
    res.status(500).json({ error: 'Failed to export data' });
  }
});

// ─── Delete individual response ───
router.delete('/responses/:id', async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Delete user, their responses, and their results using the custom id
    await Promise.all([
      User.findOneAndDelete({ id: userId }),
      Response.deleteMany({ userId }),
      Result.deleteOne({ userId })
    ]);

    res.json({ success: true, message: 'Response deleted successfully' });
  } catch (err) {
    console.error('Error deleting response:', err);
    res.status(500).json({ error: 'Failed to delete response' });
  }
});

module.exports = router;
