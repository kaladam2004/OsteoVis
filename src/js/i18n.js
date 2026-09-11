import { DICT } from './i18n_dict.js';

export const translations = {
  ...DICT,
  // Navigation / Modes
  "mode_explore": { tg: "Кашф", ru: "Изучать", en: "Explore" },
  "mode_explode": { tg: "Таҷзия", ru: "Разобрать", en: "Explode" },
  "mode_learn": { tg: "Системаҳо", ru: "Системы", en: "Systems" },
  "mode_quiz": { tg: "Викторина", ru: "Викторина", en: "Quiz" },
  
  // Sidebar Tabs
  "tab_skeleton": { tg: "Устухонбандӣ", ru: "Скелет", en: "Skeleton" },
  "tab_muscles": { tg: "Мушакҳо", ru: "Мышцы", en: "Muscles" },
  "tab_nerves": { tg: "Асабҳо", ru: "Нервная система", en: "Nerves" },
  "tab_cardio": { tg: "Дил ва рагҳо", ru: "Сердечно-сосудистая", en: "Cardio" },
  
  // Search
  "search_bones": { tg: "Ҷустуҷӯ дар махзани анатомия...", ru: "Поиск в базе анатомии...", en: "Search anatomy database..." },
  "search_muscles": { tg: "Ҷустуҷӯи мушакҳо...", ru: "Поиск мышц...", en: "Search muscles..." },
  "search_nerves": { tg: "Ҷустуҷӯи асабҳо...", ru: "Поиск нервов...", en: "Search nerves..." },
  "search_cardio": { tg: "Ҷустуҷӯи рагҳо ва дил...", ru: "Поиск сосудов...", en: "Search cardiovascular..." },
  
  // Categories - Bones
  "cat_all": { tg: "Ҳама", ru: "Все", en: "All" },
  "cat_skull": { tg: "Косахонаи сар", ru: "Череп", en: "Skull" },
  "cat_vertebral": { сутунмуҳра: "Сутунмуҳра", tg: "Сутунмуҳра", ru: "Позвоночник", en: "Spine" },
  "cat_thorax": { tg: "Қафаси сина", ru: "Грудная клетка", en: "Thorax" },
  "cat_upper": { tg: "Дасти боло", ru: "Верхняя конечность", en: "Upper Limb" },
  "cat_pelvis": { tg: "Кос", ru: "Таз", en: "Pelvis" },
  "cat_lower": { tg: "Пой", ru: "Нижняя конечность", en: "Lower Limb" },
  "cat_hand": { tg: "Панҷаи даст", ru: "Кисть", en: "Hand" },
  "cat_foot": { tg: "Панҷаи пой", ru: "Стопа", en: "Foot" },
  
  // Categories - Muscles
  "mcat_head": { tg: "Сар", ru: "Голова", en: "Head" },
  "mcat_neck": { tg: "Гардан", ru: "Шея", en: "Neck" },
  "mcat_back": { tg: "Пушт", ru: "Спина", en: "Back" },
  "mcat_chest": { tg: "Сина", ru: "Грудь", en: "Chest" },
  "mcat_shoulder": { tg: "Шона", ru: "Плечо", en: "Shoulder" },
  "mcat_arm": { tg: "Бозу", ru: "Плечевая часть", en: "Arm" },
  "mcat_forearm": { tg: "Банди даст", ru: "Предплечье", en: "Forearm" },
  "mcat_hand": { tg: "Панҷа", ru: "Кисть", en: "Hand" },
  "mcat_abdominal": { tg: "Шикам", ru: "Живот", en: "Abdomen" },
  "mcat_hip": { tg: "Кос", ru: "Таз", en: "Hip" },
  "mcat_thigh": { tg: "Рон", ru: "Бедро", en: "Thigh" },
  "mcat_leg": { tg: "Пой (соқ)", ru: "Голень", en: "Leg" },
  "mcat_foot": { tg: "Панҷаи пой", ru: "Стопа", en: "Foot" },
  
  // Categories - Nerves
  "ncat_brain": { tg: "Майнаи сар", ru: "Головной мозг", en: "Brain" },
  "ncat_spinal_cord": { tg: "Ҳароммағз", ru: "Спинной мозг", en: "Spinal Cord" },
  "ncat_cranial_nerves": { tg: "Асабҳои косахонаи сар", ru: "Черепные нервы", en: "Cranial Nerves" },
  "ncat_peripheral_nerves": { tg: "Асабҳои канорӣ", ru: "Периферические нервы", en: "Peripheral Nerves" },

  // Categories - Cardio
  "ccat_heart": { tg: "Дил", ru: "Сердце", en: "Heart" },
  "ccat_arteries": { tg: "Шараёнҳо", ru: "Артерии", en: "Arteries" },
  "ccat_veins": { tg: "Варидҳо", ru: "Вены", en: "Veins" },
  
  // Display Modes
  "dm_skeleton": { tg: "🦴 Устухонҳо", ru: "🦴 Скелет", en: "🦴 Skeleton" },
  "dm_muscles": { tg: "💪 Мушакҳо", ru: "💪 Мышцы", en: "💪 Muscles" },
  "dm_nerves": { tg: "🧠 Асабҳо", ru: "🧠 Нервная система", en: "🧠 Nerves" },
  "dm_combined": { tg: "⚕ Якҷоя", ru: "⚕ Комбинированно", en: "⚕ Combined" },
  
  // Missing muscle state
  "mmissing_title": { tg: "Модели 3D мушакҳо ёфт нашуд", ru: "3D-модель мышц не найдена", en: "Real 3D Muscle Model Not Found" },
  "mmissing_body": { tg: "Барои фаъол кардани системаи мушакҳо, файли GLB анатомияро ба папкаи зерин илова кунед:", ru: "Чтобы включить мышечную систему, добавьте файл GLB анатомии:", en: "To enable the Muscular System, add a real human anatomy GLB file:" },
  "mmissing_hint": { tg: "Манбаъҳо: Sketchfab, TurboSquid ё дигар моделҳои 3D анатомия.", ru: "Источники: Sketchfab, TurboSquid или другие 3D-модели анатомии.", en: "Sources: Sketchfab, TurboSquid, or any anatomically accurate human muscles 3D model." },
  
  // Missing nerve state
  "nmissing_title": { tg: "Модели 3D асабҳо ёфт нашуд", ru: "3D-модель нервной системы не найдена", en: "Real 3D Nervous System Model Not Found" },
  "nmissing_body": { tg: "Барои фаъол кардани системаи асаб, файли GLB асабҳоро ба папкаи зерин илова кунед:", ru: "Чтобы включить нервную систему, добавьте файл GLB:", en: "To enable the Nervous System, add a real human anatomy GLB file:" },
  
  "btn_retry": { tg: "↺ Такрор", ru: "↺ Повторить", en: "↺ Retry" },
  "btn_back_skeleton": { tg: "← Бозгашт ба устухонҳо", ru: "← Назад к скелету", en: "← Back to Skeleton" },
  "btn_animate": { tg: "⚡ Аниматсия", ru: "⚡ Анимация", en: "⚡ Animate" },
  "btn_close": { tg: "✕ Пӯшидан", ru: "✕ Закрыть", en: "✕ Close" },
  
  // Stats
  "stat_bones": { tg: "Устухонҳо", ru: "Кости", en: "Bones" },
  "stat_muscles": { tg: "Мушакҳо", ru: "Мышцы", en: "Muscles" },
  "stat_nerves": { tg: "Асабҳо", ru: "Нервы", en: "Nerves" },
  "stat_visible": { tg: "Намоён", ru: "Видимые", en: "Visible" },
  "sd_in_model": { tg: "Дар модел", ru: "В модели", en: "In model" },
  "sd_selected": { tg: "Интихобшуда", ru: "Выбрано", en: "Selected" },
  "sd_quiz_acc": { tg: "Натиҷаи викторина", ru: "Точ. викторины", en: "Quiz acc." },
  "sd_annotations": { tg: "Қайдҳо", ru: "Аннотации", en: "Annotations" },
  
  // Cross Section
  "cs_header": { tg: "✂ Буриш", ru: "✂ Сечение", en: "✂ Cross Section" },
  "cs_sagittal": { tg: "Сагитталӣ", ru: "Сагиттальная", en: "Sagittal" },
  "cs_transverse": { tg: "Трансверсӣ", ru: "Поперечная", en: "Transverse" },
  "cs_coronal": { tg: "Короналӣ", ru: "Фронтальная", en: "Coronal" },
  "btn_reset_all": { tg: "Бозсозии ҳама", ru: "Сбросить все", en: "Reset All" },
  
  // View Controls
  "view_front": { tg: "Пеш", ru: "Спереди", en: "Front" },
  "view_back": { tg: "Ақиб", ru: "Сзади", en: "Back" },
  "view_left": { tg: "Чап", ru: "Слева", en: "Left" },
  "view_right": { tg: "Рост", ru: "Справа", en: "Right" },
  "view_top": { tg: "Боло", ru: "Сверху", en: "Top" },
  "view_bottom": { tg: "Поён", ru: "Снизу", en: "Bottom" },
  "view_iso": { tg: "ISO", ru: "ISO", en: "ISO" },
  "view_reset": { tg: "Бозсозӣ", ru: "Сброс", en: "Reset" },
  
  // Bone Details Panel
  "panel_bone_details": { tg: "Тафсилоти Устухон", ru: "Сведения о кости", en: "Bone Details" },
  "ph_select_bone": { tg: "Барои дидани тафсилот ягон сохторро интихоб кунед", ru: "Выберите структуру для просмотра сведений", en: "Select any structure to view<br>anatomical details" },
  "lbl_desc": { tg: "📖 Тавсиф", ru: "📖 Описание", en: "📖 Description" },
  "lbl_fn": { tg: "⚡ Вазифа", ru: "⚡ Функция", en: "⚡ Function" },
  "lbl_art": { tg: "🔗 Пайвастшавӣ", ru: "🔗 Сочленения", en: "🔗 Articulations" },
  "lbl_muscles": { tg: "💪 Мушакҳои пайваст", ru: "💪 Крепление мышц", en: "💪 Muscle Attachments" },
  "lbl_clinic": { tg: "🏥 Қайди клиникӣ", ru: "🏥 Клин. заметка", en: "🏥 Clinical Note" },
  "lbl_oss": { tg: "🦴 Устухоншавӣ", ru: "🦴 Окостенение", en: "🦴 Ossification" },
  "lbl_cat": { tg: "🏷️ Категория", ru: "🏷️ Категория", en: "🏷️ Category" },
  "btn_isolate": { tg: "🔬 Ҷудо кардан", ru: "🔬 Изолировать", en: "🔬 Isolate Bone" },
  "btn_show_all": { tg: "🔄 Ҳамаро нишон додан", ru: "🔄 Показать все", en: "🔄 Show All Bones" },
  
  // Muscle Details Panel
  "panel_muscle_details": { tg: "Тафсилоти Мушак", ru: "Сведения о мышце", en: "Muscle Details" },
  "lbl_innervation": { tg: "⚡ Иннерватсия", ru: "⚡ Иннервация", en: "⚡ Innervation" },
  "lbl_blood": { tg: "🩸 Таъминоти хун", ru: "🩸 Кровоснабжение", en: "🩸 Blood Supply" },
  
  // Quiz Panel
  "quiz_score": { tg: "Хол", ru: "Балл", en: "Score" },
  "quiz_total": { tg: "Умумӣ", ru: "Всего", en: "Total" },
  "quiz_beg": { tg: "Осон", ru: "Новичок", en: "Beginner" },
  "quiz_med": { tg: "Миёна", ru: "Средний", en: "Med" },
  "quiz_hard": { tg: "Мушкил", ru: "Продвинутый", en: "Hard" },
  "quiz_timer": { tg: "⏱ Таймер", ru: "⏱ Таймер", en: "⏱ Timer" },
  "quiz_end": { tg: "🏁 Анҷом", ru: "🏁 Завершить", en: "🏁 End" },
  "quiz_skip": { tg: "Гузарондан ⏭", ru: "Пропустить ⏭", en: "Skip Question ⏭" },
  "quiz_identify": { tg: "Сохторро муайян кунед:", ru: "Определите структуру:", en: "Identify the structure:" },
  "quiz_loading": { tg: "Боргирӣ...", ru: "Загрузка...", en: "Loading..." },
  "quiz_complete": { tg: "Викторина анҷом ёфт!", ru: "Викторина завершена!", en: "Quiz Complete!" },
  "quiz_acc": { tg: "Дақиқӣ", ru: "Точность", en: "Accuracy" },
  "quiz_play_again": { tg: "🔄 Дубора бозӣ кардан", ru: "🔄 Играть снова", en: "🔄 Play Again" },
  "quiz_exit": { tg: "← Баромад", ru: "← Выйти", en: "← Exit Quiz" },
  "quiz_correct": { tg: "Дуруст!", ru: "Правильно!", en: "Correct!" },
  "quiz_incorrect": { tg: "Нодуруст", ru: "Неправильно", en: "Incorrect" },
  
  // Annotations
  "ann_header": { tg: "📌 Қайдҳо", ru: "📌 Аннотации", en: "📌 Annotations" },
  "ann_hint": { tg: "Барои гузоштани нуқтаҳо ба устухонҳо дар 3D клик кунед", ru: "Кликните по кости в 3D, чтобы добавить метку", en: "Click bones in 3D to add pins" },
  "ann_title": { tg: "📌 Иловаи қайд", ru: "📌 Добавить аннотацию", en: "📌 Add Annotation" },
  "ann_ph_title": { tg: "Сарлавҳа (ҳатмӣ)", ru: "Заголовок (обязат.)", en: "Title (required)" },
  "ann_ph_note": { tg: "Қайди клиникӣ (ихтиёрӣ)", ru: "Клин. заметка (необяз.)", en: "Clinical note (optional)" },
  "btn_save": { tg: "Сабт 💾", ru: "Сохр. 💾", en: "Save 💾" },
  "btn_cancel": { tg: "Бекор кардан", ru: "Отмена", en: "Cancel" },
  
  // Tooltips & Buttons
  "tt_xray": { tg: "Режими Рентген", ru: "Рентген", en: "X-Ray Mode" },
  "tt_measure": { tg: "Абзори ченкунӣ", ru: "Измерение", en: "Measure Tool" },
  "tt_annotate": { tg: "Қайдкунӣ", ru: "Аннотация", en: "Annotate" },
  "tt_section": { tg: "Буриш", ru: "Сечение", en: "Cross Section" },
  "tt_isolate": { tg: "Ҷудо кардани устухон (I)", ru: "Изолировать кость (I)", en: "Isolate Bone (I)" },
  "tt_pres": { tg: "Режими Намоиш", ru: "Режим презентации", en: "Presentation Mode" },
  "tt_labels": { tg: "Номҳоро нишон додан", ru: "Показать метки", en: "Toggle Labels" },
  "tt_rotate": { tg: "Гардиши автоматӣ", ru: "Авто-вращение", en: "Auto-Rotate" },
  "tt_screen": { tg: "Скриншот", ru: "Скриншот", en: "Screenshot" },
  "btn_screen_norm": { tg: "📸 Муқаррарӣ", ru: "📸 Обычный", en: "📸 Normal" },
  "btn_screen_trans": { tg: "🌙 Фон шаффоф", ru: "🌙 Прозрачный фон", en: "🌙 Transparent BG" },
  "nav_close": { tg: "Пӯшидан", ru: "Закрыть", en: "Close" },
  
  // Measure Hint
  "meas_hint": { tg: "Барои гузоштани нуқтаи аввал клик кунед", ru: "Кликните для первой точки", en: "Click a bone to place first point" },
  "meas_clear": { tg: "Тоза кардан", ru: "Очистить", en: "Clear" },
  
  // Presentation Mode
  "pres_exit": { tg: "✕ Баромад аз намоиш", ru: "✕ Выйти из презентации", en: "✕ Exit Presentation" },
  "pres_hint": { tg: "Барои оғоз ягон устухонро клик кунед", ru: "Кликните любую кость для начала", en: "Click any bone to begin" },
  
  // Loading
  "loading_title": { tg: "Атласи тиббӣ бор шуда истодааст...", ru: "Загрузка мед. атласа...", en: "Loading High-Resolution Medical Atlas…" },
  
  // Systems specific panel
  "sys_axial": { tg: "Меҳварӣ", ru: "Осевой", en: "Axial" },
  "sys_appendicular": { tg: "Замимавӣ", ru: "Добавочный", en: "Appendicular" },
};

// Global state
let currentLanguage = localStorage.getItem('osteovis_lang') || 'tg';

export function setLanguage(lang) {
  if (['tg', 'ru', 'en'].includes(lang)) {
    currentLanguage = lang;
    localStorage.setItem('osteovis_lang', lang);
    updateUI();
  }
}

export function getLanguage() {
  return currentLanguage;
}

export function t(key) {
  if (translations[key] && translations[key][currentLanguage]) {
    return translations[key][currentLanguage];
  }
  return translations[key]?.en || key; // fallback to English then to key itself
}

// Extract string directly from localized object 
// e.g. { tg: '...', ru: '...', en: '...' }
export function tObj(obj) {
  if (!obj) return '';
  if (typeof obj === 'string') return obj;
  return obj[currentLanguage] || obj.en || obj.tg || '';
}

function updateUI() {
  // Update data-i18n attributes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (el.tagName === 'INPUT' && el.type === 'text') {
      el.placeholder = t(key);
    } else if (el.tagName === 'TEXTAREA') {
      el.placeholder = t(key);
    } else {
      // If element has icon spans, preserve them
      const icon = el.querySelector('.nav-icon, .search-icon, .icon');
      if (icon) {
        el.innerHTML = '';
        el.appendChild(icon);
        el.appendChild(document.createTextNode(t(key)));
      } else {
        el.innerHTML = t(key);
      }
    }
  });

  // Update specific elements with titles
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    el.title = t(key);
  });

  // Trigger global event for custom re-rendering
  window.dispatchEvent(new Event('language-changed'));
}

// Inject initialization
window.addEventListener('DOMContentLoaded', () => {
  const langSelect = document.getElementById('lang-switch');
  if (langSelect) {
    langSelect.value = currentLanguage;
    langSelect.addEventListener('change', (e) => {
      setLanguage(e.target.value);
    });
  }
  updateUI();
});
