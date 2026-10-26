// ==============================================================================
// Dashboard Script (frontend/js/dashboard.js)
// Fetches real club metrics from backend API and populates the Home page via DOM
// ==============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  const totalClubsElem = document.getElementById('total-clubs-count');
  const totalCategoriesElem = document.getElementById('total-categories-count');
  const recentClubsContainer = document.getElementById('recent-clubs-container');
  const alertContainer = document.getElementById('dashboard-alert');

  try {
    // Show loading state in recent clubs container
    showLoading(recentClubsContainer, 'Fetching latest club data...');

    // Fetch actual clubs from backend REST API
    const response = await getAllClubs();
    const clubs = response.data || [];

    // 1. Direct DOM update for Total Clubs counter
    if (totalClubsElem) {
      totalClubsElem.textContent = clubs.length.toString();
    }

    // 2. Calculate unique categories
    if (totalCategoriesElem) {
      const uniqueCategories = new Set(clubs.map((c) => c.category));
      totalCategoriesElem.textContent = uniqueCategories.size.toString();
    }

    // 3. Render recent clubs preview (up to 3 clubs)
    if (clubs.length === 0) {
      showEmptyState(
        recentClubsContainer,
        'No Clubs Registered Yet',
        'Start building your campus community by creating your first student club.',
        { text: 'Add First Club', href: 'add-club.html' }
      );
      return;
    }

    // Direct DOM construction for recent club cards
    const fragment = document.createDocumentFragment();
    const previewClubs = clubs.slice(0, 3); // show latest 3

    previewClubs.forEach((club) => {
      // Create card element
      const card = document.createElement('div');
      card.classList.add('club-card');

      // Card Header: Title & Category Badge
      const header = document.createElement('div');
      header.classList.add('club-card-header');

      const title = document.createElement('h3');
      title.classList.add('club-card-title');
      title.textContent = club.name; // Safe DOM textContent

      const badge = document.createElement('span');
      badge.classList.add('badge', getCategoryBadgeClass(club.category));
      badge.textContent = club.category;

      header.appendChild(title);
      header.appendChild(badge);

      // Card Description
      const desc = document.createElement('p');
      desc.classList.add('club-card-desc');
      desc.textContent = club.description.length > 120
        ? `${club.description.substring(0, 120)}...`
        : club.description;

      // Meta list: President and Meetings
      const metaList = document.createElement('ul');
      metaList.classList.add('club-meta-list');

      // President item
      const presItem = document.createElement('li');
      presItem.classList.add('club-meta-item');
      const presLabel = document.createElement('span');
      presLabel.classList.add('club-meta-label');
      presLabel.textContent = 'President:';
      const presVal = document.createTextNode(` ${club.president}`);
      presItem.appendChild(presLabel);
      presItem.appendChild(presVal);

      // Meeting item
      const meetItem = document.createElement('li');
      meetItem.classList.add('club-meta-item');
      const meetLabel = document.createElement('span');
      meetLabel.classList.add('club-meta-label');
      meetLabel.textContent = 'Meets:';
      const meetVal = document.createTextNode(` ${club.meetingDay} @ ${club.meetingTime}`);
      meetItem.appendChild(meetLabel);
      meetItem.appendChild(meetVal);

      metaList.appendChild(presItem);
      metaList.appendChild(meetItem);

      // Card Actions
      const actions = document.createElement('div');
      actions.classList.add('club-card-actions');

      const viewBtn = document.createElement('a');
      viewBtn.classList.add('btn', 'btn-primary', 'btn-sm');
      viewBtn.href = `club-details.html?id=${encodeURIComponent(club._id)}`;
      viewBtn.textContent = 'View Details';

      actions.appendChild(viewBtn);

      // Assemble card
      card.appendChild(header);
      card.appendChild(desc);
      card.appendChild(metaList);
      card.appendChild(actions);

      fragment.appendChild(card);
    });

    // Replace loading spinner with constructed cards
    recentClubsContainer.replaceChildren(fragment);
  } catch (error) {
    console.error('[Dashboard Error]:', error);
    if (totalClubsElem) totalClubsElem.textContent = '0';
    if (totalCategoriesElem) totalCategoriesElem.textContent = '0';

    showAlert(
      alertContainer,
      `Backend Server / Database Notice: ${error.message}. Please check if the Node backend and MongoDB are running.`,
      'danger'
    );

    showEmptyState(
      recentClubsContainer,
      'Unable to Connect to Server',
      'The application could not reach the backend REST API on /api/clubs. Ensure "npm start" is active.'
    );
  }
});
