document.addEventListener('DOMContentLoaded', function() {
  // Add animation to the hero section
  const header = document.querySelector('header');
  
  // Create animation elements
  const heroAnimation = document.createElement('div');
  heroAnimation.className = 'hero-animation';
  
  const request = document.createElement('div');
  request.className = 'request';
  
  const requestFast = document.createElement('div');
  requestFast.className = 'request request-fast';
  
  const cache = document.createElement('div');
  cache.className = 'cache';
  cache.textContent = 'CACHE';
  
  const server = document.createElement('div');
  server.className = 'server';
  server.textContent = 'API';
  
  // Append elements
  heroAnimation.appendChild(request);
  heroAnimation.appendChild(requestFast);
  heroAnimation.appendChild(cache);
  heroAnimation.appendChild(server);
  
  // Insert after the CTA
  const cta = header.querySelector('.cta');
  cta.parentNode.insertBefore(heroAnimation, cta.nextSibling);
  
  // Add syntax highlighting
  document.querySelectorAll('pre code').forEach((block) => {
    highlightCode(block);
  });
  
  // Add dark mode toggle
  const darkModeToggle = document.createElement('button');
  darkModeToggle.className = 'dark-mode-toggle';
  darkModeToggle.innerHTML = '🌙';
  darkModeToggle.setAttribute('aria-label', 'Toggle dark mode');
  
  darkModeToggle.addEventListener('click', () => {
    document.documentElement.setAttribute('data-theme', 
      document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'
    );
    darkModeToggle.innerHTML = document.documentElement.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
  });
  
  document.body.appendChild(darkModeToggle);
  
  // Check user preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
    darkModeToggle.innerHTML = '☀️';
  }
});

// Simple syntax highlighting function
function highlightCode(element) {
  let code = element.textContent;
  
  // Keywords
  code = code.replace(/\b(import|from|const|let|var|function|return|await|async|if|else|for|while)\b/g, '<span class="token keyword">$1</span>');
  
  // Strings
  code = code.replace(/(["'])(.*?)\1/g, '<span class="token string">$1$2$1</span>');
  
  // Comments
  code = code.replace(/\/\/(.*)/g, '<span class="token comment">// $1</span>');
  
  // Numbers
  code = code.replace(/\b(\d+)\b/g, '<span class="token number">$1</span>');
  
  // Functions
  code = code.replace(/\b([a-zA-Z]+)(?=\()/g, '<span class="token function">$1</span>');
  
  // Objects and properties
  code = code.replace(/\.([a-zA-Z]+)\b/g, '.<span class="token property">$1</span>');
  
  element.innerHTML = code;
}
