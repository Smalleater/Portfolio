const STARS_COUNT = 50;
const PARTICLE_PROBABILITY = 0.98;

let currentLang = "en";
let lastScrollTime = 0;
let lastMouseTime = 0;

const cache = {
    stars: null,
    profileImage: null,
    scrollHeight: null
};

async function loadLanguage(lang) {
    try {
        const response = await fetch(`./langs/${lang}.json`);
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

        document.querySelectorAll("[data-i18n-img]").forEach(el => {
            const key = el.getAttribute("data-i18n-img");
            if (translation[key]) {
                el.src = translation[key];
            }
        });

        document.querySelectorAll("[data-i18n-href]").forEach(el => {
            const key = el.getAttribute("data-i18n-href");
            if (translation[key]) {
                el.href = translation[key];
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
        console.log('✅ Stars generated');

        initParallaxEffect();
        console.log('✅ Parallax effect enabled');

        initParticleSystem();
        console.log('✅ Particle system enabled');

        console.log('🌟 Optimized portfolio operational!');
    } catch (error) {
        console.error('⚠️ Error during initialization:', error);
    }
}

window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
});

init();