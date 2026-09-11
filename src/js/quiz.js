import { state } from './state.js';
import { ANATOMY_DB } from './data.js';
import { MUSCLE_DB } from './muscles_data.js';
import { NERVE_DB } from './nerve_data.js';
import { CARDIO_DB } from './cardio_data.js';
import { resetMats, updateStats } from './ui.js';
import { t, tObj } from './i18n.js';

// Quiz mode: 'bones' | 'muscles' | 'nerves' | 'mixed'
let quizMode = 'bones';

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

// Nerve quiz pools (all levels use all nerves since fewer structures)
const nerveQuizPool = NERVE_DB.map(n => n.id);

// Cardio quiz pool
const cardioQuizPool = CARDIO_DB.map(c => c.id);

// Mixed pool dynamically generated
function getMixedPool() {
  const bones   = quizPools['beginner'];
  const muscles = MUSCLE_DB.slice(0, 10).map(m => m.id);
  const nerves  = nerveQuizPool;
  const cardio  = cardioQuizPool;
  return [...bones, ...muscles, ...nerves, ...cardio];
}

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
      fb.textContent = "⏱ " + (t('quiz_times_up') || "Time's up!");
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

// ─── Core quiz logic ─────────────────────────────────────────────────────────

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

  // Build the active pool based on quiz mode
  let allPool;
  if (quizMode === 'nerves') {
    allPool = nerveQuizPool;
  } else if (quizMode === 'cardio') {
    allPool = cardioQuizPool;
  } else if (quizMode === 'mixed') {
    allPool = getMixedPool();
  } else {
    allPool = quizPools[quizLevel] || quizPools.beginner;
  }

  const pool = allPool.filter(id =>
    state.boneMeshes[id] || state.muscleMeshes?.[id] || state.nerveMeshes?.[id] || state.cardioMeshes?.[id] ||
    NERVE_DB.find(n => n.id === id)  // nerves always selectable from list even without 3D model
  );
  if (!pool.length) {
    quizTarget = null;
    document.getElementById('quiz-question').innerHTML = `${t('quiz_identify')}<span>${t('load_model_first') || 'Load a model first'}</span>`;
    document.getElementById('quiz-feedback').style.display = 'none';
    return;
  }
  quizTarget = pool[Math.floor(Math.random() * pool.length)];
  const currentData = ANATOMY_DB.find(b => b.id === quizTarget) ||
                      MUSCLE_DB.find(m => m.id === quizTarget) ||
                      NERVE_DB.find(n => n.id === quizTarget);
  const objName = currentData ? (tObj(currentData.name) || currentData.name) : quizTarget;

  const hasLatin = currentData?.latinName;
  if (hasLatin) {
    document.getElementById('quiz-question').innerHTML = `${t('quiz_identify')} <strong>${objName}</strong> <br><span style="font-size:12px;opacity:0.7">(${currentData.latinName})</span>`;
  } else {
    document.getElementById('quiz-question').innerHTML = `${t('quiz_identify')} <strong>${objName}</strong>`;
  }
  document.getElementById('quiz-feedback').style.display = 'none';
  resetMats();
  if (timerEnabled) _startTimer();
}

function checkQuizAnswer(id) {
  if (!quizTarget) return;
  clearInterval(_quizTimer);
  quizTotal++;
  const correct = id === quizTarget;
  if (correct) {
    quizScore++;
    updateStats?.();
  }
  document.getElementById('quiz-score').textContent = quizScore;
  document.getElementById('quiz-total').textContent = quizTotal;
  _saveScore();

  const targetData = ANATOMY_DB.find(b => b.id === id) ||
                     MUSCLE_DB.find(m => m.id === id) ||
                     NERVE_DB.find(n => n.id === id);
  const targetName = targetData ? (tObj(targetData.name) || targetData.name) : id;

  fb.textContent = correct ? `✓ ${t('quiz_correct') || 'Correct!'}` : `✗ ${t('quiz_incorrect') || 'Incorrect. That was'} ${targetName}.`;
  fb.className = 'quiz-feedback ' + (correct ? 'correct' : 'wrong');
  fb.style.display = 'block';

  const mesh = state.boneMeshes[quizTarget] || state.muscleMeshes?.[quizTarget] || state.nerveMeshes?.[quizTarget];
  if (mesh) {
    mesh.material.color.setHex(correct ? 0x22c55e : 0xef4444);
    mesh.material.emissive.setHex(correct ? 0x22c55e : 0xef4444);
    mesh.material.emissiveIntensity = 0.8;
  }

  setTimeout(() => { if (state.currentMode === 'quiz') nextQuizQuestion(); }, 2000);
}

function setQuizMode(mode, btn) {
  quizMode = mode;
  document.querySelectorAll('.quiz-mode-tab').forEach(b => b.classList.remove('active'));
  btn?.classList.add('active');
  quizScore = 0; quizTotal = 0;
  document.getElementById('quiz-score').textContent = '0';
  document.getElementById('quiz-total').textContent = '0';
  _saveScore();
  nextQuizQuestion();
}

export { setQuizLevel, nextQuizQuestion, checkQuizAnswer, setQuizMode };
