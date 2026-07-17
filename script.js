/* ==========================================================
   EVER AFTER EVENTS — interactions
   1. Navigation (scroll + menu mobile)
   2. Animations d'apparition (IntersectionObserver)
   3. Slider des avis clients
   4. Visionneuse de la galerie
   5. Simulateur de devis (fonctionnalité innovante)
   6. Formulaire de contact
   7. Assistant de chat (Chatbase)
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
  /* ---------- 1. Navigation ---------- */
  const nav = document.getElementById("nav");
  const burger = document.getElementById("burger");
  const navLinks = document.getElementById("navLinks");

  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const closeMenu = () => {
    navLinks.classList.remove("is-open");
    burger.classList.remove("is-open");
    burger.setAttribute("aria-expanded", "false");
  };

  burger.addEventListener("click", () => {
    const open = navLinks.classList.toggle("is-open");
    burger.classList.toggle("is-open", open);
    burger.setAttribute("aria-expanded", String(open));
  });

  navLinks.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  /* ---------- 2. Apparitions au scroll ---------- */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  /* ---------- 3. Slider des avis ---------- */
  const reviews = Array.from(document.querySelectorAll(".review"));
  const dotsWrap = document.getElementById("reviewDots");
  let current = 0;
  let autoplay;

  reviews.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.setAttribute("aria-label", `Afficher l'avis ${i + 1}`);
    dot.addEventListener("click", () => goTo(i, true));
    dotsWrap.appendChild(dot);
  });

  const dots = Array.from(dotsWrap.children);

  function goTo(index, manual = false) {
    current = (index + reviews.length) % reviews.length;
    reviews.forEach((r, i) => r.classList.toggle("is-active", i === current));
    dots.forEach((d, i) => d.classList.toggle("is-active", i === current));
    if (manual) restartAutoplay();
  }

  function restartAutoplay() {
    clearInterval(autoplay);
    autoplay = setInterval(() => goTo(current + 1), 6000);
  }

  document.getElementById("reviewPrev").addEventListener("click", () => goTo(current - 1, true));
  document.getElementById("reviewNext").addEventListener("click", () => goTo(current + 1, true));

  goTo(0);
  restartAutoplay();

  /* ---------- 4. Visionneuse de la galerie ---------- */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImg");
  const lightboxCaption = document.getElementById("lightboxCaption");

  document.querySelectorAll(".gallery__item").forEach((item) => {
    item.addEventListener("click", () => {
      const img = getComputedStyle(item).getPropertyValue("--img");
      lightboxImg.style.backgroundImage = img;
      lightboxCaption.textContent = item.dataset.caption || "";
      lightbox.classList.add("is-open");
      lightbox.setAttribute("aria-hidden", "false");
      document.body.style.overflow = "hidden";
    });
  });

  const closeLightbox = () => {
    lightbox.classList.remove("is-open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  document.getElementById("lightboxClose").addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeLightbox();
  });

  /* ---------- 5. Simulateur de devis ---------- */
  const guestsInput = document.getElementById("simGuests");
  const guestsOut = document.getElementById("simGuestsOut");
  const priceEl = document.getElementById("simPrice");
  const summaryEl = document.getElementById("simSummary");

  // Barème indicatif en FCFA — basé sur les tarifs moyens du marché
  // (Bénin / Côte d'Ivoire, 2025-2026) — facilement ajustable par l'équipe
  const PRICING = {
    perGuest: 20000, // traiteur + logistique par invité
    venue: { salle: 800000, jardin: 500000, plage: 1000000, domaine: 2000000 },
    venueLabel: {
      salle: "salle de réception",
      jardin: "jardin privé",
      plage: "bord de mer",
      domaine: "domaine d'exception",
    },
    formula: { jourj: 400000, complete: 1500000, deco: 800000 },
    formulaLabel: {
      jourj: "coordination Jour J",
      complete: "organisation complète",
      deco: "décoration & scénographie",
    },
    options: { optPhoto: 450000, optMusic: 600000, optFlowers: 750000, optCake: 150000 },
  };

  let displayed = 0;
  let animFrame;

  function currentTotal() {
    const guests = Number(guestsInput.value);
    const venue = document.querySelector('input[name="venue"]:checked').value;
    const formula = document.querySelector('input[name="formula"]:checked').value;

    let total = guests * PRICING.perGuest + PRICING.venue[venue] + PRICING.formula[formula];

    Object.keys(PRICING.options).forEach((id) => {
      if (document.getElementById(id).checked) total += PRICING.options[id];
    });

    return { total, guests, venue, formula };
  }

  function animatePrice(target) {
    cancelAnimationFrame(animFrame);
    const start = displayed;
    const diff = target - start;
    const duration = 600;
    const t0 = performance.now();

    function tick(now) {
      const p = Math.min((now - t0) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      displayed = Math.round(start + diff * eased);
      priceEl.textContent = displayed.toLocaleString("fr-FR");
      if (p < 1) animFrame = requestAnimationFrame(tick);
    }

    animFrame = requestAnimationFrame(tick);
  }

  function updateSimulator() {
    const { total, guests, venue, formula } = currentTotal();
    guestsOut.textContent = guests;
    summaryEl.textContent = `Pour ${guests} invités, en ${PRICING.venueLabel[venue]}, avec ${PRICING.formulaLabel[formula]}.`;
    animatePrice(total);
  }

  document
    .querySelectorAll("#simulateur input")
    .forEach((input) => input.addEventListener("input", updateSimulator));

  updateSimulator();

  /* ---------- 6. Formulaire de contact ---------- */
  const form = document.getElementById("contactForm");
  const success = document.getElementById("formSuccess");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Démo : pas de backend pour le challenge.
    // Pour brancher un vrai envoi : Formspree, Resend ou EmailJS.
    success.hidden = false;
    form.reset();
    setTimeout(() => (success.hidden = true), 6000);
  });

  /* ---------- 7. Assistant de chat (Chatbase) ---------- */
  const chatToggle = document.getElementById("chatToggle");
  const chatPanel = document.getElementById("chatPanel");
  const chatClose = document.getElementById("chatClose");
  const chatFrame = document.getElementById("chatFrame");
  const chatTeaser = document.getElementById("chatTeaser");
  const chatTeaserClose = document.getElementById("chatTeaserClose");

  const hideTeaser = () => (chatTeaser.hidden = true);

  const setChatOpen = (open) => {
    // L'iframe n'est chargée qu'à la première ouverture pour ne pas ralentir la page.
    if (open && !chatFrame.src) chatFrame.src = chatFrame.dataset.src;
    if (open) hideTeaser();
    chatPanel.hidden = !open;
    chatToggle.setAttribute("aria-expanded", String(open));
    chatToggle.setAttribute("aria-label", open ? "Réduire le chat" : "Ouvrir le chat avec notre assistant");
  };

  chatToggle.addEventListener("click", () => setChatOpen(chatPanel.hidden));
  chatClose.addEventListener("click", () => setChatOpen(false));

  // Bulle d'accroche affichée peu après le chargement, tant que le chat est fermé.
  setTimeout(() => {
    if (chatPanel.hidden) chatTeaser.hidden = false;
  }, 2500);
  chatTeaserClose.addEventListener("click", hideTeaser);
});
