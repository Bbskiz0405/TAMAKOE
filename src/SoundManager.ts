// SoundManager.ts

// 使用單例模式或靜態方法來管理 AudioContext
class SoundManager {
  private static ctx: AudioContext | null = null;
  private static enabled: boolean = true;

  private static getContext(): AudioContext {
    if (!this.ctx) {
      // 現代瀏覽器需要使用者互動後才能啟動 AudioContext
      const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx!;
  }

  // 播放基礎的嗶嗶聲 (頻率, 持續時間, 波形類型)
  private static playTone(freq: number, duration: number, type: OscillatorType = 'square') {
    if (!this.enabled) return;
    const ctx = this.getContext();
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    // 音量包絡 (Envelope): 快速淡入淡出，避免爆音
    gain.gain.setValueAtTime(0.01, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.1, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  }

  // 1. 介面按鈕音效 (短促高頻)
  public static playBtnClick() {
    this.playTone(800, 0.1, 'square');
  }

  // 2. 進食音效 (快速的上行琶音)
  public static playEat() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    [300, 400, 500].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, now + i * 0.1);
      
      gain.gain.setValueAtTime(0.1, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.1);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.1);
    });
  }

  // 3. 玩耍/快樂音效 (輕快的旋律)
  public static playHappy() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    // 簡單的大調三和弦 Do-Mi-Sol
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle'; // 三角波聽起來比較圓潤可愛
      osc.frequency.setValueAtTime(freq, now + i * 0.15);
      
      gain.gain.setValueAtTime(0.1, now + i * 0.15);
      gain.gain.linearRampToValueAtTime(0, now + i * 0.15 + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.15);
    });
  }

  // 4. 死亡/便便音效 (低沉雜訊感)
  public static playBad() {
    this.playTone(150, 0.5, 'sawtooth'); // 鋸齒波聽起來比較刺耳粗糙
  }

  // 5. 孵化/進化 (神聖感?)
  public static playEvolve() {
    if (!this.enabled) return;
    const ctx = this.getContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    // 滑音效果
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.linearRampToValueAtTime(800, now + 1);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.linearRampToValueAtTime(0, now + 1);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 1);
  }

  public static toggleSound(on: boolean) {
    this.enabled = on;
  }
}

export default SoundManager;
