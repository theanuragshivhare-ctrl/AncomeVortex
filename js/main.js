/**
 * AncomeVortex - Main Core JavaScript
 * Handles navigation, dynamic auth state in navbar, active link states, counter statistics, scroll reveals
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Navbar Transition
  const navbar = document.querySelector('.cyber-navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar?.classList.add('scrolled');
    } else {
      navbar?.classList.remove('scrolled');
    }
  });

  // 2. Active Link Highlighting
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link, .dropdown-item-cyber');
  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
      const parentDropdown = link.closest('.dropdown');
      if (parentDropdown) {
        const toggle = parentDropdown.querySelector('.nav-link');
        toggle?.classList.add('active');
      }
    }
  });

  // 3. Dynamic Authentication State in Public Navbar
  updateNavbarAuthState();

  // 4. Scroll Reveal Animation using IntersectionObserver
  const revealElements = document.querySelectorAll('.reveal-fade-up');
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // 5. Animated Number Counters
  const counterElements = document.querySelectorAll('.counter-value');
  const counterObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseFloat(entry.target.getAttribute('data-target'));
        const suffix = entry.target.getAttribute('data-suffix') || '';
        const decimals = parseInt(entry.target.getAttribute('data-decimals') || '0', 10);
        animateCounter(entry.target, target, suffix, decimals);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counterElements.forEach(el => counterObserver.observe(el));

  function animateCounter(element, target, suffix, decimals) {
    let start = 0;
    const duration = 2000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = target / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        element.textContent = target.toFixed(decimals) + suffix;
        clearInterval(timer);
      } else {
        element.textContent = start.toFixed(decimals) + suffix;
      }
    }, stepTime);
  }

  // 6. Back to Top Button
  const backToTopBtn = document.getElementById('btn-back-to-top');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 300) {
        backToTopBtn.style.display = 'flex';
      } else {
        backToTopBtn.style.display = 'none';
      }
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // 7. Initialize Bootstrap Tooltips
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map((tooltipTriggerEl) => {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });
});

/**
 * Dynamic Navbar Authentication State Renderer
 */
function updateNavbarAuthState() {
  const navContainer = document.querySelector('.cyber-navbar .collapse.navbar-collapse');
  if (!navContainer) return;

  const authSection = navContainer.querySelector('.d-flex.align-items-center.gap-3');
  if (!authSection) return;

  // Check if Auth object is loaded and user is logged in
  if (typeof Auth !== 'undefined' && Auth.isLoggedIn()) {
    const user = Auth.getCurrentUser();
    let roleLabel = user.role.toUpperCase();
    if (user.role === 'head') roleLabel = 'HEAD';
    if (user.role === 'admin') roleLabel = 'ADMIN';
    if (user.role === 'employee') roleLabel = 'R&D';
    if (user.role === 'member') roleLabel = 'MEMBER';

    authSection.innerHTML = `
      <a href="dashboard.html" class="btn-cyber-primary btn-cyber-sm">
        <i class="bi bi-speedometer2 me-1"></i> <span>Dashboard (${roleLabel})</span>
      </a>
      <button class="btn btn-sm btn-cyber-outline py-1 px-2" onclick="Auth.logout()" title="Sign Out">
        <i class="bi bi-power"></i>
      </button>
    `;
  } else {
    authSection.innerHTML = `
      <a href="login.html" class="btn-cyber-outline btn-cyber-sm">
        <i class="bi bi-person-lock me-1"></i> <span>Portal Login</span>
      </a>
      <a href="contact.html" class="btn-cyber-primary btn-cyber-sm">
        <span>Start Project</span> <i class="bi bi-lightning-charge-fill"></i>
      </a>
    `;
  }
}
