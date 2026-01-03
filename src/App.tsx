import { useState, useEffect, useRef } from 'react'
import './App.css'

type Stage = 'egg' | 'child' | 'adult' | 'dead';

function App() {
  const [stage, setStage] = useState<Stage>('egg');
  const [hunger, setHunger] = useState(100);
  const [happiness, setHappiness] = useState(100);
  const [health, setHealth] = useState(100);
  const [poop, setPoop] = useState(0);
  const [age, setAge] = useState(0);
  const [message, setMessage] = useState("Waiting to hatch...");

  // Ref to track if game loop is active without causing re-renders
  const timerRef = useRef<number | null>(null);

  // Game Loop
  useEffect(() => {
    if (stage === 'dead') return;

    timerRef.current = setInterval(() => {
      // Evolution: Egg -> Child
      if (stage === 'egg') {
        if (Math.random() > 0.7) {
          setStage('child');
          setMessage("Hatched!");
        }
        return;
      }

      // Stats Decay
      setHunger((prev) => Math.max(0, prev - 2));
      setHappiness((prev) => Math.max(0, prev - 2));

      // Health Logic
      if (hunger < 20 || poop > 2) {
        setHealth((prev) => Math.max(0, prev - 5));
      } else if (hunger > 80 && poop === 0) {
         setHealth((prev) => Math.min(100, prev + 1));
      }

      // Poop Logic (Random chance if fed)
      if (hunger > 50 && Math.random() > 0.9) {
        setPoop((prev) => Math.min(4, prev + 1));
        setMessage("Pooped!");
      }

      // Aging
      setAge((prev) => prev + 1);
      
      // Evolution: Child -> Adult
      if (stage === 'child' && age > 50) {
        setStage('adult');
        setMessage("Evolved!");
      }

      // Death Check
      if (health <= 0 || hunger <= 0) {
        setStage('dead');
        setMessage("Oh no... it died.");
        if (timerRef.current) clearInterval(timerRef.current);
      }

    }, 2000); // Ticks every 2 seconds

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage, health, hunger, age, poop]);

  // Actions
  const feed = () => {
    if (stage === 'dead' || stage === 'egg') return;
    setHunger((prev) => Math.min(100, prev + 20));
    setHealth((prev) => Math.min(100, prev + 2));
    setMessage("Yummy!");
  };

  const play = () => {
    if (stage === 'dead' || stage === 'egg') return;
    setHappiness((prev) => Math.min(100, prev + 15));
    setHunger((prev) => Math.max(0, prev - 5)); // Playing makes you hungry
    setMessage("Fun!");
  };

  const clean = () => {
    if (stage === 'dead' || stage === 'egg') return;
    if (poop > 0) {
      setPoop(0);
      setMessage("Cleaned!");
    } else {
      setMessage("It's clean already.");
    }
  };

  const heal = () => {
    if (stage === 'dead' || stage === 'egg') return;
    setHealth((prev) => Math.min(100, prev + 20));
    setMessage("Feeling better.");
  };

  const resetGame = () => {
    setStage('egg');
    setHunger(100);
    setHappiness(100);
    setHealth(100);
    setPoop(0);
    setAge(0);
    setMessage("New egg!");
  };

  // Visuals
  const getSprite = () => {
    switch (stage) {
      case 'egg': return '🥚';
      case 'child': return '🐣';
      case 'adult': return '🐥';
      case 'dead': return '💀';
      default: return '❓';
    }
  };

  return (
    <div className="tamagotchi-device">
      <div className="screen-container">
        <div className="screen">
          <div className="stats-bar">
            <span>🍖{hunger}</span>
            <span>❤️{health}</span>
            <span>😄{happiness}</span>
          </div>
          
          <div className={`pet-area ${stage === 'dead' ? 'dead' : ''}`}>
            {getSprite()}
            <div className="poop-area">
              {Array.from({ length: poop }).map((_, i) => (
                <span key={i} className="poop">💩</span>
              ))}
            </div>
          </div>

          <div className="status-message">
            {message}
          </div>
        </div>
      </div>

      <div className="buttons-container">
        <button className="game-btn" onClick={feed} title="Feed">🍖</button>
        <button className="game-btn" onClick={play} title="Play">🥎</button>
        <button className="game-btn" onClick={clean} title="Clean">🧹</button>
        <button className="game-btn" onClick={heal} title="Heal">💊</button>
      </div>

      {stage === 'dead' && (
        <button className="game-btn reset" onClick={resetGame}>RESTART</button>
      )}
    </div>
  )
}

export default App