const {google} = require('googleapis');
const fs = require('fs');

async function run() {
  try {
    // Read service account JSON from workspace file if present
    const saPath = `${__dirname}/../gorkeminsaat-02871cc1db5d.json`;
    let creds;
    if (fs.existsSync(saPath)) {
      creds = JSON.parse(fs.readFileSync(saPath, 'utf8'));
      console.log('Loaded service account JSON from', saPath);
    } else if (process.env.GOOGLE_SHEETS_CREDENTIALS) {
      creds = JSON.parse(process.env.GOOGLE_SHEETS_CREDENTIALS);
      console.log('Loaded service account JSON from GOOGLE_SHEETS_CREDENTIALS env');
    } else {
      console.error('No service account JSON found in workspace or env.');
      process.exit(1);
    }

    const auth = new google.auth.GoogleAuth({
      credentials: creds,
      scopes: ['https://www.googleapis.com/auth/spreadsheets']
    });

    const sheets = google.sheets({version: 'v4', auth});
    console.log('Google Sheets auth initialized successfully');

    const spreadsheetId = process.env.SPREADSHEET_ID || '';
    if (!spreadsheetId) {
      console.log('No SPREADSHEET_ID provided; stopping after auth init.');
      process.exit(0);
    }

    try {
      const res = await sheets.spreadsheets.get({ spreadsheetId, includeGridData: false });
      console.log('Spreadsheet title:', res.data.properties?.title);
      console.log('Sheets:', (res.data.sheets || []).map(s => s.properties?.title));
    } catch (err) {
      console.error('Failed to GET spreadsheet:', err.message || err);
      if (err.errors) console.error('Errors:', err.errors);
      process.exit(2);
    }
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(3);
  }
}

run();
