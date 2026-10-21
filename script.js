const root = document.documentElement;
const system = matchMedia('(prefers-color-scheme: dark)');

function getSavedTheme() {
  try {
    const theme = localStorage.getItem('theme');
    return theme === 'dark' || theme === 'light' ? theme : null;
  } catch (e) {
    return null;
  }
}

const savedTheme = getSavedTheme();
if (savedTheme) root.classList.add(savedTheme);

function isDarkMode() {
  const manual = getSavedTheme();
  if (manual === 'dark') return true;
  if (manual === 'light') return false;
  return system.matches;
}

function applyTheme(theme) {
  if (theme === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else if (theme === 'light') {
    root.classList.add('light');
    root.classList.remove('dark');
  } else {
    root.classList.remove('dark', 'light');
  }
  const toggle = document.querySelector('#theme');
  if (toggle) toggle.setAttribute('aria-checked', String(isDarkMode()));
}

system.addEventListener('change', () => {
  if (getSavedTheme() === null) applyTheme(null);
});

function setupThemeToggle(btn) {
  if (!btn) return;
  btn.setAttribute('aria-checked', String(isDarkMode()));
  btn.onclick = () => {
    document.body.classList.add('theme-transition');
    const nextTheme = isDarkMode() ? 'light' : 'dark';
    try { localStorage.setItem('theme', nextTheme); } catch (e) {}
    applyTheme(nextTheme);
  };
}

class SiteHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header>
        <h1><a href="/website/" aria-label="Homepage">Giuseppe Coiro</a></h1>
        <button id="theme" role="switch" aria-label="Cambia tema" aria-checked="${isDarkMode()}"></button>
      </header>
    `;
    setupThemeToggle(this.querySelector('#theme'));
  }
}
class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer>
        <a href="mailto:giuseppecoiro@proton.me" target="_blank" rel="noopener noreferrer">giuseppecoiro@proton.me</a>
        <span>Ethereum address: <a href="https://etherscan.io/address/0xa0A8A49274fD9c00b2ebbefF4C0C7A7739f455E" target="_blank" rel="noopener noreferrer">0xa0A8A49274fD9c00b2ebbefF4C0C7A7739f455E</a></span>
        <span>Solana address: <a href="https://solscan.io/account/LHFSGWbWQcJZTdxM7QFKkJ4Bq6ygUay7kJaGPQUUopT" target="_blank" rel="noopener noreferrer">LHFSGWbWQcJZTdxM7QFKkJ4Bq6ygUay7kJaGPQUUopT</a></span>
        <a href="https://www.linkedin.com/in/giuseppe-coiro-827b79420/" target="_blank" rel="noopener noreferrer">Collegati su LinkedIn</a>
        <a href="https://www.chess.com/member/martin_sileno" target="_blank" rel="noopener noreferrer">Giochiamo a scacchi</a>
      </footer>
    `;
  }
}
customElements.define('site-header', SiteHeader);
customElements.define('site-footer', SiteFooter);

document.addEventListener('DOMContentLoaded', () => {
  const galleria = document.querySelector('.galleria');
  if (!galleria) return;

  const immagini = galleria.querySelectorAll('img');
  const filtri = document.querySelectorAll('.filtro-grafica');
  filtri.forEach(bottone => {
    bottone.addEventListener('click', () => {
      const filtro = bottone.dataset.filtro;
      filtri.forEach(elemento => elemento.classList.toggle('attivo', elemento === bottone));
      immagini.forEach(img => {
        img.classList.toggle('nascosta', !(filtro === 'tutti' || img.dataset.evento === filtro));
      });
    });
  });

  galleria.addEventListener('click', evento => {
    const img = evento.target.closest('img');
    if (!img || img.classList.contains('nascosta')) return;

    const overlay = document.createElement('div');
    overlay.className = 'zoom-grafica';
    const grande = document.createElement('img');
    grande.src = img.src;
    grande.alt = img.alt;
    overlay.appendChild(grande);
    document.body.appendChild(overlay);
    overlay.addEventListener('click', () => overlay.remove());

    const chiudiConEsc = e => {
      if (e.key === 'Escape') {
        overlay.remove();
        document.removeEventListener('keydown', chiudiConEsc);
      }
    };
    document.addEventListener('keydown', chiudiConEsc);
  });
});
