/* =========================================================
   CyberSafe — Homepage interactions
   Kept intentionally small: navigation, scroll state,
   active section links, and topic previews.
   ========================================================= */

(() => {
  "use strict";

  const header = document.getElementById("site-header");
  const menuToggle = document.getElementById("menu-toggle");
  const primaryNav = document.getElementById("primary-nav");
  const mobileQuery = window.matchMedia("(max-width: 920px)");
  const navLinks = Array.from(primaryNav.querySelectorAll(".nav-link"));
  const spySections = Array.from(document.querySelectorAll("[data-spy]"));

  /* ---------- Mobile navigation ---------- */

  const isMenuOpen = () => header.classList.contains("nav-open");

  function openMenu() {
    header.classList.add("nav-open");
    menuToggle.setAttribute("aria-expanded", "true");
    menuToggle.setAttribute("aria-label", "Close navigation menu");

    const firstLink = primaryNav.querySelector("a");
    if (firstLink) {
      firstLink.focus();
    }
  }

  function closeMenu({ returnFocus = false } = {}) {
    if (!isMenuOpen()) {
      return;
    }

    header.classList.remove("nav-open");
    menuToggle.setAttribute("aria-expanded", "false");
    menuToggle.setAttribute("aria-label", "Open navigation menu");

    if (returnFocus) {
      menuToggle.focus();
    }
  }

  menuToggle.addEventListener("click", () => {
    if (isMenuOpen()) {
      closeMenu({ returnFocus: true });
    } else {
      openMenu();
    }
  });

  primaryNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      closeMenu();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && isMenuOpen()) {
      closeMenu({ returnFocus: true });
    }
  });

  document.addEventListener("click", (event) => {
    if (isMenuOpen() && !header.contains(event.target)) {
      closeMenu();
    }
  });

  const handleBreakpointChange = () => {
    if (!mobileQuery.matches) {
      closeMenu();
    }
  };

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", handleBreakpointChange);
  } else {
    mobileQuery.addListener(handleBreakpointChange);
  }

  /* ---------- Header state on scroll ---------- */

  function updateHeaderState() {
    header.classList.toggle("scrolled", window.scrollY > 10);
  }

  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });

  /* ---------- Active navigation link ---------- */

  function setActiveSection(sectionId) {
    navLinks.forEach((link) => {
      const isActive = link.getAttribute("href") === `#${sectionId}`;
      link.classList.toggle("is-active", isActive);

      if (isActive) {
        link.setAttribute("aria-current", "location");
      } else {
        link.removeAttribute("aria-current");
      }
    });
  }

  function updateActiveSection() {
    let currentSection = spySections[0]?.id;

    spySections.forEach((section) => {
      if (section.offsetTop <= window.scrollY + 150) {
        currentSection = section.id;
      }
    });

    // Make sure About becomes active when the page is scrolled to the very end.
    const atPageEnd =
      window.innerHeight + window.scrollY >=
      document.documentElement.scrollHeight - 4;
    const hasAboutSection = spySections.some((section) => section.id === "about");

    if (atPageEnd && hasAboutSection) {
      currentSection = "about";
    }

    if (currentSection) {
      setActiveSection(currentSection);
    }
  }

  updateActiveSection();
  window.addEventListener("scroll", updateActiveSection, { passive: true });
  window.addEventListener("resize", updateActiveSection);

  /* ---------- Topic preview dialog ---------- */

  const dialog = document.getElementById("topic-dialog");
  const dialogKicker = document.getElementById("dialog-kicker");
  const dialogTitle = document.getElementById("dialog-title");
  const dialogCopy = document.getElementById("dialog-copy");
  const dialogPoints = document.getElementById("dialog-points");
  const dialogQuiz = document.getElementById("dialog-quiz");
  let lastTopicTrigger = null;

  const topics = {
    passwords: {
      category: "Accounts",
      title: "Password Security",
      copy: "A strong password is your first line of defense. The goal is to make each important account difficult to guess and impossible to reuse.",
      points: [
        "Use a long, unique passphrase for every important account.",
        "Turn on two-factor authentication wherever it is offered.",
        "Store passwords in a trusted password manager, not a notes app."
      ]
    },
    phishing: {
      category: "Threats",
      title: "Phishing and Online Scams",
      copy: "Phishing messages imitate people or services you trust and use urgency to make you act before you think.",
      points: [
        "Check the sender address, not just the display name.",
        "Hover over links to preview the real destination before clicking.",
        "Verify unexpected requests through a separate, trusted channel."
      ]
    },
    privacy: {
      category: "Privacy",
      title: "Social Media Privacy",
      copy: "Everything you post contributes to your digital footprint. Thoughtful privacy settings limit who can see it and how it can be used.",
      points: [
        "Review who can view your posts, stories, and tagged photos.",
        "Avoid sharing your address, school schedule, or live location.",
        "Audit connected apps and remove permissions you no longer need."
      ]
    },
    malware: {
      category: "Devices",
      title: "Malware and Viruses",
      copy: "Malicious software often arrives through downloads, attachments, or outdated apps. A few cautious habits keep most of it away.",
      points: [
        "Keep your operating system, browser, and apps up to date.",
        "Download software only from official or trusted sources.",
        "Treat unexpected attachments and pop-up installers with suspicion."
      ]
    },
    browsing: {
      category: "Browsing",
      title: "Safe Browsing",
      copy: "Not every website is what it appears to be. Paying attention to connection security and browser warnings helps you browse with confidence.",
      points: [
        "Look for HTTPS and a valid padlock before entering personal details.",
        "Never ignore browser warnings about unsafe or deceptive sites.",
        "Be cautious on public Wi-Fi and avoid sensitive logins on shared networks."
      ]
    },
    citizenship: {
      category: "Community",
      title: "Digital Citizenship",
      copy: "Responsible technology use is about more than security. It is also about honesty, respect, and considering the impact of your actions online.",
      points: [
        "Think before you post, share, or forward something about another person.",
        "Respect privacy and ask before sharing someone else's content or photos.",
        "Report harmful content instead of amplifying it."
      ]
    }
  };

  /* Read-only reference used by the admin prototype to list existing lessons. */
  window.CyberSafeTopics = topics;

  function openTopicPreview(topicKey, trigger) {
    const topic = topics[topicKey];

    if (!topic) {
      return;
    }

    lastTopicTrigger = trigger;
    dialogKicker.textContent = `${topic.category} topic preview`;
    dialogTitle.textContent = topic.title;
    dialogCopy.textContent = topic.copy;

    delete dialog.dataset.skipFocusReturn;

    if (dialogQuiz) {
      dialogQuiz.dataset.quizTopic = topicKey;
      dialogQuiz.setAttribute("aria-label", `Take the ${topic.title} quiz`);
    }

    dialogPoints.replaceChildren();
    topic.points.forEach((point) => {
      const item = document.createElement("li");
      item.textContent = point;
      dialogPoints.append(item);
    });

    document.body.classList.add("modal-open");

    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      dialog.setAttribute("open", "");
    }
  }

  function closeTopicPreview() {
    if (!dialog.hasAttribute("open")) {
      return;
    }

    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
      document.body.classList.remove("modal-open");
      if (lastTopicTrigger) {
        lastTopicTrigger.focus();
      }
    }
  }

  /* Delegated so lesson previews created inside the module hub share the
     same dialog behavior as the cards in the Learn section. */
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-topic]");

    if (!trigger) {
      return;
    }

    openTopicPreview(trigger.dataset.topic, trigger);
  });

  document.querySelectorAll("[data-close-dialog]").forEach((button) => {
    button.addEventListener("click", closeTopicPreview);
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      closeTopicPreview();
    }
  });

  dialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");

    if (dialog.dataset.skipFocusReturn === "true") {
      delete dialog.dataset.skipFocusReturn;
      lastTopicTrigger = null;
      return;
    }

    if (lastTopicTrigger) {
      lastTopicTrigger.focus();
      lastTopicTrigger = null;
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && dialog.hasAttribute("open") && typeof dialog.showModal !== "function") {
      closeTopicPreview();
    }
  });
})();

/* =========================================================
   CyberSafe — learning modules
   A module hub that organizes the existing lessons and quizzes.
   ========================================================= */

(() => {
  "use strict";

  const MODULES = {
    intro: {
      lessonsTitle: "Start here",
      points: [
        "What cybersecurity means and why it matters to students.",
        "Core ideas such as protecting accounts, devices, and personal data.",
        "How everyday habits reduce risk online.",
        "Where to start with the CyberSafe lessons and quizzes."
      ],
      paragraphs: [
        "Cybersecurity is the practice of protecting systems, networks, devices, and sensitive data from digital attacks, theft, or unauthorized disruption. In an academic and campus environment where students submit assignments, manage student loans, connect to campus Wi-Fi, and collaborate through cloud platforms, digital assets represent valuable targets. Understanding fundamental security principles empowers students to safeguard both their personal privacy and scholastic achievements.",
        "Cyber risks are rarely limited to corporate servers; attackers frequently exploit unsuspecting individuals as entry points into larger institutional networks. Everyday activities—such as opening links in unsolicited messages, logging into portals over open networks, or utilizing unvetted third-party apps—can result in account takeover or identity compromise. Cultivating proactive security habits reduces these vulnerabilities to near zero.",
        "Key Takeaway: Cybersecurity is not about fear; it is about building daily digital resilience. Treat your student credentials as valuable personal assets, keep all operating systems and software updated, and verify communications before taking action."
      ],
      links: [
        {
          title: "Explore the learning library",
          meta: "Browse the six lesson topics in Learn.",
          href: "#learn",
          label: "Open Learn",
          icon: "#icon-book"
        },
        {
          title: "Choose a quiz",
          meta: "Test what you know with five-question quizzes.",
          href: "#quiz",
          label: "Open Quiz",
          icon: "#icon-target"
        }
      ],
      note: "Start with the learning library, then try a quiz when you are ready."
    },

    threats: {
      points: [
        "Phishing attacks and urgent online scams.",
        "Malware, viruses, and ransomware.",
        "Social engineering tactics that exploit trust.",
        "How to verify messages and downloads before acting."
      ],
      paragraphs: [
        "Modern cyber threats encompass a wide array of malicious tactics designed to compromise information and extract financial or identity data. Among the most prevalent is phishing—deceptive messages crafted to impersonate trusted colleges, banks, professors, or delivery services. Concurrently, malicious software such as trojans, ransomware, and spyware can silently infiltrate unprotected devices through fraudulent attachments, compromised software cracks, or malicious browser advertisements.",
        "Social engineering represents the human element of cyber risk: adversaries exploit urgency, curiosity, or academic pressure to manipulate targets into circumventing standard precautions. For instance, a fake message demanding immediate verification of university portal access or scholarship status creates panic that bypasses critical thinking. Recognizing that legitimate organizations will never demand passwords or one-time codes via email or SMS is your strongest initial defense.",
        "Key Takeaway: Always inspect sender domains and message urgency carefully. Never download software or attachments from unverified sources, and use official university channels or contact directories to verify unexpected demands."
      ],
      lessons: [{ topic: "phishing" }, { topic: "malware" }]
    },

    passwords: {
      points: [
        "Creating strong, unique passwords.",
        "Protecting passwords and using a password manager.",
        "Adding multi-factor authentication.",
        "Avoiding common password mistakes."
      ],
      paragraphs: [
        "Passwords serve as the initial barrier guarding your digital identity, academic records, and personal communications. However, relying on short words, predictable variations (such as adding '123' or an exclamation mark to a mascot name), or repeating identical passwords across multiple online platforms creates immense risk. When one service suffers a credential spill, automated attacks known as credential stuffing test those compromised passwords against hundreds of other popular platforms.",
        "Adopting multi-word passphrases—unrelated combinations of words strung together—exponentially increases the complexity required for automated cracking tools while remaining intuitive for human recall. Pairing strong passphrases with an encrypted password manager eliminates the burden of memorization while ensuring every service possesses a distinct, complex secret. Furthermore, activating Multi-Factor Authentication (MFA) ensures that even if an adversary captures your password, unauthorized login remains blocked without your secondary physical verification.",
        "Key Takeaway: Never reuse passwords across email, school, and financial accounts. Enable authenticator-app or hardware-key 2FA wherever offered, and rely on reputable password managers to generate and secure your credentials."
      ],
      lessons: [{ topic: "passwords" }]
    },

    privacy: {
      points: [
        "Protecting personal information.",
        "Understanding data privacy and your digital footprint.",
        "Sharing safely on social media.",
        "Reviewing privacy settings and app permissions."
      ],
      paragraphs: [
        "Your digital footprint encompasses every click, search, social update, and location check-in accumulated over years of online presence. For college students, this data is continuously harvested by analytics firms, commercial advertisers, and data brokers to construct detailed behavioural profiles. Left unmanaged, excessive sharing can expose home addresses, personal schedules, and sensitive financial indicators that attackers leverage in tailored social engineering schemes.",
        "Protecting your privacy starts with regularly auditing account visibility settings across social networks and denying extraneous mobile application permissions. A simple mobile game or study tool rarely requires access to your full contact list, microphone, or precise location. Exercising discretion when posting travel schedules, dorm locations, or exam rosters prevents malicious actors from tracking routines or exploiting absent households.",
        "Key Takeaway: What goes online tends to remain online permanently. Audit privacy configurations quarterly, restrict app permissions to only what is strictly necessary for core functionality, and think critically before broadcasting personal milestones or location updates."
      ],
      lessons: [{ topic: "privacy" }]
    },

    browsing: {
      points: [
        "Safe browsing habits.",
        "Recognizing suspicious websites and links.",
        "Avoiding unsafe downloads.",
        "Using the internet responsibly."
      ],
      paragraphs: [
        "Navigating the web safely requires vigilance against deceptive links, counterfeit web portals, and unencrypted networks. Cybercriminals frequently register domain names that visually mimic legitimate academic institutions or banking portals—differing by only a single transposed letter or obscure top-level domain—in order to harvest credentials entered on counterfeit forms.",
        "Public Wi-Fi networks in cafes, libraries, and airports often transmit data without isolation between connected clients, allowing adversaries on the same local network to monitor or intercept unencrypted traffic. While modern HTTPS encrypts the contents of communication between your browser and the website, HTTPS alone does not prove the website itself is benign. Combining encrypted transport with verified bookmark navigation and secure VPN protocols provides complete perimeter defense.",
        "Key Takeaway: Look for valid SSL/TLS certificates and scrutinize the full URL domain before submitting credentials. Avoid conducting banking or submitting sensitive course materials on open public Wi-Fi networks without an encrypted VPN tunnel."
      ],
      lessons: [{ topic: "browsing" }]
    },

    citizenship: {
      points: [
        "Responsible use of technology.",
        "Respecting other people's privacy.",
        "Cyberbullying awareness and support.",
        "Ethical online behavior."
      ],
      paragraphs: [
        "Digital citizenship refers to the responsible, ethical, and empathetic use of digital communications and interconnected technology. The relative anonymity of online spaces can sometimes create a false sense of detachment, but digital interactions have profound, real-world consequences on personal wellbeing, campus safety, and future professional reputations. Ethical digital citizens champion constructive discourse, safeguard peer privacy, and refuse to amplify malicious or unverified content.",
        "Respecting digital integrity also entails adhering to intellectual property standards, honoring consent prior to sharing photographs or videos of colleagues, and standing firmly against cyberbullying or online harassment. When encountering suspicious or abusive material, reporting it through designated platform or institutional safety channels helps maintain a healthy, collaborative digital community for everyone.",
        "Key Takeaway: Always consider the human impact behind every screen. Respect others' confidentiality, verify facts prior to sharing information, and uphold the same integrity and respect online that you practice in person."
      ],
      lessons: [{ topic: "citizenship" }]
    }
  };

  /* Read-only reference used by the admin prototype to list existing modules. */
  window.CyberSafeModules = MODULES;

  const grid = document.getElementById("module-grid");
  const detail = document.getElementById("module-detail");
  const detailIndex = document.getElementById("module-detail-index");
  const detailKicker = document.getElementById("module-detail-kicker");
  const detailTitle = document.getElementById("module-detail-title");
  const detailIcon = document.getElementById("module-detail-icon");
  const detailCopy = document.getElementById("module-detail-copy");
  const detailPoints = document.getElementById("module-detail-points");
  const detailLessonsTitle = document.getElementById("module-detail-lessons-title");
  const detailLessons = document.getElementById("module-detail-lessons");
  const detailNote = document.getElementById("module-detail-note");
  const backButtons = Array.from(document.querySelectorAll("[data-module-back]"));

  if (
    !grid ||
    !detail ||
    !detailIndex ||
    !detailKicker ||
    !detailTitle ||
    !detailIcon ||
    !detailCopy ||
    !detailPoints ||
    !detailLessonsTitle ||
    !detailLessons ||
    !detailNote
  ) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const cards = Array.from(grid.querySelectorAll("[data-module]"));
  let lastTrigger = null;

  function scrollTo(element) {
    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "start"
    });
  }

  function icon(href) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "icon");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");

    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", href);
    svg.append(use);

    return svg;
  }

  function linkArrow() {
    const arrow = document.createElement("span");
    arrow.className = "link-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.append(icon("#icon-arrow-right"));
    return arrow;
  }

  function buildLessonCard(topic) {
    const topicCard = document.getElementById(`topic-${topic}`);
    const title = topicCard?.querySelector("h3")?.textContent.trim() || topic;
    const iconHref = topicCard?.querySelector(".icon-tile use")?.getAttribute("href") || "#icon-book";

    const card = document.createElement("article");
    card.className = "module-lesson";

    const head = document.createElement("div");
    head.className = "module-lesson-head";

    const iconWrap = document.createElement("span");
    iconWrap.className = "module-lesson-icon";
    iconWrap.setAttribute("aria-hidden", "true");
    iconWrap.append(icon(iconHref));

    const textWrap = document.createElement("div");
    const heading = document.createElement("h4");
    heading.textContent = title;
    const meta = document.createElement("p");
    meta.className = "module-lesson-meta";
    meta.textContent = "Existing lesson · 5-question quiz";
    textWrap.append(heading, meta);
    head.append(iconWrap, textWrap);

    const actions = document.createElement("div");
    actions.className = "module-lesson-actions";

    const preview = document.createElement("button");
    preview.type = "button";
    preview.className = "topic-link";
    preview.dataset.topic = topic;
    preview.setAttribute("aria-haspopup", "dialog");
    preview.setAttribute("aria-label", `Open the ${title} lesson preview`);
    preview.append(document.createTextNode("Open Lesson"), linkArrow());

    const quiz = document.createElement("button");
    quiz.type = "button";
    quiz.className = "topic-quiz";
    quiz.dataset.quizTopic = topic;
    quiz.setAttribute("aria-label", `Take the ${title} quiz`);
    quiz.textContent = "Take Quiz";

    actions.append(preview, quiz);
    card.append(head, actions);

    return card;
  }

  function buildLinkCard(link) {
    const card = document.createElement("article");
    card.className = "module-lesson";

    const head = document.createElement("div");
    head.className = "module-lesson-head";

    const iconWrap = document.createElement("span");
    iconWrap.className = "module-lesson-icon";
    iconWrap.setAttribute("aria-hidden", "true");
    iconWrap.append(icon(link.icon || "#icon-arrow-right"));

    const textWrap = document.createElement("div");
    const heading = document.createElement("h4");
    heading.textContent = link.title;
    const meta = document.createElement("p");
    meta.className = "module-lesson-meta";
    meta.textContent = link.meta;
    textWrap.append(heading, meta);
    head.append(iconWrap, textWrap);

    const actions = document.createElement("div");
    actions.className = "module-lesson-actions";

    const anchor = document.createElement("a");
    anchor.className = "topic-link";
    anchor.href = link.href;
    anchor.dataset.moduleNav = "true";
    anchor.append(document.createTextNode(link.label), linkArrow());

    actions.append(anchor);
    card.append(head, actions);

    return card;
  }

  function renderModule(key, trigger) {
    const module = MODULES[key];

    if (!module) {
      return;
    }

    const card = trigger.closest(".module-card");

    if (!card) {
      return;
    }

    lastTrigger = trigger;

    const title = card.querySelector("h3")?.textContent.trim() || key;
    const copy = card.querySelector("p")?.textContent.trim() || "";
    const tag = card.querySelector(".topic-tag")?.textContent.trim() || "Learning module";
    const iconHref = card.querySelector(".icon-tile use")?.getAttribute("href") || "#icon-book";
    const cardIndex = cards.indexOf(trigger) + 1;

    detailIndex.textContent = `Module ${String(cardIndex).padStart(2, "0")}`;
    detailKicker.textContent = tag;
    detailTitle.textContent = title;

    detailCopy.replaceChildren();
    const paragraphs = (Array.isArray(module.paragraphs) && module.paragraphs.length)
      ? module.paragraphs
      : (module.expandedContent ? module.expandedContent.split("\n\n") : (copy ? [copy] : []));
    paragraphs.forEach((pText) => {
      const p = document.createElement("p");
      p.textContent = pText;
      detailCopy.append(p);
    });

    detailIcon.replaceChildren(icon(iconHref));

    detailPoints.replaceChildren();
    (module.points || []).forEach((point) => {
      const item = document.createElement("li");
      item.textContent = point;
      detailPoints.append(item);
    });

    detailLessonsTitle.textContent = module.lessonsTitle || "Lessons in this module";
    detailLessons.replaceChildren();

    (module.lessons || []).forEach((lesson) => {
      detailLessons.append(buildLessonCard(lesson.topic));
    });

    (module.links || []).forEach((link) => {
      detailLessons.append(buildLinkCard(link));
    });

    detailNote.textContent =
      module.note || "Lesson previews open the existing topic dialog. Quizzes open in the Quiz section.";

    detail.hidden = false;

    cards.forEach((button) => {
      const isActive = button === trigger;
      button.setAttribute("aria-expanded", String(isActive));
      button.closest(".module-card")?.classList.toggle("is-open", isActive);
    });

    detailTitle.focus({ preventScroll: true });
    scrollTo(detail);
  }

  function closeModule({ focus = true, scroll = true } = {}) {
    if (detail.hidden) {
      return;
    }

    detail.hidden = true;

    cards.forEach((button) => {
      button.setAttribute("aria-expanded", "false");
      button.closest(".module-card")?.classList.remove("is-open");
    });

    if (focus && lastTrigger) {
      lastTrigger.focus({ preventScroll: true });
    }

    if (scroll) {
      scrollTo(grid);
    }

    lastTrigger = null;
  }

  grid.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-module]");

    if (!trigger || !grid.contains(trigger)) {
      return;
    }

    renderModule(trigger.dataset.module, trigger);
  });

  backButtons.forEach((button) => {
    button.addEventListener("click", () => closeModule());
  });

  detail.addEventListener("click", (event) => {
    if (event.target.closest("[data-quiz-topic]")) {
      closeModule({ focus: false, scroll: false });
      return;
    }

    if (event.target.closest("[data-module-nav]")) {
      closeModule({ focus: false, scroll: false });
    }
  });

  document.querySelectorAll('a[href="#modules"]').forEach((link) => {
    link.addEventListener("click", () => {
      if (!detail.hidden) {
        closeModule({ focus: false, scroll: false });
      }
    });
  });
})();

/* =========================================================
   CyberSafe — lamp intro
   A one-time pull switch reveals the page, then a compact
   lamp keeps cycling the light colour on every pull.
   ========================================================= */

(() => {
  "use strict";

  const html = document.documentElement;
  const body = document.body;
  const intro = document.getElementById("lamp-intro");
  const diorama = document.getElementById("intro-diorama");
  const introHandle = document.getElementById("intro-handle");
  const introCord = document.getElementById("intro-cord");
  const ambient = document.getElementById("ambient-lamp");
  const ambientHandle = document.getElementById("ambient-handle");
  const ambientCord = document.getElementById("ambient-cord");
  const status = document.getElementById("lamp-status");
  const main = document.getElementById("main");
  const skipButton = intro ? intro.querySelector("[data-skip-intro]") : null;

  if (!intro || !diorama || !introHandle || !introCord || !ambient || !ambientHandle || !ambientCord) {
    // If the curtain markup is incomplete the page must still be usable.
    html.classList.remove("intro-active");
    body.classList.remove("intro-active");
    return;
  }

  const COLORS = [
    { hex: "#5B21B6", name: "Deep violet" },
    { hex: "#8B5CF6", name: "Electric purple" },
    { hex: "#C4A7FF", name: "Lavender" },
    { hex: "#7C3AED", name: "Royal purple" }
  ];

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pageRegions = Array.from(
    document.querySelectorAll(".site-header, #main, .site-footer, #topic-dialog")
  );

  let colorIndex = 0;
  let lampOn = false;
  let isRevealing = false;
  let introFinished = false;

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  /* Keep the page out of the tab order until the curtain lifts. */
  pageRegions.forEach((region) => {
    region.inert = true;
    region.setAttribute("aria-hidden", "true");
  });

  html.style.setProperty("--lamp-color", COLORS[0].hex);

  /* ---------- Colour ---------- */

  function setColor(index, announce) {
    colorIndex = index;
    const color = COLORS[colorIndex];

    html.style.setProperty("--lamp-color", color.hex);

    ambientHandle.setAttribute(
      "aria-label",
      `Pull the lamp switch to change the light color. Current light: ${color.name}.`
    );

    if (announce && status) {
      status.textContent = `Light color: ${color.name}.`;
    }
  }

  function advanceColor() {
    setColor((colorIndex + 1) % COLORS.length, true);
  }

  /* ---------- Pull switch ----------
     One implementation for mouse, touch and pen. The cord stretches
     with the handle and springs back with a single CSS transition. */

  function createPullSwitch({ scope, handle, cord, getMaxPull, onPull }) {
    let pointerId = null;
    let startY = 0;
    let pulled = 0;
    let cordLength = 0;
    let maxPull = 60;

    const paint = () => {
      handle.style.setProperty("--pull", `${pulled.toFixed(2)}px`);
      const stretch = cordLength > 0 ? (cordLength + pulled) / cordLength : 1;
      cord.style.setProperty("--cord-stretch", stretch.toFixed(4));
    };

    const reset = () => {
      pulled = 0;
      paint();
    };

    handle.addEventListener("pointerdown", (event) => {
      if (isRevealing || pointerId !== null) {
        return;
      }
      if (event.pointerType === "mouse" && event.button !== 0) {
        return;
      }

      pointerId = event.pointerId;
      startY = event.clientY;
      cordLength = cord.offsetHeight;
      maxPull = getMaxPull();
      pulled = 0;
      handle.classList.remove("is-nudged");
      scope.classList.add("is-pulling");
      paint();

      if (typeof handle.setPointerCapture === "function") {
        try {
          handle.setPointerCapture(pointerId);
        } catch (error) {
          /* Pointer capture is an enhancement only. */
        }
      }
    });

    handle.addEventListener("pointermove", (event) => {
      if (event.pointerId !== pointerId) {
        return;
      }
      pulled = clamp(event.clientY - startY, 0, maxPull);
      paint();
    });

    const finish = (event) => {
      if (event.pointerId !== pointerId) {
        return;
      }

      const releasedAt = pulled;
      const pointer = pointerId;
      pointerId = null;
      scope.classList.remove("is-pulling");

      try {
        if (typeof handle.hasPointerCapture === "function" && handle.hasPointerCapture(pointer)) {
          handle.releasePointerCapture(pointer);
        }
      } catch (error) {
        /* Ignore a pointer that was already released. */
      }

      reset();

      if (releasedAt >= Math.max(12, maxPull * 0.38)) {
        onPull();
      } else if (releasedAt < 6) {
        nudge();
      }
    };

    handle.addEventListener("pointerup", finish);
    handle.addEventListener("pointercancel", finish);

    function nudge() {
      handle.classList.remove("is-nudged");
      void handle.offsetWidth; /* Restart the animation on repeated taps. */
      handle.classList.add("is-nudged");
      window.setTimeout(() => handle.classList.remove("is-nudged"), 640);
    }

    /* Enter, Space and an assistive-technology "click" all perform
       the same short animated pull. */
    let lastKeyboardPull = 0;

    function keyboardPull() {
      if (isRevealing) {
        return;
      }

      lastKeyboardPull = Date.now();
      cordLength = cord.offsetHeight;
      maxPull = getMaxPull();
      scope.classList.add("is-keyed");
      pulled = Math.round(maxPull * 0.68);
      paint();

      window.setTimeout(() => {
        scope.classList.remove("is-keyed");
        reset();
        onPull();
      }, reducedMotion.matches ? 70 : 200);
    }

    handle.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " " && event.key !== "Spacebar") {
        return;
      }

      event.preventDefault();
      keyboardPull();
    });

    /* Screen readers activate buttons with a synthetic click (detail 0). */
    handle.addEventListener("click", (event) => {
      if (event.detail === 0 && Date.now() - lastKeyboardPull > 700) {
        event.preventDefault();
        keyboardPull();
      }
    });
  }

  /* ---------- Reveal ---------- */

  function reveal({ skipped = false } = {}) {
    if (isRevealing || introFinished) {
      return;
    }

    isRevealing = true;
    lampOn = true;
    intro.classList.add("is-on", "is-lighting");
    ambient.classList.add("is-on");

    if (skipButton) {
      skipButton.disabled = true;
    }

    const timings = skipped
      ? { light: 120, swap: 140, done: 560 }
      : reducedMotion.matches
        ? { light: 160, swap: 160, done: 620 }
        : { light: 1100, swap: 360, done: 1000 };

    window.setTimeout(() => {
      intro.classList.add("is-revealing");
    }, timings.light);

    window.setTimeout(() => {
      html.classList.remove("intro-active");
      body.classList.remove("intro-active");

      pageRegions.forEach((region) => {
        region.inert = false;
        region.removeAttribute("aria-hidden");
      });

      ambient.classList.add("is-visible");
      isRevealing = false;
      introFinished = true;

      if (main && typeof main.focus === "function") {
        main.focus({ preventScroll: true });
      }

      if (status) {
        status.textContent = "The lamp is on. CyberSafe is ready.";
      }
    }, timings.light + timings.swap);

    window.setTimeout(() => {
      intro.classList.add("is-done");
      intro.setAttribute("aria-hidden", "true");
    }, timings.light + timings.swap + timings.done);
  }

  /* ---------- Wiring ---------- */

  createPullSwitch({
    scope: diorama,
    handle: introHandle,
    cord: introCord,
    getMaxPull: () => clamp(diorama.clientHeight * 0.17, 44, 80),
    onPull: () => reveal()
  });

  createPullSwitch({
    scope: ambient,
    handle: ambientHandle,
    cord: ambientCord,
    getMaxPull: () => 30,
    onPull: () => {
      if (!lampOn) {
        return;
      }
      advanceColor();
    }
  });

  if (skipButton) {
    skipButton.addEventListener("click", () => reveal({ skipped: true }));
  }

  /* Escape is a quiet second exit for keyboard and screen reader users. */
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !introFinished && !isRevealing) {
      reveal({ skipped: true });
    }
  });

  setColor(0, false);
})();

/* =========================================================
   CyberSafe — lesson quizzes
   One data-driven quiz component shared by every lesson.
   ========================================================= */

(() => {
  "use strict";

  // Configured to connect to the deployed Render backend with Vite/CRA env variable support
  const API_BASE_URL = (() => {
    let envUrl = "";
    try {
      if (typeof import.meta !== "undefined" && import.meta?.env?.VITE_API_URL) {
        envUrl = import.meta.env.VITE_API_URL;
      }
    } catch (e) {}
    try {
      if (!envUrl && typeof process !== "undefined" && process?.env?.REACT_APP_API_URL) {
        envUrl = process.env.REACT_APP_API_URL;
      }
    } catch (e) {}

    const rawUrl =
      (typeof window !== "undefined" && (window.CYBERSAFE_API_URL || window.__CYBERSAFE_API_URL__)) ||
      envUrl ||
      "https://cybersafeawareness-backend.onrender.com";

    const clean = String(rawUrl).trim().replace(/\/+$/, "");
    return clean.endsWith("/api") ? clean : `${clean}/api`;
  })();

  const QUIZZES = {
    passwords: {
      title: "Password Security",
      category: "Accounts",
      questions: [
        {
          id: "passwords-1",
          text: "Which of these is the strongest password?",
          options: ["Summer2024!", "BlueSky7", "correct-horse-battery-staple", "password123"],
          correct: 2,
          explanation: "Length and unpredictability matter most. A long passphrase is much harder to guess than a short password with predictable substitutions."
        },
        {
          id: "passwords-2",
          text: "What does two-factor authentication (2FA) add to your account?",
          options: ["A second proof, such as a code or security key", "A shorter password", "A public username", "A backup email signature"],
          correct: 0,
          explanation: "2FA requires a second form of proof, so a stolen password alone is not enough to sign in."
        },
        {
          id: "passwords-3",
          text: "Why should you use a different password for each important account?",
          options: ["So you can type faster", "Because all websites require it", "Because it makes passwords easier to remember", "So a breach on one site cannot unlock your other accounts"],
          correct: 3,
          explanation: "Reusing a password means one data breach can give attackers access to many accounts. Unique passwords limit the damage."
        },
        {
          id: "passwords-4",
          text: "Where should you store many unique passwords?",
          options: ["In a note on your phone", "In a reputable password manager", "In a shared spreadsheet", "In your browser's saved passwords on a public computer"],
          correct: 1,
          explanation: "A reputable password manager encrypts your vault and helps you use a different strong password for every account."
        },
        {
          id: "passwords-5",
          text: "A website emails you asking for your password to verify your account. What should you do?",
          options: ["Reply with your password", "Click the link and enter it", "Never send your password; contact the service through its official website or app", "Send only part of the password"],
          correct: 2,
          explanation: "Legitimate services do not ask for your password by email. Verify the request through the service's official website or app."
        }
      ]
    },

    phishing: {
      title: "Phishing and Online Scams",
      category: "Threats",
      questions: [
        {
          id: "phishing-1",
          text: "Which detail is the strongest warning sign of a phishing message?",
          options: ["It creates urgency and asks you to click a link or share information", "It uses your first name", "It includes a company logo", "It arrived during the day"],
          correct: 0,
          explanation: "Urgency and requests for credentials or clicks are classic phishing tactics. Logos and names are easy to fake."
        },
        {
          id: "phishing-2",
          text: "A text says your package is delayed and asks you to pay a small fee through a link. What is the safest response?",
          options: ["Pay quickly to avoid more delays", "Open the link on your phone", "Reply with your card number", "Check the delivery company's official app or website using a known address"],
          correct: 3,
          explanation: "Use a known, official channel to check the delivery. Scammers use small fees to collect payment details."
        },
        {
          id: "phishing-3",
          text: "What should you check before clicking a link in an unexpected message?",
          options: ["The sender's display name only", "The actual destination URL and whether it matches the organization", "The message's font", "The number of emojis"],
          correct: 1,
          explanation: "Display names can be spoofed. Inspect the real destination and confirm it matches the organization's official domain."
        },
        {
          id: "phishing-4",
          text: "A caller claims to be from your bank and asks for a one-time code. What should you do?",
          options: ["Read the code to them", "Text the code", "Hang up and call the bank using the number on its official website or card", "Share your account balance"],
          correct: 2,
          explanation: "One-time codes are for you, not for callers. Hang up and contact the bank through a number you know is official."
        },
        {
          id: "phishing-5",
          text: "Why can a message from a friend still be a phishing attempt?",
          options: ["Their account may be compromised, or the message may be spoofed", "Friends never send links", "Phishing only happens by email", "Messages from friends are always safe"],
          correct: 0,
          explanation: "If a friend's account is compromised, an attacker can send phishing messages from it. Verify unusual requests through another channel."
        }
      ]
    },

    privacy: {
      title: "Social Media Privacy",
      category: "Privacy",
      questions: [
        {
          id: "privacy-1",
          text: "Which post shares the most sensitive information?",
          options: ["A photo of your lunch", "A picture of a sunset", "A screenshot of your boarding pass with a barcode", "A song you like"],
          correct: 2,
          explanation: "Boarding passes can contain booking references and personal details. Share travel photos only after you are home."
        },
        {
          id: "privacy-2",
          text: "What is a digital footprint?",
          options: ["The trail of information you leave online through posts, comments, and activity", "The number of devices you own", "Your Wi-Fi password", "A type of antivirus"],
          correct: 0,
          explanation: "Your digital footprint is the record of what you do online. It can persist and be seen by people beyond your friends."
        },
        {
          id: "privacy-3",
          text: "A quiz app asks for access to your contacts and location. What is the best move?",
          options: ["Allow everything; it is just a quiz", "Share your login", "Post your results publicly", "Deny unnecessary permissions and review what the app really needs"],
          correct: 3,
          explanation: "Apps should only get permissions they need to work. Deny unnecessary access, especially to contacts and location."
        },
        {
          id: "privacy-4",
          text: "Why should you review your social media privacy settings regularly?",
          options: ["Platforms never change them", "Defaults and features change, and old posts may become more visible than you intended", "It makes your account faster", "It hides your posts from you"],
          correct: 1,
          explanation: "Platforms update defaults and features. A regular review keeps your old and new posts visible only to the audience you choose."
        },
        {
          id: "privacy-5",
          text: "Which detail is safest to avoid sharing publicly?",
          options: ["Your favorite color", "A movie recommendation", "Your school schedule and live location", "A photo of a pet without location data"],
          correct: 2,
          explanation: "Schedules and live locations can reveal where you are and when. Share them only with people you trust."
        }
      ]
    },

    malware: {
      title: "Malware and Viruses",
      category: "Devices",
      questions: [
        {
          id: "malware-1",
          text: "What is malware?",
          options: ["Software that only slows down old computers", "Malicious software designed to damage, disrupt, or gain unauthorized access", "A type of password", "A secure browser setting"],
          correct: 1,
          explanation: "Malware is software written to cause harm or gain access without permission. It includes viruses, ransomware, and spyware."
        },
        {
          id: "malware-2",
          text: "Which download source is safest?",
          options: ["A pop-up ad offering a free game", "An unofficial mirror site", "An email attachment from an unknown sender", "The official app store or the developer's official website"],
          correct: 3,
          explanation: "Official stores and developer sites reduce the risk of tampered installers. Avoid pop-ups, mirrors, and unexpected attachments."
        },
        {
          id: "malware-3",
          text: "Why are software updates important for security?",
          options: ["They often fix security holes that malware can exploit", "They only change the look", "They make your device waterproof", "They remove the need for passwords"],
          correct: 0,
          explanation: "Updates patch known vulnerabilities. Delaying them leaves an opening that attackers can use."
        },
        {
          id: "malware-4",
          text: "You receive an unexpected email attachment named 'Invoice.exe'. What should you do?",
          options: ["Open it to see the invoice", "Forward it to friends", "Delete it or verify with the sender through another channel; do not run it", "Rename it and open it"],
          correct: 2,
          explanation: "Executable attachments can install malware. Do not run unexpected files; verify with the sender through a separate channel."
        },
        {
          id: "malware-5",
          text: "Which habit best reduces the risk of malware?",
          options: ["Clicking ads for faster browsers", "Keeping the operating system and apps updated and avoiding untrusted downloads", "Installing apps from unknown links", "Disabling your browser's security warnings"],
          correct: 1,
          explanation: "Updates and trusted sources close the most common paths malware uses to get onto a device."
        }
      ]
    },

    browsing: {
      title: "Safe Browsing",
      category: "Browsing",
      questions: [
        {
          id: "browsing-1",
          text: "What does the padlock icon in a browser address bar mean?",
          options: ["The website is guaranteed safe and honest", "The site has no ads", "The site is government-approved", "The connection is encrypted, but the site can still be malicious"],
          correct: 3,
          explanation: "A padlock means the connection is encrypted. It does not prove the site is trustworthy or honest."
        },
        {
          id: "browsing-2",
          text: "A page says your device is infected and you must call a number. What should you do?",
          options: ["Close the tab and run a trusted security scan; do not call the number", "Call the number", "Pay the fee", "Enter your password"],
          correct: 0,
          explanation: "This is a common tech-support scam. Close the page and use a trusted security tool or professional if you are worried."
        },
        {
          id: "browsing-3",
          text: "Which URL is most likely to be a phishing site?",
          options: ["https://www.example.com/login", "https://support.example.com", "https://example.com.secure-login-verify.top", "https://example.com/help"],
          correct: 2,
          explanation: "The real domain is secure-login-verify.top; example.com is only a subdomain. Attackers use this trick to look familiar."
        },
        {
          id: "browsing-4",
          text: "Why should you avoid sensitive logins on public Wi-Fi?",
          options: ["Public Wi-Fi is always faster", "Others on the network may be able to intercept traffic, especially on unsecured networks", "Public Wi-Fi deletes your files", "It uses too much battery"],
          correct: 1,
          explanation: "On an unsecured network, others may be able to monitor traffic. Use mobile data or a trusted VPN for sensitive logins."
        },
        {
          id: "browsing-5",
          text: "What is the safest way to visit your bank's website?",
          options: ["Type the known address or use a saved bookmark", "Click a link in an email", "Search for it and click the first ad", "Use a link from a social media post"],
          correct: 0,
          explanation: "Typing the known address or using a bookmark avoids malicious links and ads that imitate your bank."
        }
      ]
    },

    citizenship: {
      title: "Digital Citizenship",
      category: "Community",
      questions: [
        {
          id: "citizenship-1",
          text: "What does digital citizenship mean?",
          options: ["Using the internet only for school", "Having many followers", "Using technology responsibly, ethically, and respectfully", "Knowing how to code"],
          correct: 2,
          explanation: "Digital citizenship is about responsible, ethical, and respectful behavior online, not popularity or technical skill."
        },
        {
          id: "citizenship-2",
          text: "A friend asks you to share an embarrassing photo of a classmate. What is the responsible choice?",
          options: ["Ask for permission and respect the classmate's privacy; do not share without consent", "Share it with everyone", "Post it anonymously", "Save it for later"],
          correct: 0,
          explanation: "Sharing someone's image without consent can harm them and may break platform rules or laws. Respect their privacy."
        },
        {
          id: "citizenship-3",
          text: "You see harmful content or harassment online. What should you do?",
          options: ["Amplify it so others can see", "Ignore it and encourage others to comment", "Create a meme about it", "Report it using the platform's tools and support the person targeted"],
          correct: 3,
          explanation: "Reporting harmful content and supporting the target is safer than spreading it. Amplifying it can make the harm worse."
        },
        {
          id: "citizenship-4",
          text: "Why does online anonymity not remove responsibility for your actions?",
          options: ["Because anonymity is impossible", "Because your actions still affect real people and may have real consequences", "Because the internet is monitored by schools", "Because anonymous posts are always deleted"],
          correct: 1,
          explanation: "Behind every account is a real person. Anonymity does not erase the impact of your words or the rules that apply."
        },
        {
          id: "citizenship-5",
          text: "Which is an example of good digital citizenship?",
          options: ["Sharing unverified news quickly", "Using someone else's work without permission", "Crediting sources and checking facts before sharing", "Arguing aggressively in comments"],
          correct: 2,
          explanation: "Checking facts and crediting sources slows misinformation and respects the work of others."
        }
      ]
    }
  };

  const LETTERS = ["A", "B", "C", "D"];

  const hub = document.getElementById("quiz-hub");
  const grid = document.getElementById("quiz-lesson-grid");
  const hubTitle = document.getElementById("quiz-hub-title");
  const stage = document.getElementById("quiz-stage");
  const results = document.getElementById("quiz-results");
  const backBtn = document.getElementById("quiz-back");
  const stageTitle = document.getElementById("quiz-lesson-title");
  const counter = document.getElementById("quiz-counter");
  const progress = document.getElementById("quiz-progress");
  const progressFill = document.getElementById("quiz-progress-fill");
  const question = document.getElementById("quiz-question");
  const options = document.getElementById("quiz-options");
  const hint = document.getElementById("quiz-hint");
  const prevBtn = document.getElementById("quiz-prev");
  const nextBtn = document.getElementById("quiz-next");
  const submitBtn = document.getElementById("quiz-submit");
  const resultsTitle = document.getElementById("quiz-results-title");
  const resultsMessage = document.getElementById("quiz-results-message");
  const scoreEl = document.getElementById("quiz-score");
  const percentEl = document.getElementById("quiz-percent");
  const wrongEl = document.getElementById("quiz-wrong");
  const review = document.getElementById("quiz-review");
  const retakeBtn = document.getElementById("quiz-retake");
  const toLessonsBtn = document.getElementById("quiz-to-lessons");

  if (!hub || !grid || !stage || !results || !question || !options) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeKey = null;
  let index = 0;
  let answers = [];
  let submitted = false;

  function scrollTo(element) {
    if (!element) {
      return;
    }

    element.scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "start"
    });
  }

  function buildHub() {
    grid.replaceChildren();

    Object.entries(QUIZZES).forEach(([key, quiz]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "quiz-lesson";
      button.dataset.quizTopic = key;
      button.setAttribute("aria-label", `Start the ${quiz.title} quiz`);

      const tag = document.createElement("span");
      tag.className = "quiz-lesson-tag";
      tag.textContent = quiz.category;

      const title = document.createElement("span");
      title.className = "quiz-lesson-title";
      title.textContent = quiz.title;

      const meta = document.createElement("span");
      meta.className = "quiz-lesson-meta";
      meta.textContent = `${quiz.questions.length} questions`;

      const arrow = document.createElement("span");
      arrow.className = "quiz-lesson-arrow";
      arrow.setAttribute("aria-hidden", "true");
      arrow.innerHTML = '<svg class="icon" focusable="false"><use href="#icon-arrow-right"></use></svg>';

      button.append(tag, title, meta, arrow);
      grid.append(button);
    });
  }

  function startQuiz(key) {
    const quiz = QUIZZES[key];

    if (!quiz) {
      return;
    }

    activeKey = key;
    index = 0;
    answers = new Array(quiz.questions.length).fill(null);
    submitted = false;

    hub.hidden = true;
    results.hidden = true;
    stage.hidden = false;
    stageTitle.textContent = quiz.title;

    renderQuestion();
    scrollTo(stage);
  }

  function renderQuestion({ focus = true } = {}) {
    const quiz = QUIZZES[activeKey];

    if (!quiz) {
      return;
    }

    const current = quiz.questions[index];
    const total = quiz.questions.length;

    counter.textContent = `Question ${index + 1} of ${total}`;
    progress.setAttribute("aria-valuenow", String(index + 1));
    progress.setAttribute("aria-valuemax", String(total));
    progress.setAttribute("aria-valuetext", `Question ${index + 1} of ${total}`);
    progressFill.style.width = `${((index + 1) / total) * 100}%`;

    question.textContent = current.text;
    options.replaceChildren();

    current.options.forEach((optionText, optionIndex) => {
      const label = document.createElement("label");
      label.className = "quiz-option";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "quiz-answer";
      input.value = String(optionIndex);
      input.className = "quiz-option-input";
      input.checked = answers[index] === optionIndex;

      const letter = document.createElement("span");
      letter.className = "quiz-option-letter";
      letter.setAttribute("aria-hidden", "true");
      letter.textContent = LETTERS[optionIndex];

      const text = document.createElement("span");
      text.className = "quiz-option-text";
      text.textContent = optionText;

      label.append(input, letter, text);

      if (input.checked) {
        label.classList.add("is-selected");
      }

      options.append(label);
    });

    const last = index === total - 1;

    prevBtn.disabled = index === 0;
    nextBtn.hidden = last;
    submitBtn.hidden = !last;
    updateControls();

    if (focus) {
      question.focus({ preventScroll: true });
    }
  }

  function updateControls() {
    const quiz = QUIZZES[activeKey];

    if (!quiz) {
      return;
    }

    const answered = answers[index] !== null;
    const last = index === quiz.questions.length - 1;

    nextBtn.disabled = !answered;
    submitBtn.disabled = !answered;
    hint.hidden = answered;
    hint.textContent = last
      ? "Select an answer to submit your quiz."
      : "Select an answer to continue.";
  }

  function goNext() {
    const quiz = QUIZZES[activeKey];

    if (!quiz || answers[index] === null) {
      return;
    }

    if (index < quiz.questions.length - 1) {
      index += 1;
      renderQuestion();
    }
  }

  function goPrevious() {
    if (index === 0) {
      return;
    }

    index -= 1;
    renderQuestion();
  }

  function submitQuiz() {
    if (submitted || !activeKey) {
      return;
    }

    if (answers.some((answer) => answer === null)) {
      return;
    }

    submitted = true;
    submitBtn.disabled = true;
    renderResults();
  }

  function messageFor(percent) {
    if (percent === 100) {
      return "Perfect score. You have mastered this lesson. Nicely done.";
    }

    if (percent >= 80) {
      return "Excellent work. You have a strong grasp of this topic.";
    }

    if (percent >= 60) {
      return "Good progress. Review the explanations below to strengthen the gaps.";
    }

    return "Keep practicing. The explanations below show exactly what to review next.";
  }

  function renderResults() {
    const quiz = QUIZZES[activeKey];

    if (!quiz) {
      return;
    }

    const total = quiz.questions.length;
    const correct = quiz.questions.reduce(
      (sum, item, itemIndex) => sum + (answers[itemIndex] === item.correct ? 1 : 0),
      0
    );
    const percent = Math.round((correct / total) * 100);
    const wrong = total - correct;

    resultsTitle.textContent = `${quiz.title} quiz results`;
    scoreEl.textContent = `${correct}/${total}`;
    percentEl.textContent = `${percent}%`;
    wrongEl.textContent = String(wrong);
    resultsMessage.textContent = messageFor(percent);

    review.replaceChildren();

    quiz.questions.forEach((item, itemIndex) => {
      const chosen = answers[itemIndex];
      const isCorrect = chosen === item.correct;
      const card = document.createElement("li");
      card.className = `quiz-review-item ${isCorrect ? "is-correct" : "is-wrong"}`;

      const head = document.createElement("div");
      head.className = "quiz-review-head";

      const status = document.createElement("span");
      status.className = "quiz-review-status";
      status.textContent = isCorrect ? "Correct" : "Incorrect";

      const number = document.createElement("span");
      number.className = "quiz-review-number";
      number.textContent = `Question ${itemIndex + 1}`;

      head.append(status, number);

      const questionText = document.createElement("p");
      questionText.className = "quiz-review-question";
      questionText.textContent = item.text;

      const yourAnswer = document.createElement("p");
      yourAnswer.className = "quiz-review-answer";
      const yourLabel = document.createElement("strong");
      yourLabel.textContent = "Your answer: ";
      yourAnswer.append(yourLabel, document.createTextNode(`${LETTERS[chosen]}. ${item.options[chosen]}`));

      card.append(head, questionText, yourAnswer);

      if (!isCorrect) {
        const rightAnswer = document.createElement("p");
        rightAnswer.className = "quiz-review-answer";
        const rightLabel = document.createElement("strong");
        rightLabel.textContent = "Correct answer: ";
        rightAnswer.append(rightLabel, document.createTextNode(`${LETTERS[item.correct]}. ${item.options[item.correct]}`));
        card.append(rightAnswer);
      }

      const explanation = document.createElement("p");
      explanation.className = "quiz-review-explanation";
      explanation.innerHTML = '<svg class="icon" aria-hidden="true" focusable="false"><use href="#icon-info"></use></svg>';
      explanation.append(document.createTextNode(item.explanation));
      card.append(explanation);

      review.append(card);
    });

    stage.hidden = true;
    results.hidden = false;
    resultsTitle.focus({ preventScroll: true });
    scrollTo(results);
  }

  function showHub({ scroll = true, focus = true } = {}) {
    activeKey = null;
    index = 0;
    answers = [];
    submitted = false;

    stage.hidden = true;
    results.hidden = true;
    hub.hidden = false;

    if (focus) {
      hubTitle.focus({ preventScroll: true });
    }

    if (scroll) {
      scrollTo(hub);
    }
  }

  function backToLessons() {
    stage.hidden = true;
    results.hidden = true;
    hub.hidden = false;
    activeKey = null;
    index = 0;
    answers = [];
    submitted = false;

    const learn = document.getElementById("learn");
    const learnTitle = document.getElementById("learn-title");

    if (learnTitle) {
      learnTitle.focus({ preventScroll: true });
    }

    if (learn) {
      scrollTo(learn);
    }
  }

  function retakeQuiz() {
    if (activeKey) {
      startQuiz(activeKey);
    }
  }

  /* Delegated so the hub, lesson cards and dialog share one entry point. */
  document.addEventListener("click", (event) => {
    const trigger = event.target.closest("[data-quiz-topic]");

    if (!trigger) {
      return;
    }

    const key = trigger.getAttribute("data-quiz-topic");

    if (!key || !QUIZZES[key]) {
      return;
    }

    const dialog = trigger.closest("dialog");

    if (dialog && dialog.open) {
      document.body.classList.remove("modal-open");
      dialog.dataset.skipFocusReturn = "true";
      dialog.close();
      startQuiz(key);
      return;
    }

    startQuiz(key);
  });

  options.addEventListener("change", (event) => {
    const input = event.target;

    if (!input.matches('input[name="quiz-answer"]')) {
      return;
    }

    answers[index] = Number(input.value);

    options.querySelectorAll(".quiz-option").forEach((label) => {
      const radio = label.querySelector("input");
      label.classList.toggle("is-selected", radio.checked);
    });

    updateControls();
  });

  prevBtn.addEventListener("click", goPrevious);
  nextBtn.addEventListener("click", goNext);
  submitBtn.addEventListener("click", submitQuiz);
  retakeBtn.addEventListener("click", retakeQuiz);
  toLessonsBtn.addEventListener("click", backToLessons);
  backBtn.addEventListener("click", () => showHub());

  // Fetch quizzes dynamically from the backend and merge with static fallbacks
  async function refreshQuizzesFromBackend() {
    try {
      const res = await fetch(`${API_BASE_URL}/quizzes`, {
        method: "GET",
        credentials: window.location.protocol === "file:" ? "same-origin" : "include"
      });
      if (!res.ok) return;
      const data = await res.json();
      if (!data || !data.success || !Array.isArray(data.data)) return;

      data.data.forEach((quiz) => {
        const key = quiz.slug || quiz.id;
        const questions = Array.isArray(quiz.questions)
          ? quiz.questions.map((q) => ({
              id: q.id,
              text: q.question_text || q.text,
              options: Array.isArray(q.options) ? q.options : [],
              correct: Number.isFinite(q.correct_index) ? q.correct_index : (q.correct || 0),
              explanation: q.explanation || ""
            }))
          : [];

        QUIZZES[key] = {
          id: quiz.id,
          slug: quiz.slug || key,
          title: quiz.title,
          category: quiz.category || "General",
          description: quiz.description,
          questions: questions.length > 0 ? questions : (QUIZZES[key]?.questions || [])
        };
      });

      buildHub();
    } catch (e) {
      // Backend offline; built-in static quizzes remain active
    }
  }

  window.CyberSafeRefreshQuizzes = refreshQuizzesFromBackend;
  window.CyberSafeQuizzes = QUIZZES;

  buildHub();
  refreshQuizzesFromBackend();
})();

/* =========================================================
   CyberSafe — Admin Authentication, Dashboard & Content Sync
   Full Node.js backend & Supabase PostgreSQL integration.
   Handles authentication, REST API requests, admin panel,
   and live synchronization with the website sections.
   ========================================================= */

(() => {
  "use strict";

  // Configured to connect to the deployed Render backend with Vite/CRA env variable support
  const API_BASE_URL = (() => {
    let envUrl = "";
    try {
      if (typeof import.meta !== "undefined" && import.meta?.env?.VITE_API_URL) {
        envUrl = import.meta.env.VITE_API_URL;
      }
    } catch (e) {}
    try {
      if (!envUrl && typeof process !== "undefined" && process?.env?.REACT_APP_API_URL) {
        envUrl = process.env.REACT_APP_API_URL;
      }
    } catch (e) {}

    const rawUrl =
      (typeof window !== "undefined" && (window.CYBERSAFE_API_URL || window.__CYBERSAFE_API_URL__)) ||
      envUrl ||
      "https://cybersafeawareness-backend.onrender.com";

    const clean = String(rawUrl).trim().replace(/\/+$/, "");
    return clean.endsWith("/api") ? clean : `${clean}/api`;
  })();

  const trigger = document.getElementById("admin-logo-trigger");
  const dialog = document.getElementById("admin-dialog");
  const loginView = document.getElementById("admin-login-view");
  const panelView = document.getElementById("admin-panel-view");
  const loginForm = document.getElementById("admin-login-form");
  const loginSubmitBtn = document.getElementById("admin-login-submit");
  const usernameInput = document.getElementById("admin-username");
  const passwordInput = document.getElementById("admin-password");
  const passwordToggle = document.getElementById("admin-password-toggle");
  const usernameError = document.getElementById("admin-username-error");
  const passwordError = document.getElementById("admin-password-error");
  const loginError = document.getElementById("admin-login-error");
  const logoutBtn = document.getElementById("admin-logout");
  const panelTitle = document.getElementById("admin-panel-title");
  const panelNotice = document.getElementById("admin-panel-notice");
  const contentList = document.getElementById("admin-content-list");
  const contentForm = document.getElementById("admin-content-form");
  const kindInput = document.getElementById("admin-content-kind");
  const moduleSelectWrap = document.getElementById("admin-module-select-wrap");
  const moduleSelect = document.getElementById("admin-content-module");
  const titleInput = document.getElementById("admin-content-title");
  const categoryInput = document.getElementById("admin-content-category");
  const descriptionInput = document.getElementById("admin-content-description");
  const bodyInput = document.getElementById("admin-content-body");
  const bodyLabel = document.getElementById("admin-content-body-label");
  const bodyWrap = document.getElementById("admin-content-body-wrap");
  const moduleSelectLabel = document.getElementById("admin-module-select-label");
  const contentError = document.getElementById("admin-content-error");
  const saveBtn = document.getElementById("admin-content-save");
  const cancelBtn = document.getElementById("admin-content-cancel");
  const editorTitle = document.getElementById("admin-editor-title");
  const addBtn = document.getElementById("admin-add");
  const statusEl = document.getElementById("admin-status");
  const filterBar = document.getElementById("admin-filter-bar");
  const statTotalModules = document.getElementById("stat-total-modules");
  const statTotalLessons = document.getElementById("stat-total-lessons");
  const statRecentTitle = document.getElementById("stat-recent-title");

  // Question Manager DOM references
  const editorView = document.getElementById("admin-content-editor-view");
  const qmView = document.getElementById("admin-question-manager-view");
  const qmBackBtn = document.getElementById("admin-qm-back");
  const qmTitle = document.getElementById("admin-qm-title");
  const qmSubtitle = document.getElementById("admin-qm-subtitle");
  const qmList = document.getElementById("admin-qm-list");
  const qmForm = document.getElementById("admin-qm-form");
  const qmFormTitle = document.getElementById("admin-qm-form-title");
  const qText = document.getElementById("admin-q-text");
  const qOpt0 = document.getElementById("admin-q-opt-0");
  const qOpt1 = document.getElementById("admin-q-opt-1");
  const qOpt2 = document.getElementById("admin-q-opt-2");
  const qOpt3 = document.getElementById("admin-q-opt-3");
  const qCorrect = document.getElementById("admin-q-correct");
  const qExp = document.getElementById("admin-q-explanation");
  const qmError = document.getElementById("admin-qm-error");
  const qmSaveBtn = document.getElementById("admin-qm-save");
  const qmCancelBtn = document.getElementById("admin-qm-cancel");

  if (
    !trigger ||
    !dialog ||
    !loginView ||
    !panelView ||
    !loginForm ||
    !usernameInput ||
    !passwordInput ||
    !contentList ||
    !contentForm ||
    !kindInput ||
    !titleInput ||
    !descriptionInput ||
    !bodyInput ||
    !saveBtn ||
    !cancelBtn ||
    !editorTitle
  ) {
    return;
  }

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  let authenticated = false;
  let authToken = null;
  let editingItem = null;
  let pendingDeleteId = null;
  let activeFilter = "all";
  let statusTimer = 0;
  let cachedModules = [];
  let cachedLessons = [];
  let cachedQuizzes = [];
  let activeQuizForQuestions = null;
  let editingQuestion = null;
  let pendingDeleteQuestionId = null;

  /* ---------- REST API Client ---------- */

  async function apiRequest(endpoint, method = "GET", body = null) {
    const headers = { "Content-Type": "application/json" };
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    const options = {
      method,
      headers,
      credentials: window.location.protocol === "file:" ? "same-origin" : "include"
    };

    if (body) {
      options.body = JSON.stringify(body);
    }

    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const errorMsg = data.error || `Request failed with status ${res.status}`;
        const err = new Error(errorMsg);
        err.status = res.status;
        err.data = data;
        throw err;
      }

      return data;
    } catch (err) {
      if (err.name === "TypeError" && err.message.includes("fetch")) {
        const netErr = new Error(
          `Unable to connect to the backend server at ${API_BASE_URL}. Please ensure the Node.js backend is running.`
        );
        netErr.isNetworkError = true;
        throw netErr;
      }
      throw err;
    }
  }

  /* ---------- Status & Feedback Helpers ---------- */

  function setStatus(message, isError = false) {
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.style.color = isError ? "#FFB4C6" : "var(--cyan)";
    window.clearTimeout(statusTimer);

    if (message) {
      statusTimer = window.setTimeout(() => {
        statusEl.textContent = "";
      }, 6000);
    }
  }

  function scrollIntoView(element) {
    if (!element) return;
    element.scrollIntoView({
      behavior: reducedMotion.matches ? "auto" : "smooth",
      block: "start"
    });
  }

  /* ---------- Login Controls ---------- */

  function clearLoginErrors() {
    [usernameError, passwordError, loginError].forEach((element) => {
      if (!element) return;
      element.hidden = true;
      element.textContent = "";
    });
    usernameInput.removeAttribute("aria-invalid");
    passwordInput.removeAttribute("aria-invalid");
  }

  function showFieldError(element, input, message) {
    if (element) {
      element.textContent = message;
      element.hidden = false;
    }
    if (input) {
      input.setAttribute("aria-invalid", "true");
    }
  }

  function resetPasswordVisibility() {
    passwordInput.type = "password";
    if (passwordToggle) {
      passwordToggle.textContent = "Show";
      passwordToggle.setAttribute("aria-label", "Show password");
      passwordToggle.setAttribute("aria-pressed", "false");
    }
  }

  function showLoginView() {
    loginView.hidden = false;
    panelView.hidden = true;
    dialog.classList.remove("is-panel");
    clearLoginErrors();
  }

  function showPanelView() {
    loginView.hidden = true;
    panelView.hidden = false;
    dialog.classList.add("is-panel");
    loadDashboardAndContent();
    panelTitle?.focus({ preventScroll: true });
  }

  async function checkExistingSession() {
    try {
      const data = await apiRequest("/auth/me", "GET");
      if (data && data.success && data.admin) {
        authenticated = true;
        return true;
      }
    } catch (e) {
      authenticated = false;
    }
    return false;
  }

  async function openAdmin() {
    clearLoginErrors();

    // Verify session with backend
    const hasSession = await checkExistingSession();

    if (hasSession) {
      showPanelView();
    } else {
      showLoginView();
    }

    document.body.classList.add("modal-open");

    if (typeof dialog.showModal === "function") {
      if (!dialog.open) {
        dialog.showModal();
      }
    } else {
      dialog.setAttribute("open", "");
    }

    window.setTimeout(() => {
      if (authenticated) {
        panelTitle?.focus({ preventScroll: true });
      } else {
        usernameInput.focus({ preventScroll: true });
      }
    }, 30);
  }

  function closeAdmin() {
    if (!dialog.hasAttribute("open")) return;

    if (typeof dialog.close === "function") {
      dialog.close();
    } else {
      dialog.removeAttribute("open");
      document.body.classList.remove("modal-open");
      trigger.focus({ preventScroll: true });
    }
  }

  trigger.addEventListener("click", openAdmin);

  document.querySelectorAll("[data-admin-close]").forEach((button) => {
    button.addEventListener("click", closeAdmin);
  });

  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) {
      closeAdmin();
    }
  });

  dialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
    pendingDeleteId = null;
    trigger.focus({ preventScroll: true });
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      dialog.hasAttribute("open") &&
      typeof dialog.showModal !== "function"
    ) {
      closeAdmin();
    }
  });

  passwordToggle?.addEventListener("click", () => {
    const show = passwordInput.type === "password";
    passwordInput.type = show ? "text" : "password";
    passwordToggle.textContent = show ? "Hide" : "Show";
    passwordToggle.setAttribute("aria-label", show ? "Hide password" : "Show password");
    passwordToggle.setAttribute("aria-pressed", String(show));
    passwordInput.focus({ preventScroll: true });
  });

  // Handle Admin Login submission via REST API
  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearLoginErrors();

    const username = usernameInput.value.trim();
    const password = passwordInput.value;
    let firstInvalid = null;

    if (!username) {
      showFieldError(usernameError, usernameInput, "Enter your admin username.");
      firstInvalid = usernameInput;
    }

    if (!password) {
      showFieldError(passwordError, passwordInput, "Enter your admin password.");
      if (!firstInvalid) firstInvalid = passwordInput;
    }

    if (firstInvalid) {
      firstInvalid.focus({ preventScroll: true });
      return;
    }

    // Set loading indicator
    const submitBtn = loginSubmitBtn || loginForm.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn ? submitBtn.textContent : "Login";
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Authenticating...";
    }

    try {
      const data = await apiRequest("/auth/login", "POST", { username, password });

      if (data && data.success) {
        authenticated = true;
        authToken = data.token || null;
        loginForm.reset();
        resetPasswordVisibility();
        showPanelView();
        setStatus(`Signed in successfully as administrator "${data.admin.username}".`);
      } else {
        throw new Error(data.error || "Authentication failed.");
      }
    } catch (err) {
      if (loginError) {
        loginError.textContent = err.message || "Incorrect username or password. Please try again.";
        loginError.hidden = false;
      }
      passwordInput.select();
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = originalBtnText;
      }
    }
  });

  // Handle Admin Logout
  logoutBtn?.addEventListener("click", async () => {
    try {
      await apiRequest("/auth/logout", "POST");
    } catch (e) {
      // Ignore network errors on logout
    }

    authenticated = false;
    authToken = null;
    editingItem = null;
    pendingDeleteId = null;
    loginForm.reset();
    resetPasswordVisibility();
    resetContentForm();
    showLoginView();
    setStatus("");
    closeAdmin();
  });

  /* ---------- Dashboard & Content Loading ---------- */

  function setPanelNotice(title, message) {
    if (!panelNotice) return;
    const strong = document.createElement("strong");
    strong.textContent = title;
    panelNotice.replaceChildren(strong, document.createTextNode(` ${message}`));
  }

  async function updateDatabaseNotice() {
    if (!panelNotice) return;

    try {
      const response = await fetch(`${API_BASE_URL}/health`, {
        method: "GET",
        credentials: "include"
      });
      const health = await response.json().catch(() => ({}));
      const databaseOk = Boolean(health && health.database && health.database.ok);

      if (databaseOk) {
        setPanelNotice(
          "Database Connected.",
          "Educational modules and lessons are loaded directly from Supabase and changes save permanently."
        );
      } else {
        setPanelNotice(
          "Development Mode.",
          "Supabase is not connected, so the Admin Panel is using local fallback data. Configure backend/.env to enable permanent saves."
        );
      }
    } catch (err) {
      setPanelNotice(
        "Backend Status Unknown.",
        "The Admin Panel could not verify the database connection."
      );
    }
  }

  async function loadDashboardAndContent() {
    setStatus("Loading educational content from database...");
    updateDatabaseNotice();

    try {
      // 1. Fetch dashboard stats
      try {
        const statsRes = await apiRequest("/dashboard/stats", "GET");
        if (statsRes && statsRes.data) {
          if (statTotalModules) statTotalModules.textContent = statsRes.data.totalModules;
          if (statTotalLessons) statTotalLessons.textContent = statsRes.data.totalLessons;
          if (statRecentTitle) {
            const recent = statsRes.data.recentContent && statsRes.data.recentContent[0];
            statRecentTitle.textContent = recent
              ? `${recent.kind === "module" ? "[Module]" : "[Lesson]"} ${recent.title}`
              : "No recent updates";
          }
        }
      } catch (e) {
        console.warn("Could not load dashboard stats:", e.message);
      }

      // 2. Fetch all modules, lessons, and quizzes
      const [modulesRes, lessonsRes, quizzesRes] = await Promise.all([
        apiRequest("/modules", "GET"),
        apiRequest("/lessons", "GET"),
        apiRequest("/quizzes", "GET").catch(() => ({ data: [] }))
      ]);

      cachedModules = modulesRes.data || [];
      cachedLessons = lessonsRes.data || [];
      cachedQuizzes = (quizzesRes && quizzesRes.data) || [];

      // Update parent module dropdown in editor
      populateModuleSelect();

      // Render content list
      renderContentList();

      // Sync website sections with database content
      syncWebsiteContent(cachedModules, cachedLessons);

      setStatus("");
    } catch (err) {
      console.error("Failed to load content from database:", err);
      setStatus(err.message, true);
    }
  }

  function populateModuleSelect() {
    if (!moduleSelect) return;
    const currentVal = moduleSelect.value;
    moduleSelect.replaceChildren();

    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = "-- Select Parent Module --";
    moduleSelect.append(defaultOpt);

    cachedModules.forEach((mod) => {
      const opt = document.createElement("option");
      opt.value = mod.id;
      opt.textContent = `${mod.title} (${mod.category || "Foundations"})`;
      moduleSelect.append(opt);
    });

    if (currentVal) {
      moduleSelect.value = currentVal;
    }
  }

  // Kind toggle handler
  function handleKindChange() {
    const kind = kindInput.value;
    const isLesson = kind === "lesson";
    const isQuiz = kind === "quiz";

    if (moduleSelectWrap) {
      moduleSelectWrap.hidden = !isLesson && !isQuiz;
    }
    if (moduleSelectLabel) {
      moduleSelectLabel.textContent = isQuiz ? "Related Module (Optional)" : "Parent Module";
    }
    if (bodyWrap) {
      bodyWrap.hidden = isQuiz;
    }
    if (bodyLabel) {
      bodyLabel.textContent = isLesson ? "Full lesson content" : "What you'll cover (points, one per line)";
    }
  }

  kindInput.addEventListener("change", handleKindChange);

  /* ---------- Content List Rendering ---------- */

  function buildItemCard(item, kind) {
    const card = document.createElement("article");
    card.className = "admin-item";

    const top = document.createElement("div");
    top.className = "admin-item-top";

    const kindBadge = document.createElement("span");
    kindBadge.className = "admin-item-kind";
    kindBadge.textContent = kind;

    const tag = document.createElement("span");
    tag.className = "admin-item-tag";
    tag.textContent = item.category || (kind === "module" ? "Foundations" : (kind === "quiz" ? "Quiz" : "Accounts"));

    top.append(kindBadge, tag);

    if (kind === "lesson" && item.modules) {
      const parentTag = document.createElement("span");
      parentTag.className = "admin-item-tag";
      parentTag.style.opacity = "0.75";
      parentTag.textContent = `· Module: ${item.modules.title}`;
      top.append(parentTag);
    } else if (kind === "quiz" && item.module_id) {
      const relMod = cachedModules.find((m) => m.id === item.module_id);
      if (relMod) {
        const parentTag = document.createElement("span");
        parentTag.className = "admin-item-tag";
        parentTag.style.opacity = "0.75";
        parentTag.textContent = `· Module: ${relMod.title}`;
        top.append(parentTag);
      }
    }

    const heading = document.createElement("h4");
    heading.textContent = item.title;

    const description = document.createElement("p");
    description.className = "admin-item-desc";
    description.textContent = item.description;

    const bodyText = document.createElement("p");
    bodyText.className = "admin-item-body";
    if (kind === "quiz") {
      const qCount = (item.questions || []).length;
      bodyText.textContent = `${qCount} question${qCount === 1 ? "" : "s"} in this quiz.`;
    } else {
      bodyText.textContent = item.content || (Array.isArray(item.points) ? item.points.join("\n") : "");
    }

    card.append(top, heading, description, bodyText);

    if (pendingDeleteId === `${kind}:${item.id}`) {
      const confirmWrap = document.createElement("div");
      confirmWrap.className = "admin-confirm";

      const confirmMsg = document.createElement("p");
      confirmMsg.textContent = `Permanently delete ${kind} "${item.title}" from the database? This cannot be undone.`;

      const confirmBtn = document.createElement("button");
      confirmBtn.type = "button";
      confirmBtn.className = "btn btn-small admin-delete";
      confirmBtn.textContent = "Confirm Delete";
      confirmBtn.addEventListener("click", () => deleteItem(kind, item.id));

      const cancelDelBtn = document.createElement("button");
      cancelDelBtn.type = "button";
      cancelDelBtn.className = "btn btn-secondary btn-small";
      cancelDelBtn.textContent = "Cancel";
      cancelDelBtn.addEventListener("click", () => {
        pendingDeleteId = null;
        renderContentList();
      });

      confirmWrap.append(confirmMsg, confirmBtn, cancelDelBtn);
      card.append(confirmWrap);
      return card;
    }

    const actions = document.createElement("div");
    actions.className = "admin-item-actions";

    if (kind === "quiz") {
      const qCount = (item.questions || []).length;
      const qmBtn = document.createElement("button");
      qmBtn.type = "button";
      qmBtn.className = "btn btn-primary btn-small";
      qmBtn.textContent = `Questions (${qCount})`;
      qmBtn.addEventListener("click", () => openQuestionManager(item));
      actions.append(qmBtn);
    }

    const editBtn = document.createElement("button");
    editBtn.type = "button";
    editBtn.className = "btn btn-secondary btn-small";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => startEdit(kind, item));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "btn btn-small admin-delete";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      pendingDeleteId = `${kind}:${item.id}`;
      renderContentList();
    });

    actions.append(editBtn, deleteBtn);
    card.append(actions);

    return card;
  }

  function renderContentList() {
    contentList.replaceChildren();

    const showModules = activeFilter === "all" || activeFilter === "module";
    const showLessons = activeFilter === "all" || activeFilter === "lesson";
    const showQuizzes = activeFilter === "all" || activeFilter === "quiz";

    let totalShown = 0;

    if (showModules && cachedModules.length > 0) {
      const groupEl = document.createElement("div");
      groupEl.className = "admin-list-group";
      const titleEl = document.createElement("p");
      titleEl.className = "admin-list-group-title";
      titleEl.textContent = `Modules (${cachedModules.length})`;
      groupEl.append(titleEl);

      cachedModules.forEach((mod) => {
        groupEl.append(buildItemCard(mod, "module"));
        totalShown++;
      });
      contentList.append(groupEl);
    }

    if (showLessons && cachedLessons.length > 0) {
      const groupEl = document.createElement("div");
      groupEl.className = "admin-list-group";
      const titleEl = document.createElement("p");
      titleEl.className = "admin-list-group-title";
      titleEl.textContent = `Lessons (${cachedLessons.length})`;
      groupEl.append(titleEl);

      cachedLessons.forEach((les) => {
        groupEl.append(buildItemCard(les, "lesson"));
        totalShown++;
      });
      contentList.append(groupEl);
    }

    if (showQuizzes && cachedQuizzes.length > 0) {
      const groupEl = document.createElement("div");
      groupEl.className = "admin-list-group";
      const titleEl = document.createElement("p");
      titleEl.className = "admin-list-group-title";
      titleEl.textContent = `Quizzes (${cachedQuizzes.length})`;
      groupEl.append(titleEl);

      cachedQuizzes.forEach((quiz) => {
        groupEl.append(buildItemCard(quiz, "quiz"));
        totalShown++;
      });
      contentList.append(groupEl);
    }

    if (totalShown === 0) {
      const emptyEl = document.createElement("p");
      emptyEl.className = "admin-empty";
      emptyEl.textContent = "No educational content found in this view.";
      contentList.append(emptyEl);
    }
  }

  // Filter tabs handling
  if (filterBar) {
    filterBar.addEventListener("click", (event) => {
      const btn = event.target.closest("[data-filter]");
      if (!btn) return;
      activeFilter = btn.dataset.filter;
      filterBar.querySelectorAll(".admin-filter-btn").forEach((b) => {
        b.classList.toggle("is-active", b === btn);
      });
      renderContentList();
    });
  }

  /* ---------- Content Editor Actions ---------- */

  function clearContentError() {
    if (!contentError) return;
    contentError.hidden = true;
    contentError.textContent = "";
  }

  function showContentError(message) {
    if (!contentError) return;
    contentError.textContent = message;
    contentError.hidden = false;
  }

  function resetContentForm() {
    editingItem = null;
    contentForm.reset();
    kindInput.value = "module";
    kindInput.disabled = false;
    handleKindChange();
    editorTitle.textContent = "Add educational content";
    saveBtn.textContent = "Save Content";
    cancelBtn.hidden = true;
    clearContentError();
  }

  function startEdit(kind, item) {
    editingItem = { kind, item };
    pendingDeleteId = null;

    kindInput.value = kind;
    kindInput.disabled = true;
    handleKindChange();

    if ((kind === "lesson" || kind === "quiz") && moduleSelect) {
      moduleSelect.value = item.module_id || "";
    }

    titleInput.value = item.title || "";
    categoryInput.value = item.category || "";
    descriptionInput.value = item.description || "";

    if (kind === "quiz") {
      bodyInput.value = "";
    } else if (kind === "lesson") {
      bodyInput.value = item.content || (Array.isArray(item.points) ? item.points.join("\n") : "");
    } else {
      bodyInput.value = Array.isArray(item.points) ? item.points.join("\n") : (item.description || "");
    }

    editorTitle.textContent = `Edit ${kind}: ${item.title}`;
    saveBtn.textContent = "Update Content";
    cancelBtn.hidden = false;
    clearContentError();

    renderContentList();
    scrollIntoView(contentForm);
    titleInput.focus({ preventScroll: true });
  }

  async function deleteItem(kind, id) {
    setStatus(`Deleting ${kind}...`);
    try {
      const endpoint = kind === "module"
        ? `/modules/${id}`
        : (kind === "lesson" ? `/lessons/${id}` : `/quizzes/${id}`);
      await apiRequest(endpoint, "DELETE");

      pendingDeleteId = null;
      if (editingItem && editingItem.item.id === id) {
        resetContentForm();
      }

      if (kind === "quiz") {
        window.CyberSafeRefreshQuizzes?.();
      }

      setStatus(`Deleted ${kind} permanently from database.`);
      await loadDashboardAndContent();
    } catch (err) {
      setStatus(`Failed to delete: ${err.message}`, true);
    }
  }

  addBtn?.addEventListener("click", () => {
    resetContentForm();
    renderContentList();
    scrollIntoView(contentForm);
    titleInput.focus({ preventScroll: true });
  });

  cancelBtn?.addEventListener("click", () => {
    resetContentForm();
    renderContentList();
  });

  // Handle Create / Update Form Submit via REST API
  contentForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearContentError();

    const kind = kindInput.value;
    const title = titleInput.value.trim();
    const category = categoryInput ? categoryInput.value.trim() : "";
    const description = descriptionInput.value.trim();
    const content = bodyInput.value.trim();
    const moduleId = moduleSelect ? moduleSelect.value : null;

    if (!title) {
      showContentError("Please enter a title.");
      titleInput.focus({ preventScroll: true });
      return;
    }

    if (!description) {
      showContentError("Please enter a short description.");
      descriptionInput.focus({ preventScroll: true });
      return;
    }

    if (!content && kind !== "quiz") {
      showContentError(kind === "lesson" ? "Please enter full lesson content." : "Please enter points covered.");
      bodyInput.focus({ preventScroll: true });
      return;
    }

    saveBtn.disabled = true;
    const originalSaveText = saveBtn.textContent;
    saveBtn.textContent = "Saving...";

    try {
      if (editingItem) {
        // UPDATE existing
        const endpoint = editingItem.kind === "module"
          ? `/modules/${editingItem.item.id}`
          : (editingItem.kind === "lesson" ? `/lessons/${editingItem.item.id}` : `/quizzes/${editingItem.item.id}`);

        const payload = editingItem.kind === "quiz"
          ? { title, category: category || "General", description, module_id: moduleId || null }
          : {
              title,
              category,
              description,
              ...(editingItem.kind === "lesson" ? { content, module_id: moduleId } : { points: content.split("\n").filter(Boolean) })
            };

        await apiRequest(endpoint, "PUT", payload);
        if (editingItem.kind === "quiz") {
          window.CyberSafeRefreshQuizzes?.();
        }
        setStatus(`Updated ${editingItem.kind} "${title}" successfully.`);
      } else {
        // CREATE new
        const endpoint = kind === "module" ? "/modules" : (kind === "lesson" ? "/lessons" : "/quizzes");
        const payload = kind === "quiz"
          ? { title, category: category || "General", description, module_id: moduleId || null }
          : {
              title,
              category,
              description,
              ...(kind === "lesson" ? { content, module_id: moduleId } : { points: content.split("\n").filter(Boolean) })
            };

        await apiRequest(endpoint, "POST", payload);
        if (kind === "quiz") {
          window.CyberSafeRefreshQuizzes?.();
        }
        setStatus(`Created new ${kind} "${title}" successfully.`);
      }

      resetContentForm();
      await loadDashboardAndContent();
    } catch (err) {
      showContentError(err.message || "Failed to save content to database.");
    } finally {
      saveBtn.disabled = false;
      saveBtn.textContent = originalSaveText;
    }
  });

  /* ---------- Quiz Questions Manager ---------- */

  const LETTERS = ["A", "B", "C", "D"];

  function openQuestionManager(quiz) {
    activeQuizForQuestions = quiz;
    editingQuestion = null;
    pendingDeleteQuestionId = null;

    if (editorView) editorView.hidden = true;
    if (qmView) qmView.hidden = false;

    if (qmTitle) qmTitle.textContent = `Questions: ${quiz.title}`;
    if (qmSubtitle) {
      const qCount = (quiz.questions || []).length;
      qmSubtitle.textContent = `Review, add, edit, or delete questions for this quiz (${qCount} total).`;
    }

    renderQuestionManagerList();
    resetQuestionForm();
    scrollIntoView(qmView);
  }

  function closeQuestionManager() {
    activeQuizForQuestions = null;
    editingQuestion = null;
    pendingDeleteQuestionId = null;

    if (qmView) qmView.hidden = true;
    if (editorView) editorView.hidden = false;

    renderContentList();
  }

  function renderQuestionManagerList() {
    if (!qmList || !activeQuizForQuestions) return;
    qmList.replaceChildren();

    const questions = activeQuizForQuestions.questions || [];

    if (questions.length === 0) {
      const empty = document.createElement("p");
      empty.className = "admin-qm-empty";
      empty.textContent = "No questions in this quiz yet. Use the form below to add one.";
      qmList.append(empty);
      return;
    }

    questions.forEach((q, idx) => {
      const item = document.createElement("article");
      item.className = "admin-qm-item";

      const qTextEl = document.createElement("p");
      qTextEl.className = "admin-qm-item-text";
      qTextEl.textContent = `${idx + 1}. ${q.question_text || q.text}`;
      item.append(qTextEl);

      const optsList = document.createElement("ul");
      optsList.className = "admin-qm-item-options";
      const opts = Array.isArray(q.options) ? q.options : [];
      const correctIdx = Number.isFinite(q.correct_index) ? q.correct_index : (q.correct || 0);

      opts.forEach((optText, optIdx) => {
        const li = document.createElement("li");
        const isCorrect = optIdx === correctIdx;
        if (isCorrect) li.className = "is-correct";
        li.textContent = `${LETTERS[optIdx] || optIdx + 1}. ${optText}${isCorrect ? " ✓ (Correct)" : ""}`;
        optsList.append(li);
      });
      item.append(optsList);

      if (q.explanation) {
        const expEl = document.createElement("p");
        expEl.className = "admin-qm-item-exp";
        expEl.textContent = `Explanation: ${q.explanation}`;
        item.append(expEl);
      }

      if (pendingDeleteQuestionId === q.id) {
        const confirmWrap = document.createElement("div");
        confirmWrap.className = "admin-confirm";

        const msg = document.createElement("p");
        msg.textContent = `Delete Question ${idx + 1}?`;

        const confBtn = document.createElement("button");
        confBtn.type = "button";
        confBtn.className = "btn btn-small admin-delete";
        confBtn.textContent = "Confirm Delete";
        confBtn.addEventListener("click", () => deleteQuestion(q.id));

        const cancelDelBtn = document.createElement("button");
        cancelDelBtn.type = "button";
        cancelDelBtn.className = "btn btn-secondary btn-small";
        cancelDelBtn.textContent = "Cancel";
        cancelDelBtn.addEventListener("click", () => {
          pendingDeleteQuestionId = null;
          renderQuestionManagerList();
        });

        confirmWrap.append(msg, confBtn, cancelDelBtn);
        item.append(confirmWrap);
      } else {
        const actions = document.createElement("div");
        actions.className = "admin-qm-item-actions";

        const editBtn = document.createElement("button");
        editBtn.type = "button";
        editBtn.className = "btn btn-secondary btn-small";
        editBtn.textContent = "Edit";
        editBtn.addEventListener("click", () => startEditQuestion(q));

        const delBtn = document.createElement("button");
        delBtn.type = "button";
        delBtn.className = "btn btn-small admin-delete";
        delBtn.textContent = "Delete";
        delBtn.addEventListener("click", () => {
          pendingDeleteQuestionId = q.id;
          renderQuestionManagerList();
        });

        actions.append(editBtn, delBtn);
        item.append(actions);
      }

      qmList.append(item);
    });
  }

  function startEditQuestion(question) {
    editingQuestion = question;
    pendingDeleteQuestionId = null;

    if (qmFormTitle) qmFormTitle.textContent = "Edit Question";
    if (qText) qText.value = question.question_text || question.text || "";

    const opts = Array.isArray(question.options) ? question.options : [];
    if (qOpt0) qOpt0.value = opts[0] || "";
    if (qOpt1) qOpt1.value = opts[1] || "";
    if (qOpt2) qOpt2.value = opts[2] || "";
    if (qOpt3) qOpt3.value = opts[3] || "";

    const correctIdx = Number.isFinite(question.correct_index) ? question.correct_index : (question.correct || 0);
    if (qCorrect) qCorrect.value = String(correctIdx);
    if (qExp) qExp.value = question.explanation || "";

    if (qmSaveBtn) qmSaveBtn.textContent = "Update Question";
    if (qmCancelBtn) qmCancelBtn.hidden = false;
    if (qmError) { qmError.hidden = true; qmError.textContent = ""; }

    scrollIntoView(qmForm);
    qText?.focus({ preventScroll: true });
  }

  function resetQuestionForm() {
    editingQuestion = null;
    if (qmForm) qmForm.reset();
    if (qmFormTitle) qmFormTitle.textContent = "Add New Question";
    if (qmSaveBtn) qmSaveBtn.textContent = "Save Question";
    if (qmCancelBtn) qmCancelBtn.hidden = true;
    if (qmError) { qmError.hidden = true; qmError.textContent = ""; }
  }

  async function deleteQuestion(questionId) {
    setStatus("Deleting question...");
    try {
      await apiRequest(`/questions/${questionId}`, "DELETE");
      pendingDeleteQuestionId = null;

      // Refresh quiz questions
      const quizRes = await apiRequest(`/quizzes/${activeQuizForQuestions.id}`, "GET");
      if (quizRes && quizRes.data) {
        activeQuizForQuestions = quizRes.data;
        const cachedIdx = cachedQuizzes.findIndex(q => q.id === activeQuizForQuestions.id);
        if (cachedIdx !== -1) cachedQuizzes[cachedIdx] = activeQuizForQuestions;
      }

      window.CyberSafeRefreshQuizzes?.();
      renderQuestionManagerList();
      if (qmSubtitle) {
        const qCount = (activeQuizForQuestions.questions || []).length;
        qmSubtitle.textContent = `Review, add, edit, or delete questions for this quiz (${qCount} total).`;
      }
      setStatus("Deleted question successfully.");
    } catch (err) {
      setStatus(`Failed to delete question: ${err.message}`, true);
    }
  }

  qmBackBtn?.addEventListener("click", closeQuestionManager);
  qmCancelBtn?.addEventListener("click", resetQuestionForm);

  qmForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (qmError) { qmError.hidden = true; qmError.textContent = ""; }

    const question_text = (qText?.value || "").trim();
    const opt0 = (qOpt0?.value || "").trim();
    const opt1 = (qOpt1?.value || "").trim();
    const opt2 = (qOpt2?.value || "").trim();
    const opt3 = (qOpt3?.value || "").trim();
    const correct_index = Number(qCorrect?.value || 0);
    const explanation = (qExp?.value || "").trim();

    if (!question_text) {
      if (qmError) { qmError.textContent = "Please enter question text."; qmError.hidden = false; }
      qText?.focus({ preventScroll: true });
      return;
    }

    if (!opt0 || !opt1 || !opt2 || !opt3) {
      if (qmError) { qmError.textContent = "Please provide all four answer choices (A, B, C, and D)."; qmError.hidden = false; }
      return;
    }

    const options = [opt0, opt1, opt2, opt3];
    const payload = { question_text, options, correct_index, explanation };

    if (qmSaveBtn) {
      qmSaveBtn.disabled = true;
      qmSaveBtn.textContent = "Saving...";
    }

    try {
      if (editingQuestion) {
        await apiRequest(`/questions/${editingQuestion.id}`, "PUT", payload);
        setStatus("Updated question successfully.");
      } else {
        await apiRequest(`/quizzes/${activeQuizForQuestions.id}/questions`, "POST", payload);
        setStatus("Created new question successfully.");
      }

      // Refresh quiz questions from API
      const quizRes = await apiRequest(`/quizzes/${activeQuizForQuestions.id}`, "GET");
      if (quizRes && quizRes.data) {
        activeQuizForQuestions = quizRes.data;
        const cachedIdx = cachedQuizzes.findIndex(q => q.id === activeQuizForQuestions.id);
        if (cachedIdx !== -1) cachedQuizzes[cachedIdx] = activeQuizForQuestions;
      }

      window.CyberSafeRefreshQuizzes?.();
      renderQuestionManagerList();
      resetQuestionForm();
      if (qmSubtitle) {
        const qCount = (activeQuizForQuestions.questions || []).length;
        qmSubtitle.textContent = `Review, add, edit, or delete questions for this quiz (${qCount} total).`;
      }
    } catch (err) {
      if (qmError) {
        qmError.textContent = err.message || "Failed to save question.";
        qmError.hidden = false;
      }
    } finally {
      if (qmSaveBtn) {
        qmSaveBtn.disabled = false;
        qmSaveBtn.textContent = editingQuestion ? "Update Question" : "Save Question";
      }
    }
  });

  /* ---------- Website Content Live Synchronization ---------- */

  function iconSVG(href) {
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("class", "icon");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    const use = document.createElementNS("http://www.w3.org/2000/svg", "use");
    use.setAttribute("href", href);
    svg.append(use);
    return svg;
  }

  function arrowSpan() {
    const arrow = document.createElement("span");
    arrow.className = "link-arrow";
    arrow.setAttribute("aria-hidden", "true");
    arrow.append(iconSVG("#icon-arrow-right"));
    return arrow;
  }

  function syncWebsiteContent(modules, lessons) {
    if (!Array.isArray(modules) || !Array.isArray(lessons)) return;

    // 1. Sync global JavaScript topics dictionary
    if (window.CyberSafeTopics) {
      lessons.forEach((les) => {
        const key = les.slug || les.id;
        const pts = Array.isArray(les.points) && les.points.length
          ? les.points
          : (les.content || "").split("\n").map(s => s.replace(/^[•\-*]\s*/, "").trim()).filter(Boolean);

        window.CyberSafeTopics[key] = {
          category: les.category || "Accounts",
          title: les.title,
          copy: les.description,
          points: pts
        };
      });
    }

    // 2. Sync global JavaScript MODULES dictionary
    if (window.CyberSafeModules) {
      modules.forEach((mod) => {
        const key = mod.slug || mod.id;
        const modLessons = lessons.filter(l => l.module_id === mod.id);
        const pts = Array.isArray(mod.points) && mod.points.length ? mod.points : [mod.description || ""];

        window.CyberSafeModules[key] = {
          points: pts,
          lessons: modLessons.map(l => ({ topic: l.slug || l.id }))
        };
      });
    }

    // 3. Sync LEARN Section Topic Cards
    const learnGrid = document.querySelector("#learn .topic-grid");
    if (learnGrid) {
      lessons.forEach((les) => {
        const key = les.slug || les.id;
        let card = document.getElementById(`topic-${key}`);

        if (card) {
          // Update existing card
          const titleEl = card.querySelector("h3");
          const descEl = card.querySelector("p");
          const tagEl = card.querySelector(".topic-tag");
          if (titleEl) titleEl.textContent = les.title;
          if (descEl) descEl.textContent = les.description;
          if (tagEl) tagEl.textContent = les.category || "Accounts";
        } else {
          // Create new dynamic lesson topic card
          card = document.createElement("article");
          card.className = "topic-card";
          card.id = `topic-${key}`;

          const head = document.createElement("div");
          head.className = "topic-head";

          const tile = document.createElement("span");
          tile.className = "icon-tile";
          tile.append(iconSVG("#icon-book"));

          const tag = document.createElement("span");
          tag.className = "topic-tag";
          tag.textContent = les.category || "Lesson";

          head.append(tile, tag);

          const h3 = document.createElement("h3");
          h3.textContent = les.title;

          const p = document.createElement("p");
          p.textContent = les.description;

          const actions = document.createElement("div");
          actions.className = "topic-actions";

          const learnMoreBtn = document.createElement("button");
          learnMoreBtn.className = "topic-link";
          learnMoreBtn.type = "button";
          learnMoreBtn.dataset.topic = key;
          learnMoreBtn.setAttribute("aria-haspopup", "dialog");
          learnMoreBtn.setAttribute("aria-label", `Learn More: ${les.title}`);
          learnMoreBtn.append(document.createTextNode("Learn More"), arrowSpan());

          const quizBtn = document.createElement("button");
          quizBtn.className = "topic-quiz";
          quizBtn.type = "button";
          quizBtn.dataset.quizTopic = key;
          quizBtn.textContent = "Take Quiz";

          actions.append(learnMoreBtn, quizBtn);
          card.append(head, h3, p, actions);
          learnGrid.append(card);
        }
      });
    }

    // 4. Sync MODULES Section Module Cards
    const moduleGrid = document.getElementById("module-grid");
    if (moduleGrid) {
      modules.forEach((mod) => {
        const key = mod.slug || mod.id;
        let card = moduleGrid.querySelector(`[data-module="${key}"]`)?.closest(".module-card");

        if (card) {
          // Update existing module card
          const titleEl = card.querySelector("h3");
          const descEl = card.querySelector("p");
          const tagEl = card.querySelector(".topic-tag");
          if (titleEl) titleEl.textContent = mod.title;
          if (descEl) descEl.textContent = mod.description;
          if (tagEl) tagEl.textContent = mod.category || "Foundations";
        } else {
          // Create new dynamic module card
          card = document.createElement("article");
          card.className = "topic-card module-card";

          const head = document.createElement("div");
          head.className = "topic-head";

          const tile = document.createElement("span");
          tile.className = "icon-tile";
          tile.append(iconSVG("#icon-shield"));

          const tag = document.createElement("span");
          tag.className = "topic-tag";
          tag.textContent = mod.category || "Foundations";

          head.append(tile, tag);

          const h3 = document.createElement("h3");
          h3.textContent = mod.title;

          const p = document.createElement("p");
          p.textContent = mod.description;

          const exploreBtn = document.createElement("button");
          exploreBtn.className = "topic-link module-open";
          exploreBtn.type = "button";
          exploreBtn.dataset.module = key;
          exploreBtn.setAttribute("aria-expanded", "false");
          exploreBtn.setAttribute("aria-controls", "module-detail");
          exploreBtn.setAttribute("aria-label", `Explore Module: ${mod.title}`);
          exploreBtn.append(document.createTextNode("Explore Module"), arrowSpan());

          card.append(head, h3, p, exploreBtn);
          moduleGrid.append(card);
        }
      });
    }
  }

  /* ---------- Initialization ---------- */

  // Initial check on website load to sync database content
  async function init() {
    try {
      const [modulesRes, lessonsRes, quizzesRes] = await Promise.all([
        apiRequest("/modules", "GET"),
        apiRequest("/lessons", "GET"),
        apiRequest("/quizzes", "GET").catch(() => ({ data: [] }))
      ]);

      if (modulesRes && modulesRes.data && lessonsRes && lessonsRes.data) {
        cachedModules = modulesRes.data;
        cachedLessons = lessonsRes.data;
        cachedQuizzes = (quizzesRes && quizzesRes.data) || [];
        syncWebsiteContent(cachedModules, cachedLessons);
      }
    } catch (e) {
      // Backend may be offline or loading; default static HTML remains safe
      console.log("CyberSafe website loaded with static content fallback.");
    }

    showLoginView();
  }

  init();
})();


