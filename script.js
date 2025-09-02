const STARS_COUNT = 200;
const PARTICLE_PROBABILITY = 0.95;

let currentLang = "en";

async function loadLanguage(lang) {
    const response = await fetch(`./lang/${lang}.json`);
    const translation = await response.json();

    document.querySelectorAll("[data-i18n]").forEach(el => {
        const key = el.getAttribute("data-i18n");
        el.innerText = translation[key] || key;
    });

    document.querySelectorAll("[data-i18n-tooltip]").forEach(el => {
        const key = el.getAttribute("data-i18n-tooltip");
        el.setAttribute("data-tooltip", translation[key] || key);
    });

    document.documentElement.setAttribute("lang", lang);
}

function createLanguageParticles(element) {
    const rect = element.getBoundingClientRect();
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const particle = document.createElement('div');
            particle.style.position = 'fixed';
            particle.style.left = (rect.left + rect.width/2 + (Math.random() - 0.5) * 30) + 'px';
            particle.style.top = (rect.top + rect.height/2 + (Math.random() - 0.5) * 30) + 'px';
            particle.style.width = '3px';
            particle.style.height = '3px';
            particle.style.background = '#00ffff';
            particle.style.borderRadius = '50%';
            particle.style.pointerEvents = 'none';
            particle.style.zIndex = '9999';
            particle.style.opacity = '0.8';
            particle.style.boxShadow = '0 0 6px #00ffff';
            particle.style.animation = 'languageParticle 0.8s ease-out forwards';
            document.body.appendChild(particle);

            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 800);
        }, i * 50);
    }
}

function createStars() {
    const starsContainer = document.getElementById('stars');

    for (let i = 0; i < STARS_COUNT; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = Math.random() * 3 + 1 + 'px';
        star.style.height = star.style.width;
        star.style.animationDelay = Math.random() * 3 + 's';
        starsContainer.appendChild(star);
    }
}

function initParallaxEffect() {
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const stars = document.querySelectorAll('.star');

        stars.forEach((star, index) => {
            const layer = (index % 4 + 1);
            const speed = layer * 0.2;
            const yPos = scrolled * speed;
            star.style.transform = `translateY(${yPos}px) translateZ(0)`;
        });

        const profileImage = document.querySelector('.profile-image');
        if (profileImage) {
            profileImage.style.transform = `translateY(${scrolled * 0.1}px) scale(${1.05 - scrolled * 0.0001})`;
        }
    });
}

function createParticle(x, y) {
    const particle = document.createElement('div');
    particle.style.position = 'fixed';
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    particle.style.width = '2px';
    particle.style.height = '2px';
    particle.style.background = '#4facfe';
    particle.style.borderRadius = '50%';
    particle.style.pointerEvents = 'none';
    particle.style.zIndex = '-1';
    particle.style.opacity = '0.6';
    particle.style.animation = 'particleFade 1s ease-out forwards';
    document.body.appendChild(particle);

    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 1000);
}

function initParticleSystem() {
    document.addEventListener('mousemove', function(e) {
        if (Math.random() > PARTICLE_PROBABILITY) {
            createParticle(e.clientX, e.clientY);
        }
    });

    document.querySelectorAll('.lang-option').forEach(option => {
        option.addEventListener('mouseenter', function(e) {
            const rect = this.getBoundingClientRect();
            for (let i = 0; i < 2; i++) {
                setTimeout(() => {
                    createParticle(
                        rect.left + rect.width/2 + (Math.random() - 0.5) * 20,
                        rect.top + rect.height/2 + (Math.random() - 0.5) * 20
                    )
                }, i * 100);
            }
        });
    });
}

function typeWriter(element, text, speed = 80, callback = null) {
    element.innerHTML = '';
    element.style.opacity = '1';
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
    const terminalLines = document.querySelectorAll('.terminal-content > div');
    
    terminalLines.forEach(line => {
        if (!line.getAttribute('data-original-content')) {
            line.setAttribute('data-original-content', line.innerHTML);
        }
        line.innerHTML = '';
        line.style.opacity = '0';
        line.style.transform = 'translateY(10px)';
        line.style.display = 'none';
    });

    let currentLineIndex = 0;

    function animateNextLine() {
        if (currentLineIndex >= terminalLines.length) {
            setTimeout(() => {
                terminalLines.forEach(line => {
                    line.innerHTML = '';
                    line.style.opacity = '0';
                    line.style.transform = 'translateY(10px)';
                    line.style.display = 'none';
                });
                currentLineIndex = 0;
                animateNextLine();
            }, 3000);
            return;
        }

        const line = terminalLines[currentLineIndex];
        const originalContent = line.getAttribute('data-original-content');

        line.style.display = 'block';
        line.style.transition = 'all 0.3s ease';
        line.style.opacity = '1';
        line.style.transform = 'translateY(0)';

        setTimeout(() => {
            if (originalContent.includes('cursor') || originalContent.includes('_')) {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = originalContent;
                const cursorEl = tempDiv.querySelector('.cursor');
                if (cursorEl) cursorEl.remove();
                const textWithoutCursor = tempDiv.textContent || tempDiv.innerText || '';
                
                line.innerHTML = '<span class="text-content"></span><span class="cursor">_</span>';
                const textSpan = line.querySelector('.text-content');
                const newCursor = line.querySelector('.cursor');

                typeWriter(textSpan, textWithoutCursor, 100, () => {
                    newCursor.style.animation = 'blink 1s infinite';
                    setTimeout(() => {
                        currentLineIndex++;
                        animateNextLine();
                    }, 1500);
                });
            } else {
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = originalContent;
                const textContent = tempDiv.textContent || tempDiv.innerText || '';
                
                typeWriter(line, textContent, 60, () => {
                    setTimeout(() => {
                        currentLineIndex++;
                        animateNextLine();
                    }, 800);
                });
            }
        }, 200);
    }

    animateNextLine();
}

function initTerminalAnimation() {
    setTimeout(() => {
        animateTerminalContent();
    }, 1000);
}

function init() {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🚀 Initializing the portfolio...');

        const style = document.createElement('style');
        style.textContent = `
            .terminal-content {
                min-height: 20px !important;
                height: auto !important;
                overflow: hidden;
            }
            .terminal-content > div {
                display: none;
                opacity: 0;
                transform: translateY(10px);
                margin: 0;
                padding: 0;
            }
        `;
        document.head.appendChild(style);

        try {
            loadLanguage(currentLang).then(() => {
                console.log('✅ Languages loaded');
                initTerminalAnimation();
                console.log('✅ Terminal animation started');
            });
            
            document.querySelectorAll('.lang-option').forEach(option => {
                option.addEventListener('click', function() {
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
            console.log('✅ Stars generated');

            initParallaxEffect();
            console.log('✅ Parallax effect enabled');

            initParticleSystem();
            console.log('✅ Particle system enabled');

            console.log('🌟 Portfolio operational!');
        } catch (error) {
            console.error('❌ Error during initialization:', error);
        }
    });
}

window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
});

init();