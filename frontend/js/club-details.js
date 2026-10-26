// ==============================================================================
// Club Details Script (frontend/js/club-details.js)
// Reads club ID from URL, fetches GET /api/clubs/:id, and constructs detail view
// ==============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('club-details-container');
  const alertContainer = document.getElementById('details-alert');

  // 1. Read club ID from query string
  const urlParams = new URLSearchParams(window.location.search);
  const clubId = urlParams.get('id');

  if (!clubId) {
    showEmptyState(
      container,
      'No Club Selected',
      'Please select a club from the directory to view its full details.',
      { text: 'Browse Clubs Directory', href: 'clubs.html' }
    );
    return;
  }

  // 2. Fetch club from backend
  try {
    showLoading(container, 'Loading club details...');

    const response = await getClubById(clubId);
    const club = response.data;

    renderClubDetails(club);
  } catch (error) {
    console.error('[Club Details Error]:', error);
    showEmptyState(
      container,
      'Club Not Found',
      `Could not find club details: ${error.message}`,
      { text: 'Return to Clubs Directory', href: 'clubs.html' }
    );
  }

  /**
   * Constructs the full details presentation via safe DOM manipulation
   * @param {Object} club
   */
  function renderClubDetails(club) {
    const card = document.createElement('div');
    card.classList.add('details-card');

    // --- Header Section ---
    const header = document.createElement('div');
    header.classList.add('details-header');

    const titleGroup = document.createElement('div');
    const title = document.createElement('h1');
    title.classList.add('details-title');
    title.textContent = club.name;

    const badge = document.createElement('span');
    badge.classList.add('badge', getCategoryBadgeClass(club.category));
    badge.textContent = club.category;

    titleGroup.appendChild(title);
    titleGroup.appendChild(badge);

    const backLink = document.createElement('a');
    backLink.classList.add('btn', 'btn-secondary', 'btn-sm');
    backLink.href = 'clubs.html';
    backLink.textContent = '← All Clubs';

    header.appendChild(titleGroup);
    header.appendChild(backLink);

    // --- Meta Info Grid (President, Meeting Day, Meeting Time, Registered Date) ---
    const infoGrid = document.createElement('div');
    infoGrid.classList.add('details-info-grid');

    // Helper to create info items safely
    const createInfoItem = (label, value) => {
      const item = document.createElement('div');
      item.classList.add('info-item');

      const lbl = document.createElement('span');
      lbl.classList.add('info-label');
      lbl.textContent = label;

      const val = document.createElement('span');
      val.classList.add('info-value');
      val.textContent = value || 'N/A';

      item.appendChild(lbl);
      item.appendChild(val);
      return item;
    };

    const formattedDate = club.createdAt
      ? new Date(club.createdAt).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'N/A';

    infoGrid.appendChild(createInfoItem('Club President', club.president));
    infoGrid.appendChild(createInfoItem('Meeting Day', club.meetingDay));
    infoGrid.appendChild(createInfoItem('Meeting Time', club.meetingTime));
    infoGrid.appendChild(createInfoItem('Date Registered', formattedDate));

    // --- Description Box ---
    const descBox = document.createElement('div');
    descBox.classList.add('details-desc-box');

    const descHeading = document.createElement('h2');
    descHeading.classList.add('details-desc-title');
    descHeading.textContent = 'About This Club';

    const descText = document.createElement('p');
    descText.classList.add('details-desc-text');
    descText.textContent = club.description;

    descBox.appendChild(descHeading);
    descBox.appendChild(descText);

    // --- ID Footer Box ---
    const idBox = document.createElement('div');
    idBox.style.fontSize = '0.8rem';
    idBox.style.color = 'var(--text-muted)';
    idBox.style.marginBottom = '1.5rem';
    idBox.textContent = `System Record ID: ${club._id}`;

    // --- Actions Row (Edit, Delete, Back) ---
    const actionsRow = document.createElement('div');
    actionsRow.classList.add('details-actions');

    const leftBtns = document.createElement('div');
    leftBtns.style.display = 'flex';
    leftBtns.style.gap = '0.75rem';

    const editBtn = document.createElement('a');
    editBtn.classList.add('btn', 'btn-primary');
    editBtn.href = `edit-club.html?id=${encodeURIComponent(club._id)}`;
    editBtn.textContent = '✎ Edit Club';

    const returnBtn = document.createElement('a');
    returnBtn.classList.add('btn', 'btn-secondary');
    returnBtn.href = 'clubs.html';
    returnBtn.textContent = 'Back to Directory';

    leftBtns.appendChild(editBtn);
    leftBtns.appendChild(returnBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.classList.add('btn', 'btn-outline-danger');
    deleteBtn.textContent = '🗑 Delete Club';
    deleteBtn.type = 'button';
    deleteBtn.addEventListener('click', () => {
      showConfirmModal(
        'Delete Club Confirmation',
        `Are you sure you want to permanently delete "${club.name}"? This action cannot be undone.`,
        'Confirm Delete',
        async () => {
          try {
            await deleteClub(club._id);
            // Redirect back to clubs directory
            window.location.href = 'clubs.html';
          } catch (delErr) {
            showAlert(alertContainer, `Failed to delete: ${delErr.message}`, 'danger');
          }
        }
      );
    });

    actionsRow.appendChild(leftBtns);
    actionsRow.appendChild(deleteBtn);

    // Assemble everything into card
    card.appendChild(header);
    card.appendChild(infoGrid);
    card.appendChild(descBox);
    card.appendChild(idBox);
    card.appendChild(actionsRow);

    // Render into page
    container.replaceChildren(card);
  }
});
