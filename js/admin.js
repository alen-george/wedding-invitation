/* ==========================================================================
   RSVP responses page (admin.html): lists every reply, the headcount, and lets
   the couple remove guestbook messages or duplicate replies. Only accounts named
   in firestore.rules can read anything; everyone else gets "permission denied".
   ========================================================================== */
import { initializeApp } from "https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut, connectAuthEmulator
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js";
import {
  getFirestore, collection, getDocs, doc, setDoc, deleteDoc, writeBatch, connectFirestoreEmulator
} from "https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore-lite.js";

const C = window.WEDDING_CONFIG || {};
const cfg = (C.rsvp && C.rsvp.firebase) || {};
const $ = (sel) => document.querySelector(sel);
const esc = (v) => String(v == null ? "" : v).replace(/[&<>"']/g, (c) => (
  { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
));

const t = C.theme || {};
const rootStyle = document.documentElement.style;
if (t.primary) rootStyle.setProperty("--primary", t.primary);
if (t.accent) rootStyle.setProperty("--accent", t.accent);
if (t.background) rootStyle.setProperty("--bg", t.background);
if (t.text) rootStyle.setProperty("--text", t.text);

let rows = [];
let db = null;

if (!cfg.projectId) {
  $("#notConfigured").hidden = false;
} else {
  const app = initializeApp(cfg);
  const auth = getAuth(app);
  db = getFirestore(app);
  if (cfg.emulator) { // local testing only
    connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
    connectFirestoreEmulator(db, "127.0.0.1", 8080);
  }

  onAuthStateChanged(auth, (user) => {
    $("#signedOut").hidden = !!user;
    $("#dashboard").hidden = !user;
    if (user) {
      $("#who").textContent = `Signed in as ${user.email}`;
      load();
    }
  });

  $("#signIn").addEventListener("click", async () => {
    $("#authError").textContent = "";
    try {
      await signInWithPopup(auth, new GoogleAuthProvider());
    } catch (err) {
      if (err.code === "auth/popup-closed-by-user" || err.code === "auth/cancelled-popup-request") return;
      $("#authError").textContent = err.code === "auth/unauthorized-domain"
        ? `Add "${location.hostname}" in Firebase console → Authentication → Settings → Authorized domains, then try again.`
        : `Sign-in failed (${err.code || err.message}).`;
    }
  });
  $("#signOut").addEventListener("click", () => signOut(auth));
  $("#refresh").addEventListener("click", load);
  $("#csv").addEventListener("click", downloadCsv);
  $("#search").addEventListener("input", render);
  $("#filter").addEventListener("change", render);
  $("#responses").addEventListener("click", onAction);
}

const setStatus = (msg, cls = "") => { $("#status").textContent = msg; $("#status").className = `form-status ${cls}`; };
const millis = (ts) => (ts && ts.toMillis ? ts.toMillis() : 0);
const nameKey = (n) => String(n).toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

async function load() {
  setStatus("Loading replies…");
  try {
    const [rs, ws] = await Promise.all([getDocs(collection(db, "rsvps")), getDocs(collection(db, "wishes"))]);
    const onGuestbook = new Set(ws.docs.map((d) => d.id));
    rows = rs.docs
      .map((d) => Object.assign({ id: d.id, onGuestbook: onGuestbook.has(d.id) }, d.data()))
      .sort((a, b) => millis(b.createdAt) - millis(a.createdAt));
    const seen = {};
    rows.forEach((r) => { const k = nameKey(r.name); seen[k] = (seen[k] || 0) + 1; });
    rows.forEach((r) => { r.duplicate = seen[nameKey(r.name)] > 1; });
    setStatus("");
    render();
  } catch (err) {
    console.error(err);
    rows = [];
    render();
    setStatus(err.code === "permission-denied"
      ? "This Google account isn't allowed to see replies. Add its email to isCouple() in your Firestore rules and publish them."
      : "Could not load replies. Check your connection and press Refresh.", "error");
  }
}

function render() {
  const yes = rows.filter((r) => r.attending === "yes");
  const guests = yes.reduce((n, r) => n + (Number(r.members) || 0), 0);
  $("#stats").innerHTML = [
    ["main", guests, "Guests attending"],
    ["", yes.length, "Families attending"],
    ["", rows.length - yes.length, "Declined"],
    ["", rows.length, "Total replies"]
  ].map(([cls, n, label]) => `<div class="stat ${cls}"><b>${n}</b><span>${label}</span></div>`).join("");

  const q = nameKey($("#search").value);
  const f = $("#filter").value;
  const shown = rows.filter((r) => (f === "all" || r.attending === f) && (!q || nameKey(r.name).includes(q)));
  $("#responses").innerHTML = shown.length ? shown.map(card).join("")
    : `<p class="empty">${rows.length ? "No replies match." : "No replies yet."}</p>`;
}

function card(r) {
  const yes = r.attending === "yes";
  const when = r.createdAt && r.createdAt.toDate
    ? r.createdAt.toDate().toLocaleString(C.locale || undefined, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })
    : "";
  return `<article class="resp">
    <div class="resp-top">
      <strong>${esc(r.name)}</strong>
      ${r.duplicate ? '<span class="badge dup" title="Another reply has the same name">Possible duplicate</span>' : ""}
      <span class="badge ${yes ? "yes" : "no"}">${yes ? `Attending · ${Number(r.members) || 0}` : "Declined"}</span>
    </div>
    ${r.message ? `<p class="resp-msg">${esc(r.message)}</p>` : ""}
    <div class="resp-meta">
      <time>${esc(when)}</time>
      ${r.message ? `<button type="button" class="link-btn" data-act="guestbook" data-id="${esc(r.id)}">${r.onGuestbook ? "Hide from guestbook" : "Show on guestbook"}</button>` : ""}
      <button type="button" class="link-btn danger" data-act="delete" data-id="${esc(r.id)}">Delete reply</button>
    </div>
  </article>`;
}

async function onAction(e) {
  const b = e.target.closest("[data-act]");
  if (!b) return;
  const r = rows.find((x) => x.id === b.dataset.id);
  if (!r) return;
  if (b.dataset.act === "delete" && !confirm(`Delete the reply from "${r.name}"? This can't be undone.`)) return;
  b.disabled = true;
  try {
    if (b.dataset.act === "delete") {
      const batch = writeBatch(db);
      batch.delete(doc(db, "rsvps", r.id));
      batch.delete(doc(db, "wishes", r.id));
      await batch.commit();
      rows = rows.filter((x) => x !== r);
    } else if (r.onGuestbook) {
      await deleteDoc(doc(db, "wishes", r.id));
      r.onGuestbook = false;
    } else {
      await setDoc(doc(db, "wishes", r.id), { name: r.name, attending: r.attending, message: r.message, createdAt: r.createdAt });
      r.onGuestbook = true;
    }
    render();
  } catch (err) {
    console.error(err);
    b.disabled = false;
    setStatus("That didn't work. Please try again.", "error");
  }
}

function downloadCsv() {
  // A leading = + - @ would run as a formula in Excel or Sheets, so prefix it with '.
  const cell = (v) => {
    let s = String(v == null ? "" : v);
    if (/^[=+\-@]/.test(s)) s = "'" + s;
    return `"${s.replace(/"/g, '""')}"`;
  };
  const lines = [["Name", "Attending", "Family members", "Message", "Submitted"]].concat(rows.map((r) => [
    r.name, r.attending === "yes" ? "Yes" : "No", r.attending === "yes" ? r.members : 0, r.message,
    r.createdAt && r.createdAt.toDate ? r.createdAt.toDate().toISOString() : ""
  ]));
  const csv = "﻿" + lines.map((l) => l.map(cell).join(",")).join("\r\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = `rsvps-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}
