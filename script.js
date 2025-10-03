const STARS_COUNT = 10;

let currentLang = "en";
let lastScrollTime = 0;

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
    console.log('Language changed - particles disabled for performance');
}

function createStars() {
    const starsContainer = document.getElementById('stars');
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < STARS_COUNT; i++) {
        const star = document.createElement('div');
        
        star.className = 'star';
        star.style.left = Math.random() * 100 + '%';
        star.style.top = Math.random() * 100 + '%';
        star.style.width = '2px';
        star.style.height = '2px';
        
        fragment.appendChild(star);
    }
    
    starsContainer.appendChild(fragment);
}

function initParallaxEffect() {
    console.log('✅ Parallax disabled for memory optimization');
    return;
}

function createParticle(x, y) {
    return;
}

function initParticleSystem() {
    console.log('✅ Minimal system initialized');
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

function initLazyLoading() {
    const lazyImages = document.querySelectorAll('.lazy-load');
    
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy-load');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '50px'
        });

        lazyImages.forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        lazyImages.forEach(img => {
            img.src = img.dataset.src;
            img.classList.remove('lazy-load');
        });
    }
}

window.addEventListener('beforeunload', function() {
    console.log('🧹 Cleaning up before page unload');
});

function initializePortfolio() {
    console.log('🚀 Initializing lightweight portfolio...');

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
        console.log('✅ 10 minimal stars generated');

        initParallaxEffect();
        console.log('✅ Parallax effect enabled');

        initParticleSystem();
        console.log('✅ Particle system enabled');

        initLazyLoading();
        console.log('✅ Lazy loading initialized');

        console.log('🌟 Optimized portfolio operational!');
    } catch (error) {
        console.error('⚠️ Error during initialization:', error);
    }
}

window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
});

init();