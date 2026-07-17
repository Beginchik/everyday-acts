import lesson from './data/lessons/everydayActivities.json';
import { LessonEngine } from './components/LessonEngine';

export default function App() {
  return <LessonEngine lesson={lesson} />;
}
