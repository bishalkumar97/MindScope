const {
  invalidationQuestions,
  invalidationReverseItems,
  attachmentSecureItems,
  attachmentAnxiousItems,
  attachmentAvoidantItems,
  emotionRegulationQuestions,
  reappraisalItems,
  suppressionItems,
} = require('./questions');

function analyzePersonality(responses) {
  // ── Section 1: Childhood Emotional Invalidation ──
  const invalidationAnswers = responses.filter(r => r.section === 'invalidation');
  let invalidationTotal = 0;

  invalidationAnswers.forEach(r => {
    if (invalidationReverseItems.includes(r.questionIndex)) {
      // Reverse score: validation items → higher raw = less invalidation
      invalidationTotal += (6 - r.answer); // flip 1→5, 2→4, etc.
    } else {
      invalidationTotal += r.answer;
    }
  });

  const invalidationMax = invalidationAnswers.length * 5;
  const invalidationPercent = invalidationMax > 0 ? (invalidationTotal / invalidationMax) * 100 : 0;
  let invalidationLevel;
  if (invalidationPercent <= 33) invalidationLevel = 'Low';
  else if (invalidationPercent <= 66) invalidationLevel = 'Moderate';
  else invalidationLevel = 'High';

  // ── Section 2: Attachment Style ──
  const attachmentAnswers = responses.filter(r => r.section === 'attachment');

  let secureScore = 0, anxiousScore = 0, avoidantScore = 0;
  attachmentAnswers.forEach(r => {
    if (attachmentSecureItems.includes(r.questionIndex)) secureScore += r.answer;
    if (attachmentAnxiousItems.includes(r.questionIndex)) anxiousScore += r.answer;
    if (attachmentAvoidantItems.includes(r.questionIndex)) avoidantScore += r.answer;
  });

  // Normalize
  const secureAvg = attachmentSecureItems.length > 0 ? secureScore / attachmentSecureItems.length : 0;
  const anxiousAvg = attachmentAnxiousItems.length > 0 ? anxiousScore / attachmentAnxiousItems.length : 0;
  const avoidantAvg = attachmentAvoidantItems.length > 0 ? avoidantScore / attachmentAvoidantItems.length : 0;

  let attachmentStyle;
  const maxAttachment = Math.max(secureAvg, anxiousAvg, avoidantAvg);
  if (maxAttachment === secureAvg) attachmentStyle = 'Secure';
  else if (maxAttachment === anxiousAvg) attachmentStyle = 'Anxious';
  else attachmentStyle = 'Avoidant';

  // ── Section 3: Emotion Regulation ──
  const emotionAnswers = responses.filter(r => r.section === 'emotion');

  let reappraisalScore = 0, suppressionScore = 0;
  emotionAnswers.forEach(r => {
    if (reappraisalItems.includes(r.questionIndex)) reappraisalScore += r.answer;
    if (suppressionItems.includes(r.questionIndex)) suppressionScore += r.answer;
  });

  const reappraisalAvg = reappraisalItems.length > 0 ? reappraisalScore / reappraisalItems.length : 0;
  const suppressionAvg = suppressionItems.length > 0 ? suppressionScore / suppressionItems.length : 0;

  let emotionRegulationTendency;
  if (reappraisalAvg > suppressionAvg + 0.5) emotionRegulationTendency = 'Cognitive Reappraisal';
  else if (suppressionAvg > reappraisalAvg + 0.5) emotionRegulationTendency = 'Expressive Suppression';
  else emotionRegulationTendency = 'Balanced';

  // ── Generate Summary ──
  const summaryParts = [];

  summaryParts.push(`Your childhood emotional environment shows a ${invalidationLevel.toLowerCase()} level of invalidation.`);

  if (attachmentStyle === 'Secure') {
    summaryParts.push('You tend to have a secure attachment style — you feel comfortable with closeness and interdependence in relationships.');
  } else if (attachmentStyle === 'Anxious') {
    summaryParts.push('You show tendencies toward an anxious attachment style — you may seek high levels of closeness and worry about abandonment.');
  } else {
    summaryParts.push('You show tendencies toward an avoidant attachment style — you may value independence and feel less comfortable with emotional closeness.');
  }

  if (emotionRegulationTendency === 'Cognitive Reappraisal') {
    summaryParts.push('You primarily regulate emotions through cognitive reappraisal — reframing situations to change how you feel. This is generally associated with healthier emotional outcomes.');
  } else if (emotionRegulationTendency === 'Expressive Suppression') {
    summaryParts.push('You tend to regulate emotions through suppression — holding back the outward expression of feelings. While sometimes useful, over-reliance on this strategy may affect well-being.');
  } else {
    summaryParts.push('You use a balanced mix of cognitive reappraisal and emotional suppression strategies.');
  }

  return {
    invalidationScore: Math.round(invalidationPercent * 10) / 10,
    invalidationLevel,
    attachmentStyle,
    attachmentScore: Math.round(maxAttachment * 10) / 10,
    reappraisalScore: Math.round(reappraisalAvg * 10) / 10,
    suppressionScore: Math.round(suppressionAvg * 10) / 10,
    emotionRegulationTendency,
    personalitySummary: summaryParts.join(' '),
  };
}

module.exports = { analyzePersonality };
