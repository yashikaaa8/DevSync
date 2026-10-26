// ==============================================================================
// Clubs Directory Script (frontend/js/clubs.js)
// Demonstrates dynamic fetching (GET /api/clubs) and DOM rendering with filtering
// ==============================================================================

let allClubs = []; // Local cache of clubs from database

document.addEventListener('DOMContentLoaded', async () => {
  const clubsContainer = document.getElementById('clubs-container');
  const searchInput = document.getElementById('search-input');
  const categoryFilter = document.getElementById('category-filter');
  const resultCount = document.getElementById('result-count');
  const alertContainer = document.getElementById('clubs-alert');

  /**
   * Fetch clubs from backend API and render
   */
  async function loadClubs() {
    try {
      showLoading(clubsContainer, 'Loading clubs from campus database...');

      const response = await getAllClubs();
      allClubs = response.data || [];

      renderClubs(allClubs);
    } catch (error) {
      console.error('[Clubs Error]:', error);
      showAlert(
        alertContainer,
        `Failed to load clubs: ${error.message}. Ensure backend server is running.`,
        'danger'
      );
      showEmptyState(
        clubsContainer,
        'Database Connection Error',
        'Could not fetch clubs from the REST API endpoint (/api/clubs).'
      );
    }
  }

  /**
   * Filter clubs based on search keyword and category selection
   */
  function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    const selectedCategory = categoryFilter ? categoryFilter.value : '';

    const filtered = allClubs.filter((club) => {
      const matchesSearch =
        club.name.toLowerCase().includes(query) ||
        club.category.toLowerCase().includes(query) ||
        club.president.toLowerCase().includes(query) ||
        club.description.toLowerCase().includes(query);

      const matchesCategory =
        !selectedCategory || club.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });

    renderClubs(filtered);
  }

  /**
   * Render list of clubs using direct DOM manipulation
   * Methods: document.createElement, element.textContent, element.appendChild,
   * element.replaceChildren, element.classList, element.addEventListener
   * @param {Array} clubs
   */
  function renderClubs(clubs) {
    // Update results count label
    if (resultCount) {
      resultCount.textContent = `Showing ${clubs.length} of ${allClubs.length} clubs`;
    }

    // Handle empty state
    if (clubs.length === 0) {
      if (allClubs.length === 0) {
        showEmptyState(
          clubsContainer,
          'No Campus Clubs Found',
          'There are currently no clubs registered in the database. Be the first to start one!',
          { text: '+ Create New Club', href: 'add-club.html' }
        );
      } else {
        showEmptyState(
          clubsContainer,
          'No Matching Clubs Found',
          'Try clearing your search query or choosing a different category filter.'
        );
      }
      return;
    }

    // Construct DOM nodes
    const fragment = document.createDocumentFragment();

    clubs.forEach((club) => {
      // 1. Outer card container
      const card = document.createElement('div');
      card.classList.add('club-card');
      card.setAttribute('data-id', club._id);

      // 2. Card header (Title and Category Badge)
      const header = document.createElement('div');
      header.classList.add('club-card-header');

      const title = document.createElement('h3');
      title.classList.add('club-card-title');
      title.textContent = club.name; // textContent prevents HTML injection

      const badge = document.createElement('span');
      badge.classList.add('badge', getCategoryBadgeClass(club.category));
      badge.textContent = club.category;

      header.appendChild(title);
      header.appendChild(badge);

      // 3. Description text
      const desc = document.createElement('p');
      desc.classList.add('club-card-desc');
      desc.textContent = club.description;

      // 4. Meta information list
      const metaList = document.createElement('ul');
      metaList.classList.add('club-meta-list');

      // President
      const presItem = document.createElement('li');
      presItem.classList.add('club-meta-item');
      const presLabel = document.createElement('span');
      presLabel.classList.add('club-meta-label');
      presLabel.textContent = 'President:';
      const presVal = document.createTextNode(` ${club.president}`);
      presItem.appendChild(presLabel);
      presItem.appendChild(presVal);

      // Meeting
      const meetItem = document.createElement('li');
      meetItem.classList.add('club-meta-item');
      const meetLabel = document.createElement('span');
      meetLabel.classList.add('club-meta-label');
      meetLabel.textContent = 'Meets:';
      const meetVal = document.createTextNode(` Every ${club.meetingDay} at ${club.meetingTime}`);
      meetItem.appendChild(meetLabel);
      meetItem.appendChild(meetVal);

      metaList.appendChild(presItem);
      metaList.appendChild(meetItem);

      // 5. Action Buttons (View Details, Edit, Delete)
      const actions = document.createElement('div');
      actions.classList.add('club-card-actions');

      // View Details link
      const viewBtn = document.createElement('a');
      viewBtn.classList.add('btn', 'btn-primary', 'btn-sm');
      viewBtn.href = `club-details.html?id=${encodeURIComponent(club._id)}`;
      viewBtn.textContent = 'View Details';

      // Edit link
      const editBtn = document.createElement('a');
      editBtn.classList.add('btn', 'btn-secondary', 'btn-sm');
      editBtn.href = `edit-club.html?id=${encodeURIComponent(club._id)}`;
      editBtn.textContent = 'Edit';

      // Delete button with confirmation
      const deleteBtn = document.createElement('button');
      deleteBtn.classList.add('btn', 'btn-outline-danger', 'btn-sm');
      deleteBtn.textContent = 'Delete';
      deleteBtn.type = 'button';
      deleteBtn.addEventListener('click', () => {
        confirmAndDeleteClub(club._id, club.name);
      });

      actions.appendChild(viewBtn);
      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);

      // Assemble card
      card.appendChild(header);
      card.appendChild(desc);
      card.appendChild(metaList);
      card.appendChild(actions);

      fragment.appendChild(card);
    });

    // Replace container children explicitly
    clubsContainer.replaceChildren(fragment);
  }

  /**
   * Prompts user with a confirmation modal before sending DELETE request
   * @param {string} id
   * @param {string} name
   */
  function confirmAndDeleteClub(id, name) {
    showConfirmModal(
      'Confirm Club Deletion',
      `Are you sure you want to delete "${name}"? This record will be permanently removed from MongoDB.`,
      'Yes, Delete Club',
      async () => {
        try {
          const res = await deleteClub(id);

          // Remove deleted club from local array
          allClubs = allClubs.filter((c) => c._id !== id);

          // Re-render updated clubs list
          applyFilters();

          // Show success banner
          showAlert(
            alertContainer,
            res.message || `Club "${name}" was deleted successfully.`,
            'success'
          );
        } catch (error) {
          showAlert(
            alertContainer,
            `Failed to delete club: ${error.message}`,
            'danger'
          );
        }
      }
    );
  }

  // Event Listeners for real-time search & filter
  searchInput.addEventListener('input', applyFilters);
  if (categoryFilter) {
    categoryFilter.addEventListener('change', applyFilters);
  }

  // Initial load
  loadClubs();
});
