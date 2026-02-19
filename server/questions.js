// Survey questions based on validated psychology scales

const demographicFields = [
  { name: 'fullName', label: 'Full Name', type: 'text', required: true },
  { name: 'email', label: 'Email Address', type: 'email', required: true },
  { name: 'age', label: 'Age', type: 'number', min: 18, max: 30, required: true },
  {
    name: 'gender', label: 'Gender', type: 'select', required: true,
    options: ['Male', 'Female', 'Non-binary', 'Prefer not to say']
  },
  {
    name: 'education', label: 'Education Level', type: 'select', required: true,
    options: ['High School', 'Undergraduate', 'Postgraduate', 'Doctorate', 'Other']
  },
  { name: 'occupation', label: 'Occupation', type: 'text', required: true },
  { name: 'city', label: 'City', type: 'text', required: true },
  { name: 'state', label: 'State / Province', type: 'text', required: true },
];

// Section 1: Childhood Emotional Invalidation (adapted from ICES)
// Scale: 1=Never, 2=Rarely, 3=Sometimes, 4=Often, 5=Always
const invalidationQuestions = [
  "My parents/caregivers acknowledged my feelings when I was upset.",
  "When I was sad, I was told I was overreacting.",
  "My family encouraged me to express my emotions openly.",
  "I was told to stop crying or \"toughen up\" when I was emotional.",
  "My parents/caregivers listened to me when I needed to talk about my feelings.",
  "My feelings were dismissed as unimportant by my family.",
  "I felt comfortable sharing my emotions at home.",
  "I was made to feel ashamed for expressing emotions.",
  "My family respected my emotional boundaries.",
  "I was punished or criticized for showing negative emotions.",
  "My parents/caregivers tried to understand how I felt.",
  "I learned to hide my true feelings from my family.",
];

const invalidationScale = [
  { value: 1, label: 'Never' },
  { value: 2, label: 'Rarely' },
  { value: 3, label: 'Sometimes' },
  { value: 4, label: 'Often' },
  { value: 5, label: 'Always' },
];

// Items where HIGHER score = MORE validation (reverse-scored for invalidation)
const invalidationReverseItems = [0, 2, 4, 6, 8, 10]; // indices

// Section 2: Attachment Style (adapted from ASQ / ECR)
// Scale: 1=Strongly Disagree ... 5=Strongly Agree
const attachmentQuestions = [
  "I find it easy to trust and depend on others.",
  "I often worry that my partner or close friends don't really love me.",
  "I feel comfortable getting emotionally close to others.",
  "I prefer to keep my emotional distance from people.",
  "I worry that others will abandon me if they get to know the real me.",
  "I find it relatively easy to get close to others.",
  "I am comfortable having others depend on me.",
  "I often worry about being rejected in relationships.",
  "I feel uncomfortable when anyone gets too emotionally close.",
  "My independence is more important to me than my relationships.",
];

const attachmentScale = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
];

// Secure items (high = secure): 0, 2, 5, 6
// Anxious items (high = anxious): 1, 4, 7
// Avoidant items (high = avoidant): 3, 8, 9
const attachmentSecureItems = [0, 2, 5, 6];
const attachmentAnxiousItems = [1, 4, 7];
const attachmentAvoidantItems = [3, 8, 9];

// Section 3: Emotion Regulation (adapted from ERQ by Gross & John)
// Scale: 1=Strongly Disagree ... 7=Strongly Agree
const emotionRegulationQuestions = [
  "When I want to feel more positive emotion, I change what I'm thinking about.",
  "I keep my emotions to myself.",
  "When I want to feel less negative emotion, I change what I'm thinking about.",
  "When I am feeling positive emotions, I am careful not to express them.",
  "When I'm faced with a stressful situation, I make myself think about it in a way that helps me stay calm.",
  "I control my emotions by not expressing them.",
  "When I want to feel more positive emotion, I change the way I'm thinking about the situation.",
  "I control my emotions by changing the way I think about the situation I'm in.",
  "When I am feeling negative emotions, I make sure not to express them.",
  "When I want to feel less negative emotion, I change the way I'm thinking about the situation.",
];

const emotionRegulationScale = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Slightly Disagree' },
  { value: 4, label: 'Neutral' },
  { value: 5, label: 'Slightly Agree' },
  { value: 6, label: 'Agree' },
  { value: 7, label: 'Strongly Agree' },
];

// Reappraisal items: 0, 2, 4, 6, 7, 9
// Suppression items: 1, 3, 5, 8
const reappraisalItems = [0, 2, 4, 6, 7, 9];
const suppressionItems = [1, 3, 5, 8];

module.exports = {
  demographicFields,
  invalidationQuestions,
  invalidationScale,
  invalidationReverseItems,
  attachmentQuestions,
  attachmentScale,
  attachmentSecureItems,
  attachmentAnxiousItems,
  attachmentAvoidantItems,
  emotionRegulationQuestions,
  emotionRegulationScale,
  reappraisalItems,
  suppressionItems,
};
