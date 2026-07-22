# Dayloop lesson engine

A responsive, data-driven React lesson platform with two connected adult Elementary lessons.

## Run locally

```bash
npm install
npm run dev
```

Create a production build with `npm run build`.

Local lesson URLs:

- `/index.html` — Everyday Activities
- `/dream-interview.html` — The Dream Interview

## Architecture

- `src/data/lessons/everydayActivities.json` contains the first lesson content.
- `src/data/lessons/dreamInterview.json` contains the second lesson on questions with `be` and other verbs.
- `src/components/LessonEngine.jsx` contains 16 reusable section-level modules, including frequency discovery, spaced retry, and a homework review engine.
- `src/components/DreamInterviewLesson.jsx` provides the interview-driven interaction sequence for Lesson 02.
- `src/components/UI.jsx` contains reusable controls, grammar tokens, icons, audio, and feedback.
- `src/styles.css` contains the responsive visual system and animation layer.

`LessonEngine` receives a lesson object, so a future lesson can reuse the same presentation components. Its content schema covers metadata, hero, timeline, warm-up, vocabulary, story, transformations, builders, corrections, quiz, interview, personalization, comparison, and final challenge.

## Built-in platform hooks

- Browser speech synthesis provides zero-setup English audio.
- Progress and XP persist in `localStorage` under the lesson ID.
- Reset clears persisted progress and remounts every interaction.
- Unique missed patterns persist in a spaced-retry queue until repaired.
- The final speaking mission records microphone audio and lets learners compare it with model speech.
- All interactive controls use semantic buttons and visible focus states.
- `prefers-reduced-motion` disables non-essential animation.
- Native drag-and-drop is paired with tap/click ordering for touch and keyboard use.

For production, the `AudioButton` component can be connected to recorded audio URLs, and the progress adapter can be replaced by a user-profile API without changing lesson data.

## Add another lesson

1. Copy `src/data/lessons/everydayActivities.json`.
2. Keep the same top-level keys and replace the content.
3. Import the new JSON in `src/App.jsx` or resolve it from a route/CMS.

The grammar color contract is centralized in CSS: base verb = blue, third-person ending = red, auxiliary = green. Shuffled ordering, editable error correction, and answer-review logic are presentation-independent and consume lesson JSON.
