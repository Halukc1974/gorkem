const {google} = require('googleapis');
const fs = require('fs');

async function run() {
  try {
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
      // Include Drive scopes so the service account can create files if allowed by project/org
      scopes: [
        'https://www.googleapis.com/auth/spreadsheets',
        'https://www.googleapis.com/auth/drive'
      ]
    });

    const sheets = google.sheets({version: 'v4', auth});

    const title = `gorkem-proje-${Date.now()}`;
    console.log('Creating spreadsheet with title:', title);

    const createRes = await sheets.spreadsheets.create({
      requestBody: {
        properties: { title }
      }
    });

    const spreadsheetId = createRes.data.spreadsheetId;
    console.log('Spreadsheet created:', spreadsheetId);
    console.log('URL: https://docs.google.com/spreadsheets/d/' + spreadsheetId);

    // Add a header row to the first sheet
    const headers = ['Tarih', 'Açıklama', 'Tutar', 'Tür', 'Kategori'];
    try {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: 'Sheet1!A1',
        valueInputOption: 'RAW',
        requestBody: {
          values: [headers]
        }
      });
      console.log('Header row written to Sheet1');
    } catch (err) {
      console.error('Failed to write header row:', err.message || err);
    }

    console.log('Done');
  } catch (err) {
    console.error('Error creating spreadsheet:', err);
    process.exit(2);
  }
}

run();
