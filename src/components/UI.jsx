import { useEffect, useRef, useState } from 'react';

const paths = {
  sunrise: <><path d="M4 18h16M6 14a6 6 0 0 1 12 0M12 3v3M4.2 7.2l2.1 2.1M19.8 7.2l-2.1 2.1" /></>,
  work: <><rect x="4" y="7" width="16" height="12" rx="2" /><path d="M9 7V5h6v2M4 12h16M10 12v2h4v-2" /></>,
  book: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21V5.5ZM20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5A2.5 2.5 0 0 1 20 21V5.5Z" /></>,
  moon: <path d="M20 15.2A8 8 0 0 1 8.8 4 8 8 0 1 0 20 15.2Z" />,
  mail: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="m4 7 8 6 8-6" /></>,
  gym: <><path d="M6 8v8M3.5 10v4M18 8v8M20.5 10v4M6 12h12" /></>,
  bed: <><path d="M4 5v15M4 15h16v5M7 15v-5h4a3 3 0 0 1 3 3v2M4 18h16" /></>,
  coffee: <><path d="M5 8h11v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8ZM16 10h2a2 2 0 0 1 0 4h-2M8 3v2M12 3v2" /></>,
  meeting: <><circle cx="8" cy="8" r="3" /><circle cx="17" cy="9" r="2.5" /><path d="M3 20v-2a5 5 0 0 1 10 0v2M14 15.5a4 4 0 0 1 7 2.5v2" /></>,
  play: <path d="m9 7 8 5-8 5V7Z" />,
  check: <path d="m5 12 4 4L19 6" />,
  arrow: <path d="m9 18 6-6-6-6" />,
  spark: <><path d="m12 3 1.2 4.1L17 9l-3.8 1.9L12 15l-1.2-4.1L7 9l3.8-1.9L12 3Z" /><path d="m19 15 .7 2.3L22 18.5l-2.3 1.2L19 22l-.7-2.3-2.3-1.2 2.3-1.2L19 15Z" /></>,
  sound: <><path d="M5 10v4h3l4 4V6l-4 4H5Z" /><path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a8 8 0 0 1 0 11" /></>,
  trophy: <><path d="M8 4h8v4a4 4 0 0 1-8 0V4ZM8 6H4v1a4 4 0 0 0 5 4M16 6h4v1a4 4 0 0 1-5 4M12 12v5M8 21h8M9 17h6" /></>,
  rotate: <><path d="M20 11a8 8 0 1 0-2.3 5.7" /><path d="M20 5v6h-6" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>
};

export function Icon({ name, size = 24, className = '' }) {
  return <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.spark}</svg>;
}

export function AudioButton({ text, label = 'Play audio' }) {
  const [playing, setPlaying] = useState(false);
  const play = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.82;
    utterance.onstart = () => setPlaying(true);
    utterance.onend = () => setPlaying(false);
    utterance.onerror = () => setPlaying(false);
    window.speechSynthesis.speak(utterance);
  };
  return <button type="button" className={`icon-button ${playing ? 'is-playing' : ''}`} onClick={play} aria-label={label} title={label}><Icon name="sound" size={19} /></button>;
}

export function SpeakingRecorder({ prompt, onComplete }) {
  const [status, setStatus] = useState('idle');
  const [audioUrl, setAudioUrl] = useState('');
  const [error, setError] = useState('');
  const recorderRef = useRef(null);
  const streamRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    if (audioUrl) URL.revokeObjectURL(audioUrl);
  }, [audioUrl]);

  const start = async () => {
    if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
      setError('Recording is not supported in this browser.');
      return;
    }
    try {
      setError('');
      if (audioUrl) URL.revokeObjectURL(audioUrl);
      setAudioUrl('');
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      streamRef.current = stream;
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => { if (event.data.size) chunksRef.current.push(event.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        setAudioUrl(URL.createObjectURL(blob));
        stream.getTracks().forEach((track) => track.stop());
        setStatus('ready');
      };
      recorder.start();
      setStatus('recording');
    } catch {
      setError('Microphone access was not granted.');
      setStatus('idle');
    }
  };

  const stop = () => {
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  };

  return <div className="speaking-recorder">
    <div className="recorder-model"><span>1 · HEAR THE MODEL</span><p>{prompt}</p><AudioButton text={prompt} label="Play model sentence" /></div>
    <div className="recorder-action"><span>2 · RECORD YOUR VOICE</span><button type="button" className={`record-button ${status}`} onClick={status === 'recording' ? stop : start}><i /><strong>{status === 'recording' ? 'Stop recording' : audioUrl ? 'Record again' : 'Start recording'}</strong></button></div>
    {error && <p className="recorder-error">{error}</p>}
    {audioUrl && <div className="recorder-compare"><span>3 · COMPARE</span><audio controls src={audioUrl} /><button type="button" className="button coral" onClick={onComplete}>I compared both</button></div>}
  </div>;
}

export function SectionHeading({ number, eyebrow, title, description, action }) {
  return <div className="section-heading reveal">
    <div className="section-number">{String(number).padStart(2, '0')}</div>
    <div className="section-copy">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
    {action && <div className="section-action">{action}</div>}
  </div>;
}

export function Feedback({ state, success = 'Exactly.', error = 'Almost. Look at the pattern.' }) {
  if (!state) return null;
  return <div className={`feedback ${state === 'correct' ? 'correct' : 'incorrect'}`} role="status"><Icon name={state === 'correct' ? 'check' : 'rotate'} size={18} />{state === 'correct' ? success : error}</div>;
}

export function GrammarToken({ children, type, bracket = false }) {
  return <span className={`grammar-token ${type || ''}`}>{bracket && '['}{children}{bracket && ']'}</span>;
}

export function useReveal() {
  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach((node) => node.classList.add('visible'));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    }), { threshold: 0.12 });
    const observeNew = (root = document) => {
      if (root.matches?.('.reveal') && !root.classList.contains('visible')) observer.observe(root);
      root.querySelectorAll?.('.reveal:not(.visible)').forEach((node) => observer.observe(node));
    };
    observeNew();
    const mutations = new MutationObserver((records) => records.forEach((record) => record.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) observeNew(node);
    })));
    mutations.observe(document.body, { childList: true, subtree: true });
    return () => { observer.disconnect(); mutations.disconnect(); };
  }, []);
}
