// Aggregates every category into one flat list + a category directory
window.KobitaAllTemplates = Object.values(window.KobitaTemplates).flat();

window.KobitaCategories = window.KobitaAllTemplates.reduce((acc, t) => {
  if (!acc.find(c => c.key === t.category)) {
    acc.push({ key: t.category, nameBn: t.categoryNameBn, nameEn: t.categoryNameEn });
  }
  return acc;
}, []);
