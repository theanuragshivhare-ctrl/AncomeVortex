/**
 * AncomeVortex - Authentication & Session Management Module
 * Handles local storage persistence, seeded mock database, RBAC enforcement, and session guards
 */

const STORAGE_KEYS = {
  USERS: 'av_users_db',
  SESSION: 'av_active_session',
  INQUIRIES: 'av_inquiries_db',
  PROJECTS: 'av_projects_db',
  EMPLOYEES: 'av_employees_db',
  RND_ITEMS: 'av_rnd_db',
  AUDIT_LOGS: 'av_audit_logs'
};

// Seed Initial Database if not already present
function initDatabase() {
  // 1. Initial Users (All 4 Roles)
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const initialUsers = [
      {
        id: 'usr-001',
        name: 'Dr. Elena Vance (Head)',
        email: 'head@ancomevortex.com',
        password: 'admin123',
        role: 'head',
        roleLabel: 'Head / Super Admin',
        department: 'Executive Systems & R&D',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
        joinedDate: '2025-01-10'
      },
      {
        id: 'usr-002',
        name: 'Marcus Sterling (Admin)',
        email: 'admin@ancomevortex.com',
        password: 'admin123',
        role: 'admin',
        roleLabel: 'Administration',
        department: 'Operations & Resource Management',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
        joinedDate: '2025-02-15'
      },
      {
        id: 'usr-003',
        name: 'Aria Chen (Lead Engineer)',
        email: 'employee@ancomevortex.com',
        password: 'employee123',
        role: 'employee',
        roleLabel: 'Employee / Engineer',
        department: 'Robotics & Hardware Systems',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
        joinedDate: '2025-04-01'
      },
      {
        id: 'usr-004',
        name: 'David Vance (Global Energy Corp)',
        email: 'member@ancomevortex.com',
        password: 'member123',
        role: 'member',
        roleLabel: 'Member / Client',
        department: 'Client Partner Organization',
        status: 'active',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
        joinedDate: '2025-06-20'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(initialUsers));
  }

  // 2. Initial Inquiries Database
  if (!localStorage.getItem(STORAGE_KEYS.INQUIRIES)) {
    const initialInquiries = [
      {
        id: 'INQ-9081',
        name: 'David Vance',
        company: 'Global Energy Corp',
        email: 'member@ancomevortex.com',
        phone: '+1 (555) 382-9912',
        projectType: 'IoT Development',
        message: 'Require 2,000 sub-station LoRa telemetry sensor arrays with custom vibration and temperature thresholds for deployment across Texas power grid.',
        status: 'In Review',
        assignedTo: 'Aria Chen',
        submittedAt: '2026-08-20 10:14',
        priority: 'High'
      },
      {
        id: 'INQ-9082',
        name: 'Sarah Jenkins',
        company: 'AeroDynamics Defense',
        email: 's.jenkins@aerodynamics.io',
        phone: '+1 (555) 749-1102',
        projectType: 'Drone Solutions',
        message: 'Inquiring about AeroScan X-9 UAV autonomous charging nests for offshore rig perimeter patrol.',
        status: 'Approved',
        assignedTo: 'Marcus Sterling',
        submittedAt: '2026-08-21 14:32',
        priority: 'Critical'
      },
      {
        id: 'INQ-9083',
        name: 'Kenji Sato',
        company: 'Tokyo Micro-Fab Inc',
        email: 'k.sato@microfab.jp',
        phone: '+81 3-5555-0199',
        projectType: 'Robotics Prototyping',
        message: 'Seeking custom 7-DoF Cobot end-effectors for semiconductor wafer handling.',
        status: 'New',
        assignedTo: 'Unassigned',
        submittedAt: '2026-08-23 09:05',
        priority: 'Medium'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.INQUIRIES, JSON.stringify(initialInquiries));
  }

  // 3. Initial Projects for Tracking
  if (!localStorage.getItem(STORAGE_KEYS.PROJECTS)) {
    const initialProjects = [
      {
        id: 'PRJ-VORTEX-01',
        title: 'VortexGrid™ Telemetry Substation',
        category: 'IoT Solutions',
        progress: 88,
        lead: 'Aria Chen',
        status: 'Active Deployment',
        budget: '$1.4M',
        nodes: '1,400 Nodes',
        deadline: '2026-11-30',
        tasks: [
          { name: 'Hardware RF Compliance Testing', completed: true },
          { name: 'LoRa Gateway Mesh Deployment', completed: true },
          { name: 'Kafka Anomaly Stream Integration', completed: false },
          { name: 'Field Operator Training', completed: false }
        ]
      },
      {
        id: 'PRJ-AERO-02',
        title: 'AeroScan X-9 Autonomous Fleet',
        category: 'Drone Technology',
        progress: 65,
        lead: 'Marcus Sterling',
        status: 'In Testing',
        budget: '$850k',
        nodes: '12 UAVs',
        deadline: '2027-01-15',
        tasks: [
          { name: 'LiDAR 3D Point-Cloud Calibration', completed: true },
          { name: 'BVLOS 5G Failover Testing', completed: true },
          { name: 'Automated Nest Inductive Docking', completed: false },
          { name: 'Civil Aviation Authority Approval', completed: false }
        ]
      },
      {
        id: 'PRJ-COBOT-03',
        title: 'CobotSync-7 Swarm Cleanroom',
        category: 'Robotics',
        progress: 42,
        lead: 'Aria Chen',
        status: 'Prototyping',
        budget: '$620k',
        nodes: '8 Arms',
        deadline: '2027-03-01',
        tasks: [
          { name: '7-DoF Kinematics Simulation', completed: true },
          { name: 'Haptic Force Sensor Fabrication', completed: false },
          { name: 'ROS 2 Galactic Cleanroom Controller', completed: false }
        ]
      }
    ];
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(initialProjects));
  }

  // 4. Initial Employees
  if (!localStorage.getItem(STORAGE_KEYS.EMPLOYEES)) {
    const initialEmployees = [
      {
        id: 'EMP-101',
        name: 'Aria Chen',
        email: 'employee@ancomevortex.com',
        role: 'Principal Robotics & RF Engineer',
        shift: 'Alpha Shift (08:00 - 17:00)',
        activeProjects: ['VortexGrid™ Telemetry', 'CobotSync-7 Swarm'],
        status: 'On Duty',
        productivity: 96
      },
      {
        id: 'EMP-102',
        name: 'Tariq Al-Mansoor',
        email: 't.mansoor@ancomevortex.com',
        role: 'Senior AI Research Scientist',
        shift: 'Beta Shift (10:00 - 19:00)',
        activeProjects: ['NeuralPulse AI Engine'],
        status: 'In Lab',
        productivity: 98
      },
      {
        id: 'EMP-103',
        name: 'Linnea Lindqvist',
        email: 'l.lindqvist@ancomevortex.com',
        role: 'Embedded Firmware Specialist',
        shift: 'Alpha Shift (08:00 - 17:00)',
        activeProjects: ['BioSense Sentinel Node'],
        status: 'On Duty',
        productivity: 94
      }
    ];
    localStorage.setItem(STORAGE_KEYS.EMPLOYEES, JSON.stringify(initialEmployees));
  }

  // 5. Initial R&D Innovations
  if (!localStorage.getItem(STORAGE_KEYS.RND_ITEMS)) {
    const initialRnd = [
      {
        id: 'RND-01',
        title: 'Nitrogen-Vacancy Diamond Magnetometer',
        trlLevel: 'TRL-6 (System Prototype Demo)',
        lead: 'Dr. Elena Vance',
        lastUpdated: '2026-08-22',
        status: 'Active Experimentation',
        notes: 'Demonstrated sub-picotesla subterranean magnetic field tracking without GPS signal in Chamber 4.'
      },
      {
        id: 'RND-02',
        title: 'GaN Power Inverter for Cobot Actuators',
        trlLevel: 'TRL-7 (Integrated Field Prototype)',
        lead: 'Aria Chen',
        lastUpdated: '2026-08-21',
        status: 'Thermal Stress Testing',
        notes: 'Achieved 99.2% electrical efficiency under 48V continuous 30A torque cycling.'
      }
    ];
    localStorage.setItem(STORAGE_KEYS.RND_ITEMS, JSON.stringify(initialRnd));
  }

  // 6. Initial Audit Logs
  if (!localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS)) {
    const initialLogs = [
      { time: '2026-08-23 15:10:12', user: 'system', action: 'Quantum telemetry mesh synchronized across 24 edge nodes.' },
      { time: '2026-08-23 14:45:00', user: 'head@ancomevortex.com', action: 'Approved Project Blueprint PRJ-VORTEX-01.' },
      { time: '2026-08-23 11:20:18', user: 'admin@ancomevortex.com', action: 'Assigned Inquiry INQ-9081 to Aria Chen.' }
    ];
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(initialLogs));
  }
}

// Call initDatabase on module load
initDatabase();

// Auth Controller Object
const Auth = {
  // Get active session
  getSession() {
    const sessionStr = localStorage.getItem(STORAGE_KEYS.SESSION) || sessionStorage.getItem(STORAGE_KEYS.SESSION);
    if (!sessionStr) return null;
    try {
      return JSON.parse(sessionStr);
    } catch (e) {
      return null;
    }
  },

  // Check if user is logged in
  isLoggedIn() {
    return this.getSession() !== null;
  },

  // Get current user details
  getCurrentUser() {
    const session = this.getSession();
    if (!session) return null;
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    return users.find(u => u.id === session.id) || session;
  },

  // Login handler
  login(email, password, remember = true) {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());

    if (!user) {
      return { success: false, message: 'No account found with this corporate email address.' };
    }

    if (user.password !== password) {
      return { success: false, message: 'Invalid password. Please check your credentials.' };
    }

    if (user.status === 'suspended') {
      return { success: false, message: 'This account has been suspended by the System Administrator.' };
    }

    const sessionData = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roleLabel: user.roleLabel,
      department: user.department,
      avatar: user.avatar,
      loginTimestamp: new Date().toISOString()
    };

    if (remember) {
      localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
    } else {
      sessionStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(sessionData));
    }

    // Log Audit
    this.logAudit(user.email, `User signed in successfully (Role: ${user.role}).`);

    return { success: true, user: sessionData };
  },

  // Register handler
  register(userData) {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const exists = users.some(u => u.email.toLowerCase() === userData.email.toLowerCase().trim());

    if (exists) {
      return { success: false, message: 'An account with this email address already exists.' };
    }

    const role = userData.role || 'member';
    let roleLabel = 'Member / Client';
    if (role === 'head') roleLabel = 'Head / Super Admin';
    if (role === 'admin') roleLabel = 'Administration';
    if (role === 'employee') roleLabel = 'Employee / Engineer';

    const newUser = {
      id: 'usr-' + Math.floor(1000 + Math.random() * 9000),
      name: userData.name,
      email: userData.email.toLowerCase().trim(),
      password: userData.password,
      role: role,
      roleLabel: roleLabel,
      department: userData.department || 'Client Operations',
      status: 'active',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      joinedDate: new Date().toISOString().split('T')[0]
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

    // Auto login
    this.login(newUser.email, newUser.password, true);
    this.logAudit(newUser.email, `New user registration created (Role: ${newUser.role}).`);

    return { success: true, user: newUser };
  },

  // Logout handler
  logout() {
    const session = this.getSession();
    if (session) {
      this.logAudit(session.email, 'User signed out of system session.');
    }
    localStorage.removeItem(STORAGE_KEYS.SESSION);
    sessionStorage.removeItem(STORAGE_KEYS.SESSION);
    window.location.href = 'login.html';
  },

  // Route Guard / Enforce Permissions
  requireAuth(allowedRoles = []) {
    const session = this.getSession();
    if (!session) {
      window.location.href = 'login.html';
      return null;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
      // Redirect to designated dashboard
      window.location.href = `dashboard-${session.role}.html`;
      return null;
    }

    return session;
  },

  // Password Reset Simulator
  resetPassword(email, newPassword) {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase().trim());

    if (userIndex === -1) {
      return { success: false, message: 'Email address not found in security database.' };
    }

    users[userIndex].password = newPassword;
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.logAudit(email, 'Password successfully reset via security recovery.');

    return { success: true, message: 'Password has been updated. You can now login with your new credentials.' };
  },

  // Helper: Log security action
  logAudit(user, action) {
    try {
      const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS) || '[]');
      const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
      logs.unshift({ time: timestamp, user, action });
      if (logs.length > 100) logs.pop();
      localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(logs));
    } catch (e) {
      console.error('Failed to write audit log', e);
    }
  }
};

// Expose Auth globally
window.Auth = Auth;
window.STORAGE_KEYS = STORAGE_KEYS;
