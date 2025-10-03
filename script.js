const STARS_COUNT = 50;
const PARTICLE_PROBABILITY = 0.98;

let currentLang = "en";
let lastScrollTime = 0;
let lastMouseTime = 0;

function getInitialLanguage() {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    
    if (urlLang && (urlLang === 'fr' || urlLang === 'en')) {
        localStorage.setItem('selectedLanguage', urlLang);
        return urlLang;
    }
    
    const savedLang = localStorage.getItem('selectedLanguage');
    if (savedLang && (savedLang === 'fr' || savedLang === 'en')) {
        return savedLang;
    }
    
    return 'en';
}

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
        
        localStorage.setItem('selectedLanguage', lang);
        currentLang = lang;
        
        updateLanguageSelectors(lang);
    } catch (error) {
        console.error('Error loading language:', error);
    }
}

function updateLanguageSelectors(lang) {
    document.querySelectorAll('.lang-option').forEach(opt => {
        opt.classList.remove('active');
        if (opt.getAttribute('data-lang') === lang) {
            opt.classList.add('active');
        }
    });
    
    document.querySelectorAll('.mobile-lang-option').forEach(opt => {
        opt.classList.remove('active');
        if (opt.getAttribute('data-lang') === lang) {
            opt.classList.add('active');
        }
    });
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
        
        const starType = Math.random();
        let starClass = 'star';
        
        if (starType < 0.1) {
            starClass += ' star-bright';
        } else if (starType < 0.25) {
            starClass += ' star-medium';
        } else if (starType < 0.4) {
            starClass += ' star-small';
        } else {
            starClass += ' star-dim';
        }
        
        star.className = starClass;
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        
        let size;
        if (starClass.includes('bright')) {
            size = Math.random() * 1.5 + 2.5;
        } else if (starClass.includes('medium')) {
            size = Math.random() * 1 + 1.8;
        } else if (starClass.includes('small')) {
            size = Math.random() * 0.8 + 1;
        } else {
            size = Math.random() * 0.6 + 0.8;
        }
        
        star.style.width = size + 'px';
        star.style.height = size + 'px';
        
        star.style.animationDelay = Math.random() * 6 + 's';
        star.style.animationDuration = (Math.random() * 4 + 3) + 's';
        
        const baseTransformX = (Math.random() - 0.5) * 2;
        const baseTransformY = (Math.random() - 0.5) * 2;
        star.dataset.baseTransformX = baseTransformX;
        star.dataset.baseTransformY = baseTransformY;
        star.style.transform = `translate(${baseTransformX}px, ${baseTransformY}px)`;
        
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
                const speed = star.classList.contains('star-bright') ? 0.15 : 
                             star.classList.contains('star-medium') ? 0.12 : 0.08;
                const baseX = parseFloat(star.dataset.baseTransformX) || 0;
                const baseY = parseFloat(star.dataset.baseTransformY) || 0;
                star.style.transform = `translate(${baseX}px, ${baseY + scrolled * speed}px)`;
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
    }, { passive: true });
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

function initHamburgerMenu() {
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        const navItems = navMenu.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', function() {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });

        const mobileLangOptions = navMenu.querySelectorAll('.mobile-lang-option');
        mobileLangOptions.forEach(option => {
            option.addEventListener('click', function(e) {
                e.stopPropagation();
                
                if (this.classList.contains('active')) return;
                
                const newLang = this.getAttribute('data-lang');
                loadLanguage(newLang);
                createLanguageParticles(this);
            });
        });

        document.addEventListener('click', function(e) {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            }
        });
    }
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
        currentLang = getInitialLanguage();
        
        loadLanguage(currentLang).then(() => {
            console.log('✅ Languages loaded');
        });
        
        document.querySelectorAll('.lang-option').forEach(option => {
            option.addEventListener('click', function(e) {
                if (this.classList.contains('active')) return;
                
                const newLang = this.getAttribute('data-lang');
                loadLanguage(newLang);
                createLanguageParticles(this);
            });
        });

        initHamburgerMenu();
        console.log('✅ Hamburger menu initialized');

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