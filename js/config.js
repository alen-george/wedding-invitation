/* ==========================================================================
   WEDDING CONFIGURATION
   --------------------------------------------------------------------------
   This is the only file you need to edit. Every detail on the website
   (names, dates, venues, photos, RSVP settings, colours) comes from here.
   Keep the quotes and commas exactly as they are and only change the text.
   ========================================================================== */

window.WEDDING_CONFIG = {
  /* ---------- The couple ---------- */
  bride: {
    firstName: "Thaleetha",                       // shown big on the page
    fullName: "Thaleetha Kummi Sunil",
    parents: "Daughter of Mr. & Mrs. Sunil Thomas",
    bio: "A sunshine soul who loves books, beaches and baking for everyone she knows.",
    photo: "photos/bride.jpg"                // put the file in the photos/ folder
  },
  groom: {
    firstName: "Alen",
    fullName: "Alen George",
    parents: "Son of Mr. & Mrs. George Thomas",
    bio: "A techie and full-time optimist who still can't believe she said yes.",
    photo: "photos/groom.jpg"
  },
  nameOrder: "bride",                        // "bride" → Emma & James, "groom" → James & Emma

  tagline: "We're getting married",
  invitationMessage:
    "Together with our families, we joyfully invite you to celebrate the beginning of our forever. " +
    "Your presence would mean the world to us.",
  hashtag: "#EmmaWedsJames",

  /* ---------- Date & time ---------- */
  // The venue's offset from UTC. It keeps the countdown and calendar links right for guests in other countries.
  // Examples: India "+05:30", UK (winter) "+00:00", New York (winter) "-05:00", Dubai "+04:00".
  timezoneOffset: "-05:00",
  locale: "en-US",                           // date format: "en-US", "en-GB", "en-IN", "fr-FR", ...

  /* ---------- Events & venues ----------
     Add as many events as you like (ceremony, reception, mehendi, ...).
     Times are local to the venue in 24-hour format: "YYYY-MM-DDTHH:MM".
     mapQuery is what gets searched on Google Maps: a place name, an address,
     or exact coordinates like "40.7644,-73.9745".
     mapsUrl (optional) overrides the "Get directions" link, e.g. a Google Maps share link. */
  events: [
    {
      title: "Wedding Ceremony",
      start: "2026-12-12T15:00",
      end: "2026-12-12T16:30",
      description: "Please be seated by 2:45 PM.",
      dressCode: "Formal attire",
      venue: {
        name: "St. Patrick's Cathedral",
        address: "5th Ave, New York, NY 10022",
        city: "New York",
        mapQuery: "St. Patrick's Cathedral, 5th Ave, New York",
        mapsUrl: ""
      }
    },
    {
      title: "Reception & Dinner",
      start: "2026-12-12T18:30",
      end: "2026-12-12T23:00",
      description: "Dinner, dancing and plenty of celebration.",
      dressCode: "Black tie optional",
      venue: {
        name: "The Plaza Hotel — Grand Ballroom",
        address: "768 5th Ave, New York, NY 10019",
        city: "New York",
        mapQuery: "The Plaza Hotel, 768 5th Ave, New York",
        mapsUrl: ""
      }
    }
  ],
  countdownTo: "",                           // leave empty to count down to the first event
  afterWeddingMessage: "Just married! Thank you for celebrating with us.",

  /* ---------- Photos ----------
     hero:    big background slideshow at the top of the page (landscape photos work best)
     gallery: photo grid further down; each item is a path, or { src, caption }
     Missing photos are skipped automatically, so the site never shows broken images. */
  photos: {
    hero: ["photos/hero-1.jpg", "photos/hero-2.jpg", "photos/hero-3.jpg"],
    heroInterval: 6000,                      // milliseconds per slide
    gallery: [
      { src: "photos/gallery-1.jpg", caption: "Where it all began" },
      { src: "photos/gallery-2.jpg", caption: "Our first trip" },
      { src: "photos/gallery-3.jpg", caption: "The proposal" },
      { src: "photos/gallery-4.jpg", caption: "" },
      { src: "photos/gallery-5.jpg", caption: "" },
      { src: "photos/gallery-6.jpg", caption: "" }
    ]
  },

  /* ---------- RSVP & wishes ----------
     endpoint: the Google Apps Script web-app URL (see README.md, "RSVP setup").
     While it is empty the form runs in demo mode and responses stay in your own browser only. */
  rsvp: {
    enabled: true,
    endpoint: "",
    deadline: "2026-11-30",                  // "" for no deadline
    maxGuests: 5,                            // largest party size a guest can pick
    attendingLabel: "Joyfully accept",
    decliningLabel: "Regretfully decline",
    thanksAttending: "Wonderful! We can't wait to celebrate with you.",
    thanksDeclining: "We'll miss you! Thank you for letting us know.",
    showWishes: true                         // show guests' messages on the page
  },

  /* ---------- Optional extras ---------- */
  music: {
    src: "",                                 // e.g. "music/our-song.mp3" (leave empty for no music)
    autoplay: true,                          // starts when the guest opens the envelope
    volume: 0.5
  },
  intro: { enabled: true },                  // the animated envelope at the start
  petals: true,                              // falling petals animation

  theme: {
    primary: "#a85f6b",                      // buttons, headings, accents
    accent: "#c9a96e",                       // gold ornaments
    background: "#fbf7f2",
    text: "#3d3330"
  },

  contacts: [
    { name: "Emma", phone: "+1 212 555 0142" },
    { name: "James", phone: "+1 212 555 0178" }
  ],
  footerNote: "Your presence is the greatest gift of all."
};
