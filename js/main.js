/* main.js — wires the templates/palettes/fonts into a working editor,
   plus the Text->PDF and Image->PDF tools. */
(function () {
  const state = {
    tool: 'poster',
    category: window.KobitaCategories[0].key,
    template: null,
    palette: window.KobitaPalettes[0],
    font: window.KobitaFonts[0],
    fontSize: 28,
    query: ''
  };

  const SAMPLE_POEM_BY_CAT = {
    sahitya: 'কলমের ডগায় জমে থাকা কথাগুলো\nআজ কাগজে ঝরে পড়ুক নির্ভয়ে।',
    gram: 'ধানক্ষেতের বুক চিরে সবুজ পথ,\nমেঠো বাতাসে ভেসে আসে মায়ের ডাক।',
    city: 'কংক্রিটের বনে হারিয়ে যাওয়া পায়ের ছাপ,\nনিয়ন আলোয় লেখা থাকে একলা রাতের গল্প।',
    nature: 'পাহাড়ের কোলে ঘুমিয়ে থাকা মেঘ,\nনদীর জলে ভাসে রোদের প্রথম আলো।',
    romantic: 'তোমার নামটা লিখেছি হৃদয়ের প্রথম পাতায়,\nভালোবাসা মানে তো তুমি, শুধু তুমি।',
    motivational: 'হার মানা মানে থেমে যাওয়া নয়,\nআবার নতুন করে শুরু করার নামই সাহস।',
    religious: 'নিঃশব্দ প্রার্থনায় মিশে থাকে বিশ্বাসের আলো,\nঅন্তরের অন্ধকারে সে আলোই পথ দেখায়।',
    historical: 'পুরনো পাণ্ডুলিপির পাতায় লেখা আছে আমাদের শিকড়,\nসময় বদলায়, কিন্তু ইতিহাস কথা বলে যায়।'
  };

  // ---------------- Google Fonts loader (once) ----------------
  (function loadFonts() {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?' + [
      'family=Tiro+Bangla',
      'family=Noto+Serif+Bengali:wght@400;600',
      'family=Noto+Sans+Bengali:wght@400;500;700',
      'family=Hind+Siliguri:wght@400;500;600;700',
      'family=Baloo+Da+2:wght@500;600;700',
      'family=Atma:wght@400;500;600'
    ].join('&') + '&display=swap';
    document.head.appendChild(link);
  })();

  // ---------------- Top nav / tools ----------------
  const toolButtons = document.querySelectorAll('.tools-nav button');
  toolButtons.forEach(btn => btn.addEventListener('click', () => {
    toolButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.tool = btn.dataset.tool;
    document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-' + state.tool).classList.add('active');
    document.getElementById('sidebar-categories').style.display = state.tool === 'poster' ? '' : 'none';
  }));

  document.getElementById('templateCount').innerHTML =
    `<b>${window.KobitaAllTemplates.length.toLocaleString()}</b> structures × <b>${window.KobitaPalettes.length}</b> palettes × <b>${window.KobitaFonts.length}</b> fonts = <b>${(window.KobitaAllTemplates.length * window.KobitaPalettes.length * window.KobitaFonts.length).toLocaleString()}+</b> styles`;

  // ---------------- Sidebar categories ----------------
  const catList = document.getElementById('catList');
  window.KobitaCategories.forEach(cat => {
    const el = document.createElement('button');
    el.className = 'cat-item' + (cat.key === state.category ? ' active' : '');
    el.innerHTML = `<span>${cat.nameBn}</span><span class="en">${cat.nameEn}</span>`;
    el.addEventListener('click', () => {
      state.category = cat.key;
      document.querySelectorAll('.cat-item').forEach(c => c.classList.remove('active'));
      el.classList.add('active');
      renderGrid();
    });
    catList.appendChild(el);
  });

  // ---------------- Template grid ----------------
  const grid = document.getElementById('tplGrid');
  function renderGrid() {
    grid.innerHTML = '';
    const items = window.KobitaAllTemplates.filter(t => {
      const matchCat = t.category === state.category;
      const matchQuery = !state.query || t.decorationName.includes(state.query) || t.frameName.includes(state.query);
      return matchCat && matchQuery;
    });
    items.forEach(t => {
      const card = document.createElement('div');
      card.className = `tpl-card frame-${t.frame}`;
      card.style.background = state.palette.bg;
      card.style.color = state.palette.text;
      card.innerHTML = `
        <span class="num">#${t.n}</span>
        <span class="glyph">${t.decorationGlyph}</span>
        <span class="lbl">${t.decorationName}<br>${t.frameName}</span>
      `;
      card.addEventListener('click', () => openEditor(t));
      grid.appendChild(card);
    });
  }
  document.getElementById('tplSearch').addEventListener('input', (e) => {
    state.query = e.target.value.trim();
    renderGrid();
  });
  document.getElementById('shuffleBtn').addEventListener('click', () => {
    const pool = window.KobitaAllTemplates.filter(t => t.category === state.category);
    const t = pool[Math.floor(Math.random() * pool.length)];
    state.palette = window.KobitaPalettes[Math.floor(Math.random() * window.KobitaPalettes.length)];
    state.font = window.KobitaFonts[Math.floor(Math.random() * window.KobitaFonts.length)];
    openEditor(t);
  });

  // ---------------- Editor ----------------
  const gridView = document.getElementById('gridView');
  const editorView = document.getElementById('editorView');
  const poster = document.getElementById('stagePoster');
  const poemEl = document.getElementById('poemText');
  const authorEl = document.getElementById('authorText');

  function openEditor(t) {
    state.template = t;
    poemEl.textContent = SAMPLE_POEM_BY_CAT[t.category] || SAMPLE_POEM_BY_CAT.sahitya;
    authorEl.textContent = 'কবির নাম';
    document.getElementById('backToGrid').dataset.cat = t.category;
    gridView.style.display = 'none';
    editorView.style.display = 'block';
    applyTemplate();
    buildPaletteSwatches();
    buildFontSelect();
  }
  document.getElementById('backToGrid').addEventListener('click', () => {
    editorView.style.display = 'none';
    gridView.style.display = 'block';
  });

  function applyTemplate() {
    const t = state.template, p = state.palette, f = state.font;
    poster.className = `stage-poster frame-${t.frame}`;
    poster.dataset.padding = t.padding;
    poster.dataset.align = t.align;
    poster.style.background = p.bg;
    poster.style.color = p.text;
    poster.style.fontFamily = f.css;
    poster.style.fontWeight = f.weight;
    document.getElementById('posterDeco').textContent = t.decorationGlyph;
    poemEl.style.fontSize = state.fontSize + 'px';
    document.getElementById('editorTitle').textContent = t.name;
  }

  function buildPaletteSwatches() {
    const wrap = document.getElementById('paletteSwatches');
    wrap.innerHTML = '';
    window.KobitaPalettes.forEach(p => {
      const sw = document.createElement('button');
      sw.className = 'swatch' + (p.id === state.palette.id ? ' active' : '');
      sw.style.background = p.bg;
      sw.title = p.name;
      sw.addEventListener('click', () => {
        state.palette = p;
        applyTemplate();
        document.querySelectorAll('#paletteSwatches .swatch').forEach(s => s.classList.remove('active'));
        sw.classList.add('active');
      });
      wrap.appendChild(sw);
    });
  }

  function buildFontSelect() {
    const sel = document.getElementById('fontSelect');
    sel.innerHTML = '';
    window.KobitaFonts.forEach(f => {
      const opt = document.createElement('option');
      opt.value = f.id;
      opt.textContent = f.name;
      if (f.id === state.font.id) opt.selected = true;
      sel.appendChild(opt);
    });
  }
  document.getElementById('fontSelect').addEventListener('change', (e) => {
    state.font = window.KobitaFonts.find(f => f.id === e.target.value);
    applyTemplate();
  });
  document.getElementById('fontSizeRange').addEventListener('input', (e) => {
    state.fontSize = e.target.value;
    poemEl.style.fontSize = state.fontSize + 'px';
  });

  document.getElementById('downloadPng').addEventListener('click', () => {
    window.KobitaPDF.posterToPng(poster, `${state.template.id}.png`);
  });
  document.getElementById('downloadPdf').addEventListener('click', () => {
    window.KobitaPDF.posterToPdf(poster, `${state.template.id}.pdf`);
  });

  renderGrid();

  // ---------------- Text -> PDF ----------------
  const docPreview = document.getElementById('docPreview');
  const docTitle = document.getElementById('docTitle');
  const docBody = document.getElementById('docBody');
  const docTheme = document.getElementById('docTheme');

  window.KobitaPalettes.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id;
    opt.textContent = p.name;
    docTheme.appendChild(opt);
  });

  function renderDocPreview() {
    const theme = window.KobitaPalettes.find(p => p.id === docTheme.value) || window.KobitaPalettes[0];
    docPreview.querySelector('h2').textContent = docTitle.value || 'শিরোনাম';
    docPreview.querySelector('.body-text').textContent = docBody.value || 'এখানে আপনার লেখা দেখাবে...';
    docPreview.querySelector('h2').style.color = theme.accent;
    docPreview.querySelector('.rule').style.background = theme.line;
  }
  [docTitle, docBody, docTheme].forEach(el => el.addEventListener('input', renderDocPreview));
  renderDocPreview();

  document.getElementById('generateTextPdf').addEventListener('click', () => {
    window.KobitaPDF.textToPdf(docPreview, (docTitle.value || 'document') + '.pdf');
  });

  // ---------------- Image -> PDF ----------------
  const imgInput = document.getElementById('imgInput');
  const imgList = document.getElementById('imgList');
  let images = [];

  document.getElementById('imgDrop').addEventListener('click', () => imgInput.click());
  imgInput.addEventListener('change', (e) => handleFiles(e.target.files));

  function handleFiles(files) {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          images.push({ dataUrl: e.target.result, width: img.width, height: img.height, name: file.name });
          renderImgList();
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function renderImgList() {
    imgList.innerHTML = '';
    if (!images.length) {
      imgList.innerHTML = '<div class="empty-note">এখনো কোনো ছবি যোগ করা হয়নি</div>';
      return;
    }
    images.forEach((img, i) => {
      const row = document.createElement('div');
      row.className = 'img-row';
      row.innerHTML = `
        <img src="${img.dataUrl}" alt="">
        <span class="name">${img.name}</span>
        <button data-act="up">↑</button>
        <button data-act="down">↓</button>
        <button data-act="del">✕</button>
      `;
      row.querySelector('[data-act="up"]').addEventListener('click', () => { if (i>0){[images[i-1],images[i]]=[images[i],images[i-1]]; renderImgList();} });
      row.querySelector('[data-act="down"]').addEventListener('click', () => { if (i<images.length-1){[images[i+1],images[i]]=[images[i],images[i+1]]; renderImgList();} });
      row.querySelector('[data-act="del"]').addEventListener('click', () => { images.splice(i,1); renderImgList(); });
      imgList.appendChild(row);
    });
  }
  renderImgList();

  document.getElementById('generateImgPdf').addEventListener('click', () => {
    if (!images.length) return;
    const pageSize = document.getElementById('imgPageSize').value;
    const orientation = document.getElementById('imgOrientation').value;
    window.KobitaPDF.imagesToPdf(images, { pageSize, orientation, filename: 'images.pdf' });
  });
})();
