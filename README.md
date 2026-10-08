# Wedding invitation

The live site: https://alen-george.github.io/wedding-invitation/

Everything on the page (names, Bible verse, events, photos, RSVP settings, colours) comes from
[`js/config.js`](js/config.js). Photos go in the `photos/` folder. Commit and push, and the site
updates within a minute or two.

## Hosting (GitHub Pages)

Repository → **Settings → Pages** → Source: **Deploy from a branch** → `main` / `(root)` → Save.

## RSVP setup (Firebase, free)

Replies are saved in Cloud Firestore, Google's free database. Until this is set up, the form
runs in demo mode and replies are only kept in the browser that sent them.

1. **Create a project.** Go to https://console.firebase.google.com → **Create a project**.
   Google Analytics isn't needed. New projects are on the free Spark plan and need no card.
2. **Create the database.** **Build → Firestore Database → Create database**. If asked for an
   edition, choose **Standard**. Location: `asia-south1 (Mumbai)`. Choose **production mode**.
3. **Publish the rules.** In Firestore, open the **Rules** tab and replace everything with the
   contents of [`firestore.rules`](firestore.rules). In `isCouple()`, replace `groom@gmail.com`
   and `bride@gmail.com` with the Google accounts that should see the replies. Click **Publish**.
4. **Turn on Google sign-in** (for the responses page). **Build → Authentication → Get started →
   Sign-in method → Google → Enable**, pick a support email and save. Then open the **Settings**
   tab → **Authorized domains → Add domain** → `alen-george.github.io`.
5. **Connect the website.** Click the gear icon → **Project settings** → **Your apps** → the web
   icon `</>`. Give it any nickname, leave Firebase Hosting unticked, and click **Register app**.
   Copy `apiKey`, `authDomain`, `projectId` and `appId` into `rsvp.firebase` in `js/config.js`.
   These values are meant to be public. The rules are what keep the replies private.
6. Push, then send a test RSVP from the site and check it on the responses page.

## Seeing the replies

Open https://alen-george.github.io/wedding-invitation/admin.html and sign in with one of the
accounts from step 3. It shows the total number of guests attending, every reply with the family
size, and a **Download CSV** button for Excel or Google Sheets.

- **Hide from guestbook** removes a message from the website but keeps the reply.
- **Delete reply** removes it completely, for example when a family replies twice. Replies with
  the same name are marked "Possible duplicate".

## Free limits

The Spark plan allows 50,000 reads and 20,000 writes a day. The guestbook loads 9 messages at a
time, and only when a guest scrolls down to it, so a normal invitation stays well inside this.
If a limit were ever reached, the form would stop working until the next day; there is never a
charge.
