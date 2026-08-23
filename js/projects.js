/**
 * AncomeVortex - Projects Data & Filtering Module
 * Manages project cards, category filters, and detailed technical modal preview
 */

const projectsData = [
  {
    id: "vortex-grid",
    category: "iot",
    categoryLabel: "IoT Solutions",
    title: "VortexGrid™ Telemetry Substation",
    tagline: "Ultra-resilient IIoT Grid for Smart Energy Distribution",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    tags: ["LoRaWAN", "MQTT / TLS", "Edge AI", "Grafana"],
    summary: "High-density telemetry sensor array deployed across 1,400+ power substations, transmitting real-time vibration, thermal, and voltage data with 99.999% uptime.",
    architecture: "Edge Gateways (ARM Cortex-M7) -> LoRaWAN Gateway Mesh -> Kafka Broker -> InfluxDB Time-Series -> Real-Time Neural Anomaly Engine.",
    metrics: [
      { label: "Deployment Nodes", value: "1,400+" },
      { label: "Latency", value: "< 12ms" },
      { label: "Fault Prevention", value: "94.8%" },
      { label: "Energy Saved", value: "3.2 GWh/yr" }
    ],
    fullDesc: "The VortexGrid platform bridges legacy electrical infrastructure with next-generation edge intelligence. Using custom IP68 sealed sensor enclosures and encrypted telemetry protocols, field engineers receive proactive alerts 72 hours before catastrophic transformer overheating occurs."
  },
  {
    id: "aeroscan-x9",
    category: "drones",
    categoryLabel: "Drone Technology",
    title: "AeroScan X-9 Autonomous UAV",
    tagline: "Autonomous LiDAR Fleet for Heavy Pipeline & Powerline Survey",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80",
    tags: ["UAV Hardware", "LiDAR 3D", "PX4 Autopilot", "5G Telemetry"],
    summary: "Long-endurance autonomous quadcopters equipped with multi-spectral LiDAR and AI vision for continuous 120km pipeline structural diagnostics.",
    architecture: "Carbon-Fiber Airframe -> Velodyne LiDAR + 4K Optical Gimbal -> Jetson Orin Nano Onboard Compute -> Starlink / 5G Failover Uplink.",
    metrics: [
      { label: "Flight Range", value: "120 km" },
      { label: "Mapping Precision", value: "±2 mm" },
      { label: "Endurance", value: "85 Mins" },
      { label: "Inspection Speed", value: "10x Human" }
    ],
    fullDesc: "AeroScan X-9 operates in extreme weather conditions (-20°C to +55°C) executing automated waypoint routes. Onboard edge AI classifies micro-cracks, vegetation encroachment, and gas leak plumes in real-time, streaming 3D point-cloud models to cloud command centers."
  },
  {
    id: "cobotsync-7",
    category: "robotics",
    categoryLabel: "Robotics",
    title: "CobotSync-7 Precision Assembly",
    tagline: "Collaborative Swarm Robotics for Micro-Electronics Cleanrooms",
    image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80",
    tags: ["ROS 2", "7-DoF Kinematics", "Force Feedback", "OpenCV"],
    summary: "Synchronized 7-degree-of-freedom robotic arms working alongside cleanroom technicians with sub-millimeter force control and collision aversion.",
    architecture: "Harmonic Drive Actuators -> Real-time Linux RT-PREEMPT -> ROS 2 Galactic -> RGB-D Spatial Vision Sensors -> Zero-G Hand Guiding.",
    metrics: [
      { label: "Repeatability", value: "±0.01 mm" },
      { label: "Safety Rating", value: "ISO 10218-1" },
      { label: "Throughput Boost", value: "+340%" },
      { label: "Cycle Time", value: "1.8 sec" }
    ],
    fullDesc: "CobotSync-7 redefines cleanroom micro-assembly. Featuring haptic tactile sensors and dynamic load balancing, the swarm coordinates multi-stage soldering, chip seating, and ultrasonic bonding without requiring safety cages."
  },
  {
    id: "neuralpulse-ai",
    category: "ai",
    categoryLabel: "AI & Automation",
    title: "NeuralPulse™ Predictive Engine",
    tagline: "Edge-Native Deep Learning for Industrial Asset Health",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80",
    tags: ["PyTorch", "TensorRT", "Edge Impulse", "Time-Series CNN"],
    summary: "Self-supervised neural network trained on millions of vibrational acoustic signatures, eliminating unplanned factory downtime through micro-anomaly detection.",
    architecture: "High-frequency Piezo Sensors -> FPGA Sampling Engine -> TensorRT Quantized CNN -> Edge Inference Node -> Automated SCADA Interlock.",
    metrics: [
      { label: "Accuracy", value: "99.4%" },
      { label: "Inference Time", value: "1.2 ms" },
      { label: "Downtime Cut", value: "-82%" },
      { label: "Sensors Managed", value: "50,000+" }
    ],
    fullDesc: "NeuralPulse continuously analyzes high-frequency acoustic emissions and vibration spectra in rotating industrial machinery. The edge model detects bearing spalling, gear misalignment, and cavitation days before traditional temperature thresholds trigger alarms."
  },
  {
    id: "biosense-sentinel",
    category: "iot",
    categoryLabel: "Smart Hardware",
    title: "BioSense Sentinel Network",
    tagline: "Hazardous Gas & Environmental Autonomous Monitor",
    image: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80",
    tags: ["Custom PCB", "Gas Spectroscopy", "BLE 5.3", "Solar Harvest"],
    summary: "Ruggedized self-powered environmental sensor nodes for continuous chemical plume tracking and wildfire early-detection in remote terrain.",
    architecture: "Electrochemical + NDIR Sensors -> Energy Harvesting PMIC -> Nordic nRF5340 Dual-Core -> Satellite NTN Fallback -> Cloud GIS.",
    metrics: [
      { label: "Battery Life", value: "10 Years" },
      { label: "Detection Limit", value: "1 ppb" },
      { label: "Operating Temp", value: "-40 to 85°C" },
      { label: "Payload Weight", value: "240 g" }
    ],
    fullDesc: "Engineered for hazardous petrochemical refineries and critical conservation forests. The nodes leverage ambient kinetic and solar harvesting to sustain perpetual operation while broadcasting atmospheric data over non-terrestrial satellite networks."
  },
  {
    id: "quantumlink-cloud",
    category: "software",
    categoryLabel: "Software Solutions",
    title: "QuantumLink™ Distributed Cloud",
    tagline: "Ultra-Low Latency Telemetry & Device Control Mesh",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    tags: ["Rust", "WebAssembly", "gRPC", "Kubernetes", "Vue.js 3"],
    summary: "Distributed microservices cloud platform capable of orchestrating 10 million concurrent telemetry sockets with sub-5ms bidirectional commands.",
    architecture: "Rust Edge Daemons -> Envoy Proxies -> Distributed NATS Messaging -> CockroachDB Multi-Region -> WebGL Command HUD.",
    metrics: [
      { label: "Throughput", value: "10M msgs/sec" },
      { label: "End-to-End Latency", value: "< 4.8 ms" },
      { label: "Global Nodes", value: "24 Regions" },
      { label: "Data Compression", value: "88% Ratio" }
    ],
    fullDesc: "QuantumLink provides mission-critical control rooms with instantaneous digital twin synchronicity. Field operators can override autonomous vehicles, tune PID loops, and deploy firmware updates over-the-air across global fleets with cryptographic verification."
  }
];

// Initialize Projects Grid
document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('projects-grid-container');
  const filterButtons = document.querySelectorAll('.btn-filter');

  if (container) {
    renderProjects('all');

    filterButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        filterButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const filter = btn.getAttribute('data-filter');
        renderProjects(filter);
      });
    });
  }

  function renderProjects(filter) {
    container.innerHTML = '';
    const filtered = filter === 'all' 
      ? projectsData 
      : projectsData.filter(p => p.category === filter);

    filtered.forEach((p, index) => {
      const cardCol = document.createElement('div');
      cardCol.className = 'col-lg-4 col-md-6 mb-4 reveal-fade-up';
      cardCol.style.transitionDelay = `${index * 0.1}s`;

      const tagsHtml = p.tags.map(t => `<span class="tag-pill">${t}</span>`).join('');

      cardCol.innerHTML = `
        <div class="project-card">
          <div class="project-img-wrap">
            <img src="${p.image}" alt="${p.title}" class="project-img" loading="lazy">
            <span class="project-overlay-badge">${p.categoryLabel}</span>
          </div>
          <div class="project-body">
            <div>
              <div class="project-tags">${tagsHtml}</div>
              <h4 class="project-title text-gradient-cyan">${p.title}</h4>
              <p class="project-desc">${p.summary}</p>
            </div>
            <div class="pt-3 border-top border-secondary border-opacity-25 d-flex justify-content-between align-items-center">
              <span class="text-dim font-mono small">${p.metrics[0].label}: <strong class="text-cyan">${p.metrics[0].value}</strong></span>
              <button class="btn btn-sm btn-cyber-outline" onclick="openProjectModal('${p.id}')">
                View Blueprint <i class="bi bi-arrow-right-short"></i>
              </button>
            </div>
          </div>
        </div>
      `;
      container.appendChild(cardCol);
    });

    // Trigger reveal animation
    setTimeout(() => {
      document.querySelectorAll('.reveal-fade-up').forEach(el => el.classList.add('active'));
    }, 50);
  }
});

// Global Function to Open Technical Modal
window.openProjectModal = function(projectId) {
  const project = projectsData.find(p => p.id === projectId);
  if (!project) return;

  const modalTitle = document.getElementById('projectModalTitle');
  const modalCategory = document.getElementById('projectModalCategory');
  const modalImage = document.getElementById('projectModalImage');
  const modalDesc = document.getElementById('projectModalDesc');
  const modalArchitecture = document.getElementById('projectModalArchitecture');
  const modalTags = document.getElementById('projectModalTags');
  const modalMetrics = document.getElementById('projectModalMetrics');

  if (modalTitle) modalTitle.textContent = project.title;
  if (modalCategory) modalCategory.textContent = project.categoryLabel;
  if (modalImage) {
    modalImage.src = project.image;
    modalImage.alt = project.title;
  }
  if (modalDesc) modalDesc.textContent = project.fullDesc;
  if (modalArchitecture) modalArchitecture.textContent = project.architecture;

  if (modalTags) {
    modalTags.innerHTML = project.tags.map(t => `<span class="tag-pill">${t}</span>`).join('');
  }

  if (modalMetrics) {
    modalMetrics.innerHTML = project.metrics.map(m => `
      <div class="col-6 col-md-3 mb-2">
        <div class="cyber-stat-box p-2">
          <div class="text-cyan fw-bold fs-5">${m.value}</div>
          <div class="text-dim small font-mono">${m.label}</div>
        </div>
      </div>
    `).join('');
  }

  const modalElement = document.getElementById('projectDetailModal');
  if (modalElement && typeof bootstrap !== 'undefined') {
    const modal = new bootstrap.Modal(modalElement);
    modal.show();
  }
};
