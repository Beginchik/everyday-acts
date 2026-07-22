import { useEffect, useMemo, useState } from 'react';
import data from '../data/lessons/dreamInterview.json';
import { AudioButton, Feedback, GrammarToken, Icon, SectionHeading, SpeakingRecorder, useReveal } from './UI';

const withBase = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, '')}`;
const normalize = (value = '') => value.toLowerCase().replace(/[’]/g, "'").replace(/\s+/g, ' ').replace(/\s+([?.!,])/g, '$1').trim();
const shuffle = (items) => {
  const result = items.map((word, index) => ({ word, id: `${index}-${word}` }));
  for (let i = result.length - 1; i > 0; i -= 1) { const j = Math.floor(Math.random() * (i + 1)); [result[i], result[j]] = [result[j], result[i]]; }
  if (result.length > 2 && result.map((item) => item.word).join(' ') === items.join(' ')) result.push(result.shift());
  return result;
};

const nav = [
  ['Review', 'di-review'], ['Words', 'di-words'], ['Story', 'di-story'], ['Sort', 'di-sort'], ['X-Ray', 'di-xray'],
  ['Reflex', 'di-reflex'], ['Build', 'di-build'], ['Ask', 'di-ask'], ['Answers', 'di-short'], ['Fix', 'di-fix'],
  ['Listen', 'di-listen'], ['Interview', 'di-interview'], ['You', 'di-you'], ['Mission', 'di-mission'],
];

function Header({ progress, xp, onReset }) {
  const [open, setOpen] = useState(false);
  return <header className="di-header">
    <a className="brand" href={withBase('/index.html')} aria-label="Back to Everyday Activities"><span className="brand-mark"><span /></span><span>dayloop</span></a>
    <div className="di-progress"><div><span>The Dream Interview</span><strong>{progress}%</strong></div><i><b style={{ width: `${progress}%` }} /></i></div>
    <div className="di-header-actions"><span className="xp-pill"><Icon name="spark" size={16}/>{xp} XP</span><button className="reset-button" onClick={onReset}><Icon name="rotate" size={16}/><span>Reset</span></button><button className="menu-button" onClick={() => setOpen(!open)} aria-label="Open lesson map"><span/><span/></button></div>
    {open && <nav className="lesson-map di-map">{nav.map(([label, id], index) => <a href={`#${id}`} onClick={() => setOpen(false)} key={id}><span>{String(index + 1).padStart(2, '0')}</span>{label}</a>)}</nav>}
  </header>;
}

function Hero({ complete }) {
  return <section className="di-hero" id="di-welcome">
    <img src={withBase('/assets/dream-interview-hero.png')} alt="Maya and Alex talking in a modern international travel club"/>
    <div className="di-hero-shade"/>
    <div className="di-hero-copy reveal"><a className="di-back" href={withBase('/index.html')}>← Lesson 01 · Everyday Activities</a><span className="eyebrow light">{data.meta.eyebrow}</span><h1>{data.meta.title}</h1><p>{data.meta.subtitle}</p><div className="di-hero-actions"><a className="button coral" href="#di-review" onClick={complete}>Start the interview <Icon name="arrow" size={18}/></a><AudioButton text={`${data.meta.title}. ${data.meta.subtitle}`}/></div><div className="di-hero-pattern"><span><b>ARE</b> you ready?</span><i>or</i><span><b>DO</b> you travel?</span></div></div>
    <div className="di-hero-badge"><span>TONIGHT</span><strong>Travel Club</strong><small>Two people · two question patterns</small></div>
  </section>;
}

function Revision({ complete }) {
  const [answers, setAnswers] = useState({});
  const score = data.revision.filter((item, i) => answers[i] === item.answer).length;
  useEffect(() => { if (score === data.revision.length) complete('review'); }, [score, complete]);
  return <section className="lesson-section di-review" id="di-review"><div className="section-shell"><SectionHeading number={1} eyebrow="MEMORY WARM-UP" title="First, reopen the last pattern" description="Four quick choices from Maya’s bucket list. No rule—just rhythm." action={<span className="counter">{score} / 4</span>}/><div className="di-review-grid">{data.revision.map((item, i) => <article className="di-review-card reveal" key={item.prompt}><span>0{i + 1}</span><h3>{item.prompt}</h3><div>{item.options.map((option) => <button className={answers[i] === option ? option === item.answer ? 'correct' : 'incorrect' : ''} onClick={() => setAnswers({...answers, [i]: option})} key={option}>{option}</button>)}</div>{answers[i] && <Feedback state={answers[i] === item.answer ? 'correct' : 'incorrect'}/>}</article>)}</div></div></section>;
}

function Vocabulary({ complete }) {
  const groups = ['Personality', 'Feelings', 'Travel'];
  const [group, setGroup] = useState(groups[0]);
  const [heard, setHeard] = useState([]);
  const hear = (item) => { setHeard((old) => old.includes(item.word) ? old : [...old, item.word]); if ('speechSynthesis' in window) { speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(`${item.word}. ${item.example}`); u.lang='en-US'; u.rate=.82; speechSynthesis.speak(u); } };
  useEffect(() => { if (heard.length >= 6) complete('words'); }, [heard, complete]);
  return <section className="lesson-section di-words" id="di-words"><div className="section-shell"><SectionHeading number={2} eyebrow="NEW LANGUAGE" title="Words for people and journeys" description="Tap to hear each word in a real question or answer." action={<span className="counter">{heard.length} heard</span>}/><div className="segmented-control di-tabs">{groups.map((item) => <button className={group === item ? 'active' : ''} onClick={() => setGroup(item)} key={item}>{item}</button>)}</div><div className="di-vocab-grid">{data.vocabulary.filter((item) => item.group === group).map((item) => <button className={`di-vocab-card reveal ${heard.includes(item.word) ? 'heard' : ''}`} onClick={() => hear(item)} key={item.word}><span className="di-vocab-icon">{item.icon}</span><span className="di-sound"><Icon name="sound" size={16}/></span><h3>{item.word}</h3><p>{item.meaning}</p><small>“{item.example}”</small></button>)}</div></div></section>;
}

function Dialogue({ complete }) {
  const [index, setIndex] = useState(0);
  const item = data.dialogue[index];
  const next = () => { if (index === data.dialogue.length - 1) complete('story'); setIndex((index + 1) % data.dialogue.length); };
  return <section className="lesson-section di-story" id="di-story"><div className="section-shell"><SectionHeading number={3} eyebrow="LIVE CONVERSATION" title="Maya meets Alex" description="Follow their first conversation. Notice which word opens each question." action={<span className="counter">{index + 1} / {data.dialogue.length}</span>}/><div className="di-dialogue reveal"><div className={`di-speaker ${item.speaker.toLowerCase()}`}><div className="di-avatar">{item.speaker[0]}</div><span>{item.speaker} asks</span><h3>{item.line}</h3><AudioButton text={`${item.line} ${item.reply}`}/></div><div className="di-reply"><span>{item.type === 'be' ? 'BE QUESTION' : 'OTHER VERB'}</span><p>{item.reply}</p><button onClick={next}>{index === data.dialogue.length - 1 ? 'Replay story' : 'Continue'} <Icon name="arrow" size={17}/></button></div></div><div className="di-scene-track">{data.dialogue.map((_, i) => <button className={i === index ? 'active' : ''} onClick={() => setIndex(i)} key={i} aria-label={`Dialogue line ${i + 1}`}/>)}</div></div></section>;
}

function Sorter({ complete }) {
  const [answers, setAnswers] = useState({});
  const [selected, setSelected] = useState(0);
  const current = data.sortQuestions[selected];
  const place = (type) => {
    const next = {...answers, [selected]: type}; setAnswers(next);
    if (Object.keys(next).length === data.sortQuestions.length && data.sortQuestions.every((item, i) => next[i] === item.type)) complete('sort');
    if (type === current.type && selected < data.sortQuestions.length - 1) setTimeout(() => setSelected(selected + 1), 350);
  };
  return <section className="lesson-section di-sort" id="di-sort"><div className="section-shell"><SectionHeading number={4} eyebrow="PATTERN SORT" title="Two doors. Which one opens?" description="Sort each question by the verb pattern it uses."/><div className="di-sorter reveal"><div className="di-sort-deck"><span>QUESTION {selected + 1}</span><h3>{current.text}</h3><AudioButton text={current.text}/><div className="di-card-dots">{data.sortQuestions.map((_, i) => <i className={answers[i] ? answers[i] === data.sortQuestions[i].type ? 'done' : 'miss' : i === selected ? 'current' : ''} key={i}/>)}</div></div><button className="di-bin be" onClick={() => place('be')}><span>DOOR A</span><strong>BE</strong><small>am · is · are</small></button><button className="di-bin do" onClick={() => place('do')}><span>DOOR B</span><strong>DO</strong><small>other verbs</small></button></div>{answers[selected] && <Feedback state={answers[selected] === current.type ? 'correct' : 'incorrect'} success="Correct door. Keep the shape in view." error="Look at the verb: is it be or an action?"/>}</div></section>;
}

function XRay({ complete }) {
  const [mode, setMode] = useState('normal');
  const [discovery, setDiscovery] = useState({});
  const solved = discovery.be === 'moves' && discovery.do === 'helper' && discovery.s === 'base';
  useEffect(() => { if (solved) complete('xray'); }, [solved, complete]);
  return <section className="lesson-section di-xray" id="di-xray"><div className="section-shell"><SectionHeading number={5} eyebrow="QUESTION X-RAY" title="Watch the question take shape" description="One pattern moves. The other calls for help."/><div className="di-xray-stage reveal"><div className="di-mode"><button className={mode === 'normal' ? 'active' : ''} onClick={() => setMode('normal')}>STATEMENTS</button><button className={mode === 'xray' ? 'active' : ''} onClick={() => setMode('xray')}>QUESTION X-RAY</button></div>{mode === 'normal' ? <div className="di-xray-lines"><p>Maya <GrammarToken type="aux">is</GrammarToken> adventurous.</p><p>Maya want<GrammarToken type="ending">s</GrammarToken> <GrammarToken type="base">to travel</GrammarToken>.</p></div> : <div className="di-xray-lines active"><p><GrammarToken type="aux">Is</GrammarToken> Maya adventurous?</p><p><GrammarToken type="aux">Do</GrammarToken><GrammarToken type="ending">es</GrammarToken> Maya <GrammarToken type="base">want</GrammarToken> to travel?</p><div className="di-motion"><span>BE moves ↖</span><span>DO + ES arrives · S leaves</span></div></div>}</div><div className="di-discovery reveal"><h3>What changed?</h3><DiscoveryRow label="With be…" options={['it moves', 'we add do']} answer="moves" value={discovery.be} onPick={(value) => setDiscovery({...discovery, be:value})}/><DiscoveryRow label="With other verbs…" options={['be moves', 'do / does helps']} answer="helper" value={discovery.do} onPick={(value) => setDiscovery({...discovery, do:value})}/><DiscoveryRow label="After does…" options={['use the base verb', 'keep the -s']} answer="base" value={discovery.s} onPick={(value) => setDiscovery({...discovery, s:value})}/>{solved && <div className="di-rule-reveal"><Icon name="check"/><p><strong>You found both systems.</strong> Question word + <b>be</b> + subject. Question word + <b>do/does</b> + subject + base verb.</p></div>}</div></div></section>;
}

function DiscoveryRow({ label, options, answer, value, onPick }) {
  const values = answer === 'moves' ? ['moves','add'] : answer === 'helper' ? ['move','helper'] : ['base','s'];
  return <div className="di-discovery-row"><strong>{label}</strong><div>{options.map((option, i) => <button className={value === values[i] ? values[i] === answer ? 'correct' : 'incorrect' : ''} onClick={() => onPick(values[i])} key={option}>{option}</button>)}</div></div>;
}

function Reflex({ complete }) {
  const [index, setIndex] = useState(0); const [choice, setChoice] = useState(''); const [score, setScore] = useState(0);
  const item = data.starters[index];
  const pick = (option) => { if (choice) return; setChoice(option); if (option === item.answer) setScore(score + 1); setTimeout(() => { if (index === data.starters.length - 1) complete('reflex'); else setIndex(index + 1); setChoice(''); }, 650); };
  return <section className="lesson-section di-reflex" id="di-reflex"><div className="section-shell"><SectionHeading number={6} eyebrow="FAST REFLEX" title="Choose the opening signal" description="Answer quickly. Let the meaning choose the grammar." action={<span className="counter">{score} correct</span>}/><div className="di-reflex-card reveal"><div className="di-timer"><span style={{width:`${((index+1)/data.starters.length)*100}%`}}/></div><span>ROUND {index + 1} / {data.starters.length}</span><h3>{item.prompt}</h3><div>{item.options.map((option) => <button className={choice === option ? option === item.answer ? 'correct' : 'incorrect' : choice && option === item.answer ? 'correct' : ''} onClick={() => pick(option)} key={option}>{option}</button>)}</div><Feedback state={choice ? choice === item.answer ? 'correct' : 'incorrect' : ''}/></div></div></section>;
}

function Builder({ complete }) {
  const [index, setIndex] = useState(0); const item = data.builders[index];
  const [pool, setPool] = useState(() => shuffle(item.words)); const [built, setBuilt] = useState([]); const [feedback, setFeedback] = useState(null);
  useEffect(() => { setPool(shuffle(item.words)); setBuilt([]); setFeedback(null); }, [index]);
  const add = (token) => { setPool(pool.filter((x) => x.id !== token.id)); setBuilt([...built, token]); setFeedback(null); };
  const remove = (token) => { setBuilt(built.filter((x) => x.id !== token.id)); setPool([...pool, token]); setFeedback(null); };
  const check = () => { const value = built.map((x) => x.word).join(' ').replace(/\s+\?/g,'?'); const good = normalize(value) === normalize(item.answer); setFeedback(good ? 'correct':'incorrect'); if (good && index === data.builders.length - 1) complete('build'); };
  const next = () => setIndex((index + 1) % data.builders.length);
  return <section className="lesson-section di-build" id="di-build"><div className="section-shell"><SectionHeading number={7} eyebrow="BUILD THE QUESTION" title="Put every word in its place" description="The words reshuffle each round. Tap or drag them into order." action={<span className="counter">{index + 1} / {data.builders.length}</span>}/><div className="builder-card reveal"><div className="builder-prompt"><span>INTERVIEW PROMPT</span><strong>{index < 2 ? 'Yes / no question' : 'Information question'}</strong></div><div className={`drop-zone ${built.length ? 'has-words':''}`}>{built.length ? built.map((token) => <button onClick={() => remove(token)} key={token.id}>{token.word}</button>) : <span>Build the question here…</span>}</div><div className="word-bank">{pool.map((token) => <button onClick={() => add(token)} key={token.id}>{token.word}</button>)}</div><div className="builder-footer"><Feedback state={feedback}/><button className="button primary" onClick={check}>Check question</button></div>{feedback === 'correct' && <button className="di-next" onClick={next}>Next question →</button>}</div></div></section>;
}

function AskFromAnswer({ complete }) {
  const [index, setIndex] = useState(0); const item = data.answerToQuestion[index]; const [value,setValue]=useState(''); const [feedback,setFeedback]=useState(null);
  const check=()=>{const good=normalize(value)===normalize(item.answer);setFeedback(good?'correct':'incorrect');if(good&&index===data.answerToQuestion.length-1)complete('ask');};
  const next=()=>{setIndex((index+1)%data.answerToQuestion.length);setValue('');setFeedback(null);};
  return <section className="lesson-section di-ask" id="di-ask"><div className="section-shell"><SectionHeading number={8} eyebrow="REVERSE THE INTERVIEW" title="The answer is ready. Find its question." description="Meaning comes first: use the answer to decide what to ask."/><div className="di-answer-card reveal"><div className="di-answer-bubble"><span>ANSWER</span><p>“{item.answerLine}”</p></div><div className="di-question-editor"><span>YOUR QUESTION · CUE: {item.cue}</span><div><input value={value} onChange={(e)=>{setValue(e.target.value);setFeedback(null);}} onKeyDown={(e)=>e.key==='Enter'&&check()} placeholder="Type the complete question…"/><button onClick={check}><Icon name="check"/></button></div><Feedback state={feedback} error="Check the question word, helper, subject, and verb."/>{feedback==='correct'&&<button className="di-next" onClick={next}>Use another answer →</button>}</div></div></div></section>;
}

function ShortAnswers({ complete }) {
  const [answers,setAnswers]=useState({}); const score=data.shortAnswers.filter((x,i)=>answers[i]===x.answer).length;
  useEffect(()=>{if(score===data.shortAnswers.length)complete('short');},[score,complete]);
  return <section className="lesson-section di-short" id="di-short"><div className="section-shell"><SectionHeading number={9} eyebrow="ANSWER REFLEX" title="Match the question’s helper" description="The opening word returns in the short answer." action={<span className="counter">{score} / {data.shortAnswers.length}</span>}/><div className="di-short-grid">{data.shortAnswers.map((item,i)=><article className="reveal" key={item.question}><AudioButton text={item.question}/><h3>{item.question}</h3><div>{item.options.map(option=><button className={answers[i]===option?(option===item.answer?'correct':'incorrect'):''} onClick={()=>setAnswers({...answers,[i]:option})} key={option}>{option}</button>)}</div></article>)}</div></div></section>;
}

function FixQuestions({ complete }) {
  const [order] = useState(() => [...data.mistakes].sort(()=>Math.random()-.5)); const [index,setIndex]=useState(0); const item=order[index]; const [value,setValue]=useState(item.bad); const [feedback,setFeedback]=useState(null); const [done,setDone]=useState(false);
  const check=()=>{const good=normalize(value)===normalize(item.good);setFeedback(good?'correct':'incorrect');if(good)setTimeout(()=>{if(index===order.length-1){setDone(true);complete('fix');}else{setIndex(index+1);setValue(order[index+1].bad);setFeedback(null);}},650);};
  return <section className="lesson-section di-fix" id="di-fix"><div className="section-shell"><SectionHeading number={10} eyebrow="QUESTION REPAIR" title="Edit the interview script" description="One line is already correct. Edit—or simply press Enter." action={<span className="counter">{Math.min(index+1,order.length)} / {order.length}</span>}/>{done?<div className="glitch-complete reveal"><Icon name="check" size={34}/><div><span>INTERVIEW READY</span><h3>All questions repaired.</h3><p>You also spotted the line with no mistake.</p></div></div>:<div className={`mistake-card editable reveal ${feedback||''}`}><span className="glitch-label">EDIT THE QUESTION · OR PRESS ENTER</span><input aria-label="Edit the question" value={value} onChange={e=>{setValue(e.target.value);setFeedback(null);}} onKeyDown={e=>e.key==='Enter'&&check()} spellCheck="false"/><div className="edit-hint"><span>Look at be, do/does, and the base verb.</span><button className="button coral" onClick={check}>Check question</button></div><Feedback state={feedback} success="Clean question. Next line loading…" error="Not yet. Which of the two question systems do you need?"/></div>}</div></section>;
}

function Listening({ complete }) {
  const [index,setIndex]=useState(0); const [choice,setChoice]=useState(''); const [score,setScore]=useState(0); const item=data.listening[index];
  const pick=(option)=>{if(choice)return;setChoice(option);if(option===item.answer)setScore(score+1);setTimeout(()=>{if(index===data.listening.length-1)complete('listen');else setIndex(index+1);setChoice('');},800);};
  return <section className="lesson-section di-listen" id="di-listen"><div className="section-shell"><SectionHeading number={11} eyebrow="LISTENING" title="Hear the opening signal" description="Play the question. Match its sound to the written form." action={<span className="counter">{score} heard</span>}/><div className="di-listen-card reveal"><div className="di-wave"><i/><i/><i/><i/><i/><AudioButton text={item.audio} label="Play question"/><i/><i/><i/><i/><i/></div><span>CLIP {index+1} / {data.listening.length}</span><h3>{item.prompt}</h3><div className="di-listen-options">{item.options.map(option=><button className={choice===option?(option===item.answer?'correct':'incorrect'):choice&&option===item.answer?'correct':''} onClick={()=>pick(option)} key={option}>{option}</button>)}</div></div></div></section>;
}

function Interview({ complete }) {
  const [index,setIndex]=useState(0); const [shown,setShown]=useState(false); const item=data.interview[index];
  const next=()=>{if(index===data.interview.length-1)complete('interview');setIndex((index+1)%data.interview.length);setShown(false);};
  return <section className="lesson-section di-interview" id="di-interview"><div className="section-shell"><SectionHeading number={12} eyebrow="YOUR TURN" title="Interview Alex" description="Use the cue, say your question, then reveal the model."/><div className="di-interview-stage reveal"><div className="di-person"><span>A</span><strong>ALEX</strong><small>TRAVEL WRITER</small></div><div className="di-interview-main"><span>CUE {index+1} · {item.cue.toUpperCase()}</span><p>What question can you ask?</p>{shown?<><div className="di-model-question">{item.question}<AudioButton text={`${item.question} ${item.reply}`}/></div><div className="di-alex-reply">“{item.reply}”</div><button className="button coral" onClick={next}>Next cue <Icon name="arrow" size={17}/></button></>:<button className="button primary" onClick={()=>setShown(true)}>Reveal model question</button>}</div></div></div></section>;
}

function NowYou({ complete }) {
  const [profile,setProfile]=useState({from:'',job:'',dream:''}); const [ready,setReady]=useState('');
  const completeProfile=Object.values(profile).every(Boolean)&&ready;
  useEffect(()=>{if(completeProfile)complete('you');},[completeProfile,complete]);
  return <section className="lesson-section di-you" id="di-you"><div className="section-shell"><SectionHeading number={13} eyebrow="MAKE IT PERSONAL" title="Now the questions are yours" description="Answer three real questions, then practise asking them aloud."/><div className="di-profile reveal"><div className="di-profile-head"><span>MY TRAVEL PROFILE</span><strong>{Object.values(profile).filter(Boolean).length + (ready?1:0)} / 4 answered</strong></div><ProfileRow question="Where are you from?" value={profile.from} onChange={value=>setProfile({...profile,from:value})}/><ProfileRow question="What do you do?" value={profile.job} onChange={value=>setProfile({...profile,job:value})}/><ProfileRow question="Where do you want to travel?" value={profile.dream} onChange={value=>setProfile({...profile,dream:value})}/><div className="di-profile-row"><div><AudioButton text="Are you ready for an adventure?"/><label>Are you ready for an adventure?</label></div><div className="di-ready">{['Yes, I am.','No, I\'m not.'].map(option=><button className={ready===option?'selected':''} onClick={()=>setReady(option)} key={option}>{option}</button>)}</div></div></div><div className="di-speaking-note reveal"><span>60-SECOND SPEAKING</span><p>Ask and answer all four questions. Then add one question with <strong>why</strong>.</p></div></div></section>;
}

function ProfileRow({question,value,onChange}) { return <div className="di-profile-row"><div><AudioButton text={question}/><label>{question}</label></div><input value={value} onChange={e=>onChange(e.target.value)} placeholder="Type your answer…"/></div>; }

function Mission({ xp, complete }) {
  const [started,setStarted]=useState(false);const[index,setIndex]=useState(0);const[records,setRecords]=useState([]);const[done,setDone]=useState(false);const item=data.mission[index];
  const answer=(value)=>{const correct=item.answer==='open'||value===item.answer;const next=[...records,{prompt:item.prompt,value,correct,answer:item.answer}];setRecords(next);if(index===data.mission.length-1){setDone(true);complete('mission');}else setIndex(index+1);};
  const reset=()=>{setIndex(0);setRecords([]);setDone(false);setStarted(true);};
  return <section className="lesson-section di-mission" id="di-mission"><div className="section-shell">{!started?<div className="mission-intro reveal"><span className="mission-icon"><Icon name="trophy" size={46}/></span><span className="eyebrow light">FINAL MISSION</span><h2>Join the travel club</h2><p>Five tasks. Both question systems. One fluent interview.</p><div className="mission-stats"><span><strong>5</strong>tasks</span><span><strong>{xp}</strong>XP</span><span><strong>~5</strong>min</span></div><button className="button coral" onClick={()=>setStarted(true)}>Enter the club <Icon name="arrow" size={18}/></button></div>:done?<MissionResults records={records} onRetry={reset}/>:<div className="mission-task reveal"><div className="mission-task-top"><span>MISSION {index+1} / {data.mission.length}</span><div>{data.mission.map((_,i)=><i className={i<=index?'active':''} key={i}/>)}</div></div><h3>{item.prompt}</h3>{item.type==='speaking'?<div className="di-speaking-mission"><SpeakingRecorder prompt="Where do you want to travel? Are you ready for an adventure?" onComplete={()=>answer('Spoken response')}/><button className="di-said-button" onClick={()=>answer('Spoken response')}>I said both questions →</button></div>:<div className="mission-options">{item.options.map(option=><button onClick={()=>answer(option)} key={option}>{option}<Icon name="arrow" size={17}/></button>)}</div>}</div>}</div></section>;
}

function MissionResults({records,onRetry}) { const score=records.filter(x=>x.correct).length;return <div className="di-results reveal"><div className="di-score"><span><strong>{score}</strong>/{records.length}</span><div><p>MISSION COMPLETE</p><h2>{score===records.length?'Interview unlocked.':'Your questions are getting sharper.'}</h2></div></div><div className="di-review-list">{records.map((item,i)=><article className={item.correct?'right':'wrong'} key={i}><span>{item.correct?'✓':'×'} {String(i+1).padStart(2,'0')}</span><div><p>{item.prompt}</p><em className={!item.correct?'crossed':''}>{item.value}</em>{!item.correct&&<strong>{item.answer}</strong>}</div></article>)}</div><div className="di-results-actions"><a className="button primary" href={withBase('/index.html')}>← Previous lesson</a><button className="button coral" onClick={onRetry}>Run mission again</button></div></div>; }

function Footer() { return <footer className="di-footer"><a className="brand" href="#di-welcome"><span className="brand-mark"><span/></span><span>dayloop</span></a><p><strong>Lesson 02 · The Dream Interview</strong><br/>Questions with be and other verbs</p><div><a href={withBase('/index.html')}>← Everyday Activities</a><a href="#di-welcome">Back to top ↑</a></div></footer>; }

export function DreamInterviewLesson() {
  const storageKey='dayloop:dream-interview:progress';
  const [completed,setCompleted]=useState(()=>{try{return JSON.parse(localStorage.getItem(storageKey))||[]}catch{return[]}});
  useReveal();
  useEffect(()=>localStorage.setItem(storageKey,JSON.stringify(completed)),[completed]);
  const complete=useMemo(()=>id=>setCompleted(old=>old.includes(id)?old:[...old,id]),[]);
  const total=15; const progress=Math.min(100,Math.round((completed.length/total)*100)); const xp=Math.round((completed.length/total)*data.meta.xp);
  const reset=()=>{if(window.confirm('Reset all Dream Interview progress?')){localStorage.removeItem(storageKey);window.location.reload();}};
  return <><Header progress={progress} xp={xp} onReset={reset}/><main><Hero complete={()=>complete('hero')}/><Revision complete={complete}/><Vocabulary complete={complete}/><Dialogue complete={complete}/><Sorter complete={complete}/><XRay complete={complete}/><Reflex complete={complete}/><Builder complete={complete}/><AskFromAnswer complete={complete}/><ShortAnswers complete={complete}/><FixQuestions complete={complete}/><Listening complete={complete}/><Interview complete={complete}/><NowYou complete={complete}/><Mission xp={data.meta.xp} complete={complete}/></main><Footer/></>;
}
