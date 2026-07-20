(function () {
  const data = window.ACADEMY_DATA;
  const lessons = data.lessons;
  const lessonMap = new Map(lessons.map((lesson) => [lesson.id, lesson]));
  const cardsEl = document.querySelector('[data-lesson-grid]');
  const modalEl = document.querySelector('[data-modal]');
  const modalPanelEl = document.querySelector('[data-modal-panel]');
  let activeLessonId = null;

  function getSavedReads() {
    try {
      return JSON.parse(localStorage.getItem('academyReadLessons') || '[]');
    } catch (error) {
      return [];
    }
  }

  function saveRead(id) {
    const reads = new Set(getSavedReads());
    reads.add(id);
    localStorage.setItem('academyReadLessons', JSON.stringify([...reads]));
  }

  function renderCards() {
    const reads = new Set(getSavedReads());
    cardsEl.innerHTML = lessons.map((lesson) => `
      <button class="lesson-card inner-panel" data-lesson-id="${lesson.id}" aria-label="Open ${lesson.title}">
        <span class="lesson-number">${lesson.number}</span>
        <img class="lesson-icon" src="${lesson.icon}" alt="" />
        <span class="lesson-title">${lesson.title}</span>
        <span class="lesson-card-text">${lesson.cardDescription || lesson.cardText || lesson.openingLine}</span>
        <span class="lesson-status">${reads.has(lesson.id) ? 'Read' : 'Start Lesson'}</span>
      </button>
    `).join('');

    cardsEl.querySelectorAll('[data-lesson-id]').forEach((card) => {
      card.addEventListener('click', () => openLesson(card.dataset.lessonId));
    });
  }

  function asArray(value) {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }

  function renderParagraphs(items) {
    return asArray(items).map((item) => `<p>${item}</p>`).join('');
  }

  function renderList(items) {
    const list = asArray(items);
    if (!list.length) return '';
    return `<ul>${list.map((item) => `<li>${item}</li>`).join('')}</ul>`;
  }

  function renderKeyValueObject(object) {
    if (!object || typeof object !== 'object') return '';
    return Object.entries(object).map(([key, value]) => {
      const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase());
      if (Array.isArray(value)) {
        return `<div class="academy-data-row"><dt>${label}</dt><dd>${value.join(', ')}</dd></div>`;
      }
      if (value && typeof value === 'object') {
        return `<div class="academy-data-row"><dt>${label}</dt><dd>${renderKeyValueObject(value)}</dd></div>`;
      }
      return `<div class="academy-data-row"><dt>${label}</dt><dd>${value}</dd></div>`;
    }).join('');
  }

  function renderLecture(lesson) {
    return `
      <section class="lesson-section lesson-section-wide">
        <span class="section-label">Lecture</span>
        ${lesson.lecture.map((section) => `
          <article class="lecture-block">
            <h3>${section.heading}</h3>
            ${renderParagraphs(section.body)}
          </article>
        `).join('')}
      </section>
    `;
  }

  function renderFramework(lesson) {
    if (!lesson.framework) return '';
    return `
      <section class="lesson-section">
        <span class="section-label">Framework</span>
        <h3>${lesson.framework.title}</h3>
        ${renderList(lesson.framework.steps)}
      </section>
    `;
  }

  function renderExample(lesson) {
    const example = lesson.indischeExample || lesson.example;
    if (!example) return '';
    return `
      <section class="lesson-section">
        <span class="section-label">Indische Example</span>
        <h3>${example.title}</h3>
        ${example.description ? `<p>${example.description}</p>` : ''}
        ${renderList(example.details)}
        ${example.rows ? `<dl>${example.rows.map((row) => `<div class="academy-data-row"><dt>${row.label}</dt><dd>${row.value}</dd></div>`).join('')}</dl>` : ''}
        ${example.structure ? `<dl>${renderKeyValueObject(example.structure)}</dl>` : ''}
        ${example.brief ? `<dl>${renderKeyValueObject(example.brief)}</dl>` : ''}
      </section>
    `;
  }

  function renderGuides(lesson) {
    const guides = lesson.familyGuide || lesson.materialGuide;
    if (!guides) return '';
    return `
      <section class="lesson-section lesson-section-wide">
        <span class="section-label">${lesson.familyGuide ? 'Family Guide' : 'Material Guide'}</span>
        <div class="academy-guide-grid">
          ${guides.map((item) => `
            <article class="guide-card">
              <h3>${item.family || item.name}</h3>
              <dl>${renderKeyValueObject(Object.fromEntries(Object.entries(item).filter(([key]) => key !== 'family' && key !== 'name')))}</dl>
            </article>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderMistakes(lesson) {
    if (!lesson.commonMistakes) return '';
    return `
      <section class="lesson-section">
        <span class="section-label">Common Mistakes</span>
        ${renderList(lesson.commonMistakes)}
      </section>
    `;
  }

  function renderExercise(lesson) {
    const exercise = lesson.miniExercise || { title: 'Mini Exercise', prompt: lesson.exercise };
    if (!exercise.prompt) return '';
    return `
      <section class="lesson-section">
        <span class="section-label">Mini Exercise</span>
        <h3>${exercise.title}</h3>
        <p>${exercise.prompt}</p>
        ${exercise.exampleAnswer ? `<p class="example-answer"><strong>Example:</strong> ${exercise.exampleAnswer}</p>` : ''}
      </section>
    `;
  }

  function renderCheckpoint(lesson) {
    if (!lesson.checkpoint) return '';
    return `
      <section class="lesson-section lesson-section-wide">
        <span class="section-label">Checkpoint</span>
        <div class="checkpoint-list">
          ${lesson.checkpoint.map((item) => `
            <details>
              <summary>${item.question}</summary>
              <p>${item.answer}</p>
            </details>
          `).join('')}
        </div>
      </section>
    `;
  }

  function renderTerms(lesson) {
    if (!lesson.keyTerms) return '';
    return `
      <section class="lesson-section">
        <span class="section-label">Key Terms</span>
        <div class="term-list">
          ${lesson.keyTerms.map((term) => `<span>${term}</span>`).join('')}
        </div>
      </section>
    `;
  }

  function renderModal(lesson) {
    const nextIsLesson = lesson.nextLesson && lessonMap.has(lesson.nextLesson);
    modalPanelEl.innerHTML = `
      <button class="modal-close" data-close-modal aria-label="Close lesson">x</button>
      <div class="modal-headerline">
        <span>Course ${lesson.number}</span>
      </div>
      <header class="expanded-lesson-header">
        <h2>${lesson.title}</h2>
        <p class="opening-line">${lesson.openingLine}</p>
        ${lesson.objective ? `<p class="lesson-objective">${lesson.objective}</p>` : ''}
      </header>

      <div class="expanded-lesson-content">
        ${renderLecture(lesson)}
        ${renderFramework(lesson)}
        ${renderExample(lesson)}
        ${renderGuides(lesson)}
        ${renderMistakes(lesson)}
        ${renderExercise(lesson)}
        ${renderCheckpoint(lesson)}
        ${renderTerms(lesson)}
      </div>

      <div class="modal-actions">
        <button type="button" class="secondary-button" data-back-academy>Back to Academy</button>
        <button type="button" class="secondary-button" data-prev-lesson ${lesson.previousLesson ? '' : 'disabled'}>Previous Lesson</button>
        <button type="button" class="primary-button" data-mark-read>Mark as Read</button>
        <button type="button" class="primary-button" data-next-lesson ${nextIsLesson ? '' : 'disabled'}>${nextIsLesson ? 'Next Lesson' : 'Course Complete'}</button>
      </div>
    `;

    modalPanelEl.querySelectorAll('[data-close-modal], [data-back-academy]').forEach((button) => {
      button.addEventListener('click', closeModal);
    });

    modalPanelEl.querySelector('[data-mark-read]').addEventListener('click', () => {
      saveRead(lesson.id);
      renderCards();
      modalPanelEl.querySelector('[data-mark-read]').textContent = 'Marked as Read';
    });

    const prev = modalPanelEl.querySelector('[data-prev-lesson]');
    const next = modalPanelEl.querySelector('[data-next-lesson]');
    if (lesson.previousLesson) prev.addEventListener('click', () => openLesson(lesson.previousLesson));
    if (nextIsLesson) next.addEventListener('click', () => openLesson(lesson.nextLesson));
  }

  function openLesson(id) {
    const lesson = lessonMap.get(id);
    if (!lesson) return;
    activeLessonId = id;
    renderModal(lesson);
    modalEl.classList.add('is-open');
    modalEl.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('modal-open');
  }

  function closeModal() {
    modalEl.classList.remove('is-open');
    modalEl.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('modal-open');
    activeLessonId = null;
  }

  modalEl.addEventListener('click', (event) => {
    if (event.target === modalEl) closeModal();
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modalEl.classList.contains('is-open')) closeModal();
    if (!activeLessonId) return;
    const activeLesson = lessonMap.get(activeLessonId);
    if (event.key === 'ArrowRight' && activeLesson.nextLesson && lessonMap.has(activeLesson.nextLesson)) openLesson(activeLesson.nextLesson);
    if (event.key === 'ArrowLeft' && activeLesson.previousLesson) openLesson(activeLesson.previousLesson);
  });

  renderCards();
})();
