/**
 * AncomeVortex - Contact & Inquiry Handler
 * Form validation, localStorage sync with Head/Admin inboxes, cyber feedback toast
 */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('inquiryForm');
  const alertContainer = document.getElementById('formAlertContainer');

  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Check validity
    if (!form.checkValidity()) {
      e.stopPropagation();
      form.classList.add('was-validated');
      showNotification('Please fill all required fields correctly before transmitting.', 'danger');
      return;
    }

    // Retrieve form values
    const name = document.getElementById('contactName')?.value.trim();
    const company = document.getElementById('contactCompany')?.value.trim() || 'Direct Client';
    const email = document.getElementById('contactEmail')?.value.trim();
    const phone = document.getElementById('contactPhone')?.value.trim() || 'N/A';
    const projectType = document.getElementById('contactProjectType')?.value;
    const message = document.getElementById('contactMessage')?.value.trim();

    // Submit button loading state
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Transmitting Telemetry...`;

    // Persist to Shared Inquiries Database (Synchronized with Head & Admin dashboards)
    try {
      const storageKey = 'av_inquiries_db';
      const currentInquiries = JSON.parse(localStorage.getItem(storageKey) || '[]');
      const newInquiry = {
        id: 'INQ-' + Math.floor(1000 + Math.random() * 9000),
        name,
        company,
        email,
        phone,
        projectType,
        message,
        status: 'New',
        assignedTo: 'Unassigned',
        submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        priority: 'Normal'
      };

      currentInquiries.unshift(newInquiry);
      localStorage.setItem(storageKey, JSON.stringify(currentInquiries));

      // Log Security Audit if Auth module is loaded
      if (window.Auth) {
        Auth.logAudit(email, `Public inquiry submitted: ${projectType} from ${company}`);
      }
    } catch (err) {
      console.error('Failed to sync inquiry to local storage', err);
    }

    // Simulated API dispatch with futuristic delay
    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
      form.classList.remove('was-validated');
      form.reset();

      // Show Success Modal or Toast
      showSuccessFeedback(name, company, projectType);
    }, 1000);
  });

  function showNotification(message, type = 'info') {
    if (!alertContainer) return;
    alertContainer.innerHTML = `
      <div class="alert alert-${type === 'danger' ? 'danger' : 'info'} bg-dark border-cyan text-light d-flex align-items-center mb-4" role="alert">
        <i class="bi ${type === 'danger' ? 'bi-exclamation-triangle-fill text-danger' : 'bi-check-circle-fill text-cyan'} fs-4 me-3"></i>
        <div>${message}</div>
      </div>
    `;
  }

  function showSuccessFeedback(name, company, projectType) {
    const modalEl = document.getElementById('inquirySuccessModal');
    if (modalEl && typeof bootstrap !== 'undefined') {
      const confirmationText = document.getElementById('inquiryConfirmationText');
      if (confirmationText) {
        confirmationText.innerHTML = `
          Transmission received from <strong>${name}</strong> (${company}).<br>
          Assigned Protocol: <span class="text-cyan fw-bold">${projectType || 'General Tech Inquiry'}</span>.<br>
          Dispatched directly to Head Architecture & Administration inboxes. Review expected within 24 operational hours.
        `;
      }
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    } else {
      showNotification(`Thank you ${name}! Your inquiry for ${projectType} has been successfully dispatched.`, 'success');
    }
  }
});
