document.addEventListener("DOMContentLoaded", () => {
  // --- Fast Preloader (no fake delay) ---
  const preloader = document.getElementById("preloader");
  const preloaderProgress = document.getElementById("preloaderProgress");

  // Instantly fill the progress bar and hide preloader fast
  if (preloaderProgress) {
    preloaderProgress.style.transition = "width 0.3s ease";
    preloaderProgress.style.width = "100%";
  }

  // Hide preloader after a very short delay (just enough for the visual fill)
  setTimeout(() => {
    if (preloader) {
      preloader.classList.add("hidden");
    }
    document.body.style.overflow = "auto";
    initAnimations();
  }, 350);

  // Disable scrolling while preloader is active
  document.body.style.overflow = "hidden";

  // --- Optimized Custom Cursor ---
  const cursor = document.getElementById("cursor");
  const cursorFollower = document.getElementById("cursorFollower");
  let mouseX = 0,
    mouseY = 0;
  let followerX = 0,
    followerY = 0;
  let cursorRAF = null;

  const isTouchDevice =
    "ontouchstart" in window || navigator.maxTouchPoints > 0;

  if (!isTouchDevice && cursor && cursorFollower) {
    // Use will-change for GPU acceleration
    cursor.style.willChange = "transform";
    cursorFollower.style.willChange = "transform";

    document.addEventListener(
      "mousemove",
      (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Use transform instead of left/top for better perf
        cursor.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;

        // Start animation loop only when mouse moves
        if (!cursorRAF) {
          animateCursor();
        }
      },
      { passive: true },
    );

    const animateCursor = () => {
      const dx = mouseX - followerX;
      const dy = mouseY - followerY;

      // Stop the loop when close enough
      if (Math.abs(dx) < 0.5 && Math.abs(dy) < 0.5) {
        followerX = mouseX;
        followerY = mouseY;
        cursorFollower.style.transform = `translate(${followerX - 18}px, ${followerY - 18}px)`;
        cursorRAF = null;
        return;
      }

      followerX += dx * 0.15;
      followerY += dy * 0.15;
      cursorFollower.style.transform = `translate(${followerX - 18}px, ${followerY - 18}px)`;
      cursorRAF = requestAnimationFrame(animateCursor);
    };

    // Hover effects using event delegation (much faster than per-element listeners)
    document.addEventListener(
      "mouseover",
      (e) => {
        if (e.target.closest("a, button, .portfolio-card, input, textarea")) {
          document.body.classList.add("cursor-hover");
        }
      },
      { passive: true },
    );

    document.addEventListener(
      "mouseout",
      (e) => {
        if (e.target.closest("a, button, .portfolio-card, input, textarea")) {
          document.body.classList.remove("cursor-hover");
        }
      },
      { passive: true },
    );
  }

  // --- Navigation & Mobile Menu ---
  const navbar = document.getElementById("navbar");
  const navToggle = document.getElementById("navToggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const navLinks = document.querySelectorAll(".nav-link, .mobile-link");
  const backToTop = document.getElementById("backToTop");

  // Throttled scroll handler for buttery performance
  let ticking = false;
  let lastScrollY = 0;

  const onScroll = () => {
    lastScrollY = window.scrollY;
    if (!ticking) {
      requestAnimationFrame(() => {
        handleScroll(lastScrollY);
        ticking = false;
      });
      ticking = true;
    }
  };

  const handleScroll = (scrollY) => {
    // Navbar state
    navbar.classList.toggle("scrolled", scrollY > 50);

    // Back-to-top visibility
    backToTop.classList.toggle("visible", scrollY > 500);

    // Active link
    updateActiveLink(scrollY);
  };

  window.addEventListener("scroll", onScroll, { passive: true });

  // Mobile Menu Toggle
  if (navToggle) {
    navToggle.addEventListener("click", () => {
      navToggle.classList.toggle("open");
      mobileMenu.classList.toggle("open");
      document.body.style.overflow = mobileMenu.classList.contains("open")
        ? "hidden"
        : "auto";
    });
  }

  // Close mobile menu on link click
  navLinks.forEach((link) => {
    link.addEventListener("click", function () {
      if (mobileMenu.classList.contains("open")) {
        navToggle.classList.remove("open");
        mobileMenu.classList.remove("open");
        document.body.style.overflow = "auto";
      }
    });
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href");
      if (targetId === "#") return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        const navHeight = navbar.offsetHeight;
        const targetPosition =
          targetElement.getBoundingClientRect().top +
          window.pageYOffset -
          navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: "smooth",
        });
      }
    });
  });

  // Back to top button
  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Active link — cached section positions for speed
  const sections = document.querySelectorAll("section");
  const navLinkElements = document.querySelectorAll(".nav-link");
  let currentActive = "";

  function updateActiveLink(scrollY) {
    const offset = navbar.offsetHeight + 100;
    const scrollPos = scrollY + offset;

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (scrollPos >= section.offsetTop) {
        const id = section.getAttribute("id");
        if (id !== currentActive) {
          currentActive = id;
          navLinkElements.forEach((link) => {
            link.classList.toggle(
              "active",
              link.getAttribute("href") === `#${id}`,
            );
          });
        }
        break;
      }
    }
  }

  // --- Stats Counter Animation ---
  const statsSection = document.querySelector(".hero-stats");
  const statNumbers = document.querySelectorAll(".stat-number");
  let hasCounted = false;

  const animateStats = () => {
    statNumbers.forEach((stat) => {
      const target = parseInt(stat.getAttribute("data-target"));
      const duration = 1500;
      const startTime = performance.now();

      const updateCount = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out for smoother feel
        const eased = 1 - Math.pow(1 - progress, 3);
        stat.innerText = Math.round(target * eased);

        if (progress < 1) {
          requestAnimationFrame(updateCount);
        } else {
          stat.innerText = target;
        }
      };
      requestAnimationFrame(updateCount);
    });
  };

  if (statsSection) {
    const statsObserver = new IntersectionObserver(
      (entries, observer) => {
        if (entries[0].isIntersecting && !hasCounted) {
          animateStats();
          hasCounted = true;
          observer.disconnect();
        }
      },
      { threshold: 0.5 },
    );
    statsObserver.observe(statsSection);
  }

  // --- Skills Progress Bar Animation ---
  const skillsSection = document.getElementById("skills");
  const skillBars = document.querySelectorAll(".skill-progress");

  if (skillsSection) {
    const skillsObserver = new IntersectionObserver(
      (entries, observer) => {
        if (entries[0].isIntersecting) {
          skillBars.forEach((bar) => {
            bar.style.width = `${bar.getAttribute("data-width")}%`;
          });
          observer.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    skillsObserver.observe(skillsSection);
  }

  // --- Portfolio Filtering (smooth, no glitches) ---
  const filterBtns = document.querySelectorAll(".filter-btn");
  const portfolioItems = document.querySelectorAll(".portfolio-item");
  let isFiltering = false;

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (isFiltering) return; // Prevent rapid clicking glitches
      isFiltering = true;

      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filterValue = btn.getAttribute("data-filter");

      portfolioItems.forEach((item) => {
        const category = item.getAttribute("data-category");
        const shouldShow = filterValue === "all" || filterValue === category;

        if (shouldShow) {
          item.classList.remove("hidden");
          // Force reflow so transition plays
          item.offsetHeight;
          item.classList.remove("fade-out");
        } else {
          item.classList.add("fade-out");
          // Hide after transition completes
          item.addEventListener(
            "transitionend",
            function handler() {
              item.classList.add("hidden");
              item.removeEventListener("transitionend", handler);
            },
            { once: true },
          );
        }
      });

      // Unlock filtering after transitions settle
      setTimeout(() => {
        isFiltering = false;
      }, 350);
    });
  });

  // --- Form Submission ---
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById("submitBtn");
      const originalText = submitBtn.innerHTML;

      submitBtn.innerHTML = "<span>Sending...</span>";
      submitBtn.style.opacity = "0.8";
      submitBtn.disabled = true;

      setTimeout(() => {
        submitBtn.innerHTML =
          '<span>Message Sent!</span> <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 13l4 4L19 7"/></svg>';
        submitBtn.style.backgroundColor = "#10B981";
        contactForm.reset();

        setTimeout(() => {
          submitBtn.innerHTML = originalText;
          submitBtn.style.backgroundColor = "";
          submitBtn.style.opacity = "1";
          submitBtn.disabled = false;
        }, 2500);
      }, 800);
    });
  }

  // --- Simple AOS (Animate on Scroll) Implementation ---
  function initAnimations() {
    const animatedElements = document.querySelectorAll("[data-aos]");

    const animationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const delay = entry.target.getAttribute("data-delay") || 0;
            setTimeout(() => {
              entry.target.classList.add("aos-animate");
            }, delay);
            animationObserver.unobserve(entry.target); // Only animate once
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -30px 0px" },
    );

    animatedElements.forEach((el) => {
      animationObserver.observe(el);
    });

    // --- Section header fade-in ---
    const sectionHeaders = document.querySelectorAll(".section-header");
    const headerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            headerObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2, rootMargin: "0px 0px -40px 0px" },
    );

    sectionHeaders.forEach((header) => {
      headerObserver.observe(header);
    });
  }
});
