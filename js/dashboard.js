/**
 * AncomeVortex - Dashboard Controller
 * Dynamic data rendering, role-based CRUD operations, live state sync
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Enforce Authentication
  const user = Auth.getCurrentUser();
  if (!user) {
    window.location.href = 'login.html';
    return;
  }

  // 2. Populate Header & Sidebar Profile Info
  populateUserProfile(user);

  // 3. Initialize Mobile Sidebar Drawer Toggle
  const sidebarToggle = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.dashboard-sidebar');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('show');
    });
  }

  // 4. Initialize Role Specific Modules
  const currentRole = user.role;
  initDashboardModules(currentRole);
});

function populateUserProfile(user) {
  const avatarEls = document.querySelectorAll('.user-avatar-target');
  const nameEls = document.querySelectorAll('.user-name-target');
  const emailEls = document.querySelectorAll('.user-email-target');
  const roleBadgeEls = document.querySelectorAll('.user-role-badge-target');

  avatarEls.forEach(el => {
    if (el.tagName === 'IMG') el.src = user.avatar;
  });
  nameEls.forEach(el => el.textContent = user.name);
  emailEls.forEach(el => el.textContent = user.email);

  roleBadgeEls.forEach(el => {
    el.textContent = user.roleLabel || user.role.toUpperCase();
    el.className = `role-badge role-badge-${user.role}`;
  });
}

// Global Tab Switcher
window.switchDashboardTab = function(tabId) {
  // Hide all sections
  document.querySelectorAll('.dashboard-tab-pane').forEach(pane => {
    pane.classList.remove('active');
    pane.style.display = 'none';
  });

  // Deactivate all sidebar nav links
  document.querySelectorAll('.sidebar-nav-link').forEach(link => {
    link.classList.remove('active');
  });

  // Activate selected pane
  const targetPane = document.getElementById(tabId);
  if (targetPane) {
    targetPane.classList.add('active');
    targetPane.style.display = 'block';
  }

  // Highlight matching sidebar link
  const activeLink = document.querySelector(`[data-tab="${tabId}"]`);
  if (activeLink) {
    activeLink.classList.add('active');
  }

  // Close mobile sidebar if open
  const sidebar = document.querySelector('.dashboard-sidebar');
  if (sidebar) sidebar.classList.remove('show');
};

function initDashboardModules(role) {
  // Render based on role
  if (role === 'head') {
    renderUsersTable();
    renderHeadProjectsTable();
    renderHeadInquiriesTable();
    renderAuditLogsTable();
  } else if (role === 'admin') {
    renderAdminEmployeesTable();
    renderAdminInquiriesTable();
  } else if (role === 'employee') {
    renderEmployeeProjects();
    renderEmployeeRndTable();
  } else if (role === 'member') {
    renderMemberInquiries();
  }
}

/* ==========================================================================
   HEAD (SUPER ADMIN) MODULES
   ========================================================================== */

// Render All Users
function renderUsersTable() {
  const tableBody = document.getElementById('usersTableBody');
  if (!tableBody) return;

  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  tableBody.innerHTML = '';

  users.forEach(u => {
    const tr = document.createElement('tr');
    const isHead = u.role === 'head';
    tr.innerHTML = `
      <td>
        <div class="d-flex align-items-center gap-3">
          <img src="${u.avatar}" alt="${u.name}" class="user-avatar-sm">
          <div>
            <div class="fw-bold text-white">${u.name}</div>
            <div class="text-dim small font-mono">${u.email}</div>
          </div>
        </div>
      </td>
      <td>
        <span class="role-badge role-badge-${u.role}">${u.role.toUpperCase()}</span>
      </td>
      <td>
        <span class="status-pill ${u.status === 'active' ? 'status-active' : 'status-suspended'}">
          ${u.status.toUpperCase()}
        </span>
      </td>
      <td class="font-mono text-dim small">${u.joinedDate}</td>
      <td class="text-end">
        <div class="dropdown">
          <button class="btn btn-sm btn-cyber-outline py-1 px-2" data-bs-toggle="dropdown">
            <i class="bi bi-three-dots-vertical"></i>
          </button>
          <ul class="dropdown-menu dropdown-menu-dark dropdown-menu-cyber dropdown-menu-end">
            <li><a class="dropdown-item dropdown-item-cyber" href="#" onclick="changeUserRole('${u.id}')"><i class="bi bi-person-gear"></i> Change Role</a></li>
            <li><a class="dropdown-item dropdown-item-cyber" href="#" onclick="toggleUserStatus('${u.id}')"><i class="bi bi-shield-slash"></i> Toggle Status</a></li>
            ${!isHead ? `<li><a class="dropdown-item dropdown-item-cyber text-danger" href="#" onclick="deleteUser('${u.id}')"><i class="bi bi-trash"></i> Delete</a></li>` : ''}
          </ul>
        </div>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  // Update user count metric
  const countEl = document.getElementById('totalUsersCount');
  if (countEl) countEl.textContent = users.length;
}

// Add User Modal Handler
window.handleCreateUser = function(event) {
  event.preventDefault();
  const name = document.getElementById('newUserName').value.trim();
  const email = document.getElementById('newUserEmail').value.trim();
  const password = document.getElementById('newUserPassword').value.trim();
  const role = document.getElementById('newUserRole').value;
  const department = document.getElementById('newUserDepartment').value.trim();

  const res = Auth.register({ name, email, password, role, department });
  if (res.success) {
    const modalEl = document.getElementById('addUserModal');
    if (modalEl) {
      bootstrap.Modal.getInstance(modalEl)?.hide();
    }
    document.getElementById('addUserForm').reset();
    renderUsersTable();
    Auth.logAudit(Auth.getCurrentUser().email, `Admin created user: ${email} (${role})`);
    alert(`User ${name} has been successfully created.`);
  } else {
    alert(res.message);
  }
};

window.toggleUserStatus = function(userId) {
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    users[index].status = users[index].status === 'active' ? 'suspended' : 'active';
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    renderUsersTable();
    Auth.logAudit(Auth.getCurrentUser().email, `Toggled status for user ${users[index].email} to ${users[index].status}`);
  }
};

window.changeUserRole = function(userId) {
  const newRole = prompt('Enter new role: head | admin | employee | member');
  if (!newRole || !['head', 'admin', 'employee', 'member'].includes(newRole.toLowerCase().trim())) {
    alert('Invalid role specified. Must be head, admin, employee, or member.');
    return;
  }
  const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  const index = users.findIndex(u => u.id === userId);
  if (index !== -1) {
    users[index].role = newRole.toLowerCase().trim();
    users[index].roleLabel = users[index].role.toUpperCase();
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    renderUsersTable();
    Auth.logAudit(Auth.getCurrentUser().email, `Promoted user ${users[index].email} to ${users[index].role}`);
  }
};

window.deleteUser = function(userId) {
  if (!confirm('Are you sure you wish to delete this user from the security database?')) return;
  let users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  users = users.filter(u => u.id !== userId);
  localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  renderUsersTable();
  Auth.logAudit(Auth.getCurrentUser().email, `Deleted user ${userId}`);
};

// Render Head Projects Table
function renderHeadProjectsTable() {
  const tableBody = document.getElementById('headProjectsTableBody');
  if (!tableBody) return;

  const projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
  tableBody.innerHTML = '';

  projects.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="fw-bold text-white">${p.title}</div>
        <div class="text-dim small font-mono">${p.id} • ${p.category}</div>
      </td>
      <td>
        <div class="d-flex align-items-center gap-2">
          <div class="cyber-progress flex-grow-1" style="width: 100px;">
            <div class="cyber-progress-bar" style="width: ${p.progress}%;"></div>
          </div>
          <span class="font-mono text-cyan small">${p.progress}%</span>
        </div>
      </td>
      <td><span class="text-light">${p.lead}</span></td>
      <td><span class="status-pill status-active">${p.status}</span></td>
      <td class="font-mono text-cyan">${p.budget}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-cyber-outline py-1 px-2 text-danger" onclick="deleteProject('${p.id}')">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

// Add Project Modal Handler
window.handleCreateProject = function(event) {
  event.preventDefault();
  const title = document.getElementById('newProjectTitle').value.trim();
  const category = document.getElementById('newProjectCategory').value;
  const lead = document.getElementById('newProjectLead').value.trim();
  const budget = document.getElementById('newProjectBudget').value.trim();
  const deadline = document.getElementById('newProjectDeadline').value;

  const projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
  const newProject = {
    id: 'PRJ-' + Math.floor(1000 + Math.random() * 9000),
    title,
    category,
    progress: 10,
    lead,
    status: 'Active Deployment',
    budget,
    nodes: 'Deploying',
    deadline,
    tasks: [{ name: 'Initial Architecture Bring-Up', completed: true }]
  };

  projects.push(newProject);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));

  const modalEl = document.getElementById('addProjectModal');
  if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
  document.getElementById('addProjectForm').reset();
  renderHeadProjectsTable();
  Auth.logAudit(Auth.getCurrentUser().email, `Created project blueprint ${title}`);
};

window.deleteProject = function(projectId) {
  if (!confirm('Are you sure you wish to delete this project blueprint?')) return;
  let projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
  projects = projects.filter(p => p.id !== projectId);
  localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  renderHeadProjectsTable();
  Auth.logAudit(Auth.getCurrentUser().email, `Deleted project blueprint ${projectId}`);
};

// Render Inquiries (Head View)
function renderHeadInquiriesTable() {
  const tableBody = document.getElementById('headInquiriesTableBody');
  if (!tableBody) return;

  const inquiries = JSON.parse(localStorage.getItem(STORAGE_KEYS.INQUIRIES) || '[]');
  tableBody.innerHTML = '';

  inquiries.forEach(inq => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="fw-bold text-white">${inq.name}</div>
        <div class="text-dim small font-mono">${inq.company} • ${inq.email}</div>
      </td>
      <td><span class="badge-cyber mb-0 py-1 px-2" style="font-size: 0.75rem;">${inq.projectType}</span></td>
      <td>
        <select class="form-select cyber-form-control py-1 px-2 small font-mono" style="width: 130px; font-size: 0.8rem;" onchange="updateInquiryStatus('${inq.id}', this.value)">
          <option value="New" ${inq.status === 'New' ? 'selected' : ''}>New</option>
          <option value="In Review" ${inq.status === 'In Review' ? 'selected' : ''}>In Review</option>
          <option value="Approved" ${inq.status === 'Approved' ? 'selected' : ''}>Approved</option>
          <option value="Resolved" ${inq.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
        </select>
      </td>
      <td><span class="text-light small">${inq.assignedTo || 'Unassigned'}</span></td>
      <td class="font-mono text-dim small">${inq.submittedAt}</td>
      <td class="text-end">
        <button class="btn btn-sm btn-cyber-outline py-1 px-2" onclick="viewInquiryDetail('${inq.id}')">
          <i class="bi bi-eye"></i> View Scope
        </button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  const countEl = document.getElementById('totalInquiriesCount');
  if (countEl) countEl.textContent = inquiries.length;
}

window.updateInquiryStatus = function(inquiryId, newStatus) {
  const inquiries = JSON.parse(localStorage.getItem(STORAGE_KEYS.INQUIRIES) || '[]');
  const index = inquiries.findIndex(i => i.id === inquiryId);
  if (index !== -1) {
    inquiries[index].status = newStatus;
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
    Auth.logAudit(Auth.getCurrentUser().email, `Updated inquiry ${inquiryId} status to ${newStatus}`);
  }
};

window.viewInquiryDetail = function(inquiryId) {
  const inquiries = JSON.parse(localStorage.getItem(STORAGE_KEYS.INQUIRIES) || '[]');
  const inq = inquiries.find(i => i.id === inquiryId);
  if (!inq) return;

  alert(`[INQUIRY DETAILS #${inq.id}]\n\nClient: ${inq.name} (${inq.company})\nEmail: ${inq.email}\nPhone: ${inq.phone}\nDiscipline: ${inq.projectType}\nPriority: ${inq.priority || 'Normal'}\nStatus: ${inq.status}\n\nProject Scope:\n${inq.message}`);
};

// Render Audit Logs
function renderAuditLogsTable() {
  const listEl = document.getElementById('auditLogsList');
  if (!listEl) return;

  const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || '[]');
  listEl.innerHTML = '';

  logs.slice(0, 15).forEach(log => {
    const item = document.createElement('div');
    item.className = 'p-3 mb-2 rounded bg-black bg-opacity-40 border border-secondary border-opacity-25 font-mono small d-flex justify-content-between align-items-center';
    item.innerHTML = `
      <div>
        <span class="text-cyan fw-bold me-2">[${log.user}]</span>
        <span class="text-light">${log.action}</span>
      </div>
      <span class="text-dim small">${log.time}</span>
    `;
    listEl.appendChild(item);
  });
}

/* ==========================================================================
   ADMINISTRATION MODULES
   ========================================================================== */

function renderAdminEmployeesTable() {
  const tableBody = document.getElementById('adminEmployeesTableBody');
  if (!tableBody) return;

  const employees = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
  tableBody.innerHTML = '';

  employees.forEach(emp => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="fw-bold text-white">${emp.name}</div>
        <div class="text-dim small font-mono">${emp.email}</div>
      </td>
      <td><span class="text-cyan small">${emp.role}</span></td>
      <td><span class="text-light small font-mono">${emp.shift}</span></td>
      <td><span class="status-pill status-active">${emp.status}</span></td>
      <td><span class="font-mono text-cyan fw-bold">${emp.productivity}%</span></td>
      <td class="text-end">
        <button class="btn btn-sm btn-cyber-outline py-1 px-2" onclick="assignEmployeeShift('${emp.id}')">
          <i class="bi bi-clock-history"></i> Shift
        </button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

window.assignEmployeeShift = function(empId) {
  const newShift = prompt('Enter new operational shift: (e.g. Alpha Shift, Beta Shift, Gamma Overnight)');
  if (!newShift) return;
  const employees = JSON.parse(localStorage.getItem(STORAGE_KEYS.EMPLOYEES) || '[]');
  const index = employees.findIndex(e => e.id === empId);
  if (index !== -1) {
    employees[index].shift = newShift;
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(employees));
    renderAdminEmployeesTable();
    Auth.logAudit(Auth.getCurrentUser().email, `Reassigned shift for employee ${employees[index].name} to ${newShift}`);
  }
};

function renderAdminInquiriesTable() {
  const tableBody = document.getElementById('adminInquiriesTableBody');
  if (!tableBody) return;

  const inquiries = JSON.parse(localStorage.getItem(STORAGE_KEYS.INQUIRIES) || '[]');
  tableBody.innerHTML = '';

  inquiries.forEach(inq => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="fw-bold text-white">${inq.name} (${inq.company})</div>
        <div class="text-dim small font-mono">${inq.email}</div>
      </td>
      <td><span class="badge-cyber mb-0 py-1 px-2" style="font-size: 0.75rem;">${inq.projectType}</span></td>
      <td>
        <select class="form-select cyber-form-control py-1 px-2 small font-mono" style="width: 140px; font-size: 0.8rem;" onchange="assignInquiryToEngineer('${inq.id}', this.value)">
          <option value="Unassigned" ${inq.assignedTo === 'Unassigned' ? 'selected' : ''}>Unassigned</option>
          <option value="Aria Chen" ${inq.assignedTo === 'Aria Chen' ? 'selected' : ''}>Aria Chen</option>
          <option value="Marcus Sterling" ${inq.assignedTo === 'Marcus Sterling' ? 'selected' : ''}>Marcus Sterling</option>
          <option value="Tariq Al-Mansoor" ${inq.assignedTo === 'Tariq Al-Mansoor' ? 'selected' : ''}>Tariq Al-Mansoor</option>
        </select>
      </td>
      <td><span class="status-pill ${inq.status === 'Approved' ? 'status-approved' : 'status-in-review'}">${inq.status}</span></td>
      <td class="text-end">
        <button class="btn btn-sm btn-cyber-outline py-1 px-2" onclick="viewInquiryDetail('${inq.id}')">
          <i class="bi bi-card-text"></i> Scope
        </button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

window.assignInquiryToEngineer = function(inquiryId, engineerName) {
  const inquiries = JSON.parse(localStorage.getItem(STORAGE_KEYS.INQUIRIES) || '[]');
  const index = inquiries.findIndex(i => i.id === inquiryId);
  if (index !== -1) {
    inquiries[index].assignedTo = engineerName;
    if (inquiries[index].status === 'New') inquiries[index].status = 'In Review';
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));
    Auth.logAudit(Auth.getCurrentUser().email, `Admin assigned inquiry ${inquiryId} to ${engineerName}`);
    renderAdminInquiriesTable();
  }
};

/* ==========================================================================
   EMPLOYEE MODULES
   ========================================================================== */

function renderEmployeeProjects() {
  const container = document.getElementById('employeeProjectsContainer');
  if (!container) return;

  const projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
  container.innerHTML = '';

  projects.forEach(p => {
    const col = document.createElement('div');
    col.className = 'col-lg-6 mb-4';

    const tasksHtml = p.tasks.map((t, idx) => `
      <div class="form-check mb-2">
        <input class="form-check-input" type="checkbox" ${t.completed ? 'checked' : ''} id="task_${p.id}_${idx}" onchange="toggleProjectTask('${p.id}', ${idx}, this.checked)">
        <label class="form-check-label small ${t.completed ? 'text-decoration-line-through text-dim' : 'text-light'}" for="task_${p.id}_${idx}">
          ${t.name}
        </label>
      </div>
    `).join('');

    col.innerHTML = `
      <div class="glass-panel p-4 h-100">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <div>
            <h5 class="text-white mb-1">${p.title}</h5>
            <span class="badge-cyber mb-0 py-1 px-2" style="font-size: 0.75rem;">${p.category}</span>
          </div>
          <span class="status-pill status-active">${p.status}</span>
        </div>
        
        <div class="mb-3">
          <div class="d-flex justify-content-between font-mono small mb-1">
            <span class="text-muted-custom">Sprint Progress</span>
            <span class="text-cyan fw-bold">${p.progress}%</span>
          </div>
          <div class="cyber-progress">
            <div class="cyber-progress-bar" style="width: ${p.progress}%;"></div>
          </div>
        </div>

        <div class="d-flex align-items-center gap-3 mb-4">
          <input type="range" class="form-range" min="0" max="100" value="${p.progress}" onchange="updateProjectProgress('${p.id}', this.value)">
          <span class="text-dim font-mono small" style="min-width: 65px;">Adjust %</span>
        </div>

        <h6 class="text-cyan sub-heading mb-2">Active Milestone Tasks</h6>
        <div class="p-3 rounded bg-black bg-opacity-30 border border-secondary border-opacity-25 mb-3">
          ${tasksHtml}
        </div>
      </div>
    `;
    container.appendChild(col);
  });
}

window.updateProjectProgress = function(projectId, newProgress) {
  const projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
  const index = projects.findIndex(p => p.id === projectId);
  if (index !== -1) {
    projects[index].progress = parseInt(newProgress, 10);
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    renderEmployeeProjects();
    Auth.logAudit(Auth.getCurrentUser().email, `Employee updated ${projects[index].title} progress to ${newProgress}%`);
  }
};

window.toggleProjectTask = function(projectId, taskIndex, isChecked) {
  const projects = JSON.parse(localStorage.getItem(STORAGE_KEYS.PROJECTS) || '[]');
  const index = projects.findIndex(p => p.id === projectId);
  if (index !== -1 && projects[index].tasks[taskIndex]) {
    projects[index].tasks[taskIndex].completed = isChecked;
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    renderEmployeeProjects();
  }
};

function renderEmployeeRndTable() {
  const tableBody = document.getElementById('employeeRndTableBody');
  if (!tableBody) return;

  const rndItems = JSON.parse(localStorage.getItem(STORAGE_KEYS.RND_ITEMS) || '[]');
  tableBody.innerHTML = '';

  rndItems.forEach(r => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>
        <div class="fw-bold text-white">${r.title}</div>
        <div class="text-dim small font-mono">${r.id} • Lead: ${r.lead}</div>
      </td>
      <td><span class="badge-cyber mb-0 py-1 px-2" style="font-size: 0.75rem;">${r.trlLevel}</span></td>
      <td><span class="status-pill status-active">${r.status}</span></td>
      <td><span class="text-light small font-mono">${r.lastUpdated}</span></td>
      <td class="text-end">
        <button class="btn btn-sm btn-cyber-outline py-1 px-2" onclick="updateRndTrl('${r.id}')">
          <i class="bi bi-arrow-up-circle"></i> Upgrade TRL
        </button>
      </td>
    `;
    tableBody.appendChild(tr);
  });
}

window.updateRndTrl = function(rndId) {
  const newTrl = prompt('Enter new Technology Readiness Level (e.g. TRL-7 Field Prototype Demo, TRL-8 Qualified System):');
  if (!newTrl) return;
  const rndItems = JSON.parse(localStorage.getItem(STORAGE_KEYS.RND_ITEMS) || '[]');
  const index = rndItems.findIndex(r => r.id === rndId);
  if (index !== -1) {
    rndItems[index].trlLevel = newTrl;
    rndItems[index].lastUpdated = new Date().toISOString().split('T')[0];
    localStorage.setItem(STORAGE_KEYS.RND_ITEMS, JSON.stringify(rndItems));
    renderEmployeeRndTable();
    Auth.logAudit(Auth.getCurrentUser().email, `Upgraded R&D ${rndItems[index].title} to ${newTrl}`);
  }
};

// Add R&D Experiment Log Modal Handler
window.handleAddRndLog = function(event) {
  event.preventDefault();
  const title = document.getElementById('newRndTitle').value.trim();
  const trlLevel = document.getElementById('newRndTrl').value;
  const notes = document.getElementById('newRndNotes').value.trim();

  const rndItems = JSON.parse(localStorage.getItem(STORAGE_KEYS.RND_ITEMS) || '[]');
  const newRnd = {
    id: 'RND-' + Math.floor(10 + Math.random() * 90),
    title,
    trlLevel,
    lead: Auth.getCurrentUser().name,
    lastUpdated: new Date().toISOString().split('T')[0],
    status: 'Active Experimentation',
    notes
  };

  rndItems.push(newRnd);
  localStorage.setItem(STORAGE_KEYS.RND_ITEMS, JSON.stringify(rndItems));

  const modalEl = document.getElementById('addRndModal');
  if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
  document.getElementById('addRndForm').reset();
  renderEmployeeRndTable();
  Auth.logAudit(Auth.getCurrentUser().email, `Logged new R&D experiment: ${title}`);
};

/* ==========================================================================
   MEMBER MODULES
   ========================================================================== */

function renderMemberInquiries() {
  const container = document.getElementById('memberInquiriesContainer');
  if (!container) return;

  const currentUser = Auth.getCurrentUser();
  const allInquiries = JSON.parse(localStorage.getItem(STORAGE_KEYS.INQUIRIES) || '[]');
  
  // Match by user's email or show list
  const memberInquiries = allInquiries.filter(i => 
    i.email.toLowerCase() === currentUser.email.toLowerCase() || currentUser.email === 'member@ancomevortex.com'
  );

  container.innerHTML = '';

  if (memberInquiries.length === 0) {
    container.innerHTML = `
      <div class="glass-panel p-5 text-center">
        <i class="bi bi-inbox text-dim fs-1 mb-3 d-block"></i>
        <h5 class="text-white mb-2">No Active Inquiries Found</h5>
        <p class="text-muted-custom small mb-4">You have not submitted any technical project blueprints yet.</p>
        <button class="btn btn-cyber-primary btn-sm" data-bs-toggle="modal" data-bs-target="#memberNewInquiryModal">
          <i class="bi bi-plus-circle me-1"></i> Submit First Inquiry
        </button>
      </div>
    `;
    return;
  }

  memberInquiries.forEach(inq => {
    // Determine timeline step
    let stepIndex = 1;
    if (inq.status === 'In Review') stepIndex = 2;
    if (inq.status === 'Approved') stepIndex = 3;
    if (inq.status === 'Resolved') stepIndex = 4;

    const card = document.createElement('div');
    card.className = 'glass-panel p-4 mb-4';
    card.innerHTML = `
      <div class="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
        <div>
          <span class="badge-cyber mb-1 py-1 px-2" style="font-size: 0.75rem;">${inq.id} • ${inq.projectType}</span>
          <h4 class="text-white mb-0">${inq.company} System Request</h4>
        </div>
        <span class="status-pill ${inq.status === 'Approved' ? 'status-approved' : 'status-in-review'}">${inq.status}</span>
      </div>

      <p class="text-muted-custom small mb-4">${inq.message}</p>

      <!-- 4-Step Visual Timeline -->
      <div class="timeline-steps">
        <div class="timeline-step ${stepIndex >= 1 ? 'completed' : ''}">
          <div class="timeline-dot"><i class="bi bi-send-check"></i></div>
          <div class="timeline-label">1. Submitted</div>
        </div>
        <div class="timeline-step ${stepIndex >= 2 ? (stepIndex === 2 ? 'current' : 'completed') : ''}">
          <div class="timeline-dot"><i class="bi bi-search"></i></div>
          <div class="timeline-label">2. Under Review</div>
        </div>
        <div class="timeline-step ${stepIndex >= 3 ? (stepIndex === 3 ? 'current' : 'completed') : ''}">
          <div class="timeline-dot"><i class="bi bi-diagram-3"></i></div>
          <div class="timeline-label">3. Architecture Proposal</div>
        </div>
        <div class="timeline-step ${stepIndex >= 4 ? 'completed' : ''}">
          <div class="timeline-dot"><i class="bi bi-cpu"></i></div>
          <div class="timeline-label">4. Engineering Phase</div>
        </div>
      </div>

      <div class="pt-3 border-top border-secondary border-opacity-25 d-flex justify-content-between align-items-center font-mono small text-dim">
        <span>Assigned Lead: <strong class="text-cyan">${inq.assignedTo || 'Under Triage'}</strong></span>
        <span>Submitted: ${inq.submittedAt}</span>
      </div>
    `;
    container.appendChild(card);
  });
}

// Member Submit New Inquiry Modal Handler
window.handleMemberSubmitInquiry = function(event) {
  event.preventDefault();
  const currentUser = Auth.getCurrentUser();
  const projectType = document.getElementById('memberProjectType').value;
  const phone = document.getElementById('memberPhone').value.trim();
  const message = document.getElementById('memberMessage').value.trim();

  const inquiries = JSON.parse(localStorage.getItem(STORAGE_KEYS.INQUIRIES) || '[]');
  const newInq = {
    id: 'INQ-' + Math.floor(1000 + Math.random() * 9000),
    name: currentUser.name,
    company: currentUser.department || 'Enterprise Partner',
    email: currentUser.email,
    phone: phone || '+1 (555) 000-0000',
    projectType,
    message,
    status: 'New',
    assignedTo: 'Unassigned',
    submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
    priority: 'Normal'
  };

  inquiries.unshift(newInq);
  localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(inquiries));

  const modalEl = document.getElementById('memberNewInquiryModal');
  if (modalEl) bootstrap.Modal.getInstance(modalEl)?.hide();
  document.getElementById('memberInquiryForm').reset();
  renderMemberInquiries();
  Auth.logAudit(currentUser.email, `Member submitted new project inquiry: ${projectType}`);
  alert('Your project parameters have been dispatched to our Systems Architecture desk.');
};
