/*
  template-builder.js
  ---------------------------------------------------------------
  Shared factory used by every file in js/templates/*.js
  A "template" here is a STRUCTURE (decoration + frame + alignment
  + padding). Colour comes later from a palette (js/palettes.js)
  and typeface from a font (js/fonts.js). Structure x Palette x Font
  is what gets you from ~70 hand-designed structures per category
  to 1000+ real, visually distinct results without faking a
  thousand hand-drawn designs.
*/
(function () {
  const FRAMES = [
    { id: 'none',       name: 'ফ্রেমহীন' },
    { id: 'double',     name: 'দ্বৈত রেখা' },
    { id: 'dashed',     name: 'ড্যাশ বর্ডার' },
    { id: 'shadowbox',  name: 'শ্যাডো বক্স' },
    { id: 'cornercut',  name: 'কাটা কোণ' },
    { id: 'vintage',    name: 'ভিন্টেজ' }
  ];
  const ALIGNS = ['center', 'left'];
  const PADDINGS = [
    { id: 'normal', name: 'স্বাভাবিক' },
    { id: 'wide',   name: 'প্রশস্ত' }
  ];

  window.buildCategoryTemplates = function (catKey, catNameBn, catNameEn, decorations) {
    const list = [];
    let i = 1;
    decorations.forEach((dec) => {
      FRAMES.forEach((fr) => {
        ALIGNS.forEach((al) => {
          PADDINGS.forEach((pd) => {
            list.push({
              id: `${catKey}-${dec.id}-${fr.id}-${al}-${pd.id}`,
              category: catKey,
              categoryNameBn: catNameBn,
              categoryNameEn: catNameEn,
              name: `${catNameBn} · ${dec.name} · ${fr.name}`,
              decoration: dec.id,
              decorationName: dec.name,
              decorationGlyph: dec.glyph,
              frame: fr.id,
              frameName: fr.name,
              align: al,
              padding: pd.id,
              n: i++
            });
          });
        });
      });
    });
    return list;
  };
})();
