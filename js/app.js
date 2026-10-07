/* ==========================================================================
   Wedding invitation: renders the page from window.WEDDING_CONFIG.
   You shouldn't need to edit this file; change js/config.js instead.
   ========================================================================== */
(function () {
  "use strict";

  const C = window.WEDDING_CONFIG;
  if (!C) {
    document.body.innerHTML = '<p style="padding:2rem">Could not load <code>js/config.js</code>. Check it for a missing comma or quote.</p>';
    return;
  }

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const events = C.events || [];
  const R = C.rsvp || {};
  const [first, second] = C.nameOrder === "groom" ? [C.groom, C.bride] : [C.bride, C.groom];
  const coupleNames = `${first.firstName} & ${second.firstName}`;
  const initials = `${first.firstName.charAt(0)}&${second.firstName.charAt(0)}`;

  const ORNAMENT =
    '<svg viewBox="0 0 160 20" fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">' +
    '<path d="M0 10h60M100 10h60"/><circle cx="64" cy="10" r="1.6" fill="currentColor"/><circle cx="96" cy="10" r="1.6" fill="currentColor"/>' +
    '<path d="M80 17c-6-3.6-10-6.8-10-10.2a4 4 0 0 1 7.4-2.1L80 7.6l2.6-2.9A4 4 0 0 1 90 6.8c0 3.4-4 6.6-10 10.2z" fill="currentColor" fill-opacity=".25"/></svg>';
  const RINGS =
    '<svg viewBox="0 0 54 36" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">' +
    '<circle cx="20" cy="22" r="12"/><circle cx="34" cy="22" r="12"/><path d="M16 9l4-5 4 5-4 3z" fill="currentColor" fill-opacity=".3"/></svg>';

  /* ---------- Dates ----------
     Times in the config are wall-clock times at the venue. For display we format them as-is,
     so every guest sees the venue's local time; for the countdown and calendar links we
     convert them to a real instant using timezoneOffset. */
  function parts(str) {
    const [d, t = "00:00"] = String(str).split("T");
    const [y, m, day] = d.split("-").map(Number);
    const [hh, mm] = t.split(":").map(Number);
    return { y, m, day, hh: hh || 0, mm: mm || 0 };
  }
  const pad = (n) => String(n).padStart(2, "0");
  const wall = (s) => { const p = parts(s); return new Date(Date.UTC(p.y, p.m - 1, p.day, p.hh, p.mm)); };
  const instant = (s) => {
    const p = parts(s);
    return new Date(`${p.y}-${pad(p.m)}-${pad(p.day)}T${pad(p.hh)}:${pad(p.mm)}:00${C.timezoneOffset || ""}`);
  };
  const locale = C.locale || undefined;
  const fmtDate = (s) => wall(s).toLocaleDateString(locale, { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const fmtDateShort = (s) => wall(s).toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  const fmtTime = (s) => wall(s).toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit", timeZone: "UTC" });
  const mainDate = events[0] ? events[0].start : C.countdownTo;

  /* ---------- Maps & calendar ---------- */
  const mapQuery = (v) => v.mapQuery || [v.name, v.address].filter(Boolean).join(", ");
  const mapEmbed = (v) => `https://www.google.com/maps?q=${encodeURIComponent(mapQuery(v))}&output=embed`;
  const mapDirections = (v) => v.mapsUrl || `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(mapQuery(v))}`;
  const venueLine = (v) => (v ? [v.name, v.address].filter(Boolean).join(", ") : "");
  const utcStamp = (d) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const eventEnd = (ev) => (ev.end ? instant(ev.end) : new Date(instant(ev.start).getTime() + 2 * 3600e3));

  function googleCalendarUrl(ev) {
    const q = new URLSearchParams({
      action: "TEMPLATE",
      text: `${ev.title} · ${coupleNames}`,
      dates: `${utcStamp(instant(ev.start))}/${utcStamp(eventEnd(ev))}`,
      details: [ev.description, location.href.split("#")[0]].filter(Boolean).join("\n\n"),
      location: venueLine(ev.venue)
    });
    return `https://calendar.google.com/calendar/render?${q}`;
  }

  function downloadIcs(ev) {
    const t = (s) => String(s || "").replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\r?\n/g, "\\n");
    const slug = ev.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const ics = [
      "BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wedding Invitation//EN", "CALSCALE:GREGORIAN",
      "BEGIN:VEVENT",
      `UID:${slug}-${utcStamp(instant(ev.start))}@wedding-invitation`,
      `DTSTAMP:${utcStamp(new Date())}`,
      `DTSTART:${utcStamp(instant(ev.start))}`,
      `DTEND:${utcStamp(eventEnd(ev))}`,
      `SUMMARY:${t(`${ev.title} · ${coupleNames}`)}`,
      `LOCATION:${t(venueLine(ev.venue))}`,
      `DESCRIPTION:${t(ev.description)}`,
      "END:VEVENT", "END:VCALENDAR"
    ].join("\r\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
    a.download = `${slug || "wedding"}.ics`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  }

  /* ---------- Small helpers ---------- */
  const loadImage = (src) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(null);
    img.src = src;
  });
  const initialTag = (letter) => `<span class="initial" aria-hidden="true">${esc(letter)}</span>`;
  const storage = {
    get(key, fallback) { try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch (e) { return fallback; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* private mode */ } }
  };
  function removeSection(id) {
    const s = document.getElementById(id);
    if (s) s.remove();
    const link = $(`.nav-links a[href="#${id}"]`);
    if (link) link.remove();
  }

  /* ---------- Scroll reveal ---------- */
  const revealer = "IntersectionObserver" in window
    ? new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { e.target.classList.add("in"); revealer.unobserve(e.target); }
        });
      }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" })
    : null;
  function observeReveals(root = document) {
    $$(".reveal:not(.in)", root).forEach((el) => (revealer ? revealer.observe(el) : el.classList.add("in")));
  }

  /* ---------- Theme & static text ---------- */
  function applyTheme() {
    const t = C.theme || {};
    const s = document.documentElement.style;
    if (t.primary) s.setProperty("--primary", t.primary);
    if (t.accent) s.setProperty("--accent", t.accent);
    if (t.background) s.setProperty("--bg", t.background);
    if (t.text) s.setProperty("--text", t.text);
    document.title = `${coupleNames} · Wedding Invitation`;
    $$(".ornament").forEach((o) => (o.innerHTML = ORNAMENT));
  }

  /* ---------- Music ---------- */
  let audio = null;
  function setupMusic() {
    const M = C.music || {};
    if (!M.src) return;
    audio = new Audio(M.src);
    audio.loop = true;
    audio.volume = M.volume != null ? M.volume : 0.5;
    const btn = $("#musicBtn");
    btn.hidden = false;
    const sync = () => btn.classList.toggle("playing", !audio.paused);
    audio.addEventListener("play", sync);
    audio.addEventListener("pause", sync);
    btn.addEventListener("click", () => (audio.paused ? audio.play().catch(() => {}) : audio.pause()));
  }
  function autoplayMusic() {
    if (audio && C.music.autoplay !== false) audio.play().catch(() => {});
  }

  /* ---------- Intro envelope ---------- */
  function setupIntro() {
    const intro = $("#intro");
    const reveal = () => document.body.classList.add("opened");
    if (!C.intro || C.intro.enabled === false) {
      intro.remove();
      reveal();
      return;
    }
    document.body.classList.add("locked");
    $("#introNames").textContent = coupleNames;
    $("#letterNames").textContent = coupleNames;
    $("#letterDate").textContent = mainDate ? fmtDateShort(mainDate) : "";
    const seal = $("#seal");
    seal.textContent = initials;
    seal.focus({ preventScroll: true });

    let opened = false;
    const open = () => {
      if (opened) return;
      opened = true;
      $("#envelope").classList.add("open");
      autoplayMusic();
      setTimeout(() => {
        intro.classList.add("hide");
        document.body.classList.remove("locked");
        reveal();
      }, reduceMotion ? 0 : 1900);
      setTimeout(() => intro.remove(), reduceMotion ? 50 : 3200);
    };
    seal.addEventListener("click", open);
    $("#envelope").addEventListener("click", open);
  }

  /* ---------- Hero ---------- */
  function renderHero() {
    $("#heroTagline").textContent = C.tagline || "We're getting married";
    $("#heroNames").innerHTML =
      `<span class="name">${esc(first.firstName)}</span><span class="amp">&amp;</span><span class="name">${esc(second.firstName)}</span>`;
    $("#heroDate").textContent = mainDate ? fmtDate(mainDate) : "";
    const v = events[0] && events[0].venue;
    $("#heroPlace").textContent = v ? v.city || v.name || "" : "";
    $("#navBrand").textContent = initials.replace("&", " & ");
    renderHeroSlides();
  }

  async function renderHeroSlides() {
    const srcs = ((C.photos && C.photos.hero) || []);
    const wrap = $("#heroSlides");
    // Show slides in config order, as soon as each one has loaded.
    const loaded = await Promise.all(srcs.map(loadImage));
    const ok = loaded.filter(Boolean);
    if (!ok.length) return; // keep the gradient background
    const slides = ok.map((src, i) => {
      const d = document.createElement("div");
      d.className = "slide" + (i === 0 ? " active" : "");
      d.style.backgroundImage = `url("${src.replace(/"/g, "%22")}")`;
      wrap.appendChild(d);
      return d;
    });
    if (slides.length < 2 || reduceMotion) return;
    let i = 0;
    setInterval(() => {
      const prev = slides[i];
      i = (i + 1) % slides.length;
      prev.classList.replace("active", "leaving");
      slides[i].classList.add("active");
      setTimeout(() => prev.classList.remove("leaving"), 2000);
    }, Math.max(2500, (C.photos && C.photos.heroInterval) || 6000));
  }

  function setupCountdown() {
    const box = $("#countdown");
    const target = C.countdownTo || mainDate;
    if (!target) { box.remove(); return; }
    const when = instant(target).getTime();
    const units = [["Days", 864e5], ["Hours", 36e5], ["Minutes", 6e4], ["Seconds", 1e3]];
    box.innerHTML = units.map(([u]) => `<div class="cd"><b data-u="${u}">00</b><span>${u}</span></div>`).join("");
    const cells = units.map(([u]) => $(`[data-u="${u}"]`, box));
    let timer = null;
    const tick = () => {
      let diff = when - Date.now();
      if (diff <= 0) {
        clearInterval(timer);
        box.innerHTML = `<p class="cd-done">${esc(C.afterWeddingMessage || "Just married!")}</p>`;
        return false;
      }
      units.forEach(([, ms], i) => {
        const n = Math.floor(diff / ms);
        diff -= n * ms;
        cells[i].textContent = pad(n);
      });
      return true;
    };
    if (tick()) timer = setInterval(tick, 1000);
  }

  function setupNav() {
    const nav = $("#nav");
    const hero = $("#home");
    if (!("IntersectionObserver" in window)) { nav.classList.add("show"); return; }
    new IntersectionObserver(([e]) => nav.classList.toggle("show", !e.isIntersecting), { threshold: 0.15 }).observe(hero);
  }

  /* ---------- Couple ---------- */
  function renderCouple() {
    const card = (p, delay) => `
      <div class="person reveal" style="--d:${delay}s">
        <div class="portrait">
          <div class="ring"></div>
          ${p.photo ? `<img src="${esc(p.photo)}" alt="${esc(p.fullName || p.firstName)}" loading="lazy" data-initial="${esc(p.firstName.charAt(0))}">` : initialTag(p.firstName.charAt(0))}
        </div>
        <h3>${esc(p.firstName)}</h3>
        ${p.fullName ? `<p class="full">${esc(p.fullName)}</p>` : ""}
        ${p.parents ? `<p class="parents">${esc(p.parents)}</p>` : ""}
        ${p.bio ? `<p class="bio">${esc(p.bio)}</p>` : ""}
      </div>`;
    const grid = $("#coupleGrid");
    grid.innerHTML = card(first, 0) + '<div class="couple-amp reveal" style="--d:.2s">&amp;</div>' + card(second, 0.35);
    $$("img[data-initial]", grid).forEach((img) => {
      const fallback = () => { img.outerHTML = initialTag(img.dataset.initial); };
      if (img.complete && !img.naturalWidth) fallback();
      else img.addEventListener("error", fallback, { once: true });
    });
  }

  /* ---------- Events ---------- */
  function renderEvents() {
    $("#inviteMsg").textContent = C.invitationMessage || "";
    if (!C.invitationMessage) $("#inviteMsg").remove();
    const list = $("#eventsList");
    list.innerHTML = events.map((ev, i) => {
      const v = ev.venue || {};
      const time = ev.end ? `${fmtTime(ev.start)} – ${fmtTime(ev.end)}` : fmtTime(ev.start);
      return `
        <article class="event reveal" style="--d:${(i % 2) * 0.15}s">
          <div class="event-icon">${RINGS}</div>
          <h3>${esc(ev.title)}</h3>
          <p class="event-date">${esc(fmtDate(ev.start))}</p>
          <p class="event-time">${esc(time)}</p>
          <div class="event-venue">
            <strong>${esc(v.name)}</strong>
            ${v.address ? `<span>${esc(v.address)}</span>` : ""}
          </div>
          ${ev.description ? `<p class="event-desc">${esc(ev.description)}</p>` : ""}
          ${ev.dressCode ? `<p class="event-dress">Dress code · ${esc(ev.dressCode)}</p>` : ""}
          ${mapQuery(v) ? `<div class="map"><iframe src="${esc(mapEmbed(v))}" title="Map of ${esc(v.name)}" loading="lazy" referrerpolicy="no-referrer-when-downgrade" allowfullscreen></iframe></div>` : ""}
          <div class="actions">
            ${mapQuery(v) ? `<a class="btn" href="${esc(mapDirections(v))}" target="_blank" rel="noopener">Get directions</a>` : ""}
            <details class="cal">
              <summary class="btn btn-outline">Add to calendar</summary>
              <div class="cal-menu">
                <a href="${esc(googleCalendarUrl(ev))}" target="_blank" rel="noopener">Google Calendar</a>
                <button type="button" data-ics="${i}">Apple / Outlook (.ics)</button>
              </div>
            </details>
          </div>
        </article>`;
    }).join("");

    list.addEventListener("click", (e) => {
      const b = e.target.closest("[data-ics]");
      if (b) { downloadIcs(events[+b.dataset.ics]); b.closest("details").open = false; }
    });
    document.addEventListener("click", (e) => {
      $$("details.cal[open]").forEach((d) => { if (!d.contains(e.target)) d.open = false; });
    });
  }

  /* ---------- Gallery & lightbox ---------- */
  function renderGallery() {
    const items = ((C.photos && C.photos.gallery) || []).map((g) => (typeof g === "string" ? { src: g } : g)).filter((g) => g.src);
    const grid = $("#galleryGrid");
    if (!items.length) { removeSection("gallery"); return; }
    grid.innerHTML = items.map((it, i) => `
      <figure class="reveal" style="--d:${(i % 3) * 0.1}s" tabindex="0" data-caption="${esc(it.caption || "")}">
        <img src="${esc(it.src)}" alt="${esc(it.caption || `Photo ${i + 1} of ${coupleNames}`)}" loading="lazy">
        ${it.caption ? `<figcaption>${esc(it.caption)}</figcaption>` : ""}
      </figure>`).join("");
    // Drop photos that are missing, and the whole section if none are left.
    $$("img", grid).forEach((img) => {
      const drop = () => {
        img.closest("figure").remove();
        if (!grid.children.length) removeSection("gallery");
      };
      if (img.complete && !img.naturalWidth) drop();
      else img.addEventListener("error", drop, { once: true });
    });
    setupLightbox(grid);
  }

  function setupLightbox(grid) {
    const lb = $("#lightbox"), img = $("#lbImg"), cap = $("#lbCap");
    const figs = () => $$("figure", grid);
    let idx = 0, lastFocus = null;
    const show = (i) => {
      const list = figs();
      if (!list.length) return;
      idx = (i + list.length) % list.length;
      const f = list[idx], im = $("img", f);
      img.src = im.src;
      img.alt = im.alt;
      cap.textContent = f.dataset.caption || "";
    };
    const open = (i) => { lastFocus = document.activeElement; show(i); lb.classList.add("open"); document.body.classList.add("locked"); lb.focus(); };
    const close = () => { lb.classList.remove("open"); document.body.classList.remove("locked"); if (lastFocus) lastFocus.focus(); };

    grid.addEventListener("click", (e) => { const f = e.target.closest("figure"); if (f) open(figs().indexOf(f)); });
    grid.addEventListener("keydown", (e) => {
      const f = e.target.closest("figure");
      if (f && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); open(figs().indexOf(f)); }
    });
    $("#lbClose").addEventListener("click", close);
    $("#lbPrev").addEventListener("click", () => show(idx - 1));
    $("#lbNext").addEventListener("click", () => show(idx + 1));
    lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
    document.addEventListener("keydown", (e) => {
      if (!lb.classList.contains("open")) return;
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") show(idx - 1);
      if (e.key === "ArrowRight") show(idx + 1);
    });
    let x0 = null;
    lb.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener("touchend", (e) => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0;
      if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }

  /* ---------- RSVP ---------- */
  const LOCAL_KEY = "wedding-rsvp-demo";

  async function sendRsvp(data) {
    if (!R.endpoint) {
      const all = storage.get(LOCAL_KEY, []);
      all.push(Object.assign({}, data, { time: new Date().toISOString() }));
      storage.set(LOCAL_KEY, all);
      return;
    }
    // text/plain keeps this a "simple" request, so Google Apps Script accepts it without a CORS preflight.
    const res = await fetch(R.endpoint, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(data)
    });
    const json = await res.json();
    if (!json.ok) throw new Error(json.error || "Could not save your RSVP.");
  }

  function setupRsvp() {
    if (R.enabled === false) { removeSection("rsvp"); removeSection("wishes"); return; }

    const form = $("#rsvpForm");
    const status = $("#rsvpStatus");
    const submit = $("#rsvpSubmit");
    const guestsField = $("#guestsField");
    const nameInput = $("input[name=\"name\"]", form);
    const setStatus = (msg, cls = "") => { status.textContent = msg; status.className = `form-status ${cls}`; };

    $("#lblYes").textContent = R.attendingLabel || "Joyfully accept";
    $("#lblNo").textContent = R.decliningLabel || "Regretfully decline";
    const max = Math.max(1, R.maxGuests || 1);
    $("#guestsSelect").innerHTML = Array.from({ length: max }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join("");
    if (max === 1) guestsField.remove();
    $("#demoNote").hidden = !!R.endpoint;

    if (R.deadline) {
      $("#rsvpDeadline").textContent = `Kindly respond by ${fmtDate(R.deadline)}`;
      if (Date.now() > instant(`${R.deadline}T23:59`).getTime()) {
        $$("input, select, textarea, button", form).forEach((el) => (el.disabled = true));
        setStatus("RSVPs are now closed. Thank you to everyone who replied!", "closed");
        return;
      }
    }

    form.addEventListener("change", (e) => {
      if (e.target.name === "attending" && form.contains(guestsField)) guestsField.hidden = e.target.value !== "yes";
    });

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const data = {
        name: String(fd.get("name") || "").trim(),
        attending: fd.get("attending"),
        guests: fd.get("attending") === "yes" ? Number(fd.get("guests") || 1) : 0,
        comment: String(fd.get("comment") || "").trim(),
        website: fd.get("website") || ""
      };
      if (!data.name) { setStatus("Please tell us your name.", "error"); nameInput.focus(); return; }
      if (!data.attending) { setStatus("Please let us know if you can attend.", "error"); return; }

      submit.disabled = true;
      submit.textContent = "Sending…";
      setStatus("");
      try {
        await sendRsvp(data);
        const yes = data.attending === "yes";
        $("#thanksTitle").textContent = `Thank you, ${data.name.split(/[\s&,]/)[0]}!`;
        $("#thanksMsg").textContent = yes
          ? R.thanksAttending || "We can't wait to celebrate with you."
          : R.thanksDeclining || "We'll miss you. Thank you for letting us know.";
        form.hidden = true;
        $("#rsvpThanks").hidden = false;
        if (data.comment) addWish({ name: data.name, comment: data.comment, attending: yes ? "Yes" : "No" });
        form.reset();
        guestsField.hidden = true;
      } catch (err) {
        setStatus("Sorry, something went wrong. Please try again in a moment.", "error");
        console.error(err);
      } finally {
        submit.disabled = false;
        submit.textContent = "Send RSVP";
      }
    });

    $("#rsvpAgain").addEventListener("click", () => {
      $("#rsvpThanks").hidden = true;
      form.hidden = false;
      form.classList.add("in");
      nameInput.focus();
    });
  }

  /* ---------- Wishes (guestbook) ---------- */
  const WISHES_PAGE = 9;
  function wishCard(w, extraCls = "") {
    const yes = /^y/i.test(String(w.attending));
    return `<article class="wish ${extraCls}">
      <p>${esc(w.comment)}</p>
      <footer><strong>${esc(w.name)}</strong><span class="badge ${yes ? "yes" : "no"}">${yes ? "Attending" : "Sending love"}</span></footer>
    </article>`;
  }
  function addWish(w) {
    const list = $("#wishesList");
    if (!list) return;
    const empty = $(".wishes-empty", list);
    if (empty) empty.remove();
    list.insertAdjacentHTML("afterbegin", wishCard(w, "new"));
  }

  async function loadWishes() {
    if (R.enabled === false) return;
    if (R.showWishes === false) { removeSection("wishes"); return; }
    const list = $("#wishesList");
    let wishes = [];
    try {
      if (R.endpoint) {
        const url = R.endpoint + (R.endpoint.includes("?") ? "&" : "?") + "action=wishes";
        const json = await (await fetch(url)).json();
        wishes = json.wishes || [];
      } else {
        wishes = storage.get(LOCAL_KEY, []).filter((w) => w.comment).reverse();
      }
    } catch (err) {
      console.error(err);
      list.innerHTML = '<p class="wishes-empty">The guestbook could not be loaded right now.</p>';
      return;
    }
    if (!wishes.length) {
      list.innerHTML = '<p class="wishes-empty">No wishes yet. Be the first to leave a message for the couple!</p>';
      return;
    }
    list.innerHTML = wishes.map((w, i) => wishCard(w, i >= WISHES_PAGE ? "extra" : "")).join("");
    const more = $("#moreWishes");
    if (wishes.length > WISHES_PAGE) {
      more.hidden = false;
      more.addEventListener("click", () => {
        $$(".wish.extra", list).slice(0, WISHES_PAGE).forEach((w) => w.classList.remove("extra"));
        if (!$(".wish.extra", list)) more.hidden = true;
      });
    }
  }

  /* ---------- Footer ---------- */
  function renderFooter() {
    $("#footerNames").textContent = coupleNames;
    $("#footerDate").textContent = mainDate ? fmtDateShort(mainDate) : "";
    $("#footerNote").textContent = C.footerNote || "";
    $("#hashtag").textContent = C.hashtag || "";
    $("#contacts").innerHTML = (C.contacts || []).map((c) =>
      `<a href="tel:${esc(String(c.phone).replace(/[^\d+]/g, ""))}">${esc(c.name)} · ${esc(c.phone)}</a>`).join("");
  }

  /* ---------- Falling petals ---------- */
  function startPetals() {
    const canvas = $("#petals");
    if (reduceMotion || C.petals === false || !canvas.getContext) { canvas.remove(); return; }
    const ctx = canvas.getContext("2d");
    const colors = ["#f6c9cf", "#f1b3bc", "#fbe1e4", "#efc4b6", "#f8d7c9"];
    let W = 0, H = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * dpr; canvas.height = H * dpr;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const make = (anywhere) => ({
      x: Math.random() * W,
      y: anywhere ? Math.random() * H : -20 - Math.random() * 60,
      r: 5 + Math.random() * 7,
      vy: 0.35 + Math.random() * 0.75,
      vx: -0.25 + Math.random() * 0.5,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.03,
      sway: Math.random() * Math.PI * 2,
      color: colors[(Math.random() * colors.length) | 0]
    });
    const petals = Array.from({ length: W < 600 ? 14 : 26 }, () => make(true));

    (function frame() {
      ctx.clearRect(0, 0, W, H);
      for (const p of petals) {
        p.sway += 0.016;
        p.x += p.vx + Math.sin(p.sway) * 0.6;
        p.y += p.vy;
        p.rot += p.vr;
        if (p.y > H + 20 || p.x < -40 || p.x > W + 40) Object.assign(p, make(false));
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.scale(1, 0.55 + Math.abs(Math.cos(p.sway)) * 0.45);
        ctx.beginPath();
        ctx.moveTo(0, -p.r);
        ctx.bezierCurveTo(p.r, -p.r * 0.6, p.r * 0.8, p.r * 0.7, 0, p.r);
        ctx.bezierCurveTo(-p.r * 0.8, p.r * 0.7, -p.r, -p.r * 0.6, 0, -p.r);
        ctx.globalAlpha = 0.8;
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.restore();
      }
      requestAnimationFrame(frame);
    })();
  }

  /* ---------- Go ---------- */
  applyTheme();
  setupMusic();
  renderHero();
  setupCountdown();
  setupNav();
  renderCouple();
  renderEvents();
  renderGallery();
  setupRsvp();
  loadWishes();
  renderFooter();
  observeReveals();
  setupIntro();
  startPetals();
})();
