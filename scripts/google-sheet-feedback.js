/**
 * Feedback receiver only — not the waitlist.
 * Paste this into Extensions → Apps Script on the FEEDBACK spreadsheet
 * (a separate Google Sheet from the waitlist file).
 * Deploy → New deployment → Web app
 *   Execute as: Me
 *   Who has access: Anyone
 * Then put the web app URL in FEEDBACK_SHEETS_WEBHOOK_URL.
 *
 * Each POST must include:
 *   project  — tab name (this app sends "Scrixo Feedback")
 *   headers  — column names
 *   values   — object keyed by those header names
 *
 * Optional: Project Settings → Script properties
 *   FEEDBACK_SECRET  — must match FEEDBACK_SECRET in the app
 *   NOTIFY_EMAIL     — your address, or comma-separated
 *   ALLOWED_PROJECTS — comma-separated tab names
 *
 * Every note is appended. Email / Reply is optional.
 */
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents || "{}");
    const reply = String(data.email || data.reply || "")
      .trim()
      .toLowerCase();
    if (reply && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reply)) {
      return json_({ ok: false, error: "invalid_email" });
    }

    const expected = PropertiesService.getScriptProperties().getProperty("FEEDBACK_SECRET");
    if (expected && data.secret !== expected) {
      return json_({ ok: false, error: "unauthorized" });
    }

    const tabName = tabName_(data.project);
    if (!tabName) {
      return json_({ ok: false, error: "missing_project" });
    }

    const allowed = PropertiesService.getScriptProperties().getProperty("ALLOWED_PROJECTS");
    if (allowed) {
      const names = allowed.split(",").map(function (name) {
        return tabName_(name);
      });
      if (names.indexOf(tabName) === -1) {
        return json_({ ok: false, error: "unknown_project" });
      }
    }

    const headers = normalizeHeaders_(data.headers);
    if (!headers.length) {
      return json_({ ok: false, error: "missing_headers" });
    }

    const values = data.values && typeof data.values === "object" ? data.values : {};
    if (headerIndex_(headers, "Reply") !== -1 && !values.Reply && reply) {
      values.Reply = reply;
    }
    if (headerIndex_(headers, "Timestamp") !== -1 && !values.Timestamp) {
      values.Timestamp = new Date();
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(tabName);
    if (!sheet) {
      sheet = ss.insertSheet(tabName);
    }
    const sheetHeaders = ensureHeaders_(sheet, headers);
    const row = sheetHeaders.map(function (header) {
      if (values[header] !== undefined && values[header] !== "") {
        return values[header];
      }
      const key = Object.keys(values).find(function (name) {
        return String(name).toLowerCase() === String(header).toLowerCase();
      });
      return key ? values[key] : "";
    });
    sheet.appendRow(row);
    notify_(tabName, sheetHeaders, row);

    return json_({ ok: true, project: tabName, headers: sheetHeaders });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function tabName_(name) {
  return String(name || "")
    .trim()
    .replace(/[:\\/?*\[\]]/g, "")
    .slice(0, 100);
}

function normalizeHeaders_(raw) {
  if (!Array.isArray(raw)) {
    return [];
  }
  const seen = {};
  return raw
    .map(function (name) {
      return String(name || "")
        .trim()
        .replace(/[:\\/?*\[\]]/g, "")
        .slice(0, 80);
    })
    .filter(function (name) {
      const key = name.toLowerCase();
      if (!name || seen[key]) {
        return false;
      }
      seen[key] = true;
      return true;
    });
}

function headerIndex_(headers, name) {
  const target = String(name).toLowerCase();
  return headers.findIndex(function (header) {
    return String(header).toLowerCase() === target;
  });
}

function ensureHeaders_(sheet, incoming) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(incoming);
    return incoming.slice();
  }

  const lastCol = Math.max(sheet.getLastColumn(), 1);
  const existing = sheet
    .getRange(1, 1, 1, lastCol)
    .getValues()[0]
    .map(function (cell) {
      return String(cell || "").trim();
    });
  while (existing.length && existing[existing.length - 1] === "") {
    existing.pop();
  }

  incoming.forEach(function (header) {
    if (headerIndex_(existing, header) === -1) {
      existing.push(header);
      sheet.getRange(1, existing.length).setValue(header);
    }
  });

  return existing;
}

function notify_(project, headers, row) {
  const raw = PropertiesService.getScriptProperties().getProperty("NOTIFY_EMAIL");
  if (!raw) {
    return;
  }
  const to = raw
    .split(",")
    .map(function (address) {
      return address.trim();
    })
    .filter(Boolean);
  if (!to.length) {
    return;
  }

  const lines = headers.map(function (header, i) {
    return header + ": " + (row[i] || "");
  });
  MailApp.sendEmail({
    to: to.join(","),
    subject: "Feedback: " + project,
    body: "A new note landed on " + project + ".\n\n" + lines.join("\n"),
  });
}

function json_(body) {
  return ContentService.createTextOutput(JSON.stringify(body)).setMimeType(ContentService.MimeType.JSON);
}
