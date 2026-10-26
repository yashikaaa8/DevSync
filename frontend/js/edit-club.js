// ==============================================================================
// Edit Club Script (frontend/js/edit-club.js)
// Reads club ID from URL, populates existing data, and sends PUT /api/clubs/:id
// ==============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  const form = document.getElementById('edit-club-form');
  const alertContainer = document.getElementById('form-alert');
  const submitBtn = document.getElementById('submit-btn');
  const formCard = document.querySelector('.form-card');
  const successActionsContainer = document.getElementById('success-actions');

  // 1. Read club ID from URL search parameters (e.g. edit-club.html?id=64f123...)
  const urlParams = new URLSearchParams(window.location.search);
  const clubId = urlParams.get('id');

  if (!clubId) {
    showAlert(
      alertContainer,
      'No club ID was provided in the URL. Please return to the directory and select a club to edit.',
      'danger'
    );
    if (form) form.style.display = 'none';
    return;
  }

  // 2. Fetch current club details from backend
  try {
    const response = await getClubById(clubId);
    const club = response.data;

    // Populate form inputs via DOM element values
    document.getElementById('club-name').value = club.name || '';
    document.getElementById('club-category').value = club.category || '';
    document.getElementById('club-president').value = club.president || '';
    document.getElementById('club-meeting-day').value = club.meetingDay || '';
    document.getElementById('club-meeting-time').value = club.meetingTime || '';
    document.getElementById('club-description').value = club.description || '';

    // Update page title/subtitle with club name
    const editSubtitle = document.getElementById('edit-subtitle');
    if (editSubtitle) {
      editSubtitle.textContent = `Editing: ${club.name}`;
    }
  } catch (error) {
    console.error('[Edit Club Fetch Error]:', error);
    showAlert(
      alertContainer,
      `Error loading club details: ${error.message}. The club may not exist.`,
      'danger'
    );
    if (form) form.style.display = 'none';
    return;
  }

  // 3. Handle form submission (PUT update)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('club-name').value.trim();
    const category = document.getElementById('club-category').value.trim();
    const president = document.getElementById('club-president').value.trim();
    const meetingDay = document.getElementById('club-meeting-day').value.trim();
    const meetingTime = document.getElementById('club-meeting-time').value.trim();
    const description = document.getElementById('club-description').value.trim();

    // Client-side validation
    if (!name || !category || !president || !meetingDay || !meetingTime || !description) {
      showAlert(alertContainer, 'All fields are required.', 'danger');
      return;
    }

    if (name.length < 2) {
      showAlert(alertContainer, 'Club name must be at least 2 characters.', 'danger');
      return;
    }

    if (description.length < 10) {
      showAlert(alertContainer, 'Description must be at least 10 characters.', 'danger');
      return;
    }

    const payload = {
      name,
      category,
      president,
      meetingDay,
      meetingTime,
      description
    };

    submitBtn.disabled = true;
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Updating Club in Database...';

    try {
      const result = await updateClub(clubId, payload);

      showAlert(
        alertContainer,
        `Success! "${result.data.name}" has been updated successfully.`,
        'success'
      );

      // Offer convenient navigation options
      if (successActionsContainer) {
        const actionsBox = document.createElement('div');
        actionsBox.classList.add('alert', 'alert-info');
        actionsBox.style.marginTop = '1.5rem';

        const textSpan = document.createElement('span');
        textSpan.textContent = 'Changes saved successfully.';

        const btnGroup = document.createElement('div');
        btnGroup.style.display = 'flex';
        btnGroup.style.gap = '0.5rem';

        const detailsBtn = document.createElement('a');
        detailsBtn.classList.add('btn', 'btn-primary', 'btn-sm');
        detailsBtn.href = `club-details.html?id=${encodeURIComponent(clubId)}`;
        detailsBtn.textContent = 'View Updated Details →';

        const directoryBtn = document.createElement('a');
        directoryBtn.classList.add('btn', 'btn-secondary', 'btn-sm');
        directoryBtn.href = 'clubs.html';
        directoryBtn.textContent = 'Return to Directory';

        btnGroup.appendChild(detailsBtn);
        btnGroup.appendChild(directoryBtn);

        actionsBox.appendChild(textSpan);
        actionsBox.appendChild(btnGroup);

        successActionsContainer.replaceChildren(actionsBox);
      }
    } catch (error) {
      console.error('[Edit Club Update Error]:', error);
      showAlert(
        alertContainer,
        `Update failed: ${error.message}`,
        'danger'
      );
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});
