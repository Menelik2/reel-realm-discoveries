// Site protection utilities to prevent cloning and unauthorized access

export const initSiteProtection = () => {
  // Disable right-click context menu
  document.addEventListener('contextmenu', (e) => {
    e.preventDefault();
    return false;
  });

  // Disable text selection
  document.addEventListener('selectstart', (e) => {
    const target = e.target as HTMLElement;
    // Allow selection in input fields and textareas
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return true;
    }
    e.preventDefault();
    return false;
  });

  // Disable drag and drop
  document.addEventListener('dragstart', (e) => {
    e.preventDefault();
    return false;
  });

  // Disable keyboard shortcuts for viewing source, saving page, etc.
  document.addEventListener('keydown', (e) => {
    // Disable F12 (DevTools)
    if (e.key === 'F12') {
      e.preventDefault();
      return false;
    }
    
    // Disable Ctrl+Shift+I (DevTools)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault();
      return false;
    }
    
    // Disable Ctrl+Shift+J (Console)
    if (e.ctrlKey && e.shiftKey && e.key === 'J') {
      e.preventDefault();
      return false;
    }
    
    // Disable Ctrl+Shift+C (Inspect Element)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      return false;
    }
    
    // Disable Ctrl+U (View Source)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      return false;
    }
    
    // Disable Ctrl+S (Save Page)
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      return false;
    }
    
    // Disable Ctrl+P (Print)
    if (e.ctrlKey && e.key === 'p') {
      e.preventDefault();
      return false;
    }
    
    // Disable Ctrl+A (Select All) outside inputs
    if (e.ctrlKey && e.key === 'a') {
      const target = e.target as HTMLElement;
      if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        return false;
      }
    }
    
    return true;
  });

  // DevTools detection using debugger timing
  const detectDevTools = () => {
    const threshold = 160;
    const start = performance.now();
    
    // Using debugger statement - will pause if DevTools is open
    // eslint-disable-next-line no-debugger
    debugger;
    
    const end = performance.now();
    
    if (end - start > threshold) {
      // DevTools detected - you can add custom handling here
      console.clear();
      console.log('%c⚠️ Warning', 'color: red; font-size: 40px; font-weight: bold;');
      console.log('%cThis site is protected. Unauthorized access is prohibited.', 'color: red; font-size: 16px;');
    }
  };

  // Run detection periodically (disabled in development for convenience)
  if (import.meta.env.PROD) {
    // Clear console periodically
    setInterval(() => {
      console.clear();
    }, 1000);
  }

  // Disable copy
  document.addEventListener('copy', (e) => {
    const target = e.target as HTMLElement;
    // Allow copy in input fields and textareas
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return true;
    }
    e.preventDefault();
    return false;
  });

  // Disable cut
  document.addEventListener('cut', (e) => {
    const target = e.target as HTMLElement;
    // Allow cut in input fields and textareas
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      return true;
    }
    e.preventDefault();
    return false;
  });

  // Add CSS to disable selection
  const style = document.createElement('style');
  style.textContent = `
    body {
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      user-select: none;
    }
    
    input, textarea {
      -webkit-user-select: text;
      -moz-user-select: text;
      -ms-user-select: text;
      user-select: text;
    }
    
    img {
      pointer-events: none;
      -webkit-user-drag: none;
      -khtml-user-drag: none;
      -moz-user-drag: none;
      -o-user-drag: none;
      user-drag: none;
    }
  `;
  document.head.appendChild(style);

  console.log('%c⚠️ Warning', 'color: red; font-size: 40px; font-weight: bold;');
  console.log('%cThis browser feature is intended for developers only.', 'font-size: 16px;');
  console.log('%cIf someone told you to copy-paste something here, it is a scam.', 'font-size: 16px; color: red;');
};
