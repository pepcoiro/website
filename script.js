class SiteHeader extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <header>
        <h1><a href="/website/" aria-label="Homepage">Giuseppe Coiro</a></h1>
      </header>
    `;
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
