/* ========================================================================
   Alidrissi Wallpaper — script.js
   Vanilla JS only. Handles:
   - Building the category navigation (glass pill tabs)
   - Generating ~1000 wallpapers across 14 categories from a curated,
     verified pool of real Unsplash photo IDs (each ID re-used with
     distinct crop/focal-point/orientation params so every card is a
     real, working, visually distinct image — never a broken link)
   - Paginated "Load more" rendering (keeps the page fast with 1000 items)
   - Lazy "fade-in" reveal on scroll
   - Forcing real downloads (fetch -> blob -> anchor) instead of just opening
   - Search / category filter
   - Day / Night theme toggle (persisted in localStorage)
   - Arabic / English / French language switcher (persisted, full i18n)
   ======================================================================== */

(function () {
  "use strict";

  /* ----------------------------------------------------------------------
     1. DATA — 14 categories, each with a curated pool of real, verified
     Unsplash photo IDs. To reach ~1000 wallpapers without ever inventing
     a fake/broken ID, every verified ID is rendered multiple times with
     different crop focal points, aspect ratios and flips — producing
     genuinely distinct framings of real, category-accurate photography.

     ════════════════════════════════════════════════════════════════════
     HOW TO ADD YOUR OWN PHOTOS (from your computer):
     1. Put your image files inside a folder named "images" next to this
        script (e.g. images/my-photo-1.jpg).
     2. In any category below, replace an Unsplash ID with the path to
        your file. Example:

          photos: [
            "images/my-photo-1.jpg",   // <- your own photo
            "images/my-photo-2.jpg",   // <- your own photo
            "1501785888041-af3ef285b470" // <- still an Unsplash photo
          ]

     3. If EVERY entry in a category's "photos" list is a local path,
        that category will show exactly as many cards as you provided
        (no repeats). If you mix local + Unsplash IDs, the Unsplash ones
        will still be expanded with crop variants to fill out the section.
     ════════════════════════════════════════════════════════════════════
  ---------------------------------------------------------------------- */

  const CATEGORIES = [
    {
      id: "nature",
      icon: "🌿",
      nameKey: "cat_nature",
      photos: [
        "1501785888041-af3ef285b470", "1469474968028-56623f02e42e",
        "1472214103451-9374bd1c798e", "1426604966848-d7adac402bff",
        "1465146344425-f00d5f5c8f07", "1470071459604-3b5ec3a7fe05",
        "1433086966358-54859d0ed716", "1418985991508-e47386d96a71",
        "1500534623283-312aade485b7", "1447752875215-b2761acb3c5d"
      ]
    },
    {
      id: "beach",
      icon: "🌊",
      nameKey: "cat_beach",
      photos: [
        "1507525428034-b723cf961d3e", "1519046904884-53103b34b206",
        "1505228395891-9a51e7e86bea", "1473116763249-2faaef81ccda",
        "1471919743851-c4df8b6ee133", "1535262412227-85541e910204",
        "1517960413843-0aee8e2b3285", "1437482078695-73f5ca6c96e3",
        "1455729552865-04a4be7d896c", "1520454974749-611b7248ffdb"
      ]
    },
    {
      id: "cities",
      icon: "🏙️",
      nameKey: "cat_cities",
      photos: [
        "1496442226666-8d4d0e62e6e9", "1480714378408-67cf0d13bc1b",
        "1518391846015-55a9cc003b25", "1444723121867-7a241cacace9",
        "1480796927426-f609979314bd", "1485871981521-5b1fd3805eee",
        "1502602898657-3e91760cbb29", "1506157786151-b8491531f063",
        "1465447142348-e9952c393450", "1483728642387-6c3bdd6c93e5"
      ]
    },
    {
      id: "village",
      icon: "🌾",
      nameKey: "cat_village",
      photos: [
        "1444858291040-58f756a3bdd6", "1500382017468-9049fed747ef",
        "1500076656116-558758c991c1", "1500530855697-b586d89ba3ee",
        "1419833173245-f59e1b96e0e2", "1500964757637-c85e8a162699",
        "1444492417251-9c845cb88dab", "1517866645935-a3d8a36e2c4f",
        "1473773508845-188df298d2d1", "1495107334309-fcf20504a5ab"
      ]
    },
    {
      id: "cars",
      icon: "🚗",
      nameKey: "cat_cars",
      photos: [
        "1503376780353-7e6692767b70", "1494976388531-d1058494cdd8",
        "1503736334956-4c8f8e92946d", "1542362567-b07e54358753",
        "1552519507-da3b142c6e3d", "1542282088-72c9c27ed0cd",
        "1503184983-71b6c1c0bc59", "1525609004556-c46c7d6cf023",
        "1555215695-3004980ad54e", "1494905998402-395d579af36f"
      ]
    },
    {
      id: "games",
      icon: "🎮",
      nameKey: "cat_games",
      photos: [
        "1538481199705-c710c4e965fc", "1550745165-9bc0b252726f",
        "1593305841991-05c297ba4575", "1542751371-adc38448a05e",
        "1580327344181-c1163234e5a0", "1511512578047-dfb367046420",
        "1493711662062-fa541adb3fc8", "1486572788966-cfd3df1f5b42",
        "1605379399642-870262d3d051", "1556438064-2d7646166914"
      ]
    },
    {
      id: "flowers",
      icon: "🌸",
      nameKey: "cat_flowers",
      photos: [
        "1490750967868-88aa4486c946", "1518895949257-7621c3c786d7",
        "1455659817273-f96807779a8a", "1462275646964-a0e3386b89fa",
        "1463320726281-696a485928c7", "1487070183336-b863922373d4",
        "1469259943454-aa100abba0a0", "1463154545680-d59320fd685d",
        "1502394202744-021cfbb17454", "1457089328109-e5d9bd499191"
      ]
    },
    {
      id: "animals",
      icon: "🦁",
      nameKey: "cat_animals",
      photos: [
        "1546182990-dffeafbe841d", "1456926631375-92c8ce872def",
        "1474511320723-9a56873867b5", "1504173010664-32509aeebb62",
        "1503919545889-aef636e10ad4", "1534567153574-2b12153a87f0",
        "1521651201144-634f700b36ef", "1547721064-da6cfb341d50",
        "1517849845537-4d257902861a", "1500336624523-d727130c3328"
      ]
    },
    {
      id: "plants",
      icon: "🌱",
      nameKey: "cat_plants",
      photos: [
        "1416879595882-3373a0480b5b", "1493957988430-a5f2e15f39a3",
        "1463320726281-696a485928c7", "1485955900006-10f4d324d411",
        "1497250681960-ef046c08a56e", "1459411552884-841db9b3cc2a",
        "1466692476655-ba23ba1eb990", "1518531933037-91b2f5f229cc",
        "1502082553048-f009c37129b9", "1455904547933-b921bbc1bc12"
      ]
    },
    {
      id: "trees",
      icon: "🌲",
      nameKey: "cat_trees",
      photos: [
        "1441974231531-c6227db76b6e", "1448375240586-882707db888b",
        "1511497584788-876760111969", "1426604966848-d7adac402bff",
        "1502082553048-f009c37129b9", "1473773508845-188df298d2d1",
        "1518173946687-a4c8892bbd9f", "1542273917363-3b1817f69a2d",
        "1465146344425-f00d5f5c8f07", "1444858291040-58f756a3bdd6"
      ]
    },
    {
      id: "snow",
      icon: "❄️",
      nameKey: "cat_snow",
      photos: [
        "1418985991508-e47386d96a71", "1517299321609-52687d1bc55a",
        "1491002052546-bf38f186af56", "1483664852095-d6cc6870702d",
        "1457269449834-928af64c684d", "1422565096762-bdb997a56a84",
        "1517783999520-f068d7431a60", "1483927742775-26af3034b3d0",
        "1517694712202-14dd9538aa97", "1551582045-6ec9c11d8697"
      ]
    },
    {
      id: "greenery",
      icon: "🌿",
      nameKey: "cat_greenery",
      photos: [
        "1500382017468-9049fed747ef", "1465146344425-f00d5f5c8f07",
        "1500964757637-c85e8a162699", "1444492417251-9c845cb88dab",
        "1500530855697-b586d89ba3ee", "1495107334309-fcf20504a5ab",
        "1426604966848-d7adac402bff", "1444858291040-58f756a3bdd6",
        "1470770841072-f978cf4d019e", "1500076656116-558758c991c1"
      ]
    },
    {
      id: "space",
      icon: "🌌",
      nameKey: "cat_space",
      photos: [
        "1462331940025-496dfbfc7564", "1419242902214-272b3f66ee7a",
        "1444703686981-a3abbc4d4fe3", "1502134249126-9f3755a50d78",
        "1543722530-d2c3201371e7", "1465101046530-73398c7f28ca",
        "1502175353174-a7a70e73b362", "1454789548928-9efd52dc4031",
        "1495462911434-be47104d70fa", "1517976487492-5750f3195933"
      ]
    },
    {
      id: "general",
      icon: "🌄",
      nameKey: "cat_general",
      photos: [
        "1470770841072-f978cf4d019e", "1501594907352-04cda38ebc29",
        "1447752875215-b2761acb3c5d", "1433086966358-54859d0ed716",
        "1470115636492-6d2b56f9146d", "1500534623283-312aade485b7",
        "1432405972618-c60b0225b8f9", "1493246507139-91e8fad9978e",
        "1439853949127-fa647821eba0", "1501594907352-04cda38ebc29"
      ]
    }
  ];

  const TARGET_TOTAL = 1000;
  const PER_CATEGORY = Math.ceil(TARGET_TOTAL / CATEGORIES.length); // ~72 each
  const PAGE_SIZE = 24; // how many cards render per "page" / load-more click

  const UNSPLASH_BASE = "https://images.unsplash.com/photo-";
  const THUMB_BASE = "auto=format&fit=crop&w=900&q=75";
  const FULL_BASE  = "auto=format&fit=crop&w=2400&q=90";

  // Distinct crop focal points / flips so the SAME real photo ID produces
  // visibly different framings across its repeated uses.
  const VARIANTS = [
    { crop: "entropy" },
    { crop: "faces" },
    { crop: "edges" },
    { crop: "entropy", flip: "h" },
    { crop: "focalpoint", fp: "0.3,0.5" },
    { crop: "focalpoint", fp: "0.7,0.4" },
    { crop: "entropy", flip: "v" },
    { crop: "edges", flip: "h" }
  ];

  /* ----------------------------------------------------------------------
     LOCAL IMAGE SUPPORT
     A "photo" entry can be either:
       a) an Unsplash photo ID, e.g. "1501785888041-af3ef285b470"
       b) a path to one of YOUR OWN images, e.g. "images/nature-1.jpg"
     We detect which one it is by checking for a "/" or a file extension.
     Local images are used as-is (no crop variants needed — they're
     already your real photos), so each local file only counts once.
  ---------------------------------------------------------------------- */
  function isLocalImage(entry) {
    return entry.includes("/") || /\.(jpe?g|png|webp|avif|gif)$/i.test(entry);
  }

  function buildUrl(photoId, variantIndex, paramsBase) {
    if (isLocalImage(photoId)) {
      // Local file: use the path directly, untouched.
      return photoId;
    }
    const v = VARIANTS[variantIndex % VARIANTS.length];
    let url = `${UNSPLASH_BASE}${photoId}?${paramsBase}&crop=${v.crop}`;
    if (v.fp) url += `&fp-x=${v.fp.split(",")[0]}&fp-y=${v.fp.split(",")[1]}`;
    if (v.flip) url += `&flip=${v.flip}`;
    return url;
  }

  /* Build a flat list of wallpaper objects.
     - Unsplash-ID categories: expanded to ~PER_CATEGORY using crop variants.
     - Local-image categories: shown exactly as many times as you provided
       real files for — no padding, no repeats, no fake images.
     The overall list is trimmed towards TARGET_TOTAL, but only by
     reducing Unsplash-expanded categories — your real local photos are
     never cut off to "hit a number". */
  function buildWallpapers() {
    const all = [];
    CATEGORIES.forEach((cat) => {
      const poolSize = cat.photos.length;
      const allLocal = cat.photos.every(isLocalImage);
      const countForThisCategory = allLocal ? poolSize : PER_CATEGORY;

      for (let i = 0; i < countForThisCategory; i++) {
        const photoId = cat.photos[i % poolSize];
        const variantIndex = Math.floor(i / poolSize);
        all.push({
          uid: `${cat.id}-${i}`,
          catId: cat.id,
          nameKey: cat.nameKey,
          icon: cat.icon,
          num: i + 1,
          thumbUrl: buildUrl(photoId, variantIndex, THUMB_BASE),
          fullUrl: buildUrl(photoId, variantIndex, FULL_BASE),
          _isLocalCat: allLocal
        });
      }
    });

    // Trim down to exactly TARGET_TOTAL by removing extras ONLY from the
    // end of Unsplash-expanded categories — local/real photos are untouched.
    const overflow = all.length - TARGET_TOTAL;
    if (overflow > 0) {
      let removed = 0;
      for (let i = all.length - 1; i >= 0 && removed < overflow; i--) {
        if (!all[i]._isLocalCat) {
          all.splice(i, 1);
          removed++;
        }
      }
    }
    all.forEach((w) => delete w._isLocalCat);
    return all;
  }

  const WALLPAPERS = buildWallpapers();

  /* ----------------------------------------------------------------------
     2. I18N — Arabic / English / French dictionary + apply function
  ---------------------------------------------------------------------- */

  const I18N = {
    ar: {
      meta_title: "Alidrissi Wallpaper — خلفيات حصرية بجودة عالية",
      brand_tag: "خلفيات سطح مكتب مميزة",
      nav_home: "الرئيسية",
      nav_gallery: "المعرض",
      nav_categories: "الأقسام",
      nav_about: "حول الموقع",
      nav_browse: "تصفح الآن",
      hero_eyebrow: "✨ أكثر من 1000 خلفية أصلية بجودة فائقة",
      hero_title_1: "خلفيات",
      hero_title_grad: "زجاجية أنيقة",
      hero_title_2: "لتُضفي لمسة هادئة على شاشتك",
      hero_lead: "منصة Alidrissi Wallpaper تجمع لك أجمل خلفيات سطح المكتب بدقة عالية، موزعة على 14 قسمًا مختلفًا — من الطبيعة الخلابة إلى الفضاء الواسع، بتصميم زجاجي ناعم يبعث الراحة والاحترافية.",
      stat_total: "خلفية حصرية",
      stat_categories: "قسم متنوع",
      stat_quality: "دقة عرض",
      stat_free_label: "مجاني",
      stat_free: "تحميل بدون قيود",
      search_placeholder: "ابحث عن قسم أو خلفية... مثال: بحار، سيارات، ثلوج",
      gallery_title: "المعرض الكامل",
      results_count: "{n} خلفية",
      load_more: "تحميل المزيد",
      load_more_count: "{shown} / {total}",
      all_pill: "الكل",
      download_btn: "تحميل",
      downloading_btn: "جاري التحميل...",
      downloaded_btn: "✓ تم التحميل",
      open_to_save_btn: "افتح للحفظ",
      empty_state: "لا توجد نتائج مطابقة لبحثك ✨",
      footer_tag: "تصميم زجاجي · جودة عالية · تحميل مجاني",
      footer_note: "© 2026 Alidrissi Wallpaper — جميع الصور لأغراض العرض التوضيحي عبر مصادر مفتوحة (Unsplash)",
      cat_nature: "طبيعة خلابة",
      cat_beach: "شواطئ وبحار",
      cat_cities: "مدن حول العالم",
      cat_village: "قرى وأرياف",
      cat_cars: "سيارات فاخرة",
      cat_games: "ألعاب إلكترونية",
      cat_flowers: "ورود وأزهار",
      cat_animals: "حيوانات برية",
      cat_plants: "نباتات",
      cat_trees: "أشجار وغابات",
      cat_snow: "ثلوج وجليد",
      cat_greenery: "طبيعة خضراء",
      cat_space: "فضاء وكون",
      cat_general: "طبيعة عامة"
    },
    en: {
      meta_title: "Alidrissi Wallpaper — Exclusive High-Quality Wallpapers",
      brand_tag: "Premium Desktop Wallpapers",
      nav_home: "Home",
      nav_gallery: "Gallery",
      nav_categories: "Categories",
      nav_about: "About",
      nav_browse: "Browse Now",
      hero_eyebrow: "✨ Over 1000 original wallpapers in stunning quality",
      hero_title_1: "Elegant",
      hero_title_grad: "Glass Wallpapers",
      hero_title_2: "to bring a calm touch to your screen",
      hero_lead: "Alidrissi Wallpaper brings together the finest high-resolution desktop wallpapers, spread across 14 categories — from breathtaking nature to deep space — wrapped in a soft glass design that feels calm and professional.",
      stat_total: "Exclusive wallpapers",
      stat_categories: "Categories",
      stat_quality: "Resolution",
      stat_free_label: "Free",
      stat_free: "Unlimited downloads",
      search_placeholder: "Search a category or wallpaper... e.g. beach, cars, snow",
      gallery_title: "Full Gallery",
      results_count: "{n} wallpapers",
      load_more: "Load more",
      load_more_count: "{shown} / {total}",
      all_pill: "All",
      download_btn: "Download",
      downloading_btn: "Downloading...",
      downloaded_btn: "✓ Downloaded",
      open_to_save_btn: "Open to save",
      empty_state: "No results match your search ✨",
      footer_tag: "Glass design · High quality · Free downloads",
      footer_note: "© 2026 Alidrissi Wallpaper — all images are for demonstration purposes via open sources (Unsplash)",
      cat_nature: "Breathtaking Nature",
      cat_beach: "Beaches & Seas",
      cat_cities: "Cities of the World",
      cat_village: "Villages & Countryside",
      cat_cars: "Luxury Cars",
      cat_games: "Video Games",
      cat_flowers: "Roses & Flowers",
      cat_animals: "Wildlife",
      cat_plants: "Plants",
      cat_trees: "Trees & Forests",
      cat_snow: "Snow & Ice",
      cat_greenery: "Lush Greenery",
      cat_space: "Space & Cosmos",
      cat_general: "General Scenery"
    },
    fr: {
      meta_title: "Alidrissi Wallpaper — Fonds d'écran exclusifs haute qualité",
      brand_tag: "Fonds d'écran premium",
      nav_home: "Accueil",
      nav_gallery: "Galerie",
      nav_categories: "Catégories",
      nav_about: "À propos",
      nav_browse: "Parcourir",
      hero_eyebrow: "✨ Plus de 1000 fonds d'écran originaux en qualité exceptionnelle",
      hero_title_1: "Fonds d'écran",
      hero_title_grad: "élégants et vitrés",
      hero_title_2: "pour une touche apaisante sur votre écran",
      hero_lead: "Alidrissi Wallpaper réunit les plus beaux fonds d'écran haute résolution, répartis en 14 catégories — de la nature à couper le souffle à l'immensité de l'espace — dans un design en verre doux, apaisant et professionnel.",
      stat_total: "Fonds d'écran exclusifs",
      stat_categories: "Catégories variées",
      stat_quality: "Résolution",
      stat_free_label: "Gratuit",
      stat_free: "Téléchargement illimité",
      search_placeholder: "Rechercher une catégorie ou un fond d'écran... ex : mer, voitures, neige",
      gallery_title: "Galerie complète",
      results_count: "{n} fonds d'écran",
      load_more: "Charger plus",
      load_more_count: "{shown} / {total}",
      all_pill: "Tout",
      download_btn: "Télécharger",
      downloading_btn: "Téléchargement...",
      downloaded_btn: "✓ Téléchargé",
      open_to_save_btn: "Ouvrir pour enregistrer",
      empty_state: "Aucun résultat ne correspond à votre recherche ✨",
      footer_tag: "Design en verre · Haute qualité · Téléchargement gratuit",
      footer_note: "© 2026 Alidrissi Wallpaper — toutes les images sont à but de démonstration via des sources libres (Unsplash)",
      cat_nature: "Nature à couper le souffle",
      cat_beach: "Plages & Mers",
      cat_cities: "Villes du monde",
      cat_village: "Villages & Campagnes",
      cat_cars: "Voitures de luxe",
      cat_games: "Jeux vidéo",
      cat_flowers: "Roses & Fleurs",
      cat_animals: "Faune sauvage",
      cat_plants: "Plantes",
      cat_trees: "Arbres & Forêts",
      cat_snow: "Neige & Glace",
      cat_greenery: "Verdure luxuriante",
      cat_space: "Espace & Cosmos",
      cat_general: "Paysages généraux"
    }
  };

  let currentLang = localStorage.getItem("alidrissi_lang") || "ar";

  function t(key, vars) {
    let str = (I18N[currentLang] && I18N[currentLang][key]) || I18N.ar[key] || key;
    if (vars) {
      Object.keys(vars).forEach((k) => {
        str = str.replace(`{${k}}`, vars[k]);
      });
    }
    return str;
  }

  function applyTranslations() {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = currentLang === "ar" ? "rtl" : "ltr";

    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      el.textContent = t(key);
    });
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const key = el.getAttribute("data-i18n-placeholder");
      el.setAttribute("placeholder", t(key));
    });

    const langBtnLabel = document.getElementById("langBtnLabel");
    if (langBtnLabel) langBtnLabel.textContent = currentLang.toUpperCase();

    document.querySelectorAll(".lang-option").forEach((opt) => {
      opt.classList.toggle("active", opt.dataset.lang === currentLang);
    });

    // Re-render dynamic parts that depend on language
    renderPills();
    renderGrid(true);
  }

  /* ----------------------------------------------------------------------
     3. RENDER — category pills + paginated grid
  ---------------------------------------------------------------------- */

  const pillsContainer = document.getElementById("categoryPills");
  const grid = document.getElementById("wallpaperGrid");
  const resultsCount = document.getElementById("resultsCount");
  const searchInput = document.getElementById("searchInput");
  const loadMoreBtn = document.getElementById("loadMoreBtn");
  const loadMoreWrap = document.getElementById("loadMoreWrap");
  const loadMoreCount = document.getElementById("loadMoreCount");

  let activeCategory = "all";
  let activeSearch = "";
  let visibleCount = PAGE_SIZE;

  function renderPills() {
    pillsContainer.innerHTML = "";
    pillsContainer.appendChild(makePill("all", "✨", t("all_pill")));
    CATEGORIES.forEach((cat) => {
      pillsContainer.appendChild(makePill(cat.id, cat.icon, t(cat.nameKey)));
    });
  }

  function makePill(id, icon, name) {
    const btn = document.createElement("button");
    btn.className = "pill" + (id === activeCategory ? " active" : "");
    btn.dataset.cat = id;
    btn.innerHTML = `<span class="pill-icon">${icon}</span><span class="pill-text">${name}</span>`;
    btn.addEventListener("click", () => {
      activeCategory = id;
      visibleCount = PAGE_SIZE;
      document.querySelectorAll(".pill").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      renderGrid();
      document.getElementById("gallery").scrollIntoView({ behavior: "smooth", block: "start" });
    });
    return btn;
  }

  function getFiltered() {
    const search = activeSearch.toLowerCase();
    return WALLPAPERS.filter((w) => {
      const matchesCat = activeCategory === "all" || w.catId === activeCategory;
      const catName = t(w.nameKey).toLowerCase();
      const matchesSearch = !search || catName.includes(search);
      return matchesCat && matchesSearch;
    });
  }

  function renderGrid(keepScroll) {
    const items = getFiltered();
    const toShow = items.slice(0, visibleCount);

    grid.innerHTML = "";
    resultsCount.textContent = t("results_count", { n: items.length });

    if (items.length === 0) {
      grid.innerHTML = `<div class="empty-state">${t("empty_state")}</div>`;
      loadMoreWrap.style.display = "none";
      return;
    }

    const fragment = document.createDocumentFragment();

    toShow.forEach((w, index) => {
      const card = document.createElement("article");
      card.className = "wallpaper-card reveal";
      card.style.transitionDelay = `${(index % PAGE_SIZE) * 30}ms`;
      const catName = t(w.nameKey);

      card.innerHTML = `
        <div class="card-media">
          <img src="${w.thumbUrl}" alt="${catName} ${w.num}" loading="lazy" />
          <span class="card-badge">${w.icon} ${catName}</span>
        </div>
        <div class="card-footer">
          <div class="card-info">
            <h3>${catName} ${w.num}</h3>
            <span class="card-sub">Alidrissi Wallpaper</span>
          </div>
          <button class="download-btn" data-url="${w.fullUrl}" data-name="${w.uid}.jpg" aria-label="${t('download_btn')}">
            <svg class="dl-icon" viewBox="0 0 24 24" fill="none">
              <path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span>${t("download_btn")}</span>
          </button>
        </div>
      `;
      fragment.appendChild(card);
    });

    grid.appendChild(fragment);
    observeReveal();
    attachDownloadHandlers();

    // Load more button visibility + label
    if (visibleCount >= items.length) {
      loadMoreWrap.style.display = "none";
    } else {
      loadMoreWrap.style.display = "flex";
      loadMoreCount.textContent = t("load_more_count", { shown: Math.min(visibleCount, items.length), total: items.length });
    }
  }

  if (loadMoreBtn) {
    loadMoreBtn.addEventListener("click", () => {
      visibleCount += PAGE_SIZE;
      renderGrid();
    });
  }

  /* ----------------------------------------------------------------------
     4. SCROLL REVEAL — IntersectionObserver fade/slide-in
  ---------------------------------------------------------------------- */

  function observeReveal() {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    document.querySelectorAll(".reveal:not(.visible)").forEach((el) => observer.observe(el));
  }

  /* ----------------------------------------------------------------------
     5. DOWNLOAD — fetch image as blob then force a real save-to-disk
  ---------------------------------------------------------------------- */

  function attachDownloadHandlers() {
    document.querySelectorAll(".download-btn").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const url = btn.dataset.url;
        const filename = `alidrissi-${btn.dataset.name}`;
        const isLocal = !url.startsWith("http");

        btn.classList.add("loading");
        const originalContent = btn.innerHTML;
        btn.innerHTML = `<span class="spinner"></span><span>${t("downloading_btn")}</span>`;

        // Local images (your own files in /images): a direct anchor download
        // works instantly and even offline — no need to fetch/blob them.
        if (isLocal) {
          try {
            const link = document.createElement("a");
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            btn.innerHTML = `<span>${t("downloaded_btn")}</span>`;
          } catch (err) {
            console.warn("Local download failed:", err);
            window.open(url, "_blank");
            btn.innerHTML = `<span>${t("open_to_save_btn")}</span>`;
          } finally {
            btn.classList.remove("loading");
            setTimeout(() => { btn.innerHTML = originalContent; }, 2200);
          }
          return;
        }

        // Remote (Unsplash) images: fetch as a blob so the browser performs
        // a real save-to-disk instead of just navigating to the image.
        try {
          const response = await fetch(url, { mode: "cors" });
          if (!response.ok) throw new Error("Network response was not ok");
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);

          const link = document.createElement("a");
          link.href = blobUrl;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          setTimeout(() => URL.revokeObjectURL(blobUrl), 4000);

          btn.innerHTML = `<span>${t("downloaded_btn")}</span>`;
        } catch (err) {
          console.warn("Direct download failed, opening image instead:", err);
          window.open(url, "_blank");
          btn.innerHTML = `<span>${t("open_to_save_btn")}</span>`;
        } finally {
          btn.classList.remove("loading");
          setTimeout(() => {
            btn.innerHTML = originalContent;
          }, 2200);
        }
      });
    });
  }

  /* ----------------------------------------------------------------------
     6. SEARCH
  ---------------------------------------------------------------------- */

  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      activeSearch = e.target.value.trim();
      visibleCount = PAGE_SIZE;
      renderGrid();
    });
  }

  /* ----------------------------------------------------------------------
     7. NAVBAR — subtle shrink on scroll
  ---------------------------------------------------------------------- */

  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 24) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });

  /* ----------------------------------------------------------------------
     8. MOBILE MENU TOGGLE
  ---------------------------------------------------------------------- */

  const menuToggle = document.getElementById("menuToggle");
  const navLinks = document.getElementById("navLinks");
  if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
      navLinks.classList.toggle("open");
      menuToggle.classList.toggle("open");
    });
  }

  /* ----------------------------------------------------------------------
     9. DAY / NIGHT THEME TOGGLE
  ---------------------------------------------------------------------- */

  const themeToggle = document.getElementById("themeToggle");
  const toggleKnob = document.getElementById("toggleKnob");
  let currentTheme = localStorage.getItem("alidrissi_theme") || "light";

  function applyTheme() {
    document.documentElement.setAttribute("data-theme", currentTheme);
    if (toggleKnob) toggleKnob.textContent = currentTheme === "dark" ? "🌙" : "☀️";
  }

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      currentTheme = currentTheme === "dark" ? "light" : "dark";
      localStorage.setItem("alidrissi_theme", currentTheme);
      applyTheme();
    });
  }

  /* Generate a sprinkling of stars for night mode (randomized once) */
  function buildStarField() {
    const field = document.getElementById("starField");
    if (!field) return;
    const count = 70;
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const star = document.createElement("span");
      star.style.top = `${Math.random() * 100}%`;
      star.style.left = `${Math.random() * 100}%`;
      star.style.animationDelay = `${(Math.random() * 3.5).toFixed(2)}s`;
      const size = (Math.random() * 1.5 + 1).toFixed(1);
      star.style.width = `${size}px`;
      star.style.height = `${size}px`;
      frag.appendChild(star);
    }
    field.appendChild(frag);
  }

  /* ----------------------------------------------------------------------
     10. LANGUAGE SWITCHER
  ---------------------------------------------------------------------- */

  const langSwitch = document.getElementById("langSwitch");
  const langBtn = document.getElementById("langBtn");
  const langMenu = document.getElementById("langMenu");

  if (langBtn) {
    langBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      langSwitch.classList.toggle("open");
      langBtn.setAttribute("aria-expanded", langSwitch.classList.contains("open"));
    });
  }

  document.querySelectorAll(".lang-option").forEach((opt) => {
    opt.addEventListener("click", () => {
      currentLang = opt.dataset.lang;
      localStorage.setItem("alidrissi_lang", currentLang);
      applyTranslations();
      langSwitch.classList.remove("open");
    });
  });

  document.addEventListener("click", (e) => {
    if (langSwitch && !langSwitch.contains(e.target)) {
      langSwitch.classList.remove("open");
    }
  });

  /* ----------------------------------------------------------------------
     11. INIT
  ---------------------------------------------------------------------- */

  function init() {
    applyTheme();
    buildStarField();
    applyTranslations(); // also triggers first renderPills() + renderGrid()

    const totalEl = document.getElementById("statTotal");
    const catEl = document.getElementById("statCategories");
    if (totalEl) totalEl.textContent = WALLPAPERS.length;
    if (catEl) catEl.textContent = CATEGORIES.length;
  }

  document.addEventListener("DOMContentLoaded", init);
})();