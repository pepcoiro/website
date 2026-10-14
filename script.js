const root = document.documentElement;
const savedTheme = sessionStorage.getItem('theme');
if (savedTheme) root.classList.add(savedTheme);

const system = matchMedia('(prefers-color-scheme: dark)');

function isDarkMode() {
  const manual = sessionStorage.getItem('theme');
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
  if (sessionStorage.getItem('theme') === null) applyTheme(null);
});

function setupThemeToggle(btn) {
  if (!btn) return;
  btn.setAttribute('aria-checked', String(isDarkMode()));
  btn.onclick = () => {
    document.body.classList.add('theme-transition');
    const nextTheme = isDarkMode() ? 'light' : 'dark';
    try { sessionStorage.setItem('theme', nextTheme); } catch (e) {}
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
        <a href="https://www.linkedin.com/in/giuseppe-coiro-827b79420/" target="_blank" rel="noopener noreferrer">Collegati su LinkedIn</a>
        <a href="https://www.chess.com/member/martin_sileno" target="_blank" rel="noopener noreferrer">Giochiamo a scacchi</a>
      </footer>
    `;
  }
}
customElements.define('site-header', SiteHeader);
customElements.define('site-footer', SiteFooter);

function loadMarkdownLibrary() {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/marked/marked.min.js';
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function caricaArticolo() {
  const contenuto = document.querySelector('#contenuto-articolo');
  const titolo = document.querySelector('#titolo-articolo');
  if (!contenuto || !titolo) return;

  const nomeFile = new URLSearchParams(window.location.search).get('file');
  if (!nomeFile) return;

  const titoloArticolo = nomeFile
    .replace(/\.md$/i, '')
    .replace(/-/g, ' ');
  titolo.textContent = titoloArticolo.charAt(0).toUpperCase() + titoloArticolo.slice(1);
  document.title = titolo.textContent + ' / Giuseppe Coiro';

  try {
    const risposta = await fetch(nomeFile);
    const markdown = await risposta.text();
    await loadMarkdownLibrary();
    contenuto.innerHTML = marked.parse(markdown);
  } catch {
    contenuto.textContent = 'Impossibile caricare l’articolo.';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  caricaArticolo();

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
