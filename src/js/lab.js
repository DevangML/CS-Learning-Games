// Lab Page Router + Loader
;(function () {
  function hideMainUIs() {
    const ids = ['blog-main'];
    ids.forEach(id => { const el = document.getElementById(id); if (el) el.style.display = 'none'; });
  }

  function ensureLabRoot() {
    let root = document.getElementById('lab-root');
    if (!root) {
      root = document.createElement('div');
      root.id = 'lab-root';
      root.className = 'lab-page';
      const container = document.querySelector('.container') || document.body;
      container.appendChild(root);
    }
    root.style.display = 'block';
    return root;
  }

  async function showLab(topic) {
    hideMainUIs();
    const root = ensureLabRoot();
    // Clear previous
    root.innerHTML = '';

    // Header/nav crumbs
    const header = document.createElement('div');
    header.className = 'lab-topbar';
    header.innerHTML = `
      <div class="breadcrumb"><a href="/cn" data-route="/cn">📚 CN Hub</a> / Lab: ${topic.toUpperCase()}</div>
    `;
    root.appendChild(header);

    const stage = document.createElement('div');
    stage.className = 'lab-stage';
    root.appendChild(stage);

    // Mount engine
    if (window.LabEngine && typeof window.LabEngine.mount === 'function') {
      window.LabEngine.mount(stage);
    }

    // Pick scene by topic
    if (topic === 'bdp') {
      const scene = new window.BDPLabScene();
      await window.LabEngine.loadScene(scene);
    } else if (topic === 'arq') {
      const scene = new window.ARQLabScene();
      await window.LabEngine.loadScene(scene);
    } else if (topic === 'frag') {
      const scene = new window.FragLabScene();
      await window.LabEngine.loadScene(scene);
    } else {
      stage.innerHTML = '<p style="color:#fff">Lab not available yet.</p>';
    }
  }

  function registerRoutes() {
    if (!window.router) return;
    window.router.route('/lab/:topic', (ctx) => {
      showLab(ctx.params.topic);
    }, { title: 'CN Lab' });
  }

  document.addEventListener('DOMContentLoaded', registerRoutes);
  window.showLab = showLab;
})();
