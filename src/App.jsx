import { useState } from 'react';
import Landing from './components/Landing';
import Agent from './components/Agent';
import Result from './components/Result';
import Plan from './components/Plan';
import { getRecommendations } from './utils/scoring';

export default function App() {
  const [view, setView] = useState('landing');
  const [recommendations, setRecommendations] = useState([]);
  const [answers, setAnswers] = useState({});

  function handleAgentComplete(collectedAnswers) {
    const results = getRecommendations(collectedAnswers);
    setAnswers(collectedAnswers);
    setRecommendations(results);
    setView('result');
  }

  function restart() {
    setRecommendations([]);
    setAnswers({});
    setView('landing');
  }

  if (view === 'landing') {
    return <Landing onStart={() => setView('agent')} />;
  }

  if (view === 'agent') {
    return (
      <Agent
        onComplete={handleAgentComplete}
        onBack={() => setView('landing')}
      />
    );
  }

  if (view === 'result') {
    return (
      <Result
        top={recommendations[0]}
        all={recommendations}
        answers={answers}
        onViewPlan={() => setView('plan')}
        onRestart={restart}
      />
    );
  }

  if (view === 'plan') {
    return (
      <Plan
        destination={recommendations[0]}
        onBack={() => setView('result')}
        onRestart={restart}
      />
    );
  }
}
