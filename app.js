/* ==========================================================================
   JLPT N3 MOBILE STUDY HUB - ENGINE CHUẨN SÁCH PDF (TỪ VỰNG • NGỮ PHÁP • KANJI)
   Hỗ trợ:
   - 3 chế độ ngôn ngữ: VI (Tiếng Việt) | EN (English) | BOTH (Song ngữ VI + EN)
   - 3 phần sách PDF: Mimi N3 Goi (Unit 1), Mimi N3 Bunpou (Unit 1), Soumatome Kanji (Week 1)
   - Flashcard 2 mặt: Mặt trước full Nhật (Kanji + Hira + Ví dụ sách), nút Ẩn/Hiện Hira,
     Xáo thẻ, Đánh dấu & Lọc từ "Chưa thuộc / Cần ôn lại", vuốt trái/phải trên điện thoại
   - Bài tập chuẩn sách PDF: Không lộ đáp án trước, chọn xong hiện giải thích chi tiết (VI/EN/Song ngữ)
   - Xem trực tiếp trang sách PDF gốc đối chiếu
   ========================================================================== */

'use strict';

const APP_STATE = {
  lang: localStorage.getItem('n3_pdf_lang') || 'vi', // 'vi' | 'en' | 'both'
  book: localStorage.getItem('n3_pdf_book') || 'goi', // 'goi' | 'bunpou' | 'kanji'
  unit: localStorage.getItem('n3_pdf_unit') || 'u1', // 'u1' | 'u2' | 'u3' | 'all'
  mode: 'flashcard', // 'flashcard' | 'list' | 'quiz' | 'pdf'
  scope: 'all', // current filter scope inside book+unit
  hideHira: localStorage.getItem('n3_pdf_hide_hira') === 'true',
  filterHardOnly: false,
  listHideMeaning: false,
  audioSpeed: 1.0,

  // Flashcard state
  fcList: [],
  fcIndex: 0,
  fcFlipped: false,

  // Hard / Unmemorized items map: { "goi-1": true, "kanji-5": true, "bunpou-2": true }
  hardItems: JSON.parse(localStorage.getItem('n3_pdf_hard_items') || '{}'),

  // Quiz state
  quizSubFilter: 'all',
  quizList: [],
  quizAnswers: JSON.parse(localStorage.getItem('n3_pdf_quiz_answers') || '{}'),

  // PDF viewer state
  currentPdfPage: 8,
  modalPdfPage: 8
};

/* ==========================================================================
   1. HELPER: BILINGUAL TEXT RENDERING (VI | EN | BOTH)
   ========================================================================== */
function tUI(viText, enText) {
  if (APP_STATE.lang === 'vi') return viText;
  if (APP_STATE.lang === 'en') return enText;
  return `${viText} / ${enText}`;
}

function renderBilingualBlock(viText, enText, options = {}) {
  const {
    viClass = 'text-slate-900 font-bold text-sm sm:text-base',
    enClass = 'text-indigo-700 font-semibold text-xs sm:text-sm',
    showBadges = true
  } = options;

  const safeVi = viText || '';
  const safeEn = enText || '';

  if (APP_STATE.lang === 'vi') {
    return `<div class="${viClass}">${safeVi || safeEn}</div>`;
  }
  if (APP_STATE.lang === 'en') {
    return `<div class="${viClass}">${safeEn || safeVi}</div>`;
  }
  // Song ngữ (both)
  return `
    <div class="space-y-1">
      ${safeVi ? `<div class="${viClass}"><span class="${showBadges ? 'inline-block text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 mr-1.5 align-middle' : 'hidden'}">VI</span>${safeVi}</div>` : ''}
      ${safeEn ? `<div class="${enClass}"><span class="${showBadges ? 'inline-block text-[10px] font-extrabold px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-800 mr-1.5 align-middle' : 'hidden'}">EN</span>${safeEn}</div>` : ''}
    </div>
  `;
}

function renderBilingualInline(viText, enText) {
  const safeVi = viText || '';
  const safeEn = enText || '';
  if (APP_STATE.lang === 'vi') return safeVi || safeEn;
  if (APP_STATE.lang === 'en') return safeEn || safeVi;
  if (safeVi && safeEn && safeVi !== safeEn) {
    return `<span class="text-slate-800">${safeVi}</span> <span class="text-indigo-600 font-medium">(${safeEn})</span>`;
  }
  return safeVi || safeEn;
}

/* ==========================================================================
   2. DATA ACCESSORS & NORMALIZATION FOR 3 BOOKS (UNITS 1 - 3)
   ========================================================================== */
function getGoiUnitsMap() {
  return {
    u1: window.GOI_UNIT1_DATA || { words: [], columns: [], exercises: [], pdfPages: [8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31] },
    u2: window.GOI_UNIT2_DATA || { words: [], columns: [], exercises: [], pdfPages: [32,33,34,35,36,37,38,39,40,41,42,43,44,45,46,47,48,49,50,51,52,53,54,55,56,57] },
    u3: window.GOI_UNIT3_DATA || { words: [], columns: [], exercises: [], pdfPages: [58,59,60,61,62,63,64,65,66,67,68,69] }
  };
}

function getBunpouUnitsMap() {
  return {
    u1: window.BUNPOU_UNIT1_DATA || { grammarList: [], dictation: [], exercises: [], pdfPages: [7,8,9,10,11,12,13,14] },
    u2: window.BUNPOU_UNIT2_DATA || { grammarList: [], dictation: [], exercises: [], pdfPages: [15,16,17,18,19,20,21,22] },
    u3: window.BUNPOU_UNIT3_DATA || { grammarList: [], dictation: [], exercises: [], pdfPages: [23,24,25,26,27,28,29,30] }
  };
}

function getKanjiUnitsMap() {
  return {
    u1: window.KANJI_WEEK1_DATA || { kanjiList: [], exercises: [], days: [], pdfPages: [11,12,13,14,15,16,17,18,19,20,21,22,23,24,25] },
    u2: window.KANJI_WEEK2_DATA || { kanjiList: [], exercises: [], days: [], pdfPages: [27,28,29,30,31,32,33,34,35,36,37,38,39,40,41,42] },
    u3: window.KANJI_WEEK3_DATA || { kanjiList: [], exercises: [], days: [], pdfPages: [43,44,45,46,47,48,49,50,51,52,53,54,55,56,57,58] }
  };
}

function getGoiData() {
  const map = getGoiUnitsMap();
  if (APP_STATE.unit === 'all') {
    return {
      words: [...(map.u1.words || []), ...(map.u2.words || []), ...(map.u3.words || [])],
      columns: [...(map.u1.columns || []), ...(map.u2.columns || []), ...(map.u3.columns || [])],
      exercises: [...(map.u1.exercises || []), ...(map.u2.exercises || []), ...(map.u3.exercises || [])],
      pdfPages: [...(map.u1.pdfPages || []), ...(map.u2.pdfPages || []), ...(map.u3.pdfPages || [])]
    };
  }
  return map[APP_STATE.unit] || map.u1;
}

function getBunpouData() {
  const map = getBunpouUnitsMap();
  if (APP_STATE.unit === 'all') {
    return {
      grammarList: [...(map.u1.grammarList || []), ...(map.u2.grammarList || []), ...(map.u3.grammarList || [])],
      dictation: [...(map.u1.dictation || []), ...(map.u2.dictation || []), ...(map.u3.dictation || [])],
      exercises: [...(map.u1.exercises || []), ...(map.u2.exercises || []), ...(map.u3.exercises || [])],
      pdfPages: [...(map.u1.pdfPages || []), ...(map.u2.pdfPages || []), ...(map.u3.pdfPages || [])]
    };
  }
  return map[APP_STATE.unit] || map.u1;
}

function getKanjiData() {
  const map = getKanjiUnitsMap();
  if (APP_STATE.unit === 'all') {
    return {
      kanjiList: [...(map.u1.kanjiList || []), ...(map.u2.kanjiList || []), ...(map.u3.kanjiList || [])],
      exercises: [...(map.u1.exercises || []), ...(map.u2.exercises || []), ...(map.u3.exercises || [])],
      days: [...(map.u1.days || []), ...(map.u2.days || []), ...(map.u3.days || [])],
      pdfPages: [...(map.u1.pdfPages || []), ...(map.u2.pdfPages || []), ...(map.u3.pdfPages || [])]
    };
  }
  return map[APP_STATE.unit] || map.u1;
}

function getHardKey(book, id) {
  return `${book}-${id}`;
}

function isItemHard(book, id) {
  return Boolean(APP_STATE.hardItems[getHardKey(book, id)]);
}

function saveHardItems() {
  localStorage.setItem('n3_pdf_hard_items', JSON.stringify(APP_STATE.hardItems));
  syncSharedState();
}

function saveQuizAnswers() {
  localStorage.setItem('n3_pdf_quiz_answers', JSON.stringify(APP_STATE.quizAnswers));
  syncSharedState();
}

function syncSharedState() {
  fetch('/api/shared-state', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      hardItems: APP_STATE.hardItems,
      quizAnswers: APP_STATE.quizAnswers,
      updatedAt: new Date().toISOString()
    })
  }).catch(() => {});
}

/* ==========================================================================
   3. SCOPE DEFINITIONS & ITEM FILTERING
   ========================================================================== */
function getUnitTabsForCurrentBook() {
  if (APP_STATE.book === 'goi') {
    return [
      { id: 'u1', labelVi: 'Unit 1: Danh từ (1–120)', labelEn: 'Unit 1: Nouns (1–120)' },
      { id: 'u2', labelVi: 'Unit 2: Động từ (121–258)', labelEn: 'Unit 2: Verbs (121–258)' },
      { id: 'u3', labelVi: 'Unit 3: Tính từ (259–310)', labelEn: 'Unit 3: Adjectives (259–310)' },
      { id: 'all', labelVi: 'Tất cả U1–U3 (1–310)', labelEn: 'All U1–U3 (1–310)' }
    ];
  }
  if (APP_STATE.book === 'kanji') {
    return [
      { id: 'u1', labelVi: 'Tuần 1: でかける①', labelEn: 'Week 1: Going Out ①' },
      { id: 'u2', labelVi: 'Tuần 2: でかける②', labelEn: 'Week 2: Going Out ②' },
      { id: 'u3', labelVi: 'Tuần 3: つかう', labelEn: 'Week 3: Using Things' },
      { id: 'all', labelVi: 'Tất cả Tuần 1–3', labelEn: 'All Weeks 1–3' }
    ];
  }
  return [
    { id: 'u1', labelVi: 'Unit 1 (Mẫu 1–8)', labelEn: 'Unit 1 (Patterns 1–8)' },
    { id: 'u2', labelVi: 'Unit 2 (Mẫu 9–15)', labelEn: 'Unit 2 (Patterns 9–15)' },
    { id: 'u3', labelVi: 'Unit 3 (Mẫu 16–28)', labelEn: 'Unit 3 (Patterns 16–28)' },
    { id: 'all', labelVi: 'Tất cả U1–U3 (1–28)', labelEn: 'All U1–U3 (1–28)' }
  ];
}

function getScopesForCurrentBook() {
  if (APP_STATE.book === 'goi') {
    if (APP_STATE.unit === 'u1') {
      return [
        { id: 'all', labelVi: 'Tất cả U1 (1–120)', labelEn: 'All U1 (1–120)', filter: () => true },
        { id: 'step1', labelVi: 'Step 1 (1–71)', labelEn: 'Step 1 (1–71)', filter: (w) => w.id >= 1 && w.id <= 71 },
        { id: 'step2', labelVi: 'Step 2 (72–120)', labelEn: 'Step 2 (72–120)', filter: (w) => w.id >= 72 && w.id <= 120 },
        { id: 'r1', labelVi: 'Từ 1–25', labelEn: 'Words 1–25', filter: (w) => w.id >= 1 && w.id <= 25 },
        { id: 'r2', labelVi: 'Từ 26–50', labelEn: 'Words 26–50', filter: (w) => w.id >= 26 && w.id <= 50 },
        { id: 'r3', labelVi: 'Từ 51–71', labelEn: 'Words 51–71', filter: (w) => w.id >= 51 && w.id <= 71 },
        { id: 'r4', labelVi: 'Từ 72–95', labelEn: 'Words 72–95', filter: (w) => w.id >= 72 && w.id <= 95 },
        { id: 'r5', labelVi: 'Từ 96–120', labelEn: 'Words 96–120', filter: (w) => w.id >= 96 && w.id <= 120 }
      ];
    }
    if (APP_STATE.unit === 'u2') {
      return [
        { id: 'all', labelVi: 'Tất cả U2 (121–258)', labelEn: 'All U2 (121–258)', filter: () => true },
        { id: 'step1', labelVi: 'Step 1 (121–170)', labelEn: 'Step 1 (121–170)', filter: (w) => w.id >= 121 && w.id <= 170 },
        { id: 'step2', labelVi: 'Step 2 (171–220)', labelEn: 'Step 2 (171–220)', filter: (w) => w.id >= 171 && w.id <= 220 },
        { id: 'matome', labelVi: 'まとめ 連用名詞 (221–258)', labelEn: 'Matome Nouns (221–258)', filter: (w) => w.id >= 221 && w.id <= 258 },
        { id: 'r1', labelVi: 'Từ 121–145', labelEn: 'Words 121–145', filter: (w) => w.id >= 121 && w.id <= 145 },
        { id: 'r2', labelVi: 'Từ 146–170', labelEn: 'Words 146–170', filter: (w) => w.id >= 146 && w.id <= 170 },
        { id: 'r3', labelVi: 'Từ 171–195', labelEn: 'Words 171–195', filter: (w) => w.id >= 171 && w.id <= 195 },
        { id: 'r4', labelVi: 'Từ 196–220', labelEn: 'Words 196–220', filter: (w) => w.id >= 196 && w.id <= 220 }
      ];
    }
    if (APP_STATE.unit === 'u3') {
      return [
        { id: 'all', labelVi: 'Tất cả U3 (259–310)', labelEn: 'All U3 (259–310)', filter: () => true },
        { id: 'step1', labelVi: 'Tính từ A (259–298)', labelEn: 'Adjectives A (259–298)', filter: (w) => w.id >= 259 && w.id <= 298 },
        { id: 'matome', labelVi: 'まとめ まる/める (299–310)', labelEn: 'Matome -maru/-meru (299–310)', filter: (w) => w.id >= 299 && w.id <= 310 },
        { id: 'r1', labelVi: 'Từ 259–278', labelEn: 'Words 259–278', filter: (w) => w.id >= 259 && w.id <= 278 },
        { id: 'r2', labelVi: 'Từ 279–298', labelEn: 'Words 279–298', filter: (w) => w.id >= 279 && w.id <= 298 }
      ];
    }
    return [
      { id: 'all', labelVi: 'Tất cả (1–310)', labelEn: 'All (1–310)', filter: () => true },
      { id: 'u1', labelVi: 'Unit 1 (1–120)', labelEn: 'Unit 1 (1–120)', filter: (w) => w.id >= 1 && w.id <= 120 },
      { id: 'u2', labelVi: 'Unit 2 (121–258)', labelEn: 'Unit 2 (121–258)', filter: (w) => w.id >= 121 && w.id <= 258 },
      { id: 'u3', labelVi: 'Unit 3 (259–310)', labelEn: 'Unit 3 (259–310)', filter: (w) => w.id >= 259 && w.id <= 310 }
    ];
  }
  if (APP_STATE.book === 'kanji') {
    const kData = getKanjiData();
    const dayPills = (kData.days || []).filter((d) => d.dayNum <= 6).map((d) => ({
      id: `d${d.dayNum}`,
      labelVi: d.titleJp || `Ngày ${d.dayNum}`,
      labelEn: d.titleEn || `Day ${d.dayNum}`,
      filter: (k) => Number(k.day) === Number(d.dayNum)
    }));
    if (APP_STATE.unit === 'all') {
      return [
        { id: 'all', labelVi: 'Tất cả Tuần 1–3', labelEn: 'All Weeks 1–3', filter: () => true }
      ];
    }
    return [
      { id: 'all', labelVi: 'Cả Tuần (Ngày 1–6)', labelEn: 'All Week (Days 1–6)', filter: () => true },
      ...dayPills
    ];
  }
  // bunpou
  if (APP_STATE.unit === 'u1') {
    return [
      { id: 'all', labelVi: 'Tất cả Unit 1 (Mẫu 1–8)', labelEn: 'All Unit 1 (Patterns 1–8)', filter: () => true },
      { id: 'b1', labelVi: 'Mẫu 1–4', labelEn: 'Patterns 1–4', filter: (g) => g.id >= 1 && g.id <= 4 },
      { id: 'b2', labelVi: 'Mẫu 5–8', labelEn: 'Patterns 5–8', filter: (g) => g.id >= 5 && g.id <= 8 }
    ];
  }
  if (APP_STATE.unit === 'u2') {
    return [
      { id: 'all', labelVi: 'Tất cả Unit 2 (Mẫu 9–15)', labelEn: 'All Unit 2 (Patterns 9–15)', filter: () => true },
      { id: 'b1', labelVi: 'Mẫu 9–12', labelEn: 'Patterns 9–12', filter: (g) => g.id >= 9 && g.id <= 12 },
      { id: 'b2', labelVi: 'Mẫu 13–15', labelEn: 'Patterns 13–15', filter: (g) => g.id >= 13 && g.id <= 15 }
    ];
  }
  if (APP_STATE.unit === 'u3') {
    return [
      { id: 'all', labelVi: 'Tất cả Unit 3 (Mẫu 16–28)', labelEn: 'All Unit 3 (Patterns 16–28)', filter: () => true },
      { id: 'b1', labelVi: 'Mẫu 16–21', labelEn: 'Patterns 16–21', filter: (g) => g.id >= 16 && g.id <= 21 },
      { id: 'b2', labelVi: 'Mẫu 22–28', labelEn: 'Patterns 22–28', filter: (g) => g.id >= 22 && g.id <= 28 }
    ];
  }
  return [
    { id: 'all', labelVi: 'Tất cả U1–U3 (Mẫu 1–28)', labelEn: 'All U1–U3 (Patterns 1–28)', filter: () => true }
  ];
}

function getRawItemsForCurrentBook() {
  if (APP_STATE.book === 'goi') return getGoiData().words || [];
  if (APP_STATE.book === 'kanji') return getKanjiData().kanjiList || [];
  return getBunpouData().grammarList || [];
}

function buildFilteredStudyList() {
  const raw = getRawItemsForCurrentBook();
  const scopes = getScopesForCurrentBook();
  const activeScope = scopes.find((s) => s.id === APP_STATE.scope) || scopes[0];
  let filtered = raw.filter(activeScope.filter);

  if (APP_STATE.filterHardOnly) {
    filtered = filtered.filter((item) => isItemHard(APP_STATE.book, item.id));
  }
  APP_STATE.fcList = [...filtered];
  if (APP_STATE.fcIndex >= APP_STATE.fcList.length) {
    APP_STATE.fcIndex = 0;
  }
  APP_STATE.fcFlipped = false;
}

/* ==========================================================================
   4. LANGUAGE, BOOK TAB & STUDY MODE SWITCHING
   ========================================================================== */
function setLangMode(lang) {
  APP_STATE.lang = lang;
  localStorage.setItem('n3_pdf_lang', lang);
  updateHeaderAndNavLabels();
  renderUnitTabs();
  renderScopePills();
  renderCurrentView();
}

function selectUnit(unitId) {
  APP_STATE.unit = unitId;
  localStorage.setItem('n3_pdf_unit', unitId);
  APP_STATE.scope = 'all';
  APP_STATE.fcIndex = 0;
  APP_STATE.fcFlipped = false;
  APP_STATE.quizSubFilter = 'all';

  const pages = getPdfPagesForBook(APP_STATE.book);
  APP_STATE.currentPdfPage = pages[0] || 1;

  buildFilteredStudyList();
  buildFilteredQuizList();
  updateHeaderAndNavLabels();
  renderUnitTabs();
  renderScopePills();
  renderCurrentView();
}

function renderUnitTabs() {
  const container = document.getElementById('unitTabsContainer');
  if (!container) return;
  const tabs = getUnitTabsForCurrentBook();
  container.innerHTML = tabs.map((t) => {
    const active = t.id === APP_STATE.unit;
    const label = APP_STATE.lang === 'en' ? t.labelEn : t.labelVi;
    return `
      <button onclick="selectUnit('${t.id}')" class="px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition ${
        active
          ? 'bg-emerald-600 text-white shadow-sm'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
      }">
        ${label}
      </button>
    `;
  }).join('');
}

function switchBookTab(book) {
  APP_STATE.book = book;
  localStorage.setItem('n3_pdf_book', book);
  APP_STATE.scope = 'all';
  APP_STATE.filterHardOnly = false;
  APP_STATE.fcIndex = 0;
  APP_STATE.fcFlipped = false;
  APP_STATE.quizSubFilter = 'all';

  const pages = getPdfPagesForBook(book);
  APP_STATE.currentPdfPage = pages[0] || 1;

  buildFilteredStudyList();
  buildFilteredQuizList();
  updateHeaderAndNavLabels();
  renderUnitTabs();
  renderScopePills();
  renderCurrentView();
}

function setStudyMode(mode) {
  APP_STATE.mode = mode;
  ['flashcard', 'list', 'quiz', 'pdf'].forEach((m) => {
    const view = document.getElementById(`view-${m}`);
    const btn = document.getElementById(`mode-btn-${m}`);
    if (view) view.classList.toggle('hidden', m !== mode);
    if (btn) {
      if (m === mode) {
        btn.className = 'flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition bg-white text-slate-900 shadow-sm whitespace-nowrap';
      } else {
        btn.className = 'flex-1 py-1.5 px-2.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition text-slate-300 hover:text-white whitespace-nowrap';
      }
    }
  });
  renderCurrentView();
}

function updateHeaderAndNavLabels() {
  // Language buttons active state
  ['vi', 'en', 'both'].forEach((l) => {
    const btn = document.getElementById(`lang-btn-${l}`);
    if (!btn) return;
    if (l === APP_STATE.lang) {
      btn.className = 'px-2 py-1 rounded-md transition bg-emerald-600 text-white shadow-sm';
    } else {
      btn.className = 'px-2 py-1 rounded-md transition text-slate-300 hover:text-white';
    }
  });

  // Header book title & subtitle
  const titleEl = document.getElementById('headerTitle');
  const subEl = document.getElementById('headerSubtitle');
  const iconEl = document.getElementById('headerBookIcon');

  const activeUnitTab = getUnitTabsForCurrentBook().find((t) => t.id === APP_STATE.unit) || getUnitTabsForCurrentBook()[0];
  const activeUnitText = APP_STATE.lang === 'en' ? activeUnitTab.labelEn : activeUnitTab.labelVi;

  if (APP_STATE.book === 'goi') {
    titleEl.innerText = tUI('Mimi Kara Oboeru N3 - Từ Vựng', 'Mimi Kara Oboeru N3 - Vocabulary');
    subEl.innerText = activeUnitText;
    iconEl.className = 'w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center font-black text-sm shadow-sm shrink-0';
    iconEl.innerText = '語';
  } else if (APP_STATE.book === 'bunpou') {
    titleEl.innerText = tUI('Mimi Kara Oboeru N3 - Ngữ Pháp', 'Mimi Kara Oboeru N3 - Grammar');
    subEl.innerText = activeUnitText;
    iconEl.className = 'w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-sm shadow-sm shrink-0';
    iconEl.innerText = '文';
  } else {
    titleEl.innerText = tUI('Soumatome N3 - Hán Tự (Kanji)', 'Soumatome N3 - Kanji');
    subEl.innerText = activeUnitText;
    iconEl.className = 'w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-black text-sm shadow-sm shrink-0';
    iconEl.innerText = '漢';
  }

  // Bottom navigation bar active styling
  const navConfig = [
    { id: 'goi', vi: '1. Từ Vựng', en: '1. Vocab', color: 'text-emerald-600 bg-emerald-50/80' },
    { id: 'bunpou', vi: '2. Ngữ Pháp', en: '2. Grammar', color: 'text-indigo-600 bg-indigo-50/80' },
    { id: 'kanji', vi: '3. Kanji', en: '3. Kanji', color: 'text-amber-600 bg-amber-50/80' }
  ];
  navConfig.forEach((n) => {
    const tab = document.getElementById(`nav-tab-${n.id}`);
    const lbl = document.getElementById(`nav-label-${n.id}`);
    if (lbl) lbl.innerText = APP_STATE.lang === 'en' ? n.en : n.vi;
    if (tab) {
      if (APP_STATE.book === n.id) {
        tab.className = `py-1.5 px-2 rounded-xl flex flex-col items-center justify-center gap-0.5 transition font-extrabold ${n.color}`;
      } else {
        tab.className = 'py-1.5 px-2 rounded-xl flex flex-col items-center justify-center gap-0.5 transition text-slate-500 font-semibold hover:text-slate-800';
      }
    }
  });

  // Mode labels
  document.getElementById('label-mode-flashcard').innerText = 'Flashcard';
  document.getElementById('label-mode-list').innerText = APP_STATE.lang === 'en' ? 'Quick List' : 'Bảng ôn';
  document.getElementById('label-mode-quiz').innerText = APP_STATE.lang === 'en' ? 'Exercises' : 'Bài tập sách';
  document.getElementById('label-mode-pdf').innerText = APP_STATE.lang === 'en' ? 'Book PDF' : 'Trang gốc';

  const allExercises = getRawExercisesForCurrentBook();
  const badge = document.getElementById('quizCountBadge');
  if (badge) badge.innerText = allExercises.length || '';

  const langInd = document.getElementById('fcFrontLangIndicator');
  if (langInd) {
    langInd.innerText = APP_STATE.lang === 'vi' ? 'Tiếng Việt' : (APP_STATE.lang === 'en' ? 'English' : 'Song ngữ VI+EN');
  }
}

function renderScopePills() {
  const container = document.getElementById('scopePillsContainer');
  if (!container) return;
  const scopes = getScopesForCurrentBook();
  container.innerHTML = scopes.map((s) => {
    const active = s.id === APP_STATE.scope;
    const label = APP_STATE.lang === 'en' ? s.labelEn : s.labelVi;
    return `
      <button onclick="selectScope('${s.id}')" class="px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
        active
          ? 'bg-slate-900 text-white shadow-sm'
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }">
        ${label}
      </button>
    `;
  }).join('');
}

function selectScope(scopeId) {
  APP_STATE.scope = scopeId;
  APP_STATE.fcIndex = 0;
  APP_STATE.fcFlipped = false;
  buildFilteredStudyList();
  renderScopePills();
  renderCurrentView();
}

function renderCurrentView() {
  updateHardCountUI();
  if (APP_STATE.mode === 'flashcard') {
    renderFlashcard();
  } else if (APP_STATE.mode === 'list') {
    renderQuickList();
  } else if (APP_STATE.mode === 'quiz') {
    renderQuizView();
  } else if (APP_STATE.mode === 'pdf') {
    renderPdfViewer();
  }
}

/* ==========================================================================
   5. FLASHCARD 2-SIDED ENGINE (KANJI + HIRA FRONT, TRANSLATION BACK)
   ========================================================================== */
function updateHardCountUI() {
  const raw = getRawItemsForCurrentBook();
  const hardCount = raw.filter((item) => isItemHard(APP_STATE.book, item.id)).length;
  const btn = document.getElementById('btnFilterHard');
  const lbl = document.getElementById('labelFilterHard');
  if (lbl) {
    lbl.innerText = APP_STATE.lang === 'en' ? `Review (${hardCount})` : `Chưa thuộc (${hardCount})`;
  }
  if (btn) {
    if (APP_STATE.filterHardOnly) {
      btn.className = 'text-xs font-bold px-2.5 py-1.5 rounded-xl border transition flex items-center gap-1.5 bg-amber-500 border-amber-600 text-white shadow-sm';
    } else {
      btn.className = 'text-xs font-bold px-2.5 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-amber-50 transition flex items-center gap-1.5';
    }
  }

  // Update Hide Hira button
  const hiraBtn = document.getElementById('btnToggleHira');
  const hiraIcon = document.getElementById('iconToggleHira');
  const hiraLbl = document.getElementById('labelToggleHira');
  if (hiraBtn && hiraIcon && hiraLbl) {
    if (APP_STATE.hideHira) {
      hiraBtn.className = 'text-xs font-bold px-2.5 py-1.5 rounded-xl border transition flex items-center gap-1.5 bg-emerald-600 border-emerald-700 text-white shadow-sm';
      hiraIcon.className = 'fa-solid fa-eye-slash text-white';
      hiraLbl.innerText = APP_STATE.lang === 'en' ? 'Hira Hidden' : 'Đang ẩn Hira';
    } else {
      hiraBtn.className = 'text-xs font-bold px-2.5 py-1.5 rounded-xl border transition flex items-center gap-1.5 bg-slate-50 border-slate-200 text-slate-700';
      hiraIcon.className = 'fa-solid fa-eye text-emerald-600';
      hiraLbl.innerText = APP_STATE.lang === 'en' ? 'Hide Hira' : 'Ẩn Hira';
    }
  }
}

function toggleHideHira() {
  APP_STATE.hideHira = !APP_STATE.hideHira;
  localStorage.setItem('n3_pdf_hide_hira', String(APP_STATE.hideHira));
  updateHardCountUI();
  renderFlashcard();
}

function shuffleFlashcards() {
  if (APP_STATE.fcList.length <= 1) return;
  for (let i = APP_STATE.fcList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [APP_STATE.fcList[i], APP_STATE.fcList[j]] = [APP_STATE.fcList[j], APP_STATE.fcList[i]];
  }
  APP_STATE.fcIndex = 0;
  APP_STATE.fcFlipped = false;
  renderFlashcard();
}

function toggleFilterHard() {
  APP_STATE.filterHardOnly = !APP_STATE.filterHardOnly;
  APP_STATE.fcIndex = 0;
  APP_STATE.fcFlipped = false;
  buildFilteredStudyList();
  renderCurrentView();
}

function toggleCurrentItemHard() {
  const item = APP_STATE.fcList[APP_STATE.fcIndex];
  if (!item) return;
  const key = getHardKey(APP_STATE.book, item.id);
  if (APP_STATE.hardItems[key]) {
    delete APP_STATE.hardItems[key];
  } else {
    APP_STATE.hardItems[key] = true;
  }
  saveHardItems();
  if (APP_STATE.filterHardOnly && !APP_STATE.hardItems[key]) {
    buildFilteredStudyList();
  }
  updateHardCountUI();
  renderFlashcard();
}

function toggleItemHardById(book, id) {
  const key = getHardKey(book, id);
  if (APP_STATE.hardItems[key]) {
    delete APP_STATE.hardItems[key];
  } else {
    APP_STATE.hardItems[key] = true;
  }
  saveHardItems();
  updateHardCountUI();
  if (APP_STATE.mode === 'list') renderQuickList();
}

function handleCardTap(event) {
  // If user tapped a masked hiragana element, reveal it temporarily without flipping
  const masked = event.target.closest('.hira-masked');
  if (masked && !masked.classList.contains('reveal-temp')) {
    masked.classList.add('reveal-temp');
    return;
  }
  flipFlashcard();
}

function syncCardFaceVisibility(animate = false) {
  const frontEl = document.getElementById('fcFront');
  const backEl = document.getElementById('fcBack');
  if (frontEl && backEl) {
    if (APP_STATE.fcFlipped) {
      frontEl.classList.add('hidden');
      frontEl.classList.remove('flex', 'card-flip-animate');
      backEl.classList.remove('hidden', 'card-flip-animate');
      backEl.classList.add('flex');
      if (animate) {
        void backEl.offsetWidth;
        backEl.classList.add('card-flip-animate');
      }
    } else {
      backEl.classList.add('hidden');
      backEl.classList.remove('flex', 'card-flip-animate');
      frontEl.classList.remove('hidden', 'card-flip-animate');
      frontEl.classList.add('flex');
      if (animate) {
        void frontEl.offsetWidth;
        frontEl.classList.add('card-flip-animate');
      }
    }
  }
  const btnFlipLabel = document.getElementById('btnFlipLabel');
  if (btnFlipLabel) {
    btnFlipLabel.innerText = APP_STATE.fcFlipped
      ? tUI('Lật về mặt Nhật', 'Flip to Japanese')
      : tUI('Lật thẻ (Xem nghĩa)', 'Flip Card (Meaning)');
  }
}

function flipFlashcard() {
  if (!APP_STATE.fcList.length) return;
  APP_STATE.fcFlipped = !APP_STATE.fcFlipped;
  syncCardFaceVisibility(true);
}

function nextFlashcard() {
  if (!APP_STATE.fcList.length) return;
  APP_STATE.fcIndex = (APP_STATE.fcIndex + 1) % APP_STATE.fcList.length;
  APP_STATE.fcFlipped = false;
  renderFlashcard();
}

function prevFlashcard() {
  if (!APP_STATE.fcList.length) return;
  APP_STATE.fcIndex = (APP_STATE.fcIndex - 1 + APP_STATE.fcList.length) % APP_STATE.fcList.length;
  APP_STATE.fcFlipped = false;
  renderFlashcard();
}

function renderFlashcard() {
  syncCardFaceVisibility(false);

  const counterEl = document.getElementById('fcCounter');
  const total = APP_STATE.fcList.length;

  if (total === 0) {
    if (counterEl) counterEl.innerText = '0 / 0';
    document.getElementById('fcFrontReading').innerText = '';
    document.getElementById('fcFrontMain').innerHTML = `<span class="text-base font-bold text-slate-500">${tUI('Không có thẻ nào trong bộ lọc này.', 'No cards in this filter.')}</span>`;
    document.getElementById('fcFrontSubJp').innerHTML = '';
    document.getElementById('fcFrontExamples').innerHTML = `<div class="text-xs text-center text-slate-500">${tUI('Hãy tắt lọc "Chưa thuộc" hoặc chọn phạm vi khác.', 'Turn off "Review" filter or select another scope.')}</div>`;
    return;
  }

  const item = APP_STATE.fcList[APP_STATE.fcIndex];
  if (counterEl) counterEl.innerText = `${APP_STATE.fcIndex + 1} / ${total}`;

  // Hard status buttons
  const hard = isItemHard(APP_STATE.book, item.id);
  const fBtn = document.getElementById('fcHardBtnFront');
  const bBtn = document.getElementById('fcHardBtnBack');
  const fTxt = document.getElementById('fcHardTextFront');
  if (fBtn) {
    fBtn.className = hard
      ? 'px-2.5 py-1.5 rounded-full text-xs font-bold border transition flex items-center gap-1 bg-amber-500 text-white border-amber-600 shadow-sm'
      : 'px-2.5 py-1.5 rounded-full text-xs font-bold border transition flex items-center gap-1 bg-slate-50 text-slate-500 border-slate-200';
    fBtn.querySelector('i').className = hard ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
  }
  if (fTxt) fTxt.innerText = hard ? tUI('Đã lưu ôn', 'Saved') : tUI('Cần ôn', 'Save');
  if (bBtn) {
    bBtn.className = hard
      ? 'px-2.5 py-1 rounded-full text-xs font-bold border transition flex items-center gap-1 bg-amber-500 text-white border-amber-600'
      : 'px-2.5 py-1 rounded-full text-xs font-bold border transition flex items-center gap-1 bg-slate-50 text-slate-500 border-slate-200';
    bBtn.innerHTML = `<i class="${hard ? 'fa-solid' : 'fa-regular'} fa-bookmark"></i>`;
  }

  const maskClass = APP_STATE.hideHira ? 'hira-masked' : '';

  // Render by Book Type
  if (APP_STATE.book === 'goi') {
    renderGoiFlashcard(item, maskClass);
  } else if (APP_STATE.book === 'kanji') {
    renderKanjiFlashcard(item, maskClass);
  } else {
    renderBunpouFlashcard(item, maskClass);
  }
}

function renderGoiFlashcard(item, maskClass) {
  // FRONT
  document.getElementById('fcFrontBadge').innerText = `Từ #${item.id}`;
  document.getElementById('fcFrontPos').innerText = item.pos || '名詞';
  document.getElementById('fcFrontPageBtn').innerHTML = `<i class="fa-regular fa-file-lines mr-1"></i>Trang ${item.page || 8}`;

  const readingEl = document.getElementById('fcFrontReading');
  readingEl.className = `text-lg sm:text-2xl font-bold text-emerald-600 font-jp tracking-wide ${maskClass}`;
  readingEl.innerText = item.kana || '';

  document.getElementById('fcFrontMain').innerText = item.kanji || item.kana;
  document.getElementById('fcFrontSubJp').innerHTML = item.hanviet
    ? `<span class="inline-block text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">${item.hanviet}</span>`
    : '';

  const exFrontHtml = (item.examples || []).map((ex) => `
    <div class="flex items-start justify-between gap-2 text-xs sm:text-sm font-jp text-slate-800">
      <div>
        <div class="font-bold">・${ex.jp}</div>
        ${ex.hira ? `<div class="text-[11px] text-slate-500 mt-0.5 ${maskClass}">${ex.hira}</div>` : ''}
      </div>
      <button onclick="event.stopPropagation(); speakText(${JSON.stringify(ex.jp.replace(/[｛｝\{\}○×]/g, ''))})" class="w-7 h-7 rounded-full bg-white border border-slate-200 text-emerald-600 shrink-0 flex items-center justify-center hover:bg-emerald-50">
        <i class="fa-solid fa-volume-low text-xs"></i>
      </button>
    </div>
  `).join('');

  const colFrontPreview = (item.collocations || []).slice(0, 4).map((c) =>
    `<span class="inline-block text-[11px] font-jp bg-white border border-slate-200 rounded-lg px-2 py-0.5 text-slate-700"><b class="text-emerald-700">[${c.type}]</b> ${c.jp}</span>`
  ).join(' ');

  document.getElementById('fcFrontExamples').innerHTML = `
    ${exFrontHtml || '<div class="text-xs text-slate-400">（例文）</div>'}
    ${colFrontPreview ? `<div class="pt-2 border-t border-slate-200/70 flex flex-wrap gap-1">${colFrontPreview}</div>` : ''}
  `;

  // BACK
  document.getElementById('fcBackJpHead').innerText = item.kanji || item.kana;
  document.getElementById('fcBackKanaHead').innerText = `（${item.kana}）`;
  document.getElementById('fcBackHanviet').innerText = item.hanviet || 'TỪ VỰNG';

  document.getElementById('fcBackMeaningBox').innerHTML = renderBilingualBlock(item.meaningVi, item.meaningEn, {
    viClass: 'text-emerald-950 font-extrabold text-base sm:text-lg',
    enClass: 'text-indigo-800 font-bold text-sm sm:text-base'
  });

  if (item.collocations && item.collocations.length) {
    document.getElementById('fcBackCollocationsBox').classList.remove('hidden');
    document.getElementById('fcBackCollocationsBox').innerHTML = `
      <div class="text-[11px] font-extrabold uppercase text-slate-500 mb-1">${tUI('Cụm từ & Từ liên quan trong sách', 'Book Collocations & Related Words')}</div>
      <div class="space-y-1 text-xs">
        ${item.collocations.map((c) => `
          <div class="flex flex-wrap items-baseline gap-1.5">
            <span class="px-1.5 py-0.2 rounded bg-slate-200 text-slate-800 font-bold text-[10px]">${c.type}</span>
            <span class="font-jp font-bold text-slate-900">${c.jp}:</span>
            <span>${renderBilingualInline(c.vi, c.en)}</span>
          </div>
        `).join('')}
      </div>
    `;
  } else {
    document.getElementById('fcBackCollocationsBox').classList.add('hidden');
  }

  document.getElementById('fcBackExamplesBox').innerHTML = `
    <div class="text-[11px] font-extrabold uppercase text-slate-500 mb-1">${tUI('Câu ví dụ chuẩn sách', 'Book Example Sentences')}</div>
    ${(item.examples || []).map((ex) => `
      <div class="space-y-0.5 border-b last:border-b-0 border-slate-100 pb-1.5 last:pb-0">
        <div class="text-xs sm:text-sm font-bold font-jp text-slate-900">・${ex.jp}</div>
        <div class="text-xs pl-3">${renderBilingualInline(ex.vi, ex.en)}</div>
      </div>
    `).join('')}
  `;

  if (item.noteVi || item.noteEn) {
    document.getElementById('fcBackNoteBox').classList.remove('hidden');
    document.getElementById('fcBackNoteBox').innerHTML = `
      <div class="font-extrabold text-amber-900 mb-0.5 flex items-center gap-1.5">
        <i class="fa-solid fa-triangle-exclamation text-amber-600"></i>
        <span>${tUI('Lưu ý dễ sai / Bẫy thi', 'Exam Trap / Usage Note')}</span>
      </div>
      <div>${renderBilingualInline(item.noteVi, item.noteEn)}</div>
    `;
  } else {
    document.getElementById('fcBackNoteBox').classList.add('hidden');
  }
}

function renderKanjiFlashcard(item, maskClass) {
  // FRONT
  document.getElementById('fcFrontBadge').innerText = `Kanji #${item.id} (${item.day}日目)`;
  document.getElementById('fcFrontPos').innerText = `${item.strokes || ''}画`;
  document.getElementById('fcFrontPageBtn').innerHTML = `<i class="fa-regular fa-file-lines mr-1"></i>Trang ${item.page || 12}`;

  const readingEl = document.getElementById('fcFrontReading');
  readingEl.className = `text-sm sm:text-base font-bold text-amber-700 font-jp tracking-wide ${maskClass}`;
  readingEl.innerText = `音: ${item.onyomi || '-'}　｜　訓: ${item.kunyomi || '-'}`;

  document.getElementById('fcFrontMain').innerText = item.kanji;
  document.getElementById('fcFrontSubJp').innerHTML = `<span class="inline-block text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">${item.hanviet || ''}</span>`;

  const compFront = (item.compounds || []).map((c) => `
    <div class="flex items-center justify-between gap-2 text-xs sm:text-sm font-jp py-0.5">
      <div>
        <span class="font-black text-slate-900 text-sm sm:text-base">${c.word}</span>
        <span class="text-emerald-700 font-bold ml-2 ${maskClass}">（${c.reading}）</span>
      </div>
      <button onclick="event.stopPropagation(); speakText(${JSON.stringify(c.word)})" class="w-7 h-7 rounded-full bg-white border border-slate-200 text-emerald-600 shrink-0 flex items-center justify-center">
        <i class="fa-solid fa-volume-low text-xs"></i>
      </button>
    </div>
  `).join('');

  document.getElementById('fcFrontExamples').innerHTML = `
    <div class="text-[11px] font-bold text-slate-400 uppercase mb-1">${tUI('Từ ghép chuẩn sách Soumatome', 'Book Vocabulary Words')}</div>
    <div class="divide-y divide-slate-200/60">${compFront}</div>
  `;

  // BACK
  document.getElementById('fcBackJpHead').innerText = item.kanji;
  document.getElementById('fcBackKanaHead').innerText = `${item.onyomi !== '-' ? item.onyomi : ''} ${item.kunyomi !== '-' ? item.kunyomi : ''}`.trim();
  document.getElementById('fcBackHanviet').innerText = item.hanviet || 'KANJI';

  document.getElementById('fcBackMeaningBox').innerHTML = renderBilingualBlock(item.meaningVi, item.meaningEn, {
    viClass: 'text-emerald-950 font-extrabold text-base sm:text-lg',
    enClass: 'text-indigo-800 font-bold text-sm sm:text-base'
  });

  document.getElementById('fcBackCollocationsBox').classList.remove('hidden');
  document.getElementById('fcBackCollocationsBox').innerHTML = `
    <div class="text-[11px] font-extrabold uppercase text-slate-500 mb-1">${tUI('Nghĩa các từ ghép trong sách', 'Book Compounds & Meanings')}</div>
    <div class="space-y-1.5 text-xs sm:text-sm">
      ${(item.compounds || []).map((c) => `
        <div class="flex flex-wrap items-baseline justify-between gap-1 border-b last:border-b-0 border-slate-200/60 pb-1 last:pb-0">
          <div class="font-jp"><b class="text-slate-900">${c.word}</b> <span class="text-emerald-700 font-semibold">(${c.reading})</span></div>
          <div class="text-right">${renderBilingualInline(c.vi, c.en)}</div>
        </div>
      `).join('')}
    </div>
  `;

  if (item.introPhrases && item.introPhrases.length) {
    document.getElementById('fcBackExamplesBox').classList.remove('hidden');
    document.getElementById('fcBackExamplesBox').innerHTML = `
      <div class="text-[11px] font-extrabold uppercase text-slate-500 mb-1">${tUI('Biển báo / Cụm từ minh họa đầu trang', 'Illustration Signs on Page')}</div>
      ${item.introPhrases.map((p) => `
        <div class="text-xs space-y-0.5">
          <div class="font-jp font-bold text-slate-900">・${p.jp}</div>
          <div class="pl-3">${renderBilingualInline(p.vi, p.en)}</div>
        </div>
      `).join('')}
    `;
  } else {
    document.getElementById('fcBackExamplesBox').classList.add('hidden');
  }

  if (item.noteVi || item.noteEn) {
    document.getElementById('fcBackNoteBox').classList.remove('hidden');
    document.getElementById('fcBackNoteBox').innerHTML = `
      <div class="font-extrabold text-amber-900 mb-0.5 flex items-center gap-1.5">
        <i class="fa-solid fa-lightbulb text-amber-600"></i>
        <span>${tUI('Mẹo nhớ & Lưu ý dễ nhầm', 'Mnemonic & Confusing Kanji Note')}</span>
      </div>
      <div>${renderBilingualInline(item.noteVi, item.noteEn)}</div>
    `;
  } else {
    document.getElementById('fcBackNoteBox').classList.add('hidden');
  }
}

function renderBunpouFlashcard(item, maskClass) {
  // FRONT
  document.getElementById('fcFrontBadge').innerText = `Ngữ pháp #${item.num || item.id}`;
  document.getElementById('fcFrontPos').innerText = 'Unit 01';
  document.getElementById('fcFrontPageBtn').innerHTML = `<i class="fa-regular fa-file-lines mr-1"></i>Trang ${item.page || 7}`;

  const readingEl = document.getElementById('fcFrontReading');
  readingEl.className = 'text-xs sm:text-sm font-bold text-indigo-600 font-jp';
  readingEl.innerText = item.meaningJp ? `【意味】${item.meaningJp}` : '';

  document.getElementById('fcFrontMain').innerText = item.pattern;
  document.getElementById('fcFrontSubJp').innerHTML = `
    <div class="inline-block bg-indigo-50 border border-indigo-200 text-indigo-900 rounded-xl px-3 py-1 text-xs font-bold font-jp">
      【接続】${item.setsuzokuJp || ''}
    </div>
  `;

  const exFront = (item.examples || []).slice(0, 4).map((ex, idx) => `
    <div class="flex items-start justify-between gap-2 text-xs sm:text-sm font-jp text-slate-800">
      <div>
        <div class="font-bold">${idx + 1}. ${ex.jp}</div>
        ${ex.hira ? `<div class="text-[11px] text-slate-500 mt-0.5 ${maskClass}">${ex.hira}</div>` : ''}
      </div>
      <button onclick="event.stopPropagation(); speakText(${JSON.stringify(ex.jp)})" class="w-7 h-7 rounded-full bg-white border border-slate-200 text-indigo-600 shrink-0 flex items-center justify-center">
        <i class="fa-solid fa-volume-low text-xs"></i>
      </button>
    </div>
  `).join('');

  document.getElementById('fcFrontExamples').innerHTML = exFront;

  // BACK
  document.getElementById('fcBackJpHead').innerText = item.pattern;
  document.getElementById('fcBackKanaHead').innerText = item.meaningJp || '';
  document.getElementById('fcBackHanviet').innerText = `MẪU #${item.num || item.id}`;

  document.getElementById('fcBackMeaningBox').innerHTML = renderBilingualBlock(item.meaningVi, item.meaningEn, {
    viClass: 'text-emerald-950 font-extrabold text-sm sm:text-base',
    enClass: 'text-indigo-800 font-bold text-xs sm:text-sm'
  });

  document.getElementById('fcBackCollocationsBox').classList.remove('hidden');
  document.getElementById('fcBackCollocationsBox').innerHTML = `
    <div class="text-[11px] font-extrabold uppercase text-slate-500 mb-1">${tUI('Cấu trúc kết nối (接続)', 'Connection Rule (接続)')}</div>
    <div class="text-xs font-jp font-bold text-slate-900 mb-1">${item.setsuzokuJp || ''}</div>
    <div class="text-xs">${renderBilingualInline(item.setsuzokuVi, item.setsuzokuEn)}</div>
  `;

  let reviewHtml = '';
  if (item.reviewBox && item.reviewBox.items && item.reviewBox.items.length) {
    reviewHtml = `
      <div class="mt-2 pt-2 border-t border-slate-200">
        <div class="text-[11px] font-extrabold text-indigo-700 mb-1"><i class="fa-solid fa-rotate mr-1"></i>${item.reviewBox.title}</div>
        <div class="space-y-1">
          ${item.reviewBox.items.map((r) => `
            <div class="text-xs">
              <div class="font-jp font-semibold text-slate-800">${r.jp}</div>
              <div class="text-[11px] text-slate-600 pl-2">${renderBilingualInline(r.vi, r.en)}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  document.getElementById('fcBackExamplesBox').classList.remove('hidden');
  document.getElementById('fcBackExamplesBox').innerHTML = `
    <div class="text-[11px] font-extrabold uppercase text-slate-500 mb-1">${tUI('Toàn bộ ví dụ trong sách', 'All Book Examples')}</div>
    <div class="space-y-1.5">
      ${(item.examples || []).map((ex, i) => `
        <div class="text-xs border-b last:border-b-0 border-slate-100 pb-1.5 last:pb-0">
          <div class="font-jp font-bold text-slate-900">${i + 1}. ${ex.jp}</div>
          <div class="pl-3 mt-0.5">${renderBilingualInline(ex.vi, ex.en)}</div>
        </div>
      `).join('')}
    </div>
    ${reviewHtml}
  `;

  if (item.noteVi || item.noteEn) {
    document.getElementById('fcBackNoteBox').classList.remove('hidden');
    document.getElementById('fcBackNoteBox').innerHTML = `
      <div class="font-extrabold text-amber-900 mb-0.5 flex items-center gap-1.5">
        <i class="fa-solid fa-triangle-exclamation text-amber-600"></i>
        <span>${tUI('Lưu ý dễ sai / Phân biệt ngữ pháp', 'Grammar Comparison & Trap Note')}</span>
      </div>
      <div>${renderBilingualInline(item.noteVi, item.noteEn)}</div>
    `;
  } else {
    document.getElementById('fcBackNoteBox').classList.add('hidden');
  }
}

/* ==========================================================================
   6. QUICK REVIEW LIST VIEW (BẢNG ÔN NHANH)
   ========================================================================== */
function toggleListHideMeaning() {
  APP_STATE.listHideMeaning = !APP_STATE.listHideMeaning;
  const btn = document.getElementById('btnListHideMeaning');
  const lbl = document.getElementById('labelListHideMeaning');
  if (btn && lbl) {
    if (APP_STATE.listHideMeaning) {
      btn.className = 'text-xs font-bold px-3 py-2 rounded-xl border border-emerald-600 bg-emerald-600 text-white flex items-center gap-1.5';
      lbl.innerText = tUI('Đang ẩn nghĩa (Chạm để xem)', 'Meanings Hidden (Tap to peek)');
    } else {
      btn.className = 'text-xs font-bold px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 flex items-center gap-1.5';
      lbl.innerText = tUI('Ẩn nghĩa để dò', 'Hide Meanings');
    }
  }
  renderQuickList();
}

function renderQuickList() {
  const container = document.getElementById('quickListContainer');
  if (!container) return;
  const q = (document.getElementById('listSearchInput')?.value || '').trim().toLowerCase();

  const items = APP_STATE.fcList.filter((item) => {
    if (!q) return true;
    const blob = JSON.stringify(item).toLowerCase();
    return blob.includes(q);
  });

  if (!items.length) {
    container.innerHTML = `<div class="bg-white rounded-2xl p-6 text-center text-xs text-slate-500">${tUI('Không tìm thấy mục nào phù hợp.', 'No matching items found.')}</div>`;
    return;
  }

  const maskMeaningClass = APP_STATE.listHideMeaning ? 'hira-masked cursor-pointer' : '';

  container.innerHTML = items.map((item) => {
    const hard = isItemHard(APP_STATE.book, item.id);
    if (APP_STATE.book === 'goi') {
      return `
        <div class="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/80 space-y-2">
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-baseline gap-2 flex-wrap">
              <span class="text-xs font-mono font-bold text-slate-400">#${item.id}</span>
              <span class="text-lg font-black font-jp text-slate-900">${item.kanji || item.kana}</span>
              <span class="text-sm font-bold font-jp text-emerald-600">${item.kana}</span>
              ${item.hanviet ? `<span class="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-600">${item.hanviet}</span>` : ''}
            </div>
            <div class="flex items-center gap-1 shrink-0">
              <button onclick="speakText(${JSON.stringify(item.kanji || item.kana)})" class="w-8 h-8 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 flex items-center justify-center">
                <i class="fa-solid fa-volume-high text-xs"></i>
              </button>
              <button onclick="toggleItemHardById('goi', ${item.id})" class="w-8 h-8 rounded-full ${hard ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'} flex items-center justify-center">
                <i class="${hard ? 'fa-solid' : 'fa-regular'} fa-bookmark text-xs"></i>
              </button>
            </div>
          </div>
          <div onclick="this.classList.remove('hira-masked')" class="${maskMeaningClass} space-y-1.5">
            ${renderBilingualBlock(item.meaningVi, item.meaningEn, {
              viClass: 'text-slate-900 font-bold text-xs sm:text-sm',
              enClass: 'text-indigo-700 font-semibold text-xs'
            })}
            ${(item.examples || []).map((ex) => `
              <div class="text-xs text-slate-600 font-jp">・${ex.jp} <span class="font-sans text-slate-500">— ${renderBilingualInline(ex.vi, ex.en)}</span></div>
            `).join('')}
            ${(item.noteVi || item.noteEn) ? `<div class="text-[11px] bg-amber-50 text-amber-900 px-2.5 py-1.5 rounded-xl border border-amber-200"><i class="fa-solid fa-triangle-exclamation text-amber-600 mr-1"></i>${renderBilingualInline(item.noteVi, item.noteEn)}</div>` : ''}
          </div>
        </div>
      `;
    }

    if (APP_STATE.book === 'kanji') {
      return `
        <div class="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/80 space-y-2">
          <div class="flex items-start justify-between gap-2">
            <div class="flex items-center gap-2.5">
              <div class="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-2xl font-black font-jp text-slate-900 shrink-0">
                ${item.kanji}
              </div>
              <div>
                <div class="flex items-center gap-1.5">
                  <span class="text-xs font-extrabold text-amber-800">${item.hanviet}</span>
                  <span class="text-[11px] text-slate-400">• Ngày ${item.day} (Trang ${item.page})</span>
                </div>
                <div class="text-xs font-jp text-slate-600">音: <b>${item.onyomi}</b> / 訓: <b>${item.kunyomi}</b></div>
              </div>
            </div>
            <button onclick="toggleItemHardById('kanji', ${item.id})" class="w-8 h-8 rounded-full ${hard ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'} flex items-center justify-center">
              <i class="${hard ? 'fa-solid' : 'fa-regular'} fa-bookmark text-xs"></i>
            </button>
          </div>
          <div onclick="this.classList.remove('hira-masked')" class="${maskMeaningClass} space-y-1">
            ${renderBilingualBlock(item.meaningVi, item.meaningEn, {
              viClass: 'text-slate-900 font-bold text-xs sm:text-sm',
              enClass: 'text-indigo-700 font-semibold text-xs'
            })}
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
              ${(item.compounds || []).map((c) => `
                <div class="text-xs bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200/70">
                  <b class="font-jp text-slate-900">${c.word}</b> <span class="font-jp text-emerald-700">(${c.reading})</span>: ${renderBilingualInline(c.vi, c.en)}
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    }

    // Bunpou
    return `
      <div class="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/80 space-y-2">
        <div class="flex items-start justify-between gap-2">
          <div>
            <span class="text-xs font-extrabold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 mr-1.5">#${item.num || item.id}</span>
            <span class="text-base sm:text-lg font-black font-jp text-slate-900">${item.pattern}</span>
            <div class="text-xs font-jp text-indigo-700 font-semibold mt-0.5">【接続】${item.setsuzokuJp}</div>
          </div>
          <button onclick="toggleItemHardById('bunpou', ${item.id})" class="w-8 h-8 rounded-full ${hard ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-400'} flex items-center justify-center">
            <i class="${hard ? 'fa-solid' : 'fa-regular'} fa-bookmark text-xs"></i>
          </button>
        </div>
        <div onclick="this.classList.remove('hira-masked')" class="${maskMeaningClass} space-y-1.5">
          ${renderBilingualBlock(item.meaningVi, item.meaningEn, {
            viClass: 'text-slate-900 font-bold text-xs sm:text-sm',
            enClass: 'text-indigo-700 font-semibold text-xs'
          })}
          ${(item.examples || []).slice(0, 3).map((ex) => `
            <div class="text-xs text-slate-700 font-jp">・${ex.jp} <span class="font-sans text-slate-500">— ${renderBilingualInline(ex.vi, ex.en)}</span></div>
          `).join('')}
        </div>
      </div>
    `;
  }).join('') + renderExtraQuickListSections(maskMeaningClass, q);
}

function renderExtraQuickListSections(maskMeaningClass, q) {
  if (APP_STATE.book === 'goi') {
    const cols = getGoiData().columns || [];
    const matchedCols = cols.filter((c) => !q || JSON.stringify(c).toLowerCase().includes(q));
    if (!matchedCols.length) return '';
    return matchedCols.map((col) => `
      <div class="bg-emerald-50/60 rounded-2xl p-4 shadow-sm border border-emerald-200 space-y-2.5 mt-4">
        <div class="flex items-center justify-between gap-2">
          <div>
            <span class="text-[11px] font-extrabold px-2 py-0.5 rounded bg-emerald-600 text-white mr-1.5">${col.titleJp}</span>
            <span class="text-xs sm:text-sm font-extrabold text-emerald-950">${APP_STATE.lang === 'en' ? col.titleEn : col.titleVi}</span>
          </div>
          <button onclick="openPdfModalAtPage(${col.page || 15})" class="text-[11px] font-bold text-amber-700 hover:underline shrink-0">
            <i class="fa-regular fa-file-pdf mr-1"></i>Trang ${col.page || 15}
          </button>
        </div>
        <div class="divide-y divide-emerald-200/60 bg-white rounded-xl p-3 border border-emerald-100">
          ${(col.items || []).map((it) => `
            <div class="py-2 first:pt-0 last:pb-0 space-y-1">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs font-bold font-jp text-slate-700">${it.situationJp}</span>
                <span class="text-[11px] text-slate-500">${renderBilingualInline(it.situationVi, it.situationEn)}</span>
              </div>
              <div class="text-xs sm:text-sm font-black font-jp text-emerald-800">${it.exprJp}</div>
              <div onclick="this.classList.remove('hira-masked')" class="${maskMeaningClass} text-xs text-slate-700">
                ${renderBilingualInline(it.exprVi, it.exprEn)}
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('');
  }

  if (APP_STATE.book === 'bunpou') {
    const dict = getBunpouData().dictation || [];
    const matchedDict = dict.filter((d) => !q || JSON.stringify(d).toLowerCase().includes(q));
    if (!matchedDict.length) return '';
    return `
      <div class="bg-indigo-50/60 rounded-2xl p-4 shadow-sm border border-indigo-200 space-y-2.5 mt-4">
        <div class="flex items-center justify-between gap-2">
          <span class="text-xs sm:text-sm font-extrabold text-indigo-950">
            <i class="fa-solid fa-headphones mr-1.5 text-indigo-600"></i>${tUI('Unit 01 ディクテーション (Nghe - Điền từ Trang 12)', 'Unit 01 Dictation (Page 12)')}
          </span>
          <button onclick="openPdfModalAtPage(12)" class="text-[11px] font-bold text-amber-700 hover:underline">
            <i class="fa-regular fa-file-pdf mr-1"></i>Trang 12
          </button>
        </div>
        <div class="divide-y divide-indigo-100 bg-white rounded-xl p-3 border border-indigo-100">
          ${matchedDict.map((d) => `
            <div class="py-2 first:pt-0 last:pb-0 space-y-1">
              <div class="flex items-center justify-between gap-2">
                <span class="text-xs sm:text-sm font-bold font-jp text-slate-900">${d.num}. ${d.jpBlank}</span>
                <button onclick="speakText(${JSON.stringify(d.jpFull)})" class="w-7 h-7 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <i class="fa-solid fa-volume-high text-xs"></i>
                </button>
              </div>
              <div onclick="this.classList.remove('hira-masked')" class="${maskMeaningClass} text-xs space-y-0.5">
                <div class="font-jp font-extrabold text-emerald-700">→ Đáp án: ${d.answer}</div>
                <div class="text-slate-600">${renderBilingualInline(d.vi, d.en)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  return '';
}

/* ==========================================================================
   7. BOOK EXERCISES ENGINE (BÀI TẬP CHUẨN SÁCH + GIẢI THÍCH ĐÁP ÁN CHI TIẾT)
   ========================================================================== */
function getRawExercisesForCurrentBook() {
  if (APP_STATE.book === 'goi') return getGoiData().exercises || [];
  if (APP_STATE.book === 'kanji') return getKanjiData().exercises || [];
  return getBunpouData().exercises || [];
}

function buildFilteredQuizList() {
  const raw = getRawExercisesForCurrentBook();
  if (APP_STATE.quizSubFilter === 'all') {
    APP_STATE.quizList = [...raw];
  } else {
    APP_STATE.quizList = raw.filter((q) => (q.sectionVi || '') === APP_STATE.quizSubFilter);
  }
}

function selectQuizSubFilter(sec) {
  APP_STATE.quizSubFilter = sec;
  buildFilteredQuizList();
  renderQuizView();
}

function shuffleQuizQuestions() {
  for (let i = APP_STATE.quizList.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [APP_STATE.quizList[i], APP_STATE.quizList[j]] = [APP_STATE.quizList[j], APP_STATE.quizList[i]];
  }
  renderQuizView();
}

function resetQuizAnswers() {
  APP_STATE.quizList.forEach((q) => {
    delete APP_STATE.quizAnswers[q.id];
  });
  saveQuizAnswers();
  renderQuizView();
}

function handleQuizOptionSelect(qId, optIdx) {
  if (APP_STATE.quizAnswers[qId] !== undefined) return;
  APP_STATE.quizAnswers[qId] = optIdx;
  saveQuizAnswers();
  renderQuizView();
}

function renderQuizView() {
  const raw = getRawExercisesForCurrentBook();
  if (!APP_STATE.quizList.length && raw.length) {
    buildFilteredQuizList();
  }

  // Render section filter pills
  const sections = Array.from(new Set(raw.map((q) => q.sectionVi).filter(Boolean)));
  const subContainer = document.getElementById('quizSubFilterContainer');
  if (subContainer) {
    subContainer.innerHTML = [
      `<button onclick="selectQuizSubFilter('all')" class="px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition ${
        APP_STATE.quizSubFilter === 'all' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
      }">${tUI(`Tất cả (${raw.length})`, `All (${raw.length})`)}</button>`,
      ...sections.map((sec) => {
        const active = APP_STATE.quizSubFilter === sec;
        const sample = raw.find((r) => r.sectionVi === sec);
        const label = APP_STATE.lang === 'en' && sample?.sectionEn ? sample.sectionEn : sec;
        return `<button onclick="selectQuizSubFilter(${JSON.stringify(sec).replace(/"/g, '&quot;')})" class="px-3 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition ${
          active ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
        }">${label}</button>`;
      })
    ].join('');
  }

  // Score calculation
  let answeredCount = 0;
  let correctCount = 0;
  APP_STATE.quizList.forEach((q) => {
    const ans = APP_STATE.quizAnswers[q.id];
    if (ans !== undefined) {
      answeredCount++;
      const isCorrect = Array.isArray(q.correct) ? q.correct.includes(ans) : ans === q.correct;
      if (isCorrect) correctCount++;
    }
  });

  const scoreBadge = document.getElementById('quizScoreBadge');
  if (scoreBadge) {
    scoreBadge.innerText = `${tUI('Đúng', 'Score')}: ${correctCount} / ${answeredCount} (${APP_STATE.quizList.length})`;
  }

  const qContainer = document.getElementById('quizQuestionsContainer');
  if (!qContainer) return;

  qContainer.innerHTML = APP_STATE.quizList.map((q, idx) => {
    const userAns = APP_STATE.quizAnswers[q.id];
    const isAnswered = userAns !== undefined;
    const isCorrectAns = (optIdx) => Array.isArray(q.correct) ? q.correct.includes(optIdx) : optIdx === q.correct;

    const optionsHtml = (q.options || []).map((opt, oIdx) => {
      let btnStyle = 'border-slate-200 bg-slate-50/80 hover:bg-slate-100 text-slate-800';
      let iconHtml = '';

      if (isAnswered) {
        if (isCorrectAns(oIdx)) {
          btnStyle = 'border-emerald-500 bg-emerald-50 text-emerald-900 font-bold ring-1 ring-emerald-500';
          iconHtml = '<i class="fa-solid fa-circle-check text-emerald-600 text-sm shrink-0"></i>';
        } else if (oIdx === userAns) {
          btnStyle = 'border-rose-400 bg-rose-50 text-rose-800 font-semibold';
          iconHtml = '<i class="fa-solid fa-circle-xmark text-rose-500 text-sm shrink-0"></i>';
        } else {
          btnStyle = 'border-slate-200 bg-white text-slate-400 opacity-75';
        }
      }

      return `
        <button onclick="handleQuizOptionSelect('${q.id}', ${oIdx})" class="w-full text-left px-3.5 py-2.5 rounded-xl border-2 text-xs sm:text-sm font-jp transition flex items-center justify-between gap-2 ${btnStyle}">
          <span>${opt}</span>
          ${iconHtml}
        </button>
      `;
    }).join('');

    const secTitle = APP_STATE.lang === 'en' ? (q.sectionEn || q.sectionVi) : q.sectionVi;

    return `
      <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/90 space-y-3">
        <div class="flex items-center justify-between gap-2 text-[11px] font-bold text-slate-400">
          <span class="px-2 py-0.5 rounded bg-slate-100 text-slate-600 truncate">${secTitle || `Câu ${idx + 1}`}</span>
          ${q.page ? `<button onclick="openPdfModalAtPage(${q.page})" class="text-amber-700 hover:underline shrink-0"><i class="fa-regular fa-file-pdf mr-1"></i>Trang ${q.page}</button>` : ''}
        </div>

        <div class="text-sm sm:text-base font-bold font-jp text-slate-900 leading-relaxed">
          ${q.qJp}
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
          ${optionsHtml}
        </div>

        ${isAnswered ? `
          <div class="mt-2 p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200 space-y-2 text-xs sm:text-sm">
            <div class="flex items-center justify-between">
              <span class="font-extrabold text-emerald-900 flex items-center gap-1.5">
                <i class="fa-solid fa-lightbulb text-amber-500"></i>
                ${tUI('Giải thích chi tiết đáp án', 'Detailed Answer Explanation')}
              </span>
              <span class="text-[11px] font-extrabold px-2 py-0.5 rounded-full ${isCorrectAns(userAns) ? 'bg-emerald-200 text-emerald-900' : 'bg-rose-200 text-rose-900'}">
                ${isCorrectAns(userAns) ? tUI('Chính xác ✓', 'Correct ✓') : tUI('Chưa đúng ✗', 'Incorrect ✗')}
              </span>
            </div>

            ${(q.qVi || q.qEn) ? `
              <div class="bg-white/80 rounded-xl p-2.5 border border-emerald-100">
                <div class="text-[10px] font-extrabold uppercase text-slate-400 mb-0.5">${tUI('Dịch nghĩa câu hỏi', 'Sentence Translation')}</div>
                ${renderBilingualBlock(q.qVi, q.qEn, {
                  viClass: 'text-slate-800 font-semibold text-xs sm:text-sm',
                  enClass: 'text-indigo-700 font-medium text-xs'
                })}
              </div>
            ` : ''}

            <div class="space-y-1 pt-0.5">
              ${renderBilingualBlock(q.expVi, q.expEn, {
                viClass: 'text-emerald-950 font-medium text-xs sm:text-sm leading-relaxed',
                enClass: 'text-indigo-900 font-medium text-xs leading-relaxed'
              })}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }).join('');
}

/* ==========================================================================
   8. ORIGINAL PDF BOOK PAGE VIEWER & MODAL
   ========================================================================== */
function getPdfPagesForBook(book) {
  if (book === 'goi') return getGoiData().pdfPages || [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31];
  if (book === 'kanji') return getKanjiData().pdfPages || [11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25];
  return getBunpouData().pdfPages || [7, 8, 9, 10, 11, 12, 13, 14];
}

function getPdfImageUrl(book, pageNum) {
  const padded = String(pageNum).padStart(3, '0');
  return `./pdf_pages/${book}/page_${padded}.jpg`;
}

function renderPdfViewer() {
  const pages = getPdfPagesForBook(APP_STATE.book);
  if (!pages.includes(APP_STATE.currentPdfPage)) {
    APP_STATE.currentPdfPage = pages[0];
  }
  const select = document.getElementById('pdfPageSelect');
  if (select) {
    select.innerHTML = pages.map((p) => `<option value="${p}" ${p === APP_STATE.currentPdfPage ? 'selected' : ''}>Trang PDF ${p}</option>`).join('');
  }
  const img = document.getElementById('pdfPageImage');
  if (img) {
    img.src = getPdfImageUrl(APP_STATE.book, APP_STATE.currentPdfPage);
  }
}

function selectPdfPage(pageVal) {
  APP_STATE.currentPdfPage = Number(pageVal);
  renderPdfViewer();
}

function prevPdfPage() {
  const pages = getPdfPagesForBook(APP_STATE.book);
  const idx = pages.indexOf(APP_STATE.currentPdfPage);
  if (idx > 0) {
    APP_STATE.currentPdfPage = pages[idx - 1];
    renderPdfViewer();
  }
}

function nextPdfPage() {
  const pages = getPdfPagesForBook(APP_STATE.book);
  const idx = pages.indexOf(APP_STATE.currentPdfPage);
  if (idx >= 0 && idx < pages.length - 1) {
    APP_STATE.currentPdfPage = pages[idx + 1];
    renderPdfViewer();
  }
}

function openPdfModalForCurrentItem() {
  const item = APP_STATE.fcList[APP_STATE.fcIndex];
  const defaultPage = item?.page || getPdfPagesForBook(APP_STATE.book)[0];
  openPdfModalAtPage(defaultPage);
}

function openPdfModal() {
  openPdfModalAtPage(APP_STATE.currentPdfPage || getPdfPagesForBook(APP_STATE.book)[0]);
}

function openPdfModalAtPage(pageNum) {
  APP_STATE.modalPdfPage = Number(pageNum);
  const modal = document.getElementById('pdfModal');
  const img = document.getElementById('pdfModalImg');
  const num = document.getElementById('pdfModalPageNum');
  if (img) img.src = getPdfImageUrl(APP_STATE.book, APP_STATE.modalPdfPage);
  if (num) num.innerText = `Trang ${APP_STATE.modalPdfPage}`;
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  }
}

function stepModalPdfPage(delta) {
  const pages = getPdfPagesForBook(APP_STATE.book);
  const idx = pages.indexOf(APP_STATE.modalPdfPage);
  const nextIdx = idx + delta;
  if (nextIdx >= 0 && nextIdx < pages.length) {
    openPdfModalAtPage(pages[nextIdx]);
  }
}

function closePdfModal() {
  const modal = document.getElementById('pdfModal');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
}

/* ==========================================================================
   9. AUDIO TTS & TOUCH SWIPE GESTURES
   ========================================================================== */
function toggleAudioSpeed() {
  APP_STATE.audioSpeed = APP_STATE.audioSpeed === 1.0 ? 0.75 : 1.0;
  const txt = document.getElementById('speedBtnText');
  if (txt) txt.innerText = `${APP_STATE.audioSpeed}x`;
}

function speakText(text) {
  if (!('speechSynthesis' in window) || !text) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text);
  utter.lang = 'ja-JP';
  utter.rate = APP_STATE.audioSpeed;
  window.speechSynthesis.speak(utter);
}

function speakCurrentItem() {
  const item = APP_STATE.fcList[APP_STATE.fcIndex];
  if (!item) return;
  if (APP_STATE.book === 'goi') {
    speakText(item.kanji || item.kana);
  } else if (APP_STATE.book === 'kanji') {
    const words = (item.compounds || []).map((c) => c.word).join('、');
    speakText(words || item.kanji);
  } else {
    const firstEx = item.examples?.[0]?.jp || item.pattern;
    speakText(firstEx);
  }
}

function initTouchSwipe() {
  const touchArea = document.getElementById('fcTouchArea');
  if (!touchArea) return;
  let startX = 0;
  let startY = 0;

  touchArea.addEventListener('touchstart', (e) => {
    if (!e.touches || !e.touches.length) return;
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
  }, { passive: true });

  touchArea.addEventListener('touchend', (e) => {
    if (!e.changedTouches || !e.changedTouches.length) return;
    const dx = e.changedTouches[0].clientX - startX;
    const dy = e.changedTouches[0].clientY - startY;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.4) {
      if (dx < 0) nextFlashcard();
      else prevFlashcard();
    }
  }, { passive: true });
}

/* ==========================================================================
   10. INITIALIZATION
   ========================================================================== */
window.addEventListener('DOMContentLoaded', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
  initTouchSwipe();
  buildFilteredStudyList();
  buildFilteredQuizList();
  updateHeaderAndNavLabels();
  renderUnitTabs();
  renderScopePills();
  renderCurrentView();
});
