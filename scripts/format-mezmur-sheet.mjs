/**
 * Sets up and formats the EOTC Mezmur Catalog Google Sheet.
 * Run once: node scripts/format-mezmur-sheet.mjs
 */
import { google } from 'googleapis';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function loadEnv() {
  const p = path.join(ROOT, '.env');
  if (!fs.existsSync(p)) return;
  for (const line of fs.readFileSync(p, 'utf8').split('\n')) {
    const t = line.trim();
    if (!t || t.startsWith('#')) continue;
    const eq = t.indexOf('=');
    if (eq < 0) continue;
    const k = t.slice(0, eq).trim();
    let v = t.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnv();

const SHEET_ID = '1Gt_rSQlEd6R4EpZv3fR1KW6gx5-gJqSFpyj87zaUFpE';

const GOOGLE_SERVICE_ACCOUNT = process.env.GOOGLE_SERVICE_ACCOUNT_JSON
  ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON)
  : JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts/service-account.json'), 'utf8'));

async function getSheetsClient() {
  const auth = new google.auth.GoogleAuth({
    credentials: GOOGLE_SERVICE_ACCOUNT,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

function rgb(r, g, b) { return { red: r/255, green: g/255, blue: b/255 }; }

const GOLD         = rgb(212, 175, 55);
const GOLD_LIGHT   = rgb(255, 249, 220);
const GREY_DARK    = rgb(75,  75,  75);
const GREY_MID     = rgb(120, 120, 120);
const WHITE        = rgb(255, 255, 255);
const GREY_ROW     = rgb(250, 250, 250);
const GREEN_LIGHT  = rgb(218, 244, 220);
const RED_LIGHT    = rgb(252, 228, 226);
const YELLOW_LIGHT = rgb(255, 252, 218);
const BLUE         = rgb(60,  120, 220);

async function main() {
  console.log('🎨 Setting up EOTC Mezmur Catalog sheet...');
  const sheets = await getSheetsClient();

  // Rename Sheet1 to "Mezmur Catalog"
  const meta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const sheetTabId = meta.data.sheets[0].properties.sheetId;
  const currentName = meta.data.sheets[0].properties.title;

  const setupRequests = [];

  if (currentName !== 'Mezmur Catalog') {
    setupRequests.push({
      updateSheetProperties: {
        properties: { sheetId: sheetTabId, title: 'Mezmur Catalog' },
        fields: 'title',
      },
    });
  }

  if (setupRequests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: SHEET_ID,
      requestBody: { requests: setupRequests },
    });
  }

  // Write headers
  const headers = [
    'title', 'artist', 'channel', 'youtube_link',
    'thumbnail', 'type', 'language', 'video_id', 'status', 'notes'
  ];
  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: 'Mezmur Catalog!A1:J1',
    valueInputOption: 'RAW',
    requestBody: { values: [headers] },
  });
  console.log('  Headers written.');

  // Get existing banding to remove
  const freshMeta = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID });
  const existingBanding = freshMeta.data.sheets[0].bandedRanges ?? [];

  const requests = [];

  // Remove existing banding
  for (const band of existingBanding) {
    requests.push({ deleteBanding: { bandedRangeId: band.bandedRangeId } });
  }

  // Freeze header + first 2 cols
  requests.push({
    updateSheetProperties: {
      properties: {
        sheetId: sheetTabId,
        gridProperties: { frozenRowCount: 1, frozenColumnCount: 2 },
      },
      fields: 'gridProperties.frozenRowCount,gridProperties.frozenColumnCount',
    },
  });

  // Header row style — gold/grey
  requests.push({
    repeatCell: {
      range: { sheetId: sheetTabId, startRowIndex: 0, endRowIndex: 1 },
      cell: {
        userEnteredFormat: {
          backgroundColor: GOLD_LIGHT,
          textFormat: { foregroundColor: GREY_DARK, bold: true, fontSize: 11 },
          horizontalAlignment: 'CENTER',
          verticalAlignment: 'MIDDLE',
          borders: { bottom: { style: 'SOLID', width: 2, color: GOLD } },
        },
      },
      fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment,borders)',
    },
  });

  // Header row height
  requests.push({
    updateDimensionProperties: {
      range: { sheetId: sheetTabId, dimension: 'ROWS', startIndex: 0, endIndex: 1 },
      properties: { pixelSize: 40 },
      fields: 'pixelSize',
    },
  });

  // Column widths: title|artist|channel|link|thumb|type|lang|video_id|status|notes
  const colWidths = [320, 180, 180, 260, 0, 140, 100, 0, 110, 200];
  // Hide thumbnail (col E=4) and video_id (col H=7) — set to 0 width via hiding
  colWidths.forEach((width, i) => {
    if (width === 0) {
      // Hide column
      requests.push({
        updateDimensionProperties: {
          range: { sheetId: sheetTabId, dimension: 'COLUMNS', startIndex: i, endIndex: i + 1 },
          properties: { pixelSize: 1, hiddenByUser: true },
          fields: 'pixelSize,hiddenByUser',
        },
      });
    } else {
      requests.push({
        updateDimensionProperties: {
          range: { sheetId: sheetTabId, dimension: 'COLUMNS', startIndex: i, endIndex: i + 1 },
          properties: { pixelSize: width },
          fields: 'pixelSize',
        },
      });
    }
  });

  // Title — bold, wrap
  requests.push({
    repeatCell: {
      range: { sheetId: sheetTabId, startRowIndex: 1, startColumnIndex: 0, endColumnIndex: 1 },
      cell: { userEnteredFormat: { textFormat: { bold: true }, wrapStrategy: 'WRAP' } },
      fields: 'userEnteredFormat(textFormat,wrapStrategy)',
    },
  });

  // Artist + Channel — grey, italic
  requests.push({
    repeatCell: {
      range: { sheetId: sheetTabId, startRowIndex: 1, startColumnIndex: 1, endColumnIndex: 3 },
      cell: {
        userEnteredFormat: {
          textFormat: { foregroundColor: GREY_MID, italic: true },
          wrapStrategy: 'WRAP',
        },
      },
      fields: 'userEnteredFormat(textFormat,wrapStrategy)',
    },
  });

  // YouTube link — blue underline
  requests.push({
    repeatCell: {
      range: { sheetId: sheetTabId, startRowIndex: 1, startColumnIndex: 3, endColumnIndex: 4 },
      cell: {
        userEnteredFormat: { textFormat: { foregroundColor: BLUE, underline: true } },
      },
      fields: 'userEnteredFormat.textFormat',
    },
  });

  // Type dropdown (col F = index 5)
  requests.push({
    setDataValidation: {
      range: { sheetId: sheetTabId, startRowIndex: 1, startColumnIndex: 5, endColumnIndex: 6 },
      rule: {
        condition: {
          type: 'ONE_OF_LIST',
          values: [
            { userEnteredValue: 'nisiha' },
            { userEnteredValue: 'praise' },
            { userEnteredValue: 'maryam' },
            { userEnteredValue: 'fasting' },
            { userEnteredValue: 'other' },
          ],
        },
        showCustomUi: true,
        strict: true,
      },
    },
  });

  // Language dropdown (col G = index 6)
  requests.push({
    setDataValidation: {
      range: { sheetId: sheetTabId, startRowIndex: 1, startColumnIndex: 6, endColumnIndex: 7 },
      rule: {
        condition: {
          type: 'ONE_OF_LIST',
          values: [
            { userEnteredValue: 'english' },
            { userEnteredValue: 'amharic' },
            { userEnteredValue: 'geez' },
          ],
        },
        showCustomUi: true,
        strict: true,
      },
    },
  });

  // Status dropdown (col I = index 8)
  requests.push({
    setDataValidation: {
      range: { sheetId: sheetTabId, startRowIndex: 1, startColumnIndex: 8, endColumnIndex: 9 },
      rule: {
        condition: {
          type: 'ONE_OF_LIST',
          values: [
            { userEnteredValue: 'pending' },
            { userEnteredValue: 'approved' },
            { userEnteredValue: 'rejected' },
          ],
        },
        showCustomUi: true,
        strict: true,
      },
    },
  });

  // Alternating rows
  requests.push({
    addBanding: {
      bandedRange: {
        range: { sheetId: sheetTabId, startRowIndex: 1, startColumnIndex: 0, endColumnIndex: 10 },
        rowProperties: { firstBandColor: WHITE, secondBandColor: GREY_ROW },
      },
    },
  });

  // Conditional: approved = green
  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [{ sheetId: sheetTabId, startRowIndex: 1, startColumnIndex: 0, endColumnIndex: 10 }],
        booleanRule: {
          condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'approved' }] },
          format: { backgroundColor: GREEN_LIGHT },
        },
      },
      index: 0,
    },
  });

  // rejected = light red
  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [{ sheetId: sheetTabId, startRowIndex: 1, startColumnIndex: 0, endColumnIndex: 10 }],
        booleanRule: {
          condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'rejected' }] },
          format: { backgroundColor: RED_LIGHT },
        },
      },
      index: 1,
    },
  });

  // pending = light yellow
  requests.push({
    addConditionalFormatRule: {
      rule: {
        ranges: [{ sheetId: sheetTabId, startRowIndex: 1, startColumnIndex: 0, endColumnIndex: 10 }],
        booleanRule: {
          condition: { type: 'TEXT_EQ', values: [{ userEnteredValue: 'pending' }] },
          format: { backgroundColor: YELLOW_LIGHT },
        },
      },
      index: 2,
    },
  });

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: { requests },
  });

  console.log('  Formatting applied.\n');
  console.log('✓ Sheet is ready!');
  console.log(`https://docs.google.com/spreadsheets/d/${SHEET_ID}`);
}

main().catch(err => { console.error(err); process.exit(1); });
