/**
 * Wedding RSVP backend: stores RSVPs in this Google Sheet and serves the guestbook.
 *
 * Setup (once):
 *   1. Create a Google Sheet → Extensions → Apps Script → paste this whole file → Save.
 *   2. Deploy → New deployment → type "Web app"
 *        Execute as:      Me
 *        Who has access:  Anyone
 *   3. Copy the Web app URL into rsvp.endpoint in js/config.js.
 *
 * After editing this code, use Deploy → Manage deployments → Edit (pencil) →
 * Version: "New version" → Deploy. That keeps the same URL.
 *
 * Moderation: untick "Show on site" for any row to hide that message from the guestbook.
 */

const SHEET_NAME = 'RSVPs';
const HEADERS = ['Timestamp', 'Name', 'Attending', 'Guests', 'Message', 'Show on site'];
const MAX_WISHES = 300;

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

// Trim, cap the length, and stop text that starts with = + - @ being run as a spreadsheet formula.
function clean_(value, maxLength) {
  let s = String(value == null ? '' : value).trim().slice(0, maxLength);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Spam trap: bots fill the hidden "website" field. Pretend it worked.
    if (data.website) return json_({ ok: true });

    const name = clean_(data.name, 100);
    const attending = data.attending === 'yes' ? 'Yes' : data.attending === 'no' ? 'No' : '';
    if (!name || !attending) return json_({ ok: false, error: 'Name and attendance are required.' });

    const guests = attending === 'Yes' ? Math.max(1, Math.min(20, parseInt(data.guests, 10) || 1)) : 0;
    const message = clean_(data.comment, 1000);

    const sheet = getSheet_();
    sheet.appendRow([new Date(), name, attending, guests, message, true]);
    sheet.getRange(sheet.getLastRow(), HEADERS.length).insertCheckboxes().setValue(true);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: 'Could not save your RSVP. Please try again.' });
  } finally {
    lock.releaseLock();
  }
}

// Public guestbook: returns only name, attendance and message for rows still marked "Show on site".
// Guest counts and timestamps stay private in the sheet.
function doGet(e) {
  const rows = getSheet_().getDataRange().getValues().slice(1);
  const wishes = rows
    .filter(r => String(r[4]).trim() && r[5] !== false && String(r[5]).toUpperCase() !== 'FALSE')
    .map(r => ({ name: String(r[1]), attending: String(r[2]), comment: String(r[4]) }))
    .reverse()
    .slice(0, MAX_WISHES);
  return json_({ ok: true, wishes: wishes });
}

// Optional: run this from the editor to see a summary in the execution log.
function summary() {
  const rows = getSheet_().getDataRange().getValues().slice(1);
  const yes = rows.filter(r => r[2] === 'Yes');
  const people = yes.reduce((n, r) => n + (Number(r[3]) || 0), 0);
  Logger.log('Responses: %s · Attending: %s (%s people) · Declined: %s',
    rows.length, yes.length, people, rows.filter(r => r[2] === 'No').length);
}
