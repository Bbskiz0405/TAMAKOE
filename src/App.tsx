import { useState, useEffect, useRef } from 'react'
import SoundManager from './SoundManager'
import './App.css'

type Stage = 'egg' | 'child' | 'adult' | 'dead';

const STORAGE_KEY = 'tamakoechi_save';

function App() {
  // Load initial state
  const [initialData] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch (e) {
      console.error("Save load failed", e);
      return {};
    }
  });

  const [stage, setStage] = useState<Stage>(initialData.stage || 'egg');
  const [hunger, setHunger] = useState<number>(initialData.hunger ?? 100);
  const [happiness, setHappiness] = useState<number>(initialData.happiness ?? 100);
  const [health, setHealth] = useState<number>(initialData.health ?? 100);
  const [poop, setPoop] = useState<number>(initialData.poop ?? 0);
  const [age, setAge] = useState<number>(initialData.age ?? 0);
  const [message, setMessage] = useState<string>(initialData.stage && initialData.stage !== 'egg' ? "Welcome back!" : "Waiting to hatch...");
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // Auto-save
  useEffect(() => {
    const gameState = { stage, hunger, happiness, health, poop, age };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [stage, hunger, happiness, health, poop, age]);

  // Sound toggle
  useEffect(() => {
    SoundManager.toggleSound(!isMuted);
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

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
          SoundManager.playEvolve();
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
        SoundManager.playBad();
      }

      // Aging
      setAge((prev) => prev + 1);
      
      // Evolution: Child -> Adult
      if (stage === 'child' && age > 50) {
        setStage('adult');
        setMessage("Evolved!");
        SoundManager.playEvolve();
      }

      // Death Check
      if (health <= 0 || hunger <= 0) {
        setStage('dead');
        setMessage("Oh no... it died.");
        SoundManager.playBad();
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
    SoundManager.playEat();
  };

  const play = () => {
    if (stage === 'dead' || stage === 'egg') return;
    setHappiness((prev) => Math.min(100, prev + 15));
    setHunger((prev) => Math.max(0, prev - 5)); // Playing makes you hungry
    setMessage("Fun!");
    SoundManager.playHappy();
  };

  const clean = () => {
    if (stage === 'dead' || stage === 'egg') return;
    if (poop > 0) {
      setPoop(0);
      setMessage("Cleaned!");
      SoundManager.playBtnClick();
    } else {
      setMessage("It's clean already.");
    }
  };

  const heal = () => {
    if (stage === 'dead' || stage === 'egg') return;
    setHealth((prev) => Math.min(100, prev + 20));
    setMessage("Feeling better.");
    SoundManager.playEvolve();
  };

  const resetGame = () => {
    SoundManager.playBtnClick();
    localStorage.removeItem(STORAGE_KEY);
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
      case 'egg': return '(o)';
      case 'child': return '(·_·)';
      case 'adult': return '(^w^)';
      case 'dead': return '(x_x)';
      default: return '(??)';
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
                <span key={i} className="poop">@</span>
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

      <div className="extra-controls">
        <button className="mute-btn" onClick={toggleMute}>
          {isMuted ? "🔇" : "🔊"}
        </button>
      </div>

      {stage === 'dead' && (
        <button className="game-btn reset" onClick={resetGame}>RESTART</button>
      )}
    </div>
  )
}

export default App