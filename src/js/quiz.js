
import { state } from './state.js';
import { ANATOMY_DB } from './data.js';
import { resetMats } from './ui.js';

let quizScore = 0, quizTotal = 0, quizTarget = null, quizLevel = 'beginner';
let timerEnabled = false, quizCountdown = 30, _quizTimer = null;

function _saveScore() {
  try {
    const p = JSON.parse(localStorage.getItem('osteovis_prefs') || '{}');
    localStorage.setItem('osteovis_prefs', JSON.stringify({ ...p, quizScore, quizTotal }));
  } catch (e) {}
}

const quizPools = {
  beginner:     ['femur_r','femur_l','tibia_r','tibia_l','humerus_r','humerus_l','mandible','frontal','occipital','sacrum','sternum_body','patella_r','patella_l','radius_r','ulna_r','clavicle_r','scapula_r','ilium_r','calcaneus_r','talus_r'],
  intermediate: ['parietal_r','temporal_r','zygomatic_r','maxilla','c1','c7','t1','t12','l5','manubrium','xiphoid','fibula_r','fibula_l'],
  advanced:     ['sphenoid','ethmoid','vomer','malleus_r','incus_r','stapes_r','hyoid','c2','c3','t4','t5','l3'],
};

// ─── Timer ────────────────────────────────────────────────────────────────────

function _startTimer() {
  clearInterval(_quizTimer);
  quizCountdown = 30;
  _updateTimerDisplay();
  document.getElementById('quiz-timer-wrap').style.display = 'flex';
  _quizTimer = setInterval(() => {
    quizCountdown--;
    _updateTimerDisplay();
    if (quizCountdown <= 0) {
      clearInterval(_quizTimer);
      quizTotal++;
      document.getElementById('quiz-total').textContent = quizTotal;
      const fb = document.getElementById('quiz-feedback');
      fb.textContent = "⏱ Time's up!";
      fb.className = 'quiz-feedback wrong';
      fb.style.display = 'block';
      _saveScore();
      setTimeout(() => { if (state.currentMode === 'quiz') nextQuizQuestion(); }, 1500);
    }
  }, 1000);
}

function _updateTimerDisplay() {
  const el = document.getElementById('quiz-timer-display');
  if (!el) return;
  el.textContent = quizCountdown;
  el.style.color = quizCountdown <= 10 ? 'var(--wrong)' : quizCountdown <= 20 ? '#f59e0b' : 'var(--accent2)';
}

export function stopQuizTimer() {
  clearInterval(_quizTimer);
  _quizTimer = null;
  const wrap = document.getElementById('quiz-timer-wrap');
  if (wrap) wrap.style.display = 'none';
}

export function toggleQuizTimer() {
  timerEnabled = !timerEnabled;
  const btn = document.getElementById('btn-timer');
  btn?.classList.toggle('active', timerEnabled);
  btn?.setAttribute('aria-pressed', String(timerEnabled));
  if (timerEnabled) {
    _startTimer();
  } else {
    stopQuizTimer();
  }
}

// ─── Final score ──────────────────────────────────────────────────────────────

export function showFinalScore() {
  stopQuizTimer();
  const pct = quizTotal ? Math.round((quizScore / quizTotal) * 100) : 0;
  const [grade, msg, col] =
    pct >= 90 ? ['A', 'Excellent!', 'var(--correct)'] :
    pct >= 75 ? ['B', 'Good!',      'var(--correct)'] :
    pct >= 60 ? ['C', 'Fair',       '#f59e0b']        :
    pct >= 40 ? ['D', 'Keep Going', 'var(--wrong)']   :
                ['F', 'Try Again',  'var(--wrong)'];

  document.getElementById('quiz-panel').style.display = 'none';
  document.getElementById('bone-detail').style.display = 'none';
  const final = document.getElementById('quiz-final');
  final.style.display = 'flex';
  document.getElementById('qf-score-display').textContent = `${quizScore} / ${quizTotal}`;
  document.getElementById('qf-pct').textContent = `${pct}%`;
  const gradeEl = document.getElementById('qf-grade');
  gradeEl.textContent = `${grade} — ${msg}`;
  gradeEl.style.color = col;
}

export function restartQuiz() {
  quizScore = 0; quizTotal = 0;
  document.getElementById('quiz-score').textContent = '0';
  document.getElementById('quiz-total').textContent = '0';
  _saveScore();
  document.getElementById('quiz-final').style.display = 'none';
  document.getElementById('quiz-panel').style.display = 'flex';
  nextQuizQuestion();
  if (timerEnabled) _startTimer();
}

// ─── Core quiz logic (unchanged) ─────────────────────────────────────────────

function setQuizLevel(level, btn) {
  quizLevel = level;
  document.querySelectorAll('#quiz-panel .section-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  quizScore = 0; quizTotal = 0;
  document.getElementById('quiz-score').textContent = '0';
  document.getElementById('quiz-total').textContent = '0';
  _saveScore();
  nextQuizQuestion();
  if (timerEnabled) _startTimer();
}

function nextQuizQuestion() {
  clearInterval(_quizTimer);
  const allPool = quizPools[quizLevel];
  const pool = allPool.filter(id => state.boneMeshes[id]);
  if (!pool.length) {
    quizTarget = null;
    document.getElementById('quiz-question').innerHTML = `Identify the structure:<span>Load a model first</span>`;
    document.getElementById('quiz-feedback').style.display = 'none';
    return;
  }
  quizTarget = pool[Math.floor(Math.random() * pool.length)];
  const data = ANATOMY_DB.find(b => b.id === quizTarget);
  document.getElementById('quiz-question').innerHTML = `Identify the structure:<span>${data ? data.name : quizTarget}</span>`;
  document.getElementById('quiz-feedback').style.display = 'none';
  resetMats();
  if (timerEnabled) _startTimer();
}

function checkQuizAnswer(id) {
  if (!quizTarget) return;
  clearInterval(_quizTimer);
  quizTotal++;
  const correct = id === quizTarget;
  if (correct) quizScore++;
  document.getElementById('quiz-score').textContent = quizScore;
  document.getElementById('quiz-total').textContent = quizTotal;
  _saveScore();

  const fb = document.getElementById('quiz-feedback');
  fb.textContent = correct ? '✓ Correct!' : `✗ Incorrect. That was ${ANATOMY_DB.find(b => b.id === id)?.name}.`;
  fb.className = 'quiz-feedback ' + (correct ? 'correct' : 'wrong');
  fb.style.display = 'block';

  const mesh = state.boneMeshes[quizTarget];
  if (mesh) {
    mesh.material.color.setHex(correct ? 0x22c55e : 0xef4444);
    mesh.material.emissive.setHex(correct ? 0x22c55e : 0xef4444);
    mesh.material.emissiveIntensity = 0.8;
  }

  setTimeout(() => { if (state.currentMode === 'quiz') nextQuizQuestion(); }, 2000);
}

export { setQuizLevel, nextQuizQuestion, checkQuizAnswer };
