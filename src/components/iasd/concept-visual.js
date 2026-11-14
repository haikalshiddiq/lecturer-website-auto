import inventory from '../../data/iasd-visuals.json';

const escapeHTML = value => String(value ?? '').replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));

// HTML keeps diagram labels at reading size when a narrow screen reflows the trace.
export function conceptVisual(lesson) {
  const visual = inventory.find(item => item.lesson === lesson.n);
  if (!visual) return '';
  const id = `iasd-concept-${lesson.n}`;
  const e = escapeHTML;
  let diagram;
  if (visual.type === 'matrix') {
    diagram = `<div class="concept-matrix"><table><caption>${e(visual.title)}</caption><thead><tr>${visual.headers.map(header => `<th scope="col">${e(header)}</th>`).join('')}</tr></thead><tbody>${visual.rows.map(row => `<tr>${row.map((cell, index) => index === 0 ? `<th scope="row">${e(cell)}</th>` : `<td>${e(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  } else if (visual.type === 'boundary' && lesson.n === 4) {
    const [customer, system, provider, database] = visual.nodes;
    const node = ([name, detail]) => `<div><strong>${e(name)}</strong><span>${e(detail)}</span></div>`;
    diagram = `<div class="concept-boundary"><div class="boundary-actors">${node(customer)}${node(provider)}</div><p class="boundary-link">interaksi dengan tujuan checkout ↕</p><section aria-label="Di dalam aplikasi Aruna"><h4>Batas aplikasi Aruna</h4>${node(system)}${node(database)}</section></div>`;
  } else {
    diagram = `<ol class="concept-trace concept-trace-${e(visual.type)}" aria-label="${e(visual.title)}">${visual.nodes.map(([name, detail], index) => `<li><span class="trace-index" aria-hidden="true">${index + 1}</span><strong>${e(name)}</strong><span>${e(detail)}</span>${visual.type === 'structure' && index < visual.nodes.length - 1 ? `<small class="structure-relation">${index === 0 ? 'Order 1 ↔ 0..* item (draft)' : 'Item 0..* ↔ 1 Product'}</small>` : ''}</li>`).join('')}</ol>`;
  }
  return `<figure class="course-visual" data-course-visual="iasd" data-lesson-id="${lesson.n}" data-visual-type="${e(visual.type)}" role="group" aria-labelledby="${id}-title" aria-describedby="${id}-desc ${id}-cause">
    <header><p class="small">Peta konsep · S${String(lesson.n).padStart(2, '0')}</p><h3 id="${id}-title">${e(visual.title)}</h3><p id="${id}-desc">${e(visual.description)}</p></header>
    ${diagram}
    <p class="visual-legend"><b>Cara baca:</b> ${e(visual.legend)}</p>
    <figcaption id="${id}-cause"><b>Mengapa demikian?</b> ${e(visual.cause)}</figcaption>
    <details class="visual-equivalent"><summary>Baca hubungan konsep sebagai teks</summary><ul>${visual.edges.map(edge => `<li>${e(edge)}</li>`).join('')}</ul></details>
    <div class="visual-test"><p><b>Prediksi sebelum mencoba:</b> ${e(visual.prompt)}</p><button type="button" data-act="visualtest" data-visual-target="${e(visual.target)}" aria-controls="sim-controls">Uji hubungan ini di simulator</button></div>
  </figure>`;
}
