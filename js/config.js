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
    firstName: "Thaleetha Kummi",                       // shown big on the page
    shortName: "Thaleetha",
    fullName: "Thaleetha Kummi Sunil",
    parents: "Daughter of Mr. Sunil Jose  & Mrs. Dayana Sunil, Vettikuzhiyil",
    bio: "A social worker and a sunshine soul who loves sports and long conversations.",
    photo: "photos/bride.jpg"                // put the file in the photos/ folder
  },
  groom: {
    firstName: "Alen",
    shortName: "Alen",
    fullName: "Alen George",
    parents: "Son of Mr. George Thomas & Mrs. Lucy George, Moloparambil",
    bio: "A techie and adventurous soul who loves exploring new places.",
    photo: "photos/groom.jpg"
  },
  nameOrder: "groom",                        // "bride" → Emma & James, "groom" → James & Emma

  tagline: "We're getting married",
  invitationMessage:
    "Together with our families, we joyfully invite you to celebrate the beginning of our forever. " +
    "Your presence would mean the world to us.",
  hashtag: "#AlenWedsThaleetha",

  /* ---------- Bible verse ----------
     Shown just below the names. Set text to "" to hide it.
     Some other verses couples often choose (RSV Catholic Edition wording):
       "Love bears all things, believes all things, hopes all things, endures all things. Love never ends."   1 Corinthians 13:7-8
       "Many waters cannot quench love, neither can floods drown it."                                          Song of Solomon 8:7
       "And above all these put on love, which binds everything together in perfect harmony."                  Colossians 3:14
       "A threefold cord is not quickly broken."                                                                Ecclesiastes 4:12
       "Grant that I may find mercy and may grow old together with her."                                        Tobit 8:7  */
  bibleVerse: {
    text: "Love bears all things, believes all things, hopes all things, endures all things. Love never ends.",
    reference: "1 Corinthians 13:7-8"
  },

  /* ---------- Date & time ---------- */
  // The venue's offset from UTC. It keeps the countdown and calendar links right for guests in other countries.
  // Examples: India "+05:30", UK (winter) "+00:00", New York (winter) "-05:00", Dubai "+04:00".
  timezoneOffset: "+05:30",
  locale: "en-IN",                           // date format: "en-US", "en-GB", "en-IN", "fr-FR", ...

  /* ---------- Events & venues ----------
     Add as many events as you like (ceremony, reception, mehendi, ...).
     Times are local to the venue in 24-hour format: "YYYY-MM-DDTHH:MM".
     mapQuery is what gets searched on Google Maps: a place name, an address,
     or exact coordinates like "40.7644,-73.9745".
     mapsUrl (optional) overrides the "Get directions" link, e.g. a Google Maps share link. */
  events: [
    {
      title: "Wedding Ceremony",
      start: "2027-01-02T16:00",
      end: "2027-01-02T20:30",
      description: "Please be seated by 4:30 PM.",
      venue: {
        name: "Sacred Heart Church Poovarani",
        address: "Poovarani, Pala, Kerala, India",
        city: "Pala",
        mapQuery: "Sacred Heart Church Poovarani, Pala, Kerala, India",
        mapsUrl: ""
      }
    },
    {
      title: "Reception & Dinner",
      start: "2027-01-02T18:30",
      end: "2027-01-02T21:00",
      description: "Dinner, music and plenty of celebration.",
      venue: {
        name: "Sacred Heart Church Parish Hall",
        address: "Poovarani, Pala, Kerala, India",
        city: "Pala",
        mapQuery: "Sacred Heart Church Poovarani, Pala, Kerala, India",
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
    hero: ["photos/hero-1.jpg", "photos/hero-2.png", "photos/hero-3.jpg"],
    heroInterval: 6000,                      // milliseconds per slide
    gallery: [
      { src: "photos/gallery-1.jpg", caption: "Where it all began" },
      { src: "photos/gallery-2.jpg", caption: "" },
      { src: "photos/gallery-3.jpg", caption: "The proposal" },
      { src: "photos/gallery-4.jpg", caption: "PRECANA" },
      { src: "photos/gallery-5.jpg", caption: "" },
      { src: "photos/gallery-6.jpg", caption: "" }
    ]
  },

  /* ---------- RSVP & wishes ----------
     Replies are saved in Firebase (free). Follow "RSVP setup" in README.md once, then paste
     the values from your Firebase web app below. While projectId is empty the form runs in
     demo mode and responses stay in your own browser only.
     See every reply and the total headcount at admin.html on your site. */
  rsvp: {
    enabled: true,
    firebase: {
      apiKey: "AIzaSyD7vbNp8kZbbFvi8UmXmhrXJyw_ll2TQBs",
      authDomain: "weddinginvites-f5395.firebaseapp.com",
      projectId: "weddinginvites-f5395",
      appId: "1:424563779387:web:a4ce969b881dead135f91e"
    },
    deadline: "2026-12-15",                  // "" for no deadline
    maxGuests: 10,                           // most family members one reply can include (counting themselves)
    attendingLabel: "Joyfully accept",
    decliningLabel: "Regretfully decline",
    thanksAttending: "Wonderful! We can't wait to celebrate with you.",
    thanksDeclining: "We'll miss you! Thank you for letting us know.",
    showWishes: true                         // show guests' messages on the page
  },

  /* ---------- Optional extras ---------- */
  music: {
    src: "music/music.mp3",                                 // e.g. "music/our-song.mp3" (leave empty for no music)
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
    { name: "Alen", phone: "+917012877627" },
    { name: "Thaleetha" }
  ],
  footerNote: "Your presence is the greatest gift of all."
};
