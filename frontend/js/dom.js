// ==============================================================================
// DOM Helpers & UI Utilities (frontend/js/dom.js)
// Demonstrates explicit, safe direct DOM manipulation for academic evaluation
// ==============================================================================

/**
 * Returns the CSS class for styling category badges
 * @param {string} category
 * @returns {string}
 */
function getCategoryBadgeClass(category) {
  if (!category) return 'badge-other';
  const cat = category.toLowerCase();
  if (cat.includes('tech') || cat.includes('code')) return 'badge-tech';
  if (cat.includes('cultur') || cat.includes('art') || cat.includes('dance')) return 'badge-cultural';
  if (cat.includes('sport') || cat.includes('fit')) return 'badge-sports';
  if (cat.includes('acad') || cat.includes('debat') || cat.includes('research')) return 'badge-academic';
  if (cat.includes('social') || cat.includes('green') || cat.includes('enviro')) return 'badge-social';
  if (cat.includes('media') || cat.includes('journal')) return 'badge-media';
  return 'badge-other';
}

/**
 * Renders an alert/toast message dynamically into a container
 * Uses: document.createElement, element.classList, element.textContent, element.appendChild, element.addEventListener
 * @param {HTMLElement|string} target
 * @param {string} message
 * @param {'success'|'danger'|'info'} type
 */
function showAlert(target, message, type = 'info') {
  const container = typeof target === 'string' ? document.querySelector(target) : target;
  if (!container) return;

  // Create alert box
  const alertDiv = document.createElement('div');
  alertDiv.classList.add('alert', `alert-${type}`);

  // Message span - textContent prevents XSS injection
  const msgSpan = document.createElement('span');
  msgSpan.textContent = message;
  alertDiv.appendChild(msgSpan);

  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.classList.add('alert-close');
  closeBtn.textContent = '×';
  closeBtn.setAttribute('aria-label', 'Close message');
  closeBtn.addEventListener('click', () => {
    alertDiv.remove();
  });
  alertDiv.appendChild(closeBtn);

  // Clear existing alerts and append new one using replaceChildren
  container.replaceChildren(alertDiv);

  // Auto-scroll into view if needed
  alertDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Renders a loading spinner state in a container
 * Uses: document.createElement, element.classList, element.textContent, element.replaceChildren
 * @param {HTMLElement|string} target
 * @param {string} text
 */
function showLoading(target, text = 'Loading data from server...') {
  const container = typeof target === 'string' ? document.querySelector(target) : target;
  if (!container) return;

  const box = document.createElement('div');
  box.classList.add('loading-box');

  const spinner = document.createElement('div');
  spinner.classList.add('spinner');

  const label = document.createElement('p');
  label.textContent = text;

  box.appendChild(spinner);
  box.appendChild(label);

  // replaceChildren removes all previous children safely
  container.replaceChildren(box);
}

/**
 * Renders an empty state message when no items are available
 * Uses: document.createElement, element.classList, element.textContent, element.replaceChildren
 * @param {HTMLElement|string} target
 * @param {string} title
 * @param {string} description
 * @param {{text: string, href: string}} [actionBtn]
 */
function showEmptyState(target, title, description, actionBtn) {
  const container = typeof target === 'string' ? document.querySelector(target) : target;
  if (!container) return;

  const emptyDiv = document.createElement('div');
  emptyDiv.classList.add('empty-state');

  const icon = document.createElement('div');
  icon.classList.add('empty-state-icon');
  icon.textContent = '📂';
  emptyDiv.appendChild(icon);

  const heading = document.createElement('h3');
  heading.classList.add('empty-state-title');
  heading.textContent = title;
  emptyDiv.appendChild(heading);

  const desc = document.createElement('p');
  desc.classList.add('empty-state-text');
  desc.textContent = description;
  emptyDiv.appendChild(desc);

  if (actionBtn) {
    const btn = document.createElement('a');
    btn.classList.add('btn', 'btn-primary');
    btn.href = actionBtn.href;
    btn.textContent = actionBtn.text;
    emptyDiv.appendChild(btn);
  }

  container.replaceChildren(emptyDiv);
}

/**
 * Displays a modal confirmation dialog dynamically
 * @param {string} title
 * @param {string} message
 * @param {string} confirmText
 * @param {Function} onConfirm
 */
function showConfirmModal(title, message, confirmText, onConfirm) {
  // Modal backdrop
  const backdrop = document.createElement('div');
  backdrop.classList.add('modal-backdrop');

  // Modal box
  const modalBox = document.createElement('div');
  modalBox.classList.add('modal-box');

  // Title
  const heading = document.createElement('h3');
  heading.classList.add('modal-title');
  heading.textContent = title;
  modalBox.appendChild(heading);

  // Message
  const bodyText = document.createElement('p');
  bodyText.classList.add('modal-text');
  bodyText.textContent = message;
  modalBox.appendChild(bodyText);

  // Actions row
  const actions = document.createElement('div');
  actions.classList.add('modal-actions');

  // Cancel button
  const cancelBtn = document.createElement('button');
  cancelBtn.classList.add('btn', 'btn-secondary');
  cancelBtn.textContent = 'Cancel';
  cancelBtn.addEventListener('click', () => {
    backdrop.remove();
  });

  // Confirm delete button
  const confirmBtn = document.createElement('button');
  confirmBtn.classList.add('btn', 'btn-danger');
  confirmBtn.textContent = confirmText;
  confirmBtn.addEventListener('click', async () => {
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Deleting...';
    try {
      await onConfirm();
    } finally {
      backdrop.remove();
    }
  });

  actions.appendChild(cancelBtn);
  actions.appendChild(confirmBtn);
  modalBox.appendChild(actions);

  backdrop.appendChild(modalBox);
  document.body.appendChild(backdrop);
}
