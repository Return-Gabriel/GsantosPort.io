// ===== GLOBAL VARIABLES =====
let currentSection = "home";
let isScrolling = false;
let typingInstance = null;
let customCursor = null;

// ===== DOM CONTENT LOADED =====
document.addEventListener("DOMContentLoaded", function () {
  initializeApp();
});

// ===== INITIALIZE APPLICATION =====
function initializeApp() {
  // Initialize custom cursor
  initCustomCursor();

  // Initialize loading screen
  initLoadingScreen();

  // Initialize navigation
  initNavigation();

  // Initialize typing animation
  initTypingAnimation();

  // Initialize scroll animations
  initScrollAnimations();

  // Initialize skill bars
  initSkillBars();

  // Initialize counter animations
  initCounterAnimations();

  // Initialize contact form
  initContactForm();

  // Initialize smooth scrolling
  initSmoothScrolling();

  // Initialize intersection observer
  initIntersectionObserver();

  // Initialize particle effects
  initParticleEffects();

  // Initialize theme
  initTheme();
}

// ===== CUSTOM CURSOR =====
function initCustomCursor() {
  // Create cursor element
  customCursor = document.createElement("div");
  customCursor.className = "custom-cursor";
  document.body.appendChild(customCursor);

  // Mouse move event
  document.addEventListener("mousemove", (e) => {
    customCursor.style.left = e.clientX - 10 + "px";
    customCursor.style.top = e.clientY - 10 + "px";
  });

  // Mouse enter/leave events for interactive elements
  const interactiveElements = document.querySelectorAll(
    "a, button, input, textarea, select, .clickable, .nav-link, .btn, .social-link, .project-link, .contact-method"
  );

  interactiveElements.forEach((element) => {
    element.addEventListener("mouseenter", () => {
      customCursor.classList.add("hover");
    });

    element.addEventListener("mouseleave", () => {
      customCursor.classList.remove("hover");
    });
  });

  // Mouse down/up events
  document.addEventListener("mousedown", () => {
    customCursor.classList.add("click");
  });

  document.addEventListener("mouseup", () => {
    customCursor.classList.remove("click");
  });

  // Hide cursor when mouse leaves window
  document.addEventListener("mouseleave", () => {
    customCursor.style.opacity = "0";
  });

  document.addEventListener("mouseenter", () => {
    customCursor.style.opacity = "1";
  });
}

// ===== LOADING SCREEN =====
function initLoadingScreen() {
  const loadingScreen = document.getElementById("loadingScreen");

  // Simulate loading time
  setTimeout(() => {
    loadingScreen.classList.add("fade-out");
    setTimeout(() => {
      loadingScreen.style.display = "none";
    }, 500);
  }, 2000);
}

// ===== NAVIGATION =====
function initNavigation() {
  const navbar = document.getElementById("navbar");
  const navToggle = document.getElementById("navToggle");
  const navMenu = document.getElementById("navMenu");
  const navLinks = document.querySelectorAll(".nav-link");

  // Mobile menu toggle
  navToggle.addEventListener("click", () => {
    navToggle.classList.toggle("active");
    navMenu.classList.toggle("active");
  });

  // Close mobile menu when clicking on a link
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.classList.remove("active");
      navMenu.classList.remove("active");
    });
  });

  // Navbar scroll effect
  window.addEventListener("scroll", () => {
    if (window.scrollY > 100) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  // Navigation link click handlers
  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetSection = link.getAttribute("data-section");
      showSection(targetSection);
    });

    // Add cursor hover effects
    link.addEventListener("mouseenter", () => {
      if (customCursor) {
        customCursor.classList.add("hover");
      }
    });

    link.addEventListener("mouseleave", () => {
      if (customCursor) {
        customCursor.classList.remove("hover");
      }
    });
  });
}

// ===== SECTION NAVIGATION =====
function showSection(sectionId) {
  // Update active navigation
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => link.classList.remove("active"));

  const activeLink = document.querySelector(`[data-section="${sectionId}"]`);
  if (activeLink) {
    activeLink.classList.add("active");
  }

  // Scroll to section
  const targetSection = document.getElementById(sectionId);
  if (targetSection) {
    targetSection.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });

    currentSection = sectionId;

    // Trigger section-specific animations
    triggerSectionAnimations(sectionId);
  }
}

function updateActiveNavLink(activeLink) {
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => link.classList.remove("active"));
  activeLink.classList.add("active");
}

// ===== TYPING ANIMATION =====
function initTypingAnimation() {
  const typingElement = document.getElementById("typingText");

  if (typingElement && typeof Typed !== "undefined") {
    const strings = [
      "Desenvolvedor Full Stack",
      "Especialista em Soluções",
      "Desenvolvedor Mobile",
      "Analista de Sistemas",
      "Desenvolvedor Web",
    ];

    typingInstance = new Typed("#typingText", {
      strings: strings,
      typeSpeed: 80,
      backSpeed: 50,
      backDelay: 2000,
      startDelay: 1000,
      loop: true,
      showCursor: false,
    });
  }
}

// ===== SCROLL ANIMATIONS =====
function initScrollAnimations() {
  // Animate elements on scroll
  const animateOnScroll = () => {
    const elements = document.querySelectorAll("[data-animate]");

    elements.forEach((element) => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;

      if (elementTop < window.innerHeight - elementVisible) {
        element.classList.add("animate");
      }
    });
  };

  window.addEventListener("scroll", animateOnScroll);
  animateOnScroll(); // Run on load
}

// ===== SKILL BARS ANIMATION =====
function initSkillBars() {
  const skillBars = document.querySelectorAll(".skill-progress");

  const animateSkillBars = () => {
    skillBars.forEach((bar) => {
      const rect = bar.getBoundingClientRect();
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const width = bar.getAttribute("data-width");
        bar.style.width = width;
      }
    });
  };

  window.addEventListener("scroll", animateSkillBars);

  // Trigger animation when skills section is active
  const skillsSection = document.getElementById("skills");
  if (skillsSection) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setTimeout(animateSkillBars, 500);
        }
      });
    });
    observer.observe(skillsSection);
  }
}

// ===== COUNTER ANIMATIONS =====
function initCounterAnimations() {
  const counters = document.querySelectorAll(".stat-number");

  const animateCounters = () => {
    counters.forEach((counter) => {
      const rect = counter.getBoundingClientRect();
      if (
        rect.top < window.innerHeight &&
        rect.bottom > 0 &&
        !counter.classList.contains("animated")
      ) {
        const target = parseInt(counter.getAttribute("data-target"));
        const duration = 2000;
        const increment = target / (duration / 16);
        let current = 0;

        const updateCounter = () => {
          current += increment;
          if (current < target) {
            counter.textContent = Math.floor(current);
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target;
          }
        };

        updateCounter();
        counter.classList.add("animated");
      }
    });
  };

  window.addEventListener("scroll", animateCounters);
}

// ===== CONTACT FORM =====
function initContactForm() {
  const contactForm = document.getElementById("contactForm");

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Get form data
      const formData = new FormData(contactForm);
      const data = Object.fromEntries(formData);

      // Simulate form submission
      showNotification("Mensagem enviada com sucesso!", "success");
      contactForm.reset();
    });
  }
}

// ===== SMOOTH SCROLLING =====
function initSmoothScrolling() {
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        target.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    });
  });
}

// ===== INTERSECTION OBSERVER =====
function initIntersectionObserver() {
  const observerOptions = {
    threshold: 0.5,
    rootMargin: "0px 0px -50px 0px",
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("animate");

        // Update active navigation based on visible section
        const sectionId = entry.target.id;
        if (sectionId) {
          updateNavigationOnScroll(sectionId);
          currentSection = sectionId;
        }
      }
    });
  }, observerOptions);

  // Observe all sections
  document.querySelectorAll(".section").forEach((section) => {
    observer.observe(section);
  });
}

function updateNavigationOnScroll(sectionId) {
  const navLinks = document.querySelectorAll(".nav-link");
  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("data-section") === sectionId) {
      link.classList.add("active");
    }
  });
}

// ===== PARTICLE EFFECTS =====
function initParticleEffects() {
  // Create floating particles for hero section
  const heroSection = document.getElementById("home");
  if (heroSection) {
    createParticles(heroSection, 50);
  }
}

function createParticles(container, count) {
  for (let i = 0; i < count; i++) {
    const particle = document.createElement("div");
    particle.className = "particle";
    particle.style.cssText = `
            position: absolute;
            width: 2px;
            height: 2px;
            background: rgba(0, 212, 255, 0.5);
            border-radius: 50%;
            pointer-events: none;
            animation: float ${3 + Math.random() * 4}s linear infinite;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation-delay: ${Math.random() * 5}s;
        `;
    container.appendChild(particle);
  }
}

// ===== THEME MANAGEMENT =====
function initTheme() {
  // Theme is set to dark by default
  document.body.classList.add("dark");

  // Add theme toggle functionality if needed
  const themeToggle = document.getElementById("themeToggle");
  if (themeToggle) {
    themeToggle.addEventListener("click", toggleTheme);
  }
}

function toggleTheme() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  localStorage.setItem("theme", isDark ? "dark" : "light");
}

// ===== SECTION SPECIFIC ANIMATIONS =====
function triggerSectionAnimations(sectionId) {
  switch (sectionId) {
    case "skills":
      setTimeout(() => {
        animateSkillBars();
        updateCursorEvents();
      }, 300);
      break;
    case "about":
      setTimeout(() => {
        animateCounters();
        updateCursorEvents();
      }, 300);
      break;
    case "projects":
      animateProjectCards();
      setTimeout(updateCursorEvents, 500);
      break;
    case "experience":
      animateTimeline();
      setTimeout(updateCursorEvents, 500);
      break;
    default:
      setTimeout(updateCursorEvents, 100);
      break;
  }
}

function animateSkillBars() {
  const skillBars = document.querySelectorAll(".skill-progress");
  skillBars.forEach((bar, index) => {
    setTimeout(() => {
      const width = bar.getAttribute("data-width");
      bar.style.width = width;
    }, index * 100);
  });
}

function animateCounters() {
  const counters = document.querySelectorAll(".stat-number");
  counters.forEach((counter) => {
    if (!counter.classList.contains("animated")) {
      const target = parseInt(counter.getAttribute("data-target"));
      animateCounter(counter, target);
      counter.classList.add("animated");
    }
  });
}

function animateCounter(element, target) {
  const duration = 2000;
  const increment = target / (duration / 16);
  let current = 0;

  const updateCounter = () => {
    current += increment;
    if (current < target) {
      element.textContent = Math.floor(current);
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target;
    }
  };

  updateCounter();
}

function animateProjectCards() {
  const projectCards = document.querySelectorAll(".project-card");
  projectCards.forEach((card, index) => {
    setTimeout(() => {
      card.style.opacity = "1";
      card.style.transform = "translateY(0)";
    }, index * 150);
  });
}

function animateTimeline() {
  const timelineItems = document.querySelectorAll(".timeline-item");
  timelineItems.forEach((item, index) => {
    setTimeout(() => {
      item.style.opacity = "1";
      item.style.transform = "translateX(0)";
    }, index * 200);
  });
}

// ===== UTILITY FUNCTIONS =====
function updateCursorEvents() {
  // Update cursor events for dynamically added elements
  const interactiveElements = document.querySelectorAll(
    "a, button, input, textarea, select, .clickable, .nav-link, .btn, .social-link, .project-link, .contact-method, .skill-item, .timeline-item, .project-card"
  );

  interactiveElements.forEach((element) => {
    // Remove existing listeners to avoid duplicates
    element.removeEventListener("mouseenter", addHoverEffect);
    element.removeEventListener("mouseleave", removeHoverEffect);

    // Add new listeners
    element.addEventListener("mouseenter", addHoverEffect);
    element.addEventListener("mouseleave", removeHoverEffect);
  });
}

function addHoverEffect() {
  if (customCursor) {
    customCursor.classList.add("hover");
  }
}

function removeHoverEffect() {
  if (customCursor) {
    customCursor.classList.remove("hover");
  }
}

function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === "success" ? "#10b981" : "#3b82f6"};
        color: white;
        border-radius: 0.5rem;
        z-index: 10000;
        animation: slideInRight 0.3s ease-out;
    `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease-out";
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

// ===== KEYBOARD NAVIGATION =====
document.addEventListener("keydown", (e) => {
  const sections = [
    "home",
    "about",
    "skills",
    "experience",
    "projects",
    "contact",
  ];
  const currentIndex = sections.indexOf(currentSection);

  switch (e.key) {
    case "ArrowDown":
    case "PageDown":
      e.preventDefault();
      if (currentIndex < sections.length - 1) {
        showSection(sections[currentIndex + 1]);
      }
      break;
    case "ArrowUp":
    case "PageUp":
      e.preventDefault();
      if (currentIndex > 0) {
        showSection(sections[currentIndex - 1]);
      }
      break;
    case "Home":
      e.preventDefault();
      showSection("home");
      break;
    case "End":
      e.preventDefault();
      showSection("contact");
      break;
  }
});

// ===== PERFORMANCE OPTIMIZATIONS =====
// Optimize scroll events
const optimizedScrollHandler = throttle(() => {
  // Handle scroll events here
}, 16);

window.addEventListener("scroll", optimizedScrollHandler);

// Optimize resize events
const optimizedResizeHandler = debounce(() => {
  // Handle resize events here
  if (typingInstance) {
    typingInstance.reset();
  }
}, 250);

window.addEventListener("resize", optimizedResizeHandler);

// ===== ACCESSIBILITY IMPROVEMENTS =====
// Focus management
document.addEventListener("keydown", (e) => {
  if (e.key === "Tab") {
    document.body.classList.add("keyboard-navigation");
  }
});

document.addEventListener("mousedown", () => {
  document.body.classList.remove("keyboard-navigation");
});

// Reduced motion support
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);
if (prefersReducedMotion.matches) {
  document.body.classList.add("reduced-motion");
}

// ===== ERROR HANDLING =====
window.addEventListener("error", (e) => {
  console.error("JavaScript error:", e.error);
  // Handle errors gracefully
});

// ===== ANALYTICS & TRACKING =====
function trackEvent(eventName, eventData = {}) {
  // Implement analytics tracking here
  console.log("Event tracked:", eventName, eventData);
}

// Track section views
function trackSectionView(sectionId) {
  trackEvent("section_view", { section: sectionId });
}

// ===== EXPORT FOR TESTING =====
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    showSection,
    updateActiveNavLink,
    animateCounter,
    debounce,
    throttle,
  };
}
