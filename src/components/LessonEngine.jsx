import { useEffect, useMemo, useState } from 'react';
import { AudioButton, Feedback, GrammarToken, Icon, SectionHeading, SpeakingRecorder, useReveal } from './UI';

const sectionLabels = ['Welcome', 'Warm-up', 'Words', 'Story', 'X-Ray', 'Discover', 'Frequency', 'Build', 'Fix it', 'Quiz', 'Interview', 'You', 'Compare', 'Retry', 'Mission', 'Homework'];

function shuffledTokens(words) {
  const original = words.map((word, index) => ({ word, id: `${index}-${word}` }));
  const shuffled = [...original];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  if (shuffled.length > 2 && shuffled.map((x) => x.word).join(' ') === words.join(' ')) shuffled.push(shuffled.shift());
  return shuffled;
}

const normalizeSentence = (value) => value.trim().replace(/\s+/g, ' ').replace(/\s+([?.!,])/g, '$1').toLowerCase();
const withBase = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;

function AppHeader({ progress, xp, onReset }) {
  const [open, setOpen] = useState(false);
  return <header className="app-header">
    <a className="brand" href="#welcome" aria-label="Dayloop home"><span className="brand-mark"><span /></span><span>dayloop</span></a>
    <div className="header-progress" aria-label={`${progress}% lesson complete`}>
      <div className="progress-meta"><span>Everyday Activities</span><strong>{progress}%</strong></div>
      <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
    </div>
    <div className="header-actions"><span className="xp-pill"><Icon name="spark" size={17} />{xp} XP</span><button className="reset-button" type="button" onClick={onReset} title="Reset lesson"><Icon name="rotate" size={16} /><span>Reset</span></button><button className="menu-button" type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label="Open lesson map"><span /><span /></button></div>
    {open && <nav className="lesson-map" aria-label="Lesson sections">{sectionLabels.map((label, i) => <a key={label} href={`#section-${i + 1}`} onClick={() => setOpen(false)}><span>{String(i + 1).padStart(2, '0')}</span>{label}</a>)}</nav>}
  </header>;
}

function Hero({ lesson, onComplete }) {
  return <section className="hero-section" id="welcome">
    <div className="hero-grid">
      <div className="hero-content reveal">
        <span className="eyebrow light">{lesson.meta.eyebrow}</span>
        <p className="hero-kicker">{lesson.hero.kicker}</p>
        <h1>{lesson.hero.title}</h1>
        <p className="hero-intro">{lesson.hero.intro}</p>
        <div className="hero-actions"><a className="button primary" href="#section-2" onClick={onComplete}>Start the day <Icon name="arrow" size={18} /></a><AudioButton text={`${lesson.hero.title} ${lesson.hero.intro}`} label="Listen to introduction" /></div>
        <p className="source-note">{lesson.meta.sourceNote}</p>
      </div>
      <div className="hero-visual reveal">
        <img src={withBase(lesson.hero.image)} alt={lesson.hero.imageAlt} />
        <div className="floating-card time-card"><span className="pulse-dot" /> <span><small>DAY STARTS</small><strong>3:45 AM</strong></span></div>
        <div className="floating-card streak-card"><Icon name="spark" size={20} /><span><small>FOCUS</small><strong>Consistency</strong></span></div>
      </div>
    </div>
    <Timeline items={lesson.timeline} />
  </section>;
}

function Timeline({ items }) {
  return <div className="timeline reveal">{items.map((item, i) => <div className="timeline-item" key={item.label}>
    <div className="timeline-icon"><Icon name={item.icon} size={20} /></div>
    <div><span>{item.label}</span><strong>{item.time}</strong></div>
    {i < items.length - 1 && <div className="timeline-line"><span /></div>}
  </div>)}</div>;
}

function Warmup({ data, onComplete }) {
  const [choices, setChoices] = useState([]);
  const [revealed, setRevealed] = useState(false);
  const toggle = (id) => !revealed && setChoices((current) => current.includes(id) ? current.filter((x) => x !== id) : [...current, id]);
  const reveal = () => { setRevealed(true); onComplete(); };
  return <section className="lesson-section warmup-section" id="section-2">
    <div className="section-shell">
      <SectionHeading number={2} eyebrow="MAKE A GUESS" title="Before sunrise…" description={data.question} />
      <div className="guess-grid">{data.options.map((option) => {
        const selected = choices.includes(option.id);
        const status = revealed ? option.correct ? 'correct' : selected ? 'incorrect' : 'muted' : '';
        return <button type="button" key={option.id} className={`guess-card reveal ${selected ? 'selected' : ''} ${status}`} onClick={() => toggle(option.id)}>
          <span className="guess-check"><Icon name="check" size={15} /></span><span className="illustration-orb"><Icon name={option.icon} size={34} /></span><strong>{option.label}</strong><span>{selected ? 'Your guess' : 'Tap to choose'}</span>
        </button>;
      })}</div>
      <div className="center-action">{!revealed ? <button className="button dark" type="button" onClick={reveal} disabled={!choices.length}>Reveal his morning</button> : <div className="reveal-answer"><Icon name="spark" /> <span><strong>3 out of 4 are true.</strong> Early mornings are his pattern.</span></div>}</div>
    </div>
  </section>;
}

function Vocabulary({ words, onComplete }) {
  const groups = ['Morning', 'Work', 'Evening'];
  const [group, setGroup] = useState(groups[0]);
  const [flipped, setFlipped] = useState([]);
  const visible = words.filter((word) => word.group === group);
  const toggle = (id) => { setFlipped((all) => all.includes(id) ? all.filter((x) => x !== id) : [...all, id]); onComplete(); };
  return <section className="lesson-section tinted" id="section-3"><div className="section-shell">
    <SectionHeading number={3} eyebrow="WORDS IN THE STORY" title="Your day kit" description="Tap a card. Hear it. See it in motion." />
    <div className="segmented-control">{groups.map((item) => <button type="button" className={group === item ? 'active' : ''} onClick={() => setGroup(item)} key={item}>{item}</button>)}</div>
    <div className="vocab-grid" key={group}>{visible.map((word) => <article className={`vocab-card reveal ${flipped.includes(word.id) ? 'expanded' : ''}`} key={word.id}>
      <div className="vocab-main">
        <span className="vocab-art"><Icon name={word.icon} size={42} /></span><span className="vocab-copy"><span className="word-row"><strong>{word.word}</strong><AudioButton text={word.word} /></span><em>{word.phonetic}</em><span className="example">{word.example}</span></span><button type="button" className="vocab-expand" onClick={() => toggle(word.id)} aria-expanded={flipped.includes(word.id)} aria-label={`Show collocations for ${word.word}`}><span className="plus">+</span></button>
      </div>
      <div className="collocations"><small>COMMON PAIRS</small>{word.collocations.map((item) => <span key={item}>{item}</span>)}</div>
    </article>)}</div>
  </div></section>;
}

function Story({ items, onComplete }) {
  const [index, setIndex] = useState(0);
  const item = items[index];
  const change = (next) => { setIndex(next); if (next === items.length - 1) onComplete(); };
  return <section className="lesson-section story-section" id="section-4"><div className="section-shell">
    <SectionHeading number={4} eyebrow="INTERACTIVE STORY" title="A day in nine moments" description="Step through the day. Listen for the rhythm." action={<span className="counter">{index + 1} / {items.length}</span>} />
    <div className="story-player reveal">
      <div className={`story-art art-${item.icon}`} key={item.id}><div className="scene-sun" /><div className="scene-grid" /><div className="scene-person"><span /><i /></div><div className="scene-object"><Icon name={item.icon} size={62} /></div><span className="story-time">{item.time}</span></div>
      <div className="story-copy" key={`${item.id}-copy`}><span className="eyebrow">{item.period}</span><h3>{item.sentence}</h3><p>{item.caption}</p><AudioButton text={item.sentence} label={`Listen: ${item.sentence}`} /></div>
      <div className="story-controls"><button type="button" className="round-nav" onClick={() => change(Math.max(0, index - 1))} disabled={index === 0}><Icon name="arrow" className="back" /></button><div className="story-dots">{items.map((storyItem, i) => <button aria-label={`Open story step ${i + 1}`} type="button" className={i === index ? 'active' : ''} onClick={() => change(i)} key={storyItem.id} />)}</div><button type="button" className="round-nav" onClick={() => change(Math.min(items.length - 1, index + 1))} disabled={index === items.length - 1}><Icon name="arrow" /></button></div>
    </div>
  </div></section>;
}

function XRaySentence({ mode, subject = 'He', base, ending, tail, form = 'positive' }) {
  if (mode === 'normal') {
    if (form === 'positive') return <>{subject} {base}{ending} {tail}.</>;
    if (form === 'negative') return <>{subject} doesn't {base} {tail}.</>;
    return <>Does {subject.toLowerCase()} {base} {tail}?</>;
  }
  if (form === 'positive') return <>{subject} <GrammarToken type="base">{base}</GrammarToken><GrammarToken type="ending" bracket>{ending}</GrammarToken> {tail}.</>;
  if (form === 'negative') return <>{subject} <GrammarToken type="aux">do</GrammarToken><GrammarToken type="ending" bracket="true">es</GrammarToken> not <GrammarToken type="base">{base}</GrammarToken> {tail}.</>;
  return <><GrammarToken type="aux">Do</GrammarToken><GrammarToken type="ending" bracket="true">es</GrammarToken> {subject.toLowerCase()} <GrammarToken type="base">{base}</GrammarToken> {tail}?</>;
}

function GrammarXRay({ examples, onComplete }) {
  const [xray, setXray] = useState(false);
  const [example, setExample] = useState(0);
  const data = examples[example];
  const mode = xray ? 'xray' : 'normal';
  const turnOn = () => { setXray(!xray); onComplete(); };
  return <section className={`lesson-section xray-section ${xray ? 'xray-on' : ''}`} id="section-5"><div className="section-shell">
    <SectionHeading number={5} eyebrow="THE BIG IDEA" title="Grammar X-Ray" description="Don’t read a rule. Watch the ending move." action={<div className="xray-toggle"><span>NORMAL</span><button type="button" onClick={turnOn} aria-pressed={xray}><i /></button><span>X-RAY</span></div>} />
    <div className="verb-tabs">{examples.slice(0, 3).map((item, i) => <button type="button" onClick={() => setExample(i)} className={i === example ? 'active' : ''} key={item.base}>{item.base}</button>)}</div>
    <div className="xray-stage reveal">
      <div className="xray-row positive"><span className="form-label"><i />POSITIVE</span><div className="xray-sentence"><XRaySentence mode={mode} {...data} form="positive" /></div><span className="pattern-chip">{xray ? 'verb + ending' : 'statement'}</span></div>
      <div className="move-track"><div className="move-line" /><span className="moving-ending">{data.ending}</span><span className="move-label">THE ENDING MOVES</span></div>
      <div className="xray-row negative"><span className="form-label"><i />NEGATIVE</span><div className="xray-sentence"><XRaySentence mode={mode} {...data} form="negative" /></div><span className="pattern-chip">{xray ? 'does + base' : 'negative'}</span></div>
      <div className="move-track compact"><div className="move-line" /></div>
      <div className="xray-row question"><span className="form-label"><i />QUESTION</span><div className="xray-sentence"><XRaySentence mode={mode} {...data} form="question" /></div><span className="pattern-chip">{xray ? 'does + subject + base' : 'question'}</span></div>
    </div>
    <div className="color-key"><span><i className="base-dot" />Base verb</span><span><i className="end-dot" />Third-person ending</span><span><i className="aux-dot" />Auxiliary</span></div>
  </div></section>;
}

function Discovery({ onComplete }) {
  const [answer, setAnswer] = useState(null);
  const choose = (value) => { setAnswer(value); if (value === 'moved') onComplete(); };
  return <section className="lesson-section discovery-section" id="section-6"><div className="narrow-shell">
    <SectionHeading number={6} eyebrow="PATTERN DISCOVERY" title="What changed?" description="Trust your eyes. Choose the best description." />
    <div className="discovery-visual reveal"><div>He <GrammarToken type="base">work</GrammarToken><GrammarToken type="ending" bracket>s</GrammarToken>.</div><span className="down-arrow">↓</span><div>He <GrammarToken type="aux">do</GrammarToken><GrammarToken type="ending" bracket>es</GrammarToken> not <GrammarToken type="base">work</GrammarToken>.</div></div>
    <div className="choice-row">{[['gone', 'The -s disappeared.'], ['moved', 'The -s moved.'], ['doubled', 'The -s doubled.']].map(([value, label]) => <button type="button" className={answer === value ? value === 'moved' ? 'correct' : 'incorrect' : ''} onClick={() => choose(value)} key={value}>{label}</button>)}</div>
    <Feedback state={answer ? answer === 'moved' ? 'correct' : 'incorrect' : null} success="Exactly. The ending moved to DOES." />
  </div></section>;
}

function FrequencyLab({ data, onComplete, onMiss }) {
  const [discovery, setDiscovery] = useState(0);
  const [choice, setChoice] = useState(null);
  const [rulesFound, setRulesFound] = useState([]);
  const [practice, setPractice] = useState(0);
  const [built, setBuilt] = useState([]);
  const [bank, setBank] = useState(() => shuffledTokens(data.practice[0].words));
  const [feedback, setFeedback] = useState(null);
  const question = data.discoveries[discovery];
  const task = data.practice[practice];
  const discoveryDone = rulesFound.length === data.discoveries.length;
  const available = bank.filter((token) => !built.some((item) => item.id === token.id));

  const choose = (option) => {
    setChoice(option);
    if (option === question.answer && !rulesFound.includes(question.id)) setRulesFound([...rulesFound, question.id]);
    else if (option !== question.answer) onMiss({ id: `frequency-${question.id}`, prompt: question.prompt, answer: question.answer, options: question.options });
  };
  const nextDiscovery = () => { setDiscovery(discovery + 1); setChoice(null); };
  const add = (token) => { setBuilt([...built, token]); setFeedback(null); };
  const remove = (token) => { setBuilt(built.filter((item) => item.id !== token.id)); setFeedback(null); };
  const checkPractice = () => {
    const correct = built.map((token) => token.word).join(' ') === task.answer;
    setFeedback(correct ? 'correct' : 'incorrect');
    if (!correct) {
      const attempt = built.map((token) => token.word).join(' ');
      onMiss({ id: `frequency-practice-${practice}`, prompt: task.prompt, answer: task.answer, options: [attempt, task.answer].filter((value, index, all) => value && all.indexOf(value) === index) });
      return;
    }
    if (practice === data.practice.length - 1) onComplete();
    else window.setTimeout(() => {
      const next = practice + 1;
      setPractice(next);
      setBuilt([]);
      setBank(shuffledTokens(data.practice[next].words));
      setFeedback(null);
    }, 700);
  };

  return <section className="lesson-section frequency-section" id="section-7"><div className="section-shell">
    <SectionHeading number={7} eyebrow="FREQUENCY SIGNALS" title="Where does it live?" description="Notice where small frequency words sit in the sentence." />
    <div className="frequency-scale reveal">{data.adverbs.map((adverb, index) => <span key={adverb} style={{ '--level': index }}>{adverb}</span>)}</div>
    <div className="frequency-examples reveal">{data.examples.map((example) => {
      const [before, after] = example.sentence.split(example.highlight);
      return <article key={example.sentence}><span>{example.type === 'be' ? 'WITH BE' : 'WITH A MAIN VERB'}</span><p>{before}<mark>{example.highlight}</mark>{after}</p><AudioButton text={example.sentence} /></article>;
    })}</div>

    {!discoveryDone ? <div className="frequency-discovery reveal">
      <div className="frequency-question"><span>DISCOVER {discovery + 1} / {data.discoveries.length}</span><h3>{question.prompt}</h3><p>{question.sentence}</p></div>
      <div className="frequency-options">{question.options.map((option) => <button type="button" key={option} className={choice === option ? option === question.answer ? 'correct' : 'incorrect' : ''} onClick={() => choose(option)}>{option}</button>)}</div>
      {choice === question.answer && <div className="rule-reveal"><Icon name="spark" /><div><span>RULE UNLOCKED</span><strong>{question.id === 'main' ? 'Frequency adverb → before the main verb.' : 'BE → frequency adverb → description.'}</strong><p>{question.id === 'main' ? 'He usually reads. · Does he often read?' : 'He is always focused. · They are often busy.'}</p></div>{discovery < data.discoveries.length - 1 && <button type="button" className="button primary" onClick={nextDiscovery}>Next pattern</button>}</div>}
      <Feedback state={choice && choice !== question.answer ? 'incorrect' : null} error="Look at the highlighted example above." />
    </div> : <>
      <div className="frequency-ruleboard reveal"><div><small>MAIN VERB</small><strong>subject + <mark>usually</mark> + verb</strong><span>He usually reads.</span></div><div><small>VERB BE</small><strong>be + <mark>usually</mark></strong><span>He is usually focused.</span></div></div>
      <div className="frequency-practice builder-card reveal"><div className="builder-prompt"><span>PLACEMENT PRACTICE</span><strong>{practice + 1} / {data.practice.length} · {task.prompt}</strong></div>
        <div className={`drop-zone ${built.length ? 'has-words' : ''}`}>{!built.length && <span>Build the sentence</span>}{built.map((token) => <button type="button" key={token.id} onClick={() => remove(token)}>{token.word}</button>)}</div>
        <div className="word-bank">{available.map((token) => <button type="button" key={token.id} onClick={() => add(token)}>{token.word}</button>)}</div>
        <div className="builder-footer"><Feedback state={feedback} success="Perfect placement." /><button className="button primary" type="button" onClick={checkPractice} disabled={!built.length}>Check placement</button></div>
      </div>
    </>}
  </div></section>;
}

function SentenceBuilder({ items, onComplete, onMiss }) {
  const [task, setTask] = useState(0);
  const [built, setBuilt] = useState([]);
  const [bank, setBank] = useState(() => shuffledTokens(items[0].words));
  const [feedback, setFeedback] = useState(null);
  const item = items[task];
  const available = bank.filter((token) => !built.some((x) => x.id === token.id));
  const add = (token) => { setBuilt([...built, token]); setFeedback(null); };
  const remove = (token) => { setBuilt(built.filter((x) => x.id !== token.id)); setFeedback(null); };
  const check = () => {
    const correct = built.map((x) => x.word).join(' ') === item.answer;
    setFeedback(correct ? 'correct' : 'incorrect');
    if (!correct) {
      const attempt = built.map((token) => token.word).join(' ');
      onMiss({ id: `builder-${task}`, prompt: `${item.prompt}: choose the correct order.`, answer: item.answer, options: [attempt, item.answer].filter((value, index, all) => value && all.indexOf(value) === index) });
      return;
    }
    if (correct) {
      onComplete();
      window.setTimeout(() => { if (task < items.length - 1) { const next = task + 1; setTask(next); setBuilt([]); setBank(shuffledTokens(items[next].words)); setFeedback(null); } }, 750);
    }
  };
  return <section className="lesson-section builder-section" id="section-8"><div className="section-shell">
    <SectionHeading number={8} eyebrow="BUILD THE PATTERN" title="Catch the rhythm" description="The word bank reshuffles every round. Tap or drag it into order." action={<span className="counter">{task + 1} / {items.length}</span>} />
    <div className="builder-card reveal"><div className="builder-prompt"><span>{item.prompt}</span><strong>{task === 0 ? 'Tell it.' : task === 1 ? 'Flip it.' : 'Ask it.'}</strong></div>
      <div className={`drop-zone ${built.length ? 'has-words' : ''}`} onDragOver={(e) => e.preventDefault()} onDrop={(e) => { const token = available.find((x) => x.id === e.dataTransfer.getData('text/plain')); if (token) add(token); }}>
        {!built.length && <span>Drop words here</span>}{built.map((token) => <button type="button" onClick={() => remove(token)} key={token.id}>{token.word}</button>)}
      </div>
      <div className="word-bank">{available.map((token) => <button type="button" draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', token.id)} onClick={() => add(token)} key={token.id}>{token.word}</button>)}</div>
      <div className="builder-footer"><Feedback state={feedback} /><button className="button primary" type="button" onClick={check} disabled={!built.length}>Check sentence</button></div>
    </div>
    <TransformationStrip />
  </div></section>;
}

function TransformationStrip() {
  return <div className="transformation-strip reveal"><div><small>POSITIVE</small><span>He work<GrammarToken type="ending">s</GrammarToken>.</span></div><Icon name="arrow" /><div><small>NEGATIVE</small><span>He <GrammarToken type="aux">do</GrammarToken><GrammarToken type="ending">es</GrammarToken>n't <GrammarToken type="base">work</GrammarToken>.</span></div><Icon name="arrow" /><div><small>QUESTION</small><span><GrammarToken type="aux">Do</GrammarToken><GrammarToken type="ending">es</GrammarToken> he <GrammarToken type="base">work</GrammarToken>?</span></div></div>;
}

function MistakeFinder({ items, onComplete, onMiss }) {
  const [rounds] = useState(() => {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; }
    return shuffled;
  });
  const [index, setIndex] = useState(0);
  const [value, setValue] = useState(rounds[0].bad);
  const [feedback, setFeedback] = useState(null);
  const [done, setDone] = useState(false);
  const item = rounds[index];
  const check = () => {
    const correct = normalizeSentence(value) === normalizeSentence(item.good);
    setFeedback(correct ? 'correct' : 'incorrect');
    if (!correct) {
      onMiss({ id: `glitch-${item.good}`, prompt: 'Which sentence is correct?', answer: item.good, options: [value, item.good].filter((answer, i, all) => answer && all.indexOf(answer) === i) });
      return;
    }
    if (index === rounds.length - 1) { setDone(true); onComplete(); }
    else window.setTimeout(() => { const next = index + 1; setIndex(next); setValue(rounds[next].bad); setFeedback(null); }, 850);
  };
  return <section className="lesson-section mistake-section" id="section-9"><div className="narrow-shell">
    <SectionHeading number={9} eyebrow="ERROR DETECTOR" title="Find the glitch" description="Edit the sentence itself. Sometimes nothing needs changing." action={<span className="counter">{Math.min(index + 1, rounds.length)} / {rounds.length}</span>} />
    {!done ? <div className={`mistake-card editable reveal ${feedback || ''}`}><span className="glitch-label">SYSTEM CHECK · EDIT OR PRESS ENTER</span><input aria-label="Edit the sentence" value={value} onChange={(event) => { setValue(event.target.value); setFeedback(null); }} onKeyDown={(event) => { if (event.key === 'Enter') check(); }} spellCheck="false" /><div className="edit-hint"><span>Tip: one sentence is already correct.</span><button className="button coral" type="button" onClick={check}>Check sentence</button></div><Feedback state={feedback} success="Repair complete. Pattern restored." error="Not yet. Check the verb, auxiliary, and adverb position." /></div> : <div className="glitch-complete reveal"><Icon name="check" size={34} /><div><span>SCAN COMPLETE</span><h3>All {rounds.length} sentences checked.</h3><p>You also recognized the sentence with no error.</p></div></div>}
  </div></section>;
}

function MiniQuiz({ items, onComplete, onMiss }) {
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [choice, setChoice] = useState(null);
  const item = items[index];
  const pick = (option) => {
    if (choice) return;
    setChoice(option);
    if (option === item.answer) setScore(score + 1);
    else onMiss({ id: `quiz-${index}`, prompt: item.prompt, answer: item.answer, options: item.options });
    window.setTimeout(() => {
      if (index < items.length - 1) { setIndex(index + 1); setChoice(null); }
      else onComplete();
    }, 850);
  };
  return <section className="lesson-section quiz-section" id="section-10"><div className="section-shell">
    <SectionHeading number={10} eyebrow="MINI QUIZ" title="Mix the signals" description="Read, listen, and choose fast. Your first instinct matters." action={<div className="score-chip">{score} correct</div>} />
    <div className="quiz-layout reveal"><div className="quiz-side"><span>ROUND</span><strong>0{index + 1}</strong><div className="quiz-progress">{items.map((_, i) => <i key={i} className={i <= index ? 'active' : ''} />)}</div></div><div className="quiz-main">{item.type === 'listening' && <AudioButton text={item.audio} label="Play listening question" />}<span className="question-type">{item.type === 'listening' ? 'LISTENING' : 'CHOOSE THE PATTERN'}</span><h3>{item.prompt}</h3><div className="quiz-options">{item.options.map((option, i) => <button type="button" key={option} onClick={() => pick(option)} className={choice === option ? option === item.answer ? 'correct' : 'incorrect' : choice && option === item.answer ? 'correct' : ''}><span>{String.fromCharCode(65 + i)}</span>{option}</button>)}</div></div></div>
  </div></section>;
}

function Interview({ items, onComplete }) {
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState(null);
  const item = items[index];
  const choose = (yes) => { setAnswer(yes === item.truth ? 'correct' : 'incorrect'); if (yes === item.truth) onComplete(); };
  const next = () => { setIndex((index + 1) % items.length); setAnswer(null); };
  return <section className="lesson-section interview-section" id="section-11"><div className="section-shell">
    <SectionHeading number={11} eyebrow="VIRTUAL INTERVIEW" title="Ask Tim" description="You’re the interviewer. Choose his short answer." />
    <div className="interview-card reveal"><div className="avatar"><img src={withBase('/assets/tim-cook-morning.png')} alt="" /></div><div className="speech"><span>YOUR QUESTION</span><h3>{item.question}</h3><AudioButton text={item.question} /></div><div className="interview-actions"><button type="button" onClick={() => choose(true)}>Yes, he does.</button><button type="button" onClick={() => choose(false)}>No, he doesn't.</button></div>{answer && <div className={`tim-reply ${answer}`}><strong>{answer === 'correct' ? item.answer : 'Try the other short answer.'}</strong>{answer === 'correct' && <span>{item.reply}</span>}<button type="button" onClick={next}>{answer === 'correct' ? 'Next question' : 'Try again'} <Icon name="arrow" size={17} /></button></div>}</div>
  </div></section>;
}

function NowYou({ activities, onComplete, onRoutineChange }) {
  const [selected, setSelected] = useState(['coffee', 'email']);
  const [form, setForm] = useState('positive');
  useEffect(() => onRoutineChange(selected), [selected, onRoutineChange]);
  const toggle = (id) => { setSelected((all) => all.includes(id) ? all.filter((x) => x !== id) : [...all, id]); onComplete(); };
  const sentence = (activity) => form === 'positive' ? `I ${activity.label}.` : form === 'negative' ? `I don't ${activity.label}.` : `Do I ${activity.label}?`;
  return <section className="lesson-section you-section" id="section-12"><div className="section-shell">
    <SectionHeading number={12} eyebrow="MAKE IT PERSONAL" title="Now you" description="Build a real routine. Then change its shape." />
    <div className="activity-picker reveal">{activities.map((activity) => <button type="button" className={selected.includes(activity.id) ? 'selected' : ''} onClick={() => toggle(activity.id)} key={activity.id}><span><Icon name={activity.icon} /></span>{activity.label}<i><Icon name="check" size={14} /></i></button>)}</div>
    <div className="routine-builder reveal"><div className="routine-top"><div className="mini-avatar"><Icon name="user" /></div><div><span>MY ROUTINE</span><strong>{selected.length} activities selected</strong></div><div className="form-switch">{['positive', 'negative', 'question'].map((item) => <button type="button" className={form === item ? 'active' : ''} onClick={() => setForm(item)} key={item}>{item}</button>)}</div></div><div className="generated-sentences">{selected.length ? selected.map((id) => { const activity = activities.find((x) => x.id === id); return <div key={id}><span className="sentence-number">{String(selected.indexOf(id) + 1).padStart(2, '0')}</span><p>{sentence(activity)}</p><AudioButton text={sentence(activity)} /></div>; }) : <div className="empty-state">Choose an activity to begin.</div>}</div></div>
  </div></section>;
}

function Compare({ activities, personalIds, onComplete }) {
  const [answered, setAnswered] = useState(null);
  const rows = activities.slice(0, 5).map((activity) => ({ ...activity, tim: ['coffee', 'email', 'gym', 'meet', 'book'].includes(activity.id), you: personalIds.includes(activity.id) }));
  return <section className="lesson-section compare-section" id="section-13"><div className="section-shell">
    <SectionHeading number={13} eyebrow="SPOT THE DIFFERENCE" title="Tim vs. you" description="Two routines. One grammar pattern." />
    <div className="compare-card reveal"><div className="compare-head"><span>ACTIVITY</span><strong><span className="tiny-avatar tim" style={{ backgroundImage: `url(${withBase('/assets/tim-cook-morning.png')})` }} />TIM</strong><strong><span className="tiny-avatar you"><Icon name="user" size={15} /></span>YOU</strong></div>{rows.map((row) => <div className="compare-row" key={row.id}><span><Icon name={row.icon} size={20} />{row.label}</span><i className={row.tim ? 'yes' : 'no'}><Icon name={row.tim ? 'check' : 'rotate'} size={16} /></i><i className={row.you ? 'yes' : 'no'}><Icon name={row.you ? 'check' : 'rotate'} size={16} /></i></div>)}</div>
    <div className="compare-question"><span>QUICK COMPARE</span><h3>Do you both read emails?</h3><div><button type="button" className={answered === 'yes' ? personalIds.includes('email') ? 'correct' : 'incorrect' : ''} onClick={() => { setAnswered('yes'); onComplete(); }}>Yes, we do.</button><button type="button" className={answered === 'no' ? !personalIds.includes('email') ? 'correct' : 'incorrect' : ''} onClick={() => { setAnswered('no'); onComplete(); }}>No, we don't.</button></div></div>
  </div></section>;
}

function RetryQueue({ items, onResolve, onComplete }) {
  const item = items[0];
  const [choice, setChoice] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [optionOrder, setOptionOrder] = useState(() => item ? shuffledTokens(item.options).map((token) => token.word) : []);

  useEffect(() => {
    setChoice(null);
    setFeedback(null);
    setOptionOrder(item ? shuffledTokens(item.options).map((token) => token.word) : []);
  }, [item?.id]);

  const answer = (option) => {
    setChoice(option);
    const correct = normalizeSentence(option) === normalizeSentence(item.answer);
    setFeedback(correct ? 'correct' : 'incorrect');
    if (correct) window.setTimeout(() => {
      onResolve(item.id);
      if (items.length === 1) onComplete();
    }, 650);
  };

  return <section className="lesson-section retry-section" id="section-14"><div className="narrow-shell">
    <SectionHeading number={14} eyebrow="SPACED RETRY" title="Repair queue" description="Mistakes return later—after your brain has had time to reset." action={<span className="counter">{items.length} waiting</span>} />
    {!item ? <div className="retry-empty reveal"><span><Icon name="check" size={30} /></span><div><h3>Your queue is clear.</h3><p>Make a mistake earlier and it will wait here for a second look.</p></div><button type="button" className="button primary" onClick={onComplete}>Confirm clear</button></div> : <div className="retry-card reveal"><div className="retry-card-top"><span>REPAIR 01 / {items.length}</span><strong>Try it again—without the time pressure.</strong></div><h3>{item.prompt}</h3><div className="retry-options">{optionOrder.map((option) => <button type="button" key={option} onClick={() => answer(option)} className={choice === option ? normalizeSentence(option) === normalizeSentence(item.answer) ? 'correct' : 'incorrect' : ''}>{option}</button>)}</div><Feedback state={feedback} success="Repaired. This pattern leaves the queue." error="Not yet. Compare the verb and word position." /></div>}
  </div></section>;
}

function FinalChallenge({ items, xp, onComplete }) {
  const [started, setStarted] = useState(false);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const item = items[index];
  const answer = (value) => {
    const correct = item.type === 'speak' || value === item.answer;
    if (correct) setScore(score + 1);
    if (index === items.length - 1) { setDone(true); onComplete(); } else setIndex(index + 1);
  };
  return <section className="lesson-section final-section" id="section-15"><div className="section-shell">
    {!started ? <div className="mission-intro reveal"><span className="mission-icon"><Icon name="trophy" size={46} /></span><span className="eyebrow light">FINAL CHALLENGE</span><h2>Your morning mission</h2><p>Four signals. One fluent pattern. Complete the set.</p><div className="mission-stats"><span><strong>4</strong>tasks</span><span><strong>{xp}</strong>XP</span><span><strong>~4</strong>min</span></div><button type="button" className="button coral" onClick={() => setStarted(true)}>Accept mission <Icon name="arrow" size={18} /></button></div> : done ? <div className="mission-complete"><span className="mission-icon"><Icon name="trophy" size={46} /></span><span className="eyebrow light">MISSION COMPLETE</span><h2>{score}/{items.length} patterns caught</h2><p>{score === items.length ? 'Automatic mode: unlocked.' : 'The pattern is getting faster. Replay any section.'}</p><button type="button" className="button coral" onClick={() => { setIndex(0); setScore(0); setDone(false); }}>Run again</button></div> : <div className="mission-task reveal"><div className="mission-task-top"><span>MISSION {index + 1} / {items.length}</span><div>{items.map((_, i) => <i className={i <= index ? 'active' : ''} key={i} />)}</div></div><h3>{item.prompt}</h3>{item.type === 'speak' ? <SpeakingRecorder prompt={item.model || item.prompt} onComplete={() => answer('spoken')} /> : <div className="mission-options">{item.options.map((option) => <button type="button" onClick={() => answer(option)} key={option}>{option}<Icon name="arrow" size={17} /></button>)}</div>}</div>}
  </div></section>;
}

function Homework({ data, onComplete }) {
  const [answers, setAnswers] = useState(() => Array(data.tasks.length).fill(''));
  const [submitted, setSubmitted] = useState(false);
  const answered = answers.filter((answer) => answer.trim()).length;
  const isCorrect = (task, answer) => task.answer === 'open' ? Boolean(answer.trim()) : normalizeSentence(answer) === normalizeSentence(task.answer);
  const score = data.tasks.reduce((total, task, index) => total + (isCorrect(task, answers[index]) ? 1 : 0), 0);
  const setAnswer = (index, value) => setAnswers((current) => current.map((answer, i) => i === index ? value : answer));
  const submit = () => { if (answered !== data.tasks.length) return; setSubmitted(true); onComplete(); };

  return <section className="lesson-section homework-section" id="section-16"><div className="section-shell">
    <SectionHeading number={16} eyebrow="TAKE-HOME PRACTICE · ~60 MIN" title={data.title} description={data.description} action={<span className="counter">{answered} / {data.tasks.length}</span>} />
    <div className="homework-plan reveal">{data.blocks.map((block, index) => <div key={block.label}><span>{String(index + 1).padStart(2, '0')}</span><strong>{block.label.split(' · ')[1]}</strong><small>{block.minutes} MIN</small></div>)}</div>
    {!submitted ? <form className="homework-sheet" onSubmit={(event) => { event.preventDefault(); submit(); }}>
      {data.blocks.map((block, blockIndex) => <fieldset className="homework-block reveal" key={block.label}><legend><span>{block.label}</span><small>{block.minutes} minutes</small></legend>
        {data.tasks.map((task, taskIndex) => task.block === blockIndex && <div className="homework-task" key={task.prompt}><div className="homework-task-number">{String(taskIndex + 1).padStart(2, '0')}</div><div><label>{task.prompt}</label>{task.type === 'choice' ? <div className="homework-options">{task.options.map((option) => <button type="button" className={answers[taskIndex] === option ? 'selected' : ''} onClick={() => setAnswer(taskIndex, option)} key={option}>{option}</button>)}</div> : <input value={answers[taskIndex]} onChange={(event) => setAnswer(taskIndex, event.target.value)} placeholder={task.answer === 'open' ? 'Write your own answer…' : 'Type the complete sentence…'} aria-label={task.prompt} />}</div></div>)}
      </fieldset>)}
      <div className="homework-submit"><div><strong>{answered === data.tasks.length ? 'Ready for your answer review.' : `${data.tasks.length - answered} tasks left`}</strong><span>Your work stays on this page until you reset.</span></div><button className="button coral" type="submit" disabled={answered !== data.tasks.length}>Finish & review <Icon name="arrow" size={18} /></button></div>
    </form> : <div className="homework-results reveal">
      <div className="results-hero"><span className="mission-icon"><Icon name="trophy" size={40} /></span><div><span>HOMEWORK COMPLETE</span><h3>{score} / {data.tasks.length}</h3><p>{score === data.tasks.length ? 'Every pattern landed.' : 'Review the repairs below, then reset when you want another run.'}</p></div></div>
      <div className="answer-review">{data.tasks.map((task, index) => { const correct = isCorrect(task, answers[index]); return <article className={correct ? 'review-correct' : 'review-incorrect'} key={task.prompt}><div className="review-status"><Icon name={correct ? 'check' : 'rotate'} size={18} /><span>{String(index + 1).padStart(2, '0')}</span></div><div><p>{task.prompt}</p><span className={correct ? 'user-answer' : 'user-answer crossed'}>{answers[index]}</span>{!correct && <strong>{task.answer}</strong>}{task.answer === 'open' && <em>Model: {task.sample}</em>}</div></article>; })}</div>
    </div>}
  </div></section>;
}

function Footer() {
  return <footer><a className="brand" href="#welcome"><span className="brand-mark"><span /></span><span>dayloop</span></a><p>Practice until the pattern feels automatic.</p><a className="next-lesson-link" href={withBase('/dream-interview.html')}>Next lesson: The Dream Interview →</a><a href="#welcome">Back to top ↑</a></footer>;
}

export function LessonEngine({ lesson }) {
  const storageKey = `dayloop:${lesson.meta.id}:progress`;
  const retryKey = `dayloop:${lesson.meta.id}:retry`;
  const [completed, setCompleted] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey)) || []; } catch { return []; }
  });
  const [retryItems, setRetryItems] = useState(() => {
    try { return JSON.parse(localStorage.getItem(retryKey)) || []; } catch { return []; }
  });
  const [personalIds, setPersonalIds] = useState(['coffee', 'email']);
  useReveal();
  useEffect(() => localStorage.setItem(storageKey, JSON.stringify(completed)), [completed, storageKey]);
  useEffect(() => localStorage.setItem(retryKey, JSON.stringify(retryItems)), [retryItems, retryKey]);
  const complete = (id) => setCompleted((current) => current.includes(id) ? current : [...current, id]);
  const addMiss = (item) => setRetryItems((current) => current.some((queued) => queued.id === item.id) ? current : [...current, item]);
  const resolveMiss = (id) => setRetryItems((current) => current.filter((item) => item.id !== id));
  const progress = Math.round((completed.length / 16) * 100);
  const xp = Math.round((completed.length / 16) * lesson.meta.xp);
  const routineChange = useMemo(() => (ids) => setPersonalIds(ids), []);
  const resetLesson = () => {
    if (!window.confirm('Reset all lesson progress and answers?')) return;
    localStorage.removeItem(storageKey);
    localStorage.removeItem(retryKey);
    window.location.reload();
  };
  return <>
    <AppHeader progress={progress} xp={xp} onReset={resetLesson} />
    <main>
      <div id="section-1"><Hero lesson={lesson} onComplete={() => complete(1)} /></div>
      <Warmup data={lesson.warmup} onComplete={() => complete(2)} />
      <Vocabulary words={lesson.vocabulary} onComplete={() => complete(3)} />
      <Story items={lesson.story} onComplete={() => complete(4)} />
      <GrammarXRay examples={lesson.transformations} onComplete={() => complete(5)} />
      <Discovery onComplete={() => complete(6)} />
      <FrequencyLab data={lesson.frequency} onComplete={() => complete(7)} onMiss={addMiss} />
      <SentenceBuilder items={lesson.builders} onComplete={() => complete(8)} onMiss={addMiss} />
      <MistakeFinder items={lesson.mistakes} onComplete={() => complete(9)} onMiss={addMiss} />
      <MiniQuiz items={lesson.quiz} onComplete={() => complete(10)} onMiss={addMiss} />
      <Interview items={lesson.interview} onComplete={() => complete(11)} />
      <NowYou activities={lesson.personalActivities} onComplete={() => complete(12)} onRoutineChange={routineChange} />
      <Compare activities={lesson.personalActivities} personalIds={personalIds} onComplete={() => complete(13)} />
      <RetryQueue items={retryItems} onResolve={resolveMiss} onComplete={() => complete(14)} />
      <FinalChallenge items={lesson.challenge} xp={lesson.meta.xp} onComplete={() => complete(15)} />
      <Homework data={lesson.homework} onComplete={() => complete(16)} />
    </main>
    <Footer />
  </>;
}
