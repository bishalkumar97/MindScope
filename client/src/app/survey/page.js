'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const API = 'https://mind-scope-87ko.vercel.app/api';

const characterMessages = {
  demographics: { text: "Hey there! I'm MindBot, your survey companion! Let's start with some basic info about you. Don't worry, everything is completely confidential!", mood: 'happy' },
  invalidation: { text: "Great job on the intro! Now let's explore your childhood emotional environment. Think about your experiences growing up no right or wrong answers here.", mood: 'talking' },
  attachment: { text: "You're doing amazing! I can see you're really thoughtful. This section is about how you relate to others in close relationships.", mood: 'happy' },
  emotion: { text: "Almost there, superstar! Last section this one's about how you handle your emotions day to day. You've totally got this!", mood: 'excited' },
};

const encouragements = [
  "Nice pick! 🎯", "Great answer! ✨", "Keep going! 💪", "You're on fire! 🔥",
  "Awesome! 🌟", "Love the honesty! 💙", "Perfect! 🎉", "Almost there! 🚀",
];

function AnimatedCharacter({ mood, step, totalSteps, lastAnswer }) {
  const [showSparkles, setShowSparkles] = useState(false);
  useEffect(() => {
    if (lastAnswer) { setShowSparkles(true); const t = setTimeout(() => setShowSparkles(false), 1500); return () => clearTimeout(t); }
  }, [lastAnswer]);

  return (
    <div className="character-3d" style={{ animation: 'fadeIn 0.5s ease-out' }}>
      {showSparkles && (
        <div className="char-sparkles">
          <div className="char-sparkle">✨</div><div className="char-sparkle">⭐</div>
          <div className="char-sparkle">💫</div><div className="char-sparkle">🌟</div>
        </div>
      )}
      <div className="char-head">
        <div className="char-eyes"><div className="char-eye" /><div className="char-eye" /></div>
        <div className={`char-mouth ${mood}`} />
        {(mood === 'happy' || mood === 'excited') && (<>
          <div style={{ position: 'absolute', bottom: '22px', left: '8px', width: '12px', height: '6px', borderRadius: '50%', background: 'rgba(239,68,68,0.2)', filter: 'blur(2px)' }} />
          <div style={{ position: 'absolute', bottom: '22px', right: '8px', width: '12px', height: '6px', borderRadius: '50%', background: 'rgba(239,68,68,0.2)', filter: 'blur(2px)' }} />
        </>)}
      </div>
      <div className="char-body"><div style={{ position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)', width: '10px', height: '10px', borderRadius: '50%', background: 'rgba(255,255,255,0.3)' }} /></div>
      <div className="char-arms"><div className="char-arm left" /><div className="char-arm right" /></div>
      <div className="char-progress-indicator">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div key={i} className={`char-progress-dot ${i < step ? 'completed' : i === step ? 'active' : ''}`} />
        ))}
      </div>
    </div>
  );
}

function TypewriterSpeech({ text, encouragement }) {
  const [displayed, setDisplayed] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  useEffect(() => {
    setDisplayed(''); setShowCursor(true); let i = 0;
    const interval = setInterval(() => { if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++; } else { clearInterval(interval); setTimeout(() => setShowCursor(false), 1000); } }, 18);
    return () => clearInterval(interval);
  }, [text]);
  return (
    <div className="character-speech speech-typing">
      <p>{displayed}{showCursor && <span className="cursor" />}</p>
      {encouragement && (
        <div style={{ marginTop: '8px', padding: '4px 12px', background: 'rgba(14,165,233,0.1)', borderRadius: '12px', display: 'inline-block', fontSize: '13px', color: 'var(--blue-secondary)', fontWeight: 600, animation: 'bounceIn 0.4s ease-out' }}>
          {encouragement}
        </div>
      )}
    </div>
  );
}

function Celebration() {
  const colors = ['#0ea5e9', '#6366f1', '#10b981', '#f59e0b', '#ef4444', '#ec4899'];
  return (
    <div className="celebration">
      {Array.from({ length: 40 }).map((_, i) => (
        <div key={i} className="confetti" style={{
          left: `${Math.random() * 100}%`, background: colors[i % colors.length],
          animationDelay: `${Math.random() * 2}s`, animationDuration: `${2 + Math.random() * 2}s`,
          width: `${6 + Math.random() * 8}px`, height: `${6 + Math.random() * 8}px`,
          borderRadius: Math.random() > 0.5 ? '50%' : '2px',
        }} />
      ))}
    </div>
  );
}

export default function SurveyPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState(null);
  const [step, setStep] = useState(0);
  const [demographics, setDemographics] = useState({ fullName: '', email: '', age: '', gender: '', education: '', occupation: '', city: '', state: '' });
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [animating, setAnimating] = useState(false);
  const [lastAnswerKey, setLastAnswerKey] = useState(null);
  const [encouragement, setEncouragement] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [answeredCount, setAnsweredCount] = useState(0);
  const [currentQ, setCurrentQ] = useState(0);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);

  useEffect(() => {
    // Check if user already completed the survey
    const existing = localStorage.getItem('surveyResult');
    if (existing) {
      setAlreadyCompleted(true);
      return;
    }
    fetch(`${API}/questions`).then(r => r.json()).then(data => setQuestions(data))
      .catch(() => setError('Failed to load questions. Is the server running on port 5000?'));
  }, []);

  if (alreadyCompleted) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px', padding: '24px', textAlign: 'center' }}>
        <div style={{ fontSize: '64px' }}>✅</div>
        <h2 style={{ fontSize: '24px', fontWeight: 700 }}>You've Already Completed This Survey</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', lineHeight: 1.6 }}>
          Each person can only fill out this survey once. Thank you for your participation!
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn-primary" onClick={() => router.push('/results')}>View My Results</button>
          <button className="btn-secondary" onClick={() => router.push('/')}>Back to Home</button>
        </div>
      </div>
    );
  }

  if (!questions && !error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '20px' }}>
        <div className="character-3d" style={{ animation: 'bounceIn 0.8s ease-out' }}>
          <div className="char-head"><div className="char-eyes"><div className="char-eye" /><div className="char-eye" /></div><div className="char-mouth happy" /></div>
          <div className="char-body" />
        </div>
        <p style={{ color: 'var(--text-secondary)', marginTop: '30px', animation: 'fadeIn 1s ease-out 0.5s both' }}>Loading your survey...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
        <div style={{ fontSize: '48px' }}>⚠️</div>
        <p style={{ color: 'var(--danger)' }}>{error}</p>
        <button className="btn-primary" onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  const sections = questions.sections;
  const totalSteps = 1 + sections.length;
  const currentSectionKey = step === 0 ? 'demographics' : sections[step - 1]?.key;
  const charConfig = characterMessages[currentSectionKey] || characterMessages.demographics;

  const totalQs = sections.reduce((s, sec) => s + sec.questions.length, 0);
  const totalAnswered = Object.keys(answers).length;
  const overallProgress = step === 0 ? 5 : Math.round(((totalAnswered / totalQs) * 90) + 10);

  const handleDemoChange = (field, value) => {
    setDemographics(prev => ({ ...prev, [field]: value }));
  };

  const handleAnswer = (sectionKey, questionIndex, value, labelText) => {
    const key = `${sectionKey}_${questionIndex}`;
    const isNew = !answers[key];
    setAnswers(prev => ({ ...prev, [key]: { value, label: labelText } }));
    setLastAnswerKey(key + '_' + Date.now());

    if (isNew) {
      const newCount = answeredCount + 1;
      setAnsweredCount(newCount);
      if (newCount % 3 === 0) {
        const msg = encouragements[Math.floor(Math.random() * encouragements.length)];
        setEncouragement(msg);
        setTimeout(() => setEncouragement(null), 2000);
      }
    }

    // Auto-advance to next question
    const section = sections[step - 1];
    if (section && questionIndex < section.questions.length - 1) {
      setTimeout(() => {
        setAnimating(true);
        setTimeout(() => { setCurrentQ(questionIndex + 1); setAnimating(false); }, 250);
      }, 400);
    }
  };

  const canProceed = () => {
    if (step === 0) return demographics.fullName && demographics.email && demographics.age && demographics.gender && demographics.education;
    const section = sections[step - 1];
    for (let i = 0; i < section.questions.length; i++) { if (!answers[`${section.key}_${i}`]) return false; }
    return true;
  };

  const getSectionAnswered = () => {
    if (step === 0) return 0;
    const section = sections[step - 1];
    let count = 0;
    for (let i = 0; i < section.questions.length; i++) { if (answers[`${section.key}_${i}`]) count++; }
    return count;
  };

  const goNext = () => {
    if (!canProceed()) return;
    setShowCelebration(true);
    setTimeout(() => setShowCelebration(false), 2500);
    setAnimating(true);
    setTimeout(() => { setStep(prev => prev + 1); setCurrentQ(0); setAnimating(false); }, 400);
  };

  const goPrev = () => {
    setAnimating(true);
    setTimeout(() => {
      if (step > 0 && currentQ > 0) { setCurrentQ(prev => prev - 1); }
      else { setStep(prev => Math.max(0, prev - 1)); if (step > 1) setCurrentQ(sections[step - 2].questions.length - 1); else setCurrentQ(0); }
      setAnimating(false);
    }, 300);
  };

  const goToQuestion = (qi) => {
    setAnimating(true);
    setTimeout(() => { setCurrentQ(qi); setAnimating(false); }, 200);
  };

  const handleSubmit = async () => {
    if (!canProceed()) return;
    setSubmitting(true); setShowCelebration(true);
    const formattedAnswers = [];
    sections.forEach(section => {
      section.questions.forEach((q, i) => {
        const ans = answers[`${section.key}_${i}`];
        if (ans) formattedAnswers.push({ section: section.key, questionIndex: i, questionText: q, answer: ans.value, answerText: ans.label });
      });
    });
    try {
      const res = await fetch(`${API}/survey`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ demographics: { ...demographics, age: parseInt(demographics.age) }, answers: formattedAnswers }) });
      const data = await res.json();
      if (data.success) { localStorage.setItem('surveyResult', JSON.stringify(data.result)); localStorage.setItem('userName', demographics.fullName); setTimeout(() => router.push('/results'), 1500); }
      else { setError(data.error || 'Submission failed'); setSubmitting(false); setShowCelebration(false); }
    } catch { setError('Network error. Please try again.'); setSubmitting(false); setShowCelebration(false); }
  };

  const isLastStep = step === sections.length;
  const sectionIcons = { invalidation: '🏠', attachment: '💝', emotion: '🎭' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '24px' }}>
      {showCelebration && <Celebration />}

      {/* Header */}
      <div style={{ maxWidth: '900px', width: '100%', margin: '0 auto 20px', animation: 'fadeInDown 0.5s ease-out' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => router.push('/')}>
            <span style={{ fontSize: '24px' }}>🧠</span>
            <span style={{ fontSize: '18px', fontWeight: 800, background: 'linear-gradient(135deg, var(--blue-primary), var(--purple-accent))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>MindScope</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Step {step + 1} of {totalSteps}</div>
            {step > 0 && <div style={{ fontSize: '11px', color: 'var(--blue-primary)', fontWeight: 600 }}>Q {currentQ + 1} of {sections[step - 1].questions.length}</div>}
          </div>
        </div>
        <div className="progress-bar-wrapper">
          <div className="progress-bar-fill" style={{ width: `${overallProgress}%` }} />
        </div>
      </div>

      {/* Main content — centered vertically */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: '900px', width: '100%', margin: '0 auto' }}>
        {/* Character + Speech */}
        <div className="character-container" style={{
          background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--glass-border)', padding: '20px', marginBottom: '20px',
        }}>
          <AnimatedCharacter mood={charConfig.mood} step={step} totalSteps={totalSteps} lastAnswer={lastAnswerKey} />
          <TypewriterSpeech text={charConfig.text} encouragement={encouragement} />
        </div>

        {/* Demographics step */}
        {step === 0 && (
          <div className="glass-card animate-fadeInUp" style={{ padding: '32px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span>👤</span> About You
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '14px' }}>Tell us a little about yourself. All information is confidential.</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
              {questions.demographics.map((field, fi) => (
                <div key={field.name} style={{ animation: `fadeInUp 0.4s ease-out ${fi * 0.05}s both` }}>
                  <label style={{ display: 'block', marginBottom: '6px', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {field.label} {field.required && <span style={{ color: 'var(--blue-primary)' }}>*</span>}
                  </label>
                  {field.type === 'select' ? (
                    <select className="input-field" value={demographics[field.name]} onChange={e => handleDemoChange(field.name, e.target.value)}>
                      <option value="">Select...</option>
                      {field.options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                  ) : (
                    <input className="input-field" type={field.type} value={demographics[field.name]}
                      onChange={e => handleDemoChange(field.name, e.target.value)}
                      placeholder={`Enter your ${field.label.toLowerCase()}`} min={field.min} max={field.max} />
                  )}
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '28px' }}>
              <button className="btn-primary" onClick={goNext} disabled={!canProceed()}>Continue →</button>
            </div>
          </div>
        )}

        {/* Question sections — ONE question at a time */}
        {step > 0 && step <= sections.length && (() => {
          const section = sections[step - 1];
          const q = section.questions[currentQ];
          const ansKey = `${section.key}_${currentQ}`;
          const selected = answers[ansKey]?.value;
          const sectionAnswered = getSectionAnswered();
          const allAnswered = sectionAnswered === section.questions.length;
          const sectionPct = Math.round((sectionAnswered / section.questions.length) * 100);

          return (
            <div>
              {/* Section header + progress */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '22px' }}>{sectionIcons[section.key] || '📝'}</span>
                  {section.title}
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '60px', height: '4px', background: 'var(--bg-secondary)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', background: 'var(--success)', width: `${sectionPct}%`, transition: 'width 0.3s', borderRadius: '2px' }} />
                  </div>
                  <span style={{ fontSize: '12px', color: sectionPct === 100 ? 'var(--success)' : 'var(--text-muted)', fontWeight: 600 }}>
                    {sectionAnswered}/{section.questions.length}
                  </span>
                </div>
              </div>

              {/* Question dot navigator */}
              <div style={{
                display: 'flex', gap: '6px', marginBottom: '16px', flexWrap: 'wrap',
                padding: '10px 14px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
              }}>
                {section.questions.map((_, qi) => {
                  const isAnswered = !!answers[`${section.key}_${qi}`];
                  const isCurrent = qi === currentQ;
                  return (
                    <div key={qi} onClick={() => goToQuestion(qi)} style={{
                      width: '28px', height: '28px', borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '11px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease',
                      background: isCurrent ? 'var(--blue-primary)' : isAnswered ? 'rgba(16,185,129,0.2)' : 'var(--bg-secondary)',
                      color: isCurrent ? 'white' : isAnswered ? 'var(--success)' : 'var(--text-muted)',
                      border: isCurrent ? '2px solid var(--blue-secondary)' : isAnswered ? '2px solid var(--success)' : '2px solid var(--border-color)',
                      boxShadow: isCurrent ? '0 0 12px var(--blue-glow)' : 'none',
                      transform: isCurrent ? 'scale(1.15)' : 'scale(1)',
                    }}>
                      {isAnswered && !isCurrent ? '✓' : qi + 1}
                    </div>
                  );
                })}
              </div>

              {/* Question Card — compact, wide */}
              <div key={`card_${ansKey}`} className="glass-card" style={{
                padding: '28px 32px',
                opacity: animating ? 0 : 1,
                transform: animating ? 'translateX(40px) scale(0.98)' : 'translateX(0) scale(1)',
                transition: 'all 0.25s ease',
              }}>
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                      width: '34px', height: '34px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, var(--blue-primary), var(--purple-accent))',
                      color: 'white', fontSize: '14px', fontWeight: 700, flexShrink: 0,
                    }}>
                      {currentQ + 1}
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>of {section.questions.length}</span>
                    {selected && <span style={{ fontSize: '14px', marginLeft: 'auto', animation: 'bounceIn 0.3s' }}>✅</span>}
                  </div>
                  <p style={{ fontSize: '17px', fontWeight: 500, lineHeight: 1.6, color: 'var(--text-primary)' }}>{q}</p>
                </div>

                {/* Scale options — responsive via globals.css */}
                <div key={`opts_${ansKey}`} className="scale-options">
                  {section.scale.map(opt => (
                    <div key={opt.value}
                      className={`scale-option ${selected === opt.value ? 'selected' : ''}`}
                      onClick={() => handleAnswer(section.key, currentQ, opt.value, opt.label)}
                    >
                      <div className="scale-value" style={{ fontSize: '18px', fontWeight: 700 }}>{opt.value}</div>
                      <div className="scale-label" style={{ fontSize: '12px', lineHeight: 1.2 }}>{opt.label}</div>
                    </div>
                  ))}
                </div>

                {/* Navigation */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  marginTop: '24px', paddingTop: '16px', borderTop: '1px solid var(--border-color)',
                }}>
                  <button className="btn-secondary" onClick={() => { if (currentQ > 0) goToQuestion(currentQ - 1); else goPrev(); }}
                    style={{ padding: '8px 20px', fontSize: '13px' }}>← Back</button>

                  <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                    {selected
                      ? <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>✓ {answers[ansKey]?.label}</span>
                      : <span>Select an option</span>}
                  </div>

                  {currentQ < section.questions.length - 1 ? (
                    <button className="btn-primary" onClick={() => goToQuestion(currentQ + 1)} style={{ padding: '8px 20px', fontSize: '13px' }}>Next →</button>
                  ) : allAnswered ? (
                    isLastStep ? (
                      <button className="btn-primary" onClick={handleSubmit} disabled={submitting} style={{ padding: '10px 28px', fontSize: '14px' }}>
                        {submitting ? '🔄 Analyzing...' : '✨ Get My Results'}
                      </button>
                    ) : (
                      <button className="btn-primary" onClick={goNext} style={{ padding: '10px 28px', fontSize: '14px' }}>Next Section →</button>
                    )
                  ) : (
                    <button className="btn-primary" onClick={() => {
                      for (let i = 0; i < section.questions.length; i++) { if (!answers[`${section.key}_${i}`]) { goToQuestion(i); return; } }
                    }} style={{ padding: '8px 20px', fontSize: '13px' }}>Skip to unanswered →</button>
                  )}
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
}
