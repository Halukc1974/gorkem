const {google} = require('googleapis');
const fs = require('fs');

(async function() {
  try {
    const svcPath = process.env.GOOGLE_SERVICE_ACCOUNT_FILE || 'gorkeminsaat-02871cc1db5d.json';
    const raw = fs.readFileSync(svcPath, 'utf8');
    const creds = JSON.parse(raw);

    const auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({version: 'v4', auth});
    console.log('Google Sheets auth initialized successfully');

    const spreadsheetId = process.env.GOOGLE_SPREADSHEET_ID;
    if (!spreadsheetId) {
      console.log('No GOOGLE_SPREADSHEET_ID provided — stopping after auth init.');
      return;
    }

    try {
      const res = await sheets.spreadsheets.get({ spreadsheetId, includeGridData: false });
      console.log('Spreadsheet title:', res.data.properties?.title);
      console.log('Sheets count:', res.data.sheets?.length || 0);
    } catch (err) {
      console.error('Sheets get failed (may be missing sharing or bad ID):', err.message || err);
    }
  } catch (err) {
    console.error('Failed to initialize Google Sheets auth:', err.message || err);
    process.exit(1);
  }
})();
