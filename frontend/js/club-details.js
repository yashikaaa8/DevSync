// ==============================================================================
// Club Details Script (frontend/js/club-details.js)
// Reads club ID from URL, fetches GET /api/clubs/:id, constructs detail view,
// and implements the "Join Club" membership modal feature with duplicate prevention
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

    const headerNavGroup = document.createElement('div');
    headerNavGroup.style.display = 'flex';
    headerNavGroup.style.gap = '0.5rem';
    headerNavGroup.style.alignItems = 'center';

    // Prominent Join Club button in header
    const joinHeaderBtn = document.createElement('button');
    joinHeaderBtn.classList.add('btn', 'btn-success');
    joinHeaderBtn.textContent = '✨ Join Club';
    joinHeaderBtn.type = 'button';
    joinHeaderBtn.addEventListener('click', () => {
      openJoinClubModal(club);
    });

    const backLink = document.createElement('a');
    backLink.classList.add('btn', 'btn-secondary', 'btn-sm');
    backLink.href = 'clubs.html';
    backLink.textContent = '← All Clubs';

    headerNavGroup.appendChild(joinHeaderBtn);
    headerNavGroup.appendChild(backLink);

    header.appendChild(titleGroup);
    header.appendChild(headerNavGroup);

    // --- Meta Info Grid (President, Meeting Day, Meeting Time, Registered Date) ---
    const infoGrid = document.createElement('div');
    infoGrid.classList.add('details-info-grid');

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

    // --- Members Section (Fetched via GET /api/memberships?clubId=...) ---
    const membershipCard = document.createElement('div');
    membershipCard.classList.add('membership-card');
    membershipCard.id = 'membership-section';

    // Assemble initial placeholder and load actual members
    loadMembers(club._id, membershipCard, club);

    // --- ID Footer Box ---
    const idBox = document.createElement('div');
    idBox.style.fontSize = '0.8rem';
    idBox.style.color = 'var(--text-muted)';
    idBox.style.marginBottom = '1.5rem';
    idBox.textContent = `System Record ID: ${club._id}`;

    // --- Actions Row (Join, Edit, Delete, Back) ---
    const actionsRow = document.createElement('div');
    actionsRow.classList.add('details-actions');

    const leftBtns = document.createElement('div');
    leftBtns.style.display = 'flex';
    leftBtns.style.gap = '0.75rem';
    leftBtns.style.flexWrap = 'wrap';

    const joinActionBtn = document.createElement('button');
    joinActionBtn.classList.add('btn', 'btn-success');
    joinActionBtn.textContent = '✨ Join Club';
    joinActionBtn.type = 'button';
    joinActionBtn.addEventListener('click', () => {
      openJoinClubModal(club);
    });

    const editBtn = document.createElement('a');
    editBtn.classList.add('btn', 'btn-primary');
    editBtn.href = `edit-club.html?id=${encodeURIComponent(club._id)}`;
    editBtn.textContent = '✎ Edit Club';

    const returnBtn = document.createElement('a');
    returnBtn.classList.add('btn', 'btn-secondary');
    returnBtn.href = 'clubs.html';
    returnBtn.textContent = 'Back to Directory';

    leftBtns.appendChild(joinActionBtn);
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
    card.appendChild(membershipCard);
    card.appendChild(idBox);
    card.appendChild(actionsRow);

    // Render into page
    container.replaceChildren(card);
  }

  /**
   * Loads and displays registered members for this club via GET /api/memberships?clubId=...
   * @param {string} clubId
   * @param {HTMLElement} targetContainer
   * @param {Object} club
   */
  async function loadMembers(clubId, targetContainer, club) {
    try {
      const res = await getClubMemberships(clubId);
      const members = res.data || [];

      const sectionFragment = document.createDocumentFragment();

      // Header row with count and quick Join button
      const mHeader = document.createElement('div');
      mHeader.classList.add('membership-header');

      const mTitle = document.createElement('h3');
      mTitle.classList.add('membership-title');
      mTitle.textContent = `👥 Registered Members (${members.length})`;

      const mJoinBtn = document.createElement('button');
      mJoinBtn.classList.add('btn', 'btn-success', 'btn-sm');
      mJoinBtn.textContent = '+ Join This Club';
      mJoinBtn.type = 'button';
      mJoinBtn.addEventListener('click', () => openJoinClubModal(club));

      mHeader.appendChild(mTitle);
      mHeader.appendChild(mJoinBtn);
      sectionFragment.appendChild(mHeader);

      if (members.length === 0) {
        const emptyNotice = document.createElement('p');
        emptyNotice.style.color = 'var(--text-muted)';
        emptyNotice.style.fontSize = '0.92rem';
        emptyNotice.textContent = 'No students have joined this club yet. Be the first to join!';
        sectionFragment.appendChild(emptyNotice);
      } else {
        const list = document.createElement('ul');
        list.classList.add('member-list');

        members.forEach((m) => {
          const item = document.createElement('li');
          item.classList.add('member-item');

          const nameSpan = document.createElement('span');
          nameSpan.classList.add('member-name');
          nameSpan.textContent = m.studentName;

          const idSpan = document.createElement('span');
          idSpan.classList.add('member-id');
          idSpan.textContent = `ID: ${m.studentId}`;

          const emailSpan = document.createElement('span');
          emailSpan.classList.add('member-email');
          emailSpan.textContent = m.email;

          item.appendChild(nameSpan);
          item.appendChild(idSpan);
          item.appendChild(emailSpan);

          list.appendChild(item);
        });

        sectionFragment.appendChild(list);
      }

      targetContainer.replaceChildren(sectionFragment);
    } catch (err) {
      console.error('[Load Members Error]:', err);
      const errP = document.createElement('p');
      errP.style.color = 'var(--color-danger)';
      errP.textContent = `Unable to load members: ${err.message}`;
      targetContainer.replaceChildren(errP);
    }
  }

  /**
   * Displays the "Join Club" modal dialog
   * Uses direct DOM manipulation, validates inputs, and prevents duplicate submissions
   * @param {Object} club
   */
  function openJoinClubModal(club) {
    // 1. Modal backdrop
    const backdrop = document.createElement('div');
    backdrop.classList.add('modal-backdrop');

    // 2. Modal card
    const modalBox = document.createElement('div');
    modalBox.classList.add('modal-box');
    modalBox.style.maxWidth = '500px';

    // Title
    const title = document.createElement('h3');
    title.classList.add('modal-title');
    title.textContent = `Join "${club.name}"`;

    const subtitle = document.createElement('p');
    subtitle.classList.add('modal-text');
    subtitle.style.marginBottom = '1rem';
    subtitle.textContent = 'Register as a member of this student organization. Provide your student details below:';

    // In-modal alert container for messages
    const modalAlertContainer = document.createElement('div');

    // Form element
    const form = document.createElement('form');
    form.novalidate = true;

    // Helper to generate labeled form groups safely
    const createField = (id, labelText, type, placeholder) => {
      const group = document.createElement('div');
      group.classList.add('form-group');
      group.style.marginBottom = '1rem';

      const label = document.createElement('label');
      label.classList.add('form-label');
      label.setAttribute('for', id);
      label.textContent = labelText;

      const input = document.createElement('input');
      input.id = id;
      input.type = type;
      input.classList.add('form-control');
      input.placeholder = placeholder;
      input.required = true;

      group.appendChild(label);
      group.appendChild(input);
      return { group, input };
    };

    const nameField = createField('join-student-name', 'Full Name *', 'text', 'e.g. Maya Sharma');
    const idField = createField('join-student-id', 'Student ID / Roll No. *', 'text', 'e.g. STU2026');
    const emailField = createField('join-email', 'Student Email *', 'email', 'e.g. maya@campus.edu');

    form.appendChild(nameField.group);
    form.appendChild(idField.group);
    form.appendChild(emailField.group);

    // Actions
    const actions = document.createElement('div');
    actions.classList.add('modal-actions');
    actions.style.marginTop = '1.5rem';

    const cancelBtn = document.createElement('button');
    cancelBtn.classList.add('btn', 'btn-secondary');
    cancelBtn.type = 'button';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => backdrop.remove());

    const submitBtn = document.createElement('button');
    submitBtn.classList.add('btn', 'btn-success');
    submitBtn.type = 'submit';
    submitBtn.textContent = '✓ Confirm & Join';

    actions.appendChild(cancelBtn);
    actions.appendChild(submitBtn);
    form.appendChild(actions);

    // Form submission listener
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const studentName = nameField.input.value.trim();
      const studentId = idField.input.value.trim().toUpperCase();
      const email = emailField.input.value.trim().toLowerCase();

      // Client-side validation
      if (!studentName || !studentId || !email) {
        showAlert(modalAlertContainer, 'Please fill out all required fields.', 'danger');
        return;
      }

      if (studentName.length < 2) {
        showAlert(modalAlertContainer, 'Student name must be at least 2 characters long.', 'danger');
        return;
      }

      if (studentId.length < 2) {
        showAlert(modalAlertContainer, 'Student ID must be at least 2 characters long.', 'danger');
        return;
      }

      const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
      if (!emailRegex.test(email)) {
        showAlert(modalAlertContainer, 'Please enter a valid email address (e.g. student@campus.edu).', 'danger');
        return;
      }

      // Prevent duplicate submissions while request is in progress
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submitting Membership...';

      try {
        const payload = {
          clubId: club._id,
          studentName,
          studentId,
          email
        };

        const result = await joinClub(payload);

        // Show success alert in modal
        showAlert(
          modalAlertContainer,
          result.message || 'Membership registered successfully!',
          'success'
        );

        // Disable form inputs to prevent duplicate submission
        nameField.input.disabled = true;
        idField.input.disabled = true;
        emailField.input.disabled = true;

        // Change actions to a single Close button
        actions.replaceChildren();
        const closeBtn = document.createElement('button');
        closeBtn.classList.add('btn', 'btn-primary');
        closeBtn.type = 'button';
        closeBtn.textContent = 'Close';
        closeBtn.addEventListener('click', () => backdrop.remove());
        actions.appendChild(closeBtn);

        // Refresh the member list on the main page dynamically
        const membershipSection = document.getElementById('membership-section');
        if (membershipSection) {
          loadMembers(club._id, membershipSection, club);
        }

        // Show toast on page
        showAlert(
          alertContainer,
          `Welcome to ${club.name}, ${studentName}! Your membership is recorded.`,
          'success'
        );
      } catch (err) {
        console.error('[Join Club Error]:', err);
        showAlert(
          modalAlertContainer,
          err.message || 'Failed to join club. Please try again.',
          'danger'
        );
        submitBtn.disabled = false;
        submitBtn.textContent = '✓ Confirm & Join';
      }
    });

    // Assemble modal box
    modalBox.appendChild(title);
    modalBox.appendChild(subtitle);
    modalBox.appendChild(modalAlertContainer);
    modalBox.appendChild(form);

    backdrop.appendChild(modalBox);
    document.body.appendChild(backdrop);

    // Focus first input
    nameField.input.focus();
  }
});
