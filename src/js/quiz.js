
import { state } from './state.js';
import { ANATOMY_DB } from './data.js';
import { resetMats } from './ui.js';

let quizScore = 0, quizTotal = 0, quizTarget = null, quizLevel = 'beginner';
const quizPools = {
  beginner: ['femur_r','femur_l','tibia_r','tibia_l','humerus_r','humerus_l','mandible','frontal','occipital','sacrum','sternum_body','patella_r','patella_l','radius_r','ulna_r','clavicle_r','scapula_r','ilium_r','calcaneus_r','talus_r'],
  intermediate: ['parietal_r','temporal_r','zygomatic_r','maxilla','c1','c7','t1','t12','l5','manubrium','xiphoid','fibula_r','fibula_l'],
  advanced: ['sphenoid','ethmoid','vomer','malleus_r','incus_r','stapes_r','hyoid','c2','c3','t4','t5','l3']
};

function setQuizLevel(level, btn) {
  quizLevel = level;
  document.querySelectorAll('#quiz-panel .section-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  quizScore = 0; quizTotal = 0;
  document.getElementById('quiz-score').textContent = '0';
  document.getElementById('quiz-total').textContent = '0';
  nextQuizQuestion();
}

function nextQuizQuestion() {
  const pool = quizPools[quizLevel];
  quizTarget = pool[Math.floor(Math.random() * pool.length)];
  const data = ANATOMY_DB.find(b => b.id === quizTarget);
  document.getElementById('quiz-question').innerHTML = `Identify the structure:<span>${data ? data.name : quizTarget}</span>`;
  document.getElementById('quiz-feedback').style.display = 'none';
  resetMats();
}

function checkQuizAnswer(id) {
  quizTotal++;
  const correct = id === quizTarget;
  if(correct) quizScore++;
  document.getElementById('quiz-score').textContent = quizScore;
  document.getElementById('quiz-total').textContent = quizTotal;
  
  const fb = document.getElementById('quiz-feedback');
  fb.textContent = correct ? `✓ Correct! ` : `✗ Incorrect. That was ${ANATOMY_DB.find(b=>b.id===id)?.name}.`;
  fb.className = 'quiz-feedback ' + (correct ? 'correct' : 'wrong');
  fb.style.display = 'block';
  
  // Highlight correct answer
  state.boneMeshes[quizTarget].material.color.setHex(correct ? 0x22c55e : 0xef4444);
  state.boneMeshes[quizTarget].material.emissive.setHex(correct ? 0x22c55e : 0xef4444);
  state.boneMeshes[quizTarget].material.emissiveIntensity = 0.8;
  
  setTimeout(() => { if(state.currentMode === 'quiz') nextQuizQuestion(); }, 2000);
}

export { setQuizLevel, nextQuizQuestion, checkQuizAnswer };
