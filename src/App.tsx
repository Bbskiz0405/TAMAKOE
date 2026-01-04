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
  const [isSleeping, setIsSleeping] = useState<boolean>(initialData.isSleeping ?? false);
  const [careMistakes, setCareMistakes] = useState<number>(initialData.careMistakes ?? 0);
  const [message, setMessage] = useState<string>(initialData.stage && initialData.stage !== 'egg' ? "Welcome back!" : "Waiting to hatch...");
  const [isMuted, setIsMuted] = useState<boolean>(false);
  
  // Temporary reaction state (eating, playing, etc.)
  const [reaction, setReaction] = useState<string | null>(null);

  // Helper to trigger a temporary reaction
  const triggerReaction = (type: string, duration: number = 1500) => {
    setReaction(type);
    setTimeout(() => setReaction(null), duration);
  };

  // Auto-save
  useEffect(() => {
    const gameState = { stage, hunger, happiness, health, poop, age, isSleeping, careMistakes };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(gameState));
  }, [stage, hunger, happiness, health, poop, age, isSleeping, careMistakes]);

  // Sound toggle
  useEffect(() => {
    SoundManager.toggleSound(!isMuted);
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleSleep = () => {
    if (stage === 'dead' || stage === 'egg') return;
    setIsSleeping(!isSleeping);
    if (!isSleeping) {
        // Waking up
        setMessage("GOOD MORNING!");
        triggerReaction('waking', 2000);
    } else {
        setMessage("GOOD NIGHT");
    }
    SoundManager.playBtnClick();
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
          setMessage("HATCHED!");
          SoundManager.playEvolve();
        }
        return;
      }

      if (isSleeping) {
        // Sleep Mode Logic
        setHealth((prev) => Math.min(100, prev + 1)); // Regenerate health
        // Hunger/Happiness do not decay
        // No poop while sleeping
      } else {
        // Normal Mode Logic
        // Stats Decay
        setHunger((prev) => Math.max(0, prev - 2));
        setHappiness((prev) => Math.max(0, prev - 2));

        // Health Logic & Care Mistakes
        if (hunger < 20 || poop > 2) {
          setHealth((prev) => {
            const newHealth = Math.max(0, prev - 5);
            if (prev > newHealth && Math.random() > 0.8) {
               setCareMistakes(m => m + 1);
            }
            return newHealth;
          });
        } else if (hunger > 80 && poop === 0) {
           setHealth((prev) => Math.min(100, prev + 1));
        }

        // Poop Logic (Random chance if fed)
        if (hunger > 50 && Math.random() > 0.9) {
          setPoop((prev) => Math.min(4, prev + 1));
          setMessage("POOPED!");
          SoundManager.playBad();
        }
      }

      // Aging (happens even when sleeping)
      setAge((prev) => prev + 1);
      
      // Evolution: Child -> Adult
      if (stage === 'child' && age > 50) {
        if (careMistakes < 3) {
            setStage('adult'); // Good care -> Normal/Cute
            setMessage("EVOLVED! (GOOD)");
        } else if (careMistakes > 8) {
            setStage('adult'); 
            setMessage("EVOLVED! (BAD)");
        } else {
            setStage('adult');
            setMessage("EVOLVED!");
        }
        SoundManager.playEvolve();
      }

      // Death Check
      if (health <= 0 || hunger <= 0) {
        setStage('dead');
        setMessage("SYSTEM FAILURE");
        SoundManager.playBad();
        if (timerRef.current) clearInterval(timerRef.current);
      }

    }, 2000); // Ticks every 2 seconds

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage, health, hunger, age, poop, isSleeping, careMistakes]);

  // Actions
  const feed = () => {
    if (stage === 'dead' || stage === 'egg' || isSleeping) return;
    setHunger((prev) => Math.min(100, prev + 20));
    setHealth((prev) => Math.min(100, prev + 2));
    setMessage("YUMMY");
    triggerReaction('eating');
    SoundManager.playEat();
  };

  const play = () => {
    if (stage === 'dead' || stage === 'egg' || isSleeping) return;
    setHappiness((prev) => Math.min(100, prev + 15));
    setHunger((prev) => Math.max(0, prev - 5)); 
    setMessage("FUN");
    triggerReaction('playing');
    SoundManager.playHappy();
  };

  const clean = () => {
    if (stage === 'dead' || stage === 'egg' || isSleeping) return;
    if (poop > 0) {
      setPoop(0);
      setMessage("CLEANED");
      triggerReaction('cleaning');
      SoundManager.playBtnClick();
    } else {
      setMessage("CLEAN ALREADY");
      triggerReaction('refuse'); // Reaction when refusing action
    }
  };

  const heal = () => {
    if (stage === 'dead' || stage === 'egg' || isSleeping) return;
    setHealth((prev) => Math.min(100, prev + 20));
    setMessage("HEALING...");
    triggerReaction('healing');
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
    setCareMistakes(0);
    setIsSleeping(false);
    setReaction(null);
    setMessage("NEW SESSION");
  };

  // Visuals
  const getSprite = () => {
    if (stage === 'dead') return '( x _ x )';
    if (isSleeping) return '( ˘ ω ˘ )';

    // Priority: Reaction > Stage
    if (reaction) {
        switch (reaction) {
            case 'eating': return '( O u O )';
            case 'playing': return '( > ▽ < )ﾉ';
            case 'cleaning': return '( ✨ w ✨ )';
            case 'healing': return '( ˊ ᵕ ˋ )';
            case 'waking': return '( o _ o )!';
            case 'refuse': return '( - . - )';
            default: return reaction;
        }
    }
    
    switch (stage) {
      case 'egg': return '( o )';
      case 'child': return '( · ω · )';
      case 'adult': 
        if (careMistakes < 3) return '( ๑>ᴗ<๑ )'; // Angel / Good (Koe Style)
        if (careMistakes > 8) return '( # ｀Д´ )'; // Devil / Bad
        return '( ^ w ^ )'; // Normal
      default: return '( ? ? )';
    }
  };

  // ASCII Template
  const asciiShell = `
  +-------------------------------+
  |                               |
  |                               |
  |                               |
  |                               |
  |                               |
  |                               |
  |                               |
  |                               |
  |                               |
  |                               |
  |                               |
  +-------------------------------+
  `;

  return (
    <div className={`ascii-device-container ${stage === 'dead' ? 'dead' : ''}`}>
      {/* Background Layer */}
      <div className="ascii-shell">
        {asciiShell}
      </div>

      {/* UI Layer */}
      <div className="ui-layer">
        
        {/* Screen Content */}
        <div className="screen-area">
          <div className="stats-bar">
            <span>🍖{hunger}</span>
            <span>❤️{health}</span>
            <span>😄{happiness}</span>
          </div>
          
          <div className="pet-area">
            {getSprite()}
            <div className="poop-area">
              {Array.from({ length: poop }).map((_, i) => (
                <span key={i}>@</span>
              ))}
            </div>
            {isSleeping && <div style={{position:'absolute', top:'-10px', right:'20px'}}>zZ</div>}
          </div>

          <div className="status-message">
            {message}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="buttons-area">
          <button className="ascii-btn" onClick={feed} disabled={isSleeping}>[FEED]</button>
          <button className="ascii-btn" onClick={play} disabled={isSleeping}>[PLAY]</button>
          <button className="ascii-btn" onClick={clean} disabled={isSleeping}>[CLEAN]</button>
          <button className="ascii-btn" onClick={heal} disabled={isSleeping}>[HEAL]</button>
        </div>
        
        {/* Sleep Button (Extra row in buttons-area or separate) */}
        <div style={{position: 'absolute', top: '272px', left: '45px', width: '250px', textAlign: 'center'}}>
           <button className="ascii-btn" onClick={toggleSleep}>
             [{isSleeping ? "WAKE UP" : "SLEEP"}]
           </button>
        </div>

        {/* Extra Controls */}
        <div className="extra-controls">
          <button className="link-btn" onClick={toggleMute}>
            [{isMuted ? "MUTED" : "SOUND:ON"}]
          </button>
          {stage === 'dead' && (
            <button className="link-btn" onClick={resetGame}>[RESTART_SYSTEM]</button>
          )}
        </div>
      </div>
    </div>
  )
}

export default App