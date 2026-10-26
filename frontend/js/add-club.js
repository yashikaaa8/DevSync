// ==============================================================================
// Add Club Script (frontend/js/add-club.js)
// Handles new club submission via POST /api/clubs with client-side validation
// ==============================================================================

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('add-club-form');
  const alertContainer = document.getElementById('form-alert');
  const submitBtn = document.getElementById('submit-btn');
  const successActionsContainer = document.getElementById('success-actions');

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // 1. Extract values from DOM inputs
    const name = document.getElementById('club-name').value.trim();
    const category = document.getElementById('club-category').value.trim();
    const president = document.getElementById('club-president').value.trim();
    const meetingDay = document.getElementById('club-meeting-day').value.trim();
    const meetingTime = document.getElementById('club-meeting-time').value.trim();
    const description = document.getElementById('club-description').value.trim();

    // 2. Client-side field validation
    if (!name || !category || !president || !meetingDay || !meetingTime || !description) {
      showAlert(alertContainer, 'Please fill out all required fields before submitting.', 'danger');
      return;
    }

    if (name.length < 2) {
      showAlert(alertContainer, 'Club name must be at least 2 characters long.', 'danger');
      return;
    }

    if (description.length < 10) {
      showAlert(alertContainer, 'Description must be at least 10 characters long.', 'danger');
      return;
    }

    // 3. Prepare payload and prevent duplicate clicks
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
    submitBtn.textContent = 'Saving Club to Database...';

    try {
      // 4. Send POST request via fetch API
      const result = await createClub(payload);

      // Show success alert
      showAlert(
        alertContainer,
        `Success! "${result.data.name}" has been registered in the database.`,
        'success'
      );

      // Reset form fields
      form.reset();

      // Show action buttons below form using DOM manipulation
      if (successActionsContainer) {
        const actionsBox = document.createElement('div');
        actionsBox.classList.add('alert', 'alert-info');
        actionsBox.style.marginTop = '1.5rem';

        const textSpan = document.createElement('span');
        textSpan.textContent = 'What would you like to do next?';

        const btnGroup = document.createElement('div');
        btnGroup.style.display = 'flex';
        btnGroup.style.gap = '0.5rem';

        const viewDirectoryBtn = document.createElement('a');
        viewDirectoryBtn.classList.add('btn', 'btn-primary', 'btn-sm');
        viewDirectoryBtn.href = 'clubs.html';
        viewDirectoryBtn.textContent = 'View in Clubs Directory →';

        const viewClubBtn = document.createElement('a');
        viewClubBtn.classList.add('btn', 'btn-secondary', 'btn-sm');
        viewClubBtn.href = `club-details.html?id=${encodeURIComponent(result.data._id)}`;
        viewClubBtn.textContent = 'View Club Details';

        btnGroup.appendChild(viewDirectoryBtn);
        btnGroup.appendChild(viewClubBtn);

        actionsBox.appendChild(textSpan);
        actionsBox.appendChild(btnGroup);

        successActionsContainer.replaceChildren(actionsBox);
      }
    } catch (error) {
      console.error('[Add Club Error]:', error);
      showAlert(
        alertContainer,
        `Error creating club: ${error.message}`,
        'danger'
      );
    } finally {
      // Re-enable submit button
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
  });
});
