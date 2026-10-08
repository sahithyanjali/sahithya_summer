// KaiOS D-Pad & SoftKey Navigation Controller
class DPadNavigation {
  constructor() {
    this.currentIndex = 0;
    this.elements = [];
    this.initListeners();
  }

  updateFocusables() {
    this.elements = Array.from(document.querySelectorAll('.focusable:not([disabled])'));
    if (this.elements.length > 0) {
      this.setFocus(Math.min(this.currentIndex, this.elements.length - 1));
    }
  }

  setFocus(index) {
    if (this.elements.length === 0) return;
    this.elements.forEach(el => el.classList.remove('focused'));
    this.currentIndex = Math.max(0, Math.min(index, this.elements.length - 1));
    const target = this.elements[this.currentIndex];
    if (target) {
      target.classList.add('focused');
      target.focus();
      target.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }

  initListeners() {
    window.addEventListener('keydown', (e) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          this.setFocus(this.currentIndex + 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          this.setFocus(this.currentIndex - 1);
          break;
        case 'Enter':
        case 'SoftCenter':
          e.preventDefault();
          if (this.elements[this.currentIndex]) {
            this.elements[this.currentIndex].click();
          }
          break;
        case 'SoftLeft':
        case 'F1':
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('kaios-soft-left'));
          break;
        case 'SoftRight':
        case 'F2':
          e.preventDefault();
          window.dispatchEvent(new CustomEvent('kaios-soft-right'));
          break;
      }
    });
  }
}

window.dpad = new DPadNavigation();
