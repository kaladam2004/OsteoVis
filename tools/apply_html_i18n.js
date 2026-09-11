import fs from 'fs';
import path from 'path';

let html = fs.readFileSync(path.resolve('./index.html'), 'utf8');

const replacements = [
  // Loading
  ['Loading High-Resolution Medical Atlas…', 'Loading High-Resolution Medical Atlas…</div>', 'Loading High-Resolution Medical Atlas…</div>', 'data-i18n="loading_title"'],
  
  // Modes
  ['id="btn-mode-normal"', 'Explore</button>', 'Explore</button>', 'data-i18n="mode_explore"'],
  ['id="btn-mode-explode"', 'Explode</button>', 'Explode</button>', 'data-i18n="mode_explode"'],
  ['id="btn-mode-learn"', 'Systems</button>', 'Systems</button>', 'data-i18n="mode_learn"'],
  ['id="btn-mode-quiz"', 'Quiz</button>', 'Quiz</button>', 'data-i18n="mode_quiz"'],
  
  // Mobile Nav Modes
  ['id="mnav-normal"', 'Explore</button>', 'Explore</button>', 'data-i18n="mode_explore"'],
  ['id="mnav-explode"', 'Explode</button>', 'Explode</button>', 'data-i18n="mode_explode"'],
  ['id="mnav-learn"', 'Systems</button>', 'Systems</button>', 'data-i18n="mode_learn"'],
  ['id="mnav-quiz"', 'Quiz</button>', 'Quiz</button>', 'data-i18n="mode_quiz"'],
  
  // Tooltips
  ['id="btn-xray"', 'title="X-Ray Mode"', 'title="X-Ray Mode"', 'data-i18n-title="tt_xray"'],
  ['id="btn-measure"', 'title="Measure Tool"', 'title="Measure Tool"', 'data-i18n-title="tt_measure"'],
  ['id="btn-annotate"', 'title="Annotate"', 'title="Annotate"', 'data-i18n-title="tt_annotate"'],
  ['id="btn-section"', 'title="Cross Section"', 'title="Cross Section"', 'data-i18n-title="tt_section"'],
  ['id="btn-isolate"', 'title="Isolate Bone (I)"', 'title="Isolate Bone (I)"', 'data-i18n-title="tt_isolate"'],
  ['id="btn-presentation"', 'title="Presentation Mode"', 'title="Presentation Mode"', 'data-i18n-title="tt_pres"'],
  ['id="btn-labels"', 'title="Toggle Labels"', 'title="Toggle Labels"', 'data-i18n-title="tt_labels"'],
  ['id="btn-rotate"', 'title="Auto-Rotate"', 'title="Auto-Rotate"', 'data-i18n-title="tt_rotate"'],
  
  // Switchers
  ['id="sw-bones"', '🦴 Skeleton</button>', '🦴 Skeleton</button>', 'data-i18n="tab_skeleton"'],
  ['id="sw-muscles"', '💪 Muscles</button>', '💪 Muscles</button>', 'data-i18n="tab_muscles"'],
  
  // Search
  ['id="search-input"', 'placeholder="Search anatomy database…"', 'placeholder="Search anatomy database…"', 'data-i18n="search_bones"'],
  
  // Categories (Bones)
  ['data-cat="all"', 'All</button>', 'All</button>', 'data-i18n="cat_all"'],
  ['data-cat="skull"', 'Skull</button>', 'Skull</button>', 'data-i18n="cat_skull"'],
  ['data-cat="vertebral"', 'Spine</button>', 'Spine</button>', 'data-i18n="cat_vertebral"'],
  ['data-cat="thorax"', 'Thorax</button>', 'Thorax</button>', 'data-i18n="cat_thorax"'],
  ['data-cat="upper"', 'Upper Limb</button>', 'Upper Limb</button>', 'data-i18n="cat_upper"'],
  ['data-cat="pelvis"', 'Pelvis</button>', 'Pelvis</button>', 'data-i18n="cat_pelvis"'],
  ['data-cat="lower"', 'Lower Limb</button>', 'Lower Limb</button>', 'data-i18n="cat_lower"'],
  ['data-cat="hand"', 'Hand</button>', 'Hand</button>', 'data-i18n="cat_hand"'],
  ['data-cat="foot"', 'Foot</button>', 'Foot</button>', 'data-i18n="cat_foot"'],
  
  // Categories (Muscles)
  ['filterMuscleCategory(\'all\'', 'All</button>', 'All</button>', 'data-i18n="cat_all"'],
  ['filterMuscleCategory(\'head\'', 'Head</button>', 'Head</button>', 'data-i18n="mcat_head"'],
  ['filterMuscleCategory(\'neck\'', 'Neck</button>', 'Neck</button>', 'data-i18n="mcat_neck"'],
  ['filterMuscleCategory(\'back\'', 'Back</button>', 'Back</button>', 'data-i18n="mcat_back"'],
  ['filterMuscleCategory(\'chest\'', 'Chest</button>', 'Chest</button>', 'data-i18n="mcat_chest"'],
  ['filterMuscleCategory(\'shoulder\'', 'Shoulder</button>', 'Shoulder</button>', 'data-i18n="mcat_shoulder"'],
  ['filterMuscleCategory(\'arm\'', 'Arm</button>', 'Arm</button>', 'data-i18n="mcat_arm"'],
  ['filterMuscleCategory(\'forearm\'', 'Forearm</button>', 'Forearm</button>', 'data-i18n="mcat_forearm"'],
  ['filterMuscleCategory(\'hand\'', 'Hand</button>', 'Hand</button>', 'data-i18n="mcat_hand"'],
  ['filterMuscleCategory(\'abdominal\'', 'Abdomen</button>', 'Abdomen</button>', 'data-i18n="mcat_abdominal"'],
  ['filterMuscleCategory(\'hip\'', 'Hip</button>', 'Hip</button>', 'data-i18n="mcat_hip"'],
  ['filterMuscleCategory(\'thigh\'', 'Thigh</button>', 'Thigh</button>', 'data-i18n="mcat_thigh"'],
  ['filterMuscleCategory(\'leg\'', 'Leg</button>', 'Leg</button>', 'data-i18n="mcat_leg"'],
  ['filterMuscleCategory(\'foot\'', 'Foot</button>', 'Foot</button>', 'data-i18n="mcat_foot"'],
  
  // Display Modes
  ['id="btn-dm-skeleton"', '🦴 Skeleton</button>', '🦴 Skeleton</button>', 'data-i18n="dm_skeleton"'],
  ['id="btn-dm-muscles"', '💪 Muscles</button>', '💪 Muscles</button>', 'data-i18n="dm_muscles"'],
  ['id="btn-dm-combined"', '⚕ Combined</button>', '⚕ Combined</button>', 'data-i18n="dm_combined"'],
  
  // Missing muscle state
  ['<div class="mmissing-title">', 'Real 3D Muscle Model Not Found</div>', 'Real 3D Muscle Model Not Found</div>', 'data-i18n="mmissing_title"'],
  ['<div class="mmissing-body">', 'To enable the Muscular System', 'GLB file:\n        </div>', 'data-i18n="mmissing_body"'],
  ['<div class="mmissing-hint">', 'Sources: Sketchfab', 'GLTF format.\n        </div>', 'data-i18n="mmissing_hint"'],
  ['retryMuscleLoad()', '↺ Retry</button>', '↺ Retry</button>', 'data-i18n="btn_retry"'],
  ['switchPanel(\'bones\')', '← Back to Skeleton</button>', '← Back to Skeleton</button>', 'data-i18n="btn_back_skeleton"'],
  
  // Stats
  ['id="total-bones"', '<div class="stat-label">Bones</div>', '<div class="stat-label">Bones</div>', 'data-i18n="stat_bones"'],
  ['id="visible-count"', '<div class="stat-label">Visible</div>', '<div class="stat-label">Visible</div>', 'data-i18n="stat_visible"'],
  ['id="sd-in-model"', '<span>In model</span>', '<span>In model</span>', 'data-i18n="sd_in_model"'],
  ['id="sd-selected"', '<span>Selected</span>', '<span>Selected</span>', 'data-i18n="sd_selected"'],
  ['id="sd-quiz"', '<span>Quiz acc.</span>', '<span>Quiz acc.</span>', 'data-i18n="sd_quiz_acc"'],
  ['id="sd-annotations"', '<span>Annotations</span>', '<span>Annotations</span>', 'data-i18n="sd_annotations"'],
  
  // Cross Section
  ['class="cs-header"', '✂ Cross Section</div>', '✂ Cross Section</div>', 'data-i18n="cs_header"'],
  ['id="clip-sagittal-active"', 'Sagittal\n        </label>', 'Sagittal\n        </label>', 'data-i18n="cs_sagittal"'],
  ['id="clip-transverse-active"', 'Transverse\n        </label>', 'Transverse\n        </label>', 'data-i18n="cs_transverse"'],
  ['id="clip-coronal-active"', 'Coronal\n        </label>', 'Coronal\n        </label>', 'data-i18n="cs_coronal"'],
  ['resetSection()', 'Reset All</button>', 'Reset All</button>', 'data-i18n="btn_reset_all"'],
  
  // Systems Panel
  ['data-system="axial"', '>Axial</button>', '>Axial</button>', 'data-i18n="sys_axial"'],
  ['data-system="appendicular"', '>Appendicular</button>', '>Appendicular</button>', 'data-i18n="sys_appendicular"'],
  ['data-system="skull"', '>Skull</button>', '>Skull</button>', 'data-i18n="cat_skull"'],
  ['data-system="spine"', '>Spine</button>', '>Spine</button>', 'data-i18n="cat_vertebral"'],
  ['data-system="thorax"', '>Thorax</button>', '>Thorax</button>', 'data-i18n="cat_thorax"'],
  ['data-system="upper"', '>Upper Limb</button>', '>Upper Limb</button>', 'data-i18n="cat_upper"'],
  ['data-system="lower"', '>Lower Limb</button>', '>Lower Limb</button>', 'data-i18n="cat_lower"'],
  
  // View Controls
  ['setCameraView(\'front\')', '>Front</button>', '>Front</button>', 'data-i18n="view_front"'],
  ['setCameraView(\'back\')', '>Back</button>', '>Back</button>', 'data-i18n="view_back"'],
  ['setCameraView(\'left\')', '>Left</button>', '>Left</button>', 'data-i18n="view_left"'],
  ['setCameraView(\'right\')', '>Right</button>', '>Right</button>', 'data-i18n="view_right"'],
  ['setCameraView(\'top\')', '>Top</button>', '>Top</button>', 'data-i18n="view_top"'],
  ['setCameraView(\'bottom\')', '>Bottom</button>', '>Bottom</button>', 'data-i18n="view_bottom"'],
  ['setCameraView(\'isometric\')', '>ISO</button>', '>ISO</button>', 'data-i18n="view_iso"'],
  ['resetCamera()', '>Reset</button>', '>Reset</button>', 'data-i18n="view_reset"'],
  
  // Right Panel header
  ['id="panel-right"', 'Bone Details', 'Bone Details', 'data-i18n="panel_bone_details"'],
  
  // Bone Detail placeholder
  ['id="bone-detail"', 'Select any structure', 'anatomical details\n      </div>', 'data-i18n="ph_select_bone"'],
  
  // Quiz
  ['id="quiz-score"', '<div class="stat-label">Score</div>', '<div class="stat-label">Score</div>', 'data-i18n="quiz_score"'],
  ['id="quiz-total"', '<div class="stat-label">Total</div>', '<div class="stat-label">Total</div>', 'data-i18n="quiz_total"'],
  ['setQuizLevel(\'beginner\'', '>Beginner</button>', '>Beginner</button>', 'data-i18n="quiz_beg"'],
  ['setQuizLevel(\'intermediate\'', '>Med</button>', '>Med</button>', 'data-i18n="quiz_med"'],
  ['setQuizLevel(\'advanced\'', '>Hard</button>', '>Hard</button>', 'data-i18n="quiz_hard"'],
  ['id="btn-timer"', '>⏱ Timer</button>', '>⏱ Timer</button>', 'data-i18n="quiz_timer"'],
  ['showFinalScore()', '>🏁 End</button>', '>🏁 End</button>', 'data-i18n="quiz_end"'],
  ['id="quiz-question"', 'Identify the structure:', 'Identify the structure:', 'data-i18n="quiz_identify"'],
  ['id="quiz-question"', '>Loading...</span>', '>Loading...</span>', 'data-i18n="quiz_loading"'],
  ['nextQuizQuestion()', '>Skip Question ⏭</button>', '>Skip Question ⏭</button>', 'data-i18n="quiz_skip"'],
  
  // Quiz final
  ['class="quiz-final-title"', 'Quiz Complete!</div>', 'Quiz Complete!</div>', 'data-i18n="quiz_complete"'],
  ['id="qf-score-display"', '<div class="stat-label">Score</div>', '<div class="stat-label">Score</div>', 'data-i18n="quiz_score"'],
  ['id="qf-pct"', '<div class="stat-label">Accuracy</div>', '<div class="stat-label">Accuracy</div>', 'data-i18n="quiz_acc"'],
  ['restartQuiz()', '>🔄 Play Again</button>', '>🔄 Play Again</button>', 'data-i18n="quiz_play_again"'],
  ['setMode(\'normal\')', '>← Exit Quiz</button>', '>← Exit Quiz</button>', 'data-i18n="quiz_exit"'],
  
  // Annotations
  ['id="annotation-panel"', '📌 Annotations', '📌 Annotations', 'data-i18n="ann_header"'],
  ['id="annotation-panel"', 'Click bones in 3D to add pins</span>', 'Click bones in 3D to add pins</span>', 'data-i18n="ann_hint"'],
  ['class="ann-form-header"', '📌 Add Annotation</div>', '📌 Add Annotation</div>', 'data-i18n="ann_title"'],
  ['id="ann-title-input"', 'placeholder="Title (required)"', 'placeholder="Title (required)"', 'data-i18n="ann_ph_title"'],
  ['id="ann-note-input"', 'placeholder="Clinical note (optional)"', 'placeholder="Clinical note (optional)"', 'data-i18n="ann_ph_note"'],
  ['saveAnnotationForm()', '>Save 💾</button>', '>Save 💾</button>', 'data-i18n="btn_save"'],
  ['cancelAnnotationForm()', '>Cancel</button>', '>Cancel</button>', 'data-i18n="btn_cancel"'],
  
  // Presentation
  ['id="pres-exit-btn"', '>✕ Exit Presentation</button>', '>✕ Exit Presentation</button>', 'data-i18n="pres_exit"'],
  ['id="pres-latin"', '>Click any bone to begin</div>', '>Click any bone to begin</div>', 'data-i18n="pres_hint"'],
  
  // Close Panel buttons
  ['toggleSidebar(\'left\')', '>✕</button>', '>✕</button>', 'data-i18n="nav_close"'],
  ['toggleSidebar(\'right\')', '>✕</button>', '>✕</button>', 'data-i18n="nav_close"'],
];

replacements.forEach(([context, targetStart, targetEnd, i18nAttr]) => {
  const ctxIdx = html.indexOf(context);
  if (ctxIdx === -1) {
    console.warn('Could not find context:', context);
    return;
  }
  
  // Search forwards and backwards around context for the injection point
  // It's safer to just inject it into the opening tag of the closest element.
  let tagEnd = html.indexOf('>', ctxIdx);
  if (tagEnd !== -1) {
    // avoid modifying tags that already have it
    let tagHtml = html.substring(ctxIdx, tagEnd);
    if (!tagHtml.includes('data-i18n')) {
      html = html.substring(0, tagEnd) + ' ' + i18nAttr + html.substring(tagEnd);
    }
  }
});

// Write it back
fs.writeFileSync(path.resolve('./index.html'), html, 'utf8');
console.log('index.html updated with data-i18n attributes.');
