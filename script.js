const STARS_COUNT = 50;
const PARTICLE_PROBABILITY = 0.98;

let currentLang = "en";
let isAnimating = false;
let lastScrollTime = 0;
let lastMouseTime = 0;

const cache = {
    stars: null,
    profileImage: null,
    scrollHeight: null
};

async function loadLanguage(lang) {
    try {
        const response = await fetch(`./lang/${lang}.json`);
        const translation = await response.json();

        document.querySelectorAll("[data-i18n]").forEach(el => {
            const key = el.getAttribute("data-i18n");
            if (translation[key]) {
                el.innerText = translation[key];
            }
        });

        document.querySelectorAll("[data-i18n-tooltip]").forEach(el => {
            const key = el.getAttribute("data-i18n-tooltip");
            if (translation[key]) {
                el.setAttribute("data-tooltip", translation[key]);
            }
        });

        document.documentElement.setAttribute("lang", lang);
    } catch (error) {
        console.error('Error loading language:', error);
    }
}

function createLanguageParticles(element) {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < 2; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.className = 'language-particle';
            particle.style.left = (rect.left + rect.width/2) + 'px';
            particle.style.top = (rect.top + rect.height/2) + 'px';
            document.body.appendChild(particle);

            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 600);
        }, i * 100);
    }
}

function createStars() {
    const starsContainer = document.getElementById('stars');
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < STARS_COUNT; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        const size = Math.random() * 2 + 1;
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        star.style.animationDelay = Math.random() * 3 + 's';
        fragment.appendChild(star);
    }
    
    starsContainer.appendChild(fragment);
    
    cache.stars = document.querySelectorAll('.star');
    cache.profileImage = document.querySelector('.profile-image');
}

function initParallaxEffect() {
    let ticking = false;
    
    function updateParallax() {
        const scrolled = window.pageYOffset;
        
        cache.stars.forEach((star, index) => {
            if (index % 4 === 0) {
                const speed = 0.1;
                star.style.transform = `translateY(${scrolled * speed}px)`;
            }
        });

        if (cache.profileImage) {
            cache.profileImage.style.transform = `translateY(${scrolled * 0.05}px)`;
        }
        
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateParallax);
            ticking = true;
        }
    });
}

function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.className = 'mouse-particle';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    document.body.appendChild(particle);

    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 800);
}

function initParticleSystem() {
    document.addEventListener('mousemove', function(e) {
        const now = Date.now();
        if (now - lastMouseTime > 200 && Math.random() > PARTICLE_PROBABILITY) {
            createParticle(e.clientX, e.clientY);
            lastMouseTime = now;
        }
    });
}

function typeWriter(element, text, speed = 100, callback = null) {
    element.innerHTML = '';
    let i = 0;

    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        } else {
            if (callback) callback();
        }
    }

    type();
}

function animateTerminalContent() {
    if (isAnimating) return;
    isAnimating = true;
    
    const terminalLines = document.querySelectorAll('.terminal-content > div');
    
    terminalLines.forEach((line, index) => {
        if (!line.getAttribute('data-original-content')) {
            line.setAttribute('data-original-content', line.innerHTML);
        }
        line.innerHTML = '';
        line.style.display = 'none';
    });

    let currentLineIndex = 0;

    function animateNextLine() {
        if (currentLineIndex >= terminalLines.length) {
            setTimeout(() => {
                terminalLines.forEach(line => {
                    line.innerHTML = '';
                    line.style.display = 'none';
                });
                currentLineIndex = 0;
                isAnimating = false;
                setTimeout(() => animateTerminalContent(), 5000);
            }, 2000);
            return;
        }

        const line = terminalLines[currentLineIndex];
        const originalContent = line.getAttribute('data-original-content');

        line.style.display = 'block';

        if (originalContent.includes('cursor') || originalContent.includes('_')) {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = originalContent;
            const cursorEl = tempDiv.querySelector('.cursor');
            if (cursorEl) cursorEl.remove();
            const textWithoutCursor = tempDiv.textContent || tempDiv.innerText || '';
            
            line.innerHTML = '<span class="text-content"></span><span class="cursor">_</span>';
            const textSpan = line.querySelector('.text-content');

            typeWriter(textSpan, textWithoutCursor, 120, () => {
                setTimeout(() => {
                    currentLineIndex++;
                    animateNextLine();
                }, 1000);
            });
        } else {
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = originalContent;
            const textContent = tempDiv.textContent || tempDiv.innerText || '';
            
            typeWriter(line, textContent, 80, () => {
                setTimeout(() => {
                    currentLineIndex++;
                    animateNextLine();
                }, 600);
            });
        }
    }

    animateNextLine();
}

function initTerminalAnimation() {
    setTimeout(() => {
        animateTerminalContent();
    }, 1000);
}

function initTerminalControls() {
    const terminal = document.querySelector('.terminal');
    const closeButton = document.querySelector('.terminal-close');
    const minimizeButton = document.querySelector('.terminal-minimize');
    
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            // Ferme complètement le terminal
            terminal.classList.add('minimized');
        });
    }
    
    if (minimizeButton) {
        minimizeButton.addEventListener('click', function() {
            // Bascule entre réduit et normal (pas fermé)
            if (terminal.classList.contains('collapsed')) {
                terminal.classList.remove('collapsed');
                minimizeButton.title = 'Minimiser';
                minimizeButton.style.transform = 'rotate(0deg)';
            } else {
                terminal.classList.add('collapsed');
                minimizeButton.title = 'Restaurer';
                minimizeButton.style.transform = 'rotate(180deg)';
            }
        });
    }
    
    // Optionnel : double-clic sur le header pour minimiser/restaurer
    const terminalHeader = document.querySelector('.terminal-header');
    if (terminalHeader) {
        terminalHeader.addEventListener('dblclick', function() {
            if (minimizeButton) {
                minimizeButton.click();
            }
        });
    }
    
    // Optionnel : bouton pour restaurer le terminal quand il est fermé
    document.addEventListener('keydown', function(e) {
        // Ctrl + T pour réouvrir le terminal (si fermé)
        if (e.ctrlKey && e.key === 't') {
            e.preventDefault();
            terminal.classList.remove('minimized');
            terminal.classList.remove('collapsed');
            if (minimizeButton) {
                minimizeButton.title = 'Minimiser';
                minimizeButton.style.transform = 'rotate(0deg)';
            }
        }
    });
}

function init() {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializePortfolio);
    } else {
        initializePortfolio();
    }
}

function initializePortfolio() {
    console.log('🚀 Initializing optimized portfolio...');

    try {
        loadLanguage(currentLang).then(() => {
            console.log('✅ Languages loaded');
            initTerminalAnimation();
            console.log('✅ Terminal animation started');
        });
        
        document.querySelectorAll('.lang-option').forEach(option => {
            option.addEventListener('click', function(e) {
                if (this.classList.contains('active')) return;
                
                document.querySelectorAll('.lang-option').forEach(opt => {
                    opt.classList.remove('active');
                });

                this.classList.add('active');

                const newLang = this.getAttribute('data-lang');
                currentLang = newLang;
                loadLanguage(currentLang);

                createLanguageParticles(this);
            });
        });

        createStars();
        console.log('✅ Stars generated (optimized)');

        initParallaxEffect();
        console.log('✅ Parallax effect enabled (optimized)');

        initParticleSystem();
        console.log('✅ Particle system enabled (optimized)');

        initTerminalControls();
        console.log('✅ Terminal controls initialized');

        console.log('🌟 Optimized portfolio operational!');
    } catch (error) {
        console.error('⚠️ Error during initialization:', error);
    }
}

window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
});

init();