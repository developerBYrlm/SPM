import "dotenv/config";
import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import dns from "node:dns";

// Optimize DNS resolution to prevent IPv6 latency on Windows
try {
  dns.setDefaultResultOrder("ipv4first");
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch {
  // Ignore in environments where setting DNS is restricted
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SPREADSHEET_ID =
  process.env.GOOGLE_SHEET_ID || "1znIvCWAFUnnGsnzOcSGxvRWrZzHTEEFfdjR1mzgZIwk";
const TAB_NAME = process.env.GOOGLE_SHEET_TAB_NAME || "Sheet1";

// Persistent in-memory singletons for lightning-fast updates
let cachedSheetsClient = null;
const studentRowCache = new Map(); // studentId (lowercase, trimmed) -> rowNumber

// Locate the service account json file in the googleSheet folder
const getKeyFilePath = () => {
  const customPath = process.env.GOOGLE_SHEET_KEY_PATH;
  if (customPath && fs.existsSync(customPath)) {
    return customPath;
  }

  const expectedFile = path.join(__dirname, "iconic-rampart-511715-i9-4f770a8cb81f.json");
  if (fs.existsSync(expectedFile)) {
    return expectedFile;
  }

  const files = fs.readdirSync(__dirname);
  const jsonFile = files.find((f) => f.endsWith(".json"));
  if (jsonFile) {
    return path.join(__dirname, jsonFile);
  }

  throw new Error(`Google Sheet service account JSON file not found in ${__dirname}`);
};

/**
 * Get authenticated Google Sheets client (reusable singleton with HTTP Keep-Alive)
 */
export const getSheetsClient = async () => {
  if (cachedSheetsClient) {
    return cachedSheetsClient;
  }

  const keyPath = getKeyFilePath();

  const auth = new google.auth.GoogleAuth({
    keyFile: keyPath,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  cachedSheetsClient = google.sheets({ version: "v4", auth });
  return cachedSheetsClient;
};

/**
 * Format courses array into clean multiline string
 * Each course is on its own separate line (\n)
 */
export const formatCoursesString = (courses = []) => {
  if (!courses || !courses.length) return "N/A";

  return courses
    .map((c) => {
      const code = c.courseId || "";
      const title = c.courseTitle || "";
      const acr = c.facultyAcr ? ` [${c.facultyAcr}]` : "";
      return `${code}${title ? ` - ${title}` : ""}${acr}`.trim();
    })
    .filter(Boolean)
    .join("\n");
};

/**
 * Format date for sheet display (DD/MM/YYYY)
 */
export const formatDateString = (dateVal) => {
  if (!dateVal) {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    return `${day}/${month}/${year}`;
  }
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch {
    return String(dateVal);
  }
};

/**
 * Get sheet tab name directly without extra network request
 */
export const getSheetTabName = async () => {
  return TAB_NAME;
};

/**
 * Map application data to Google Sheet row array based on column structure:
 * Column A: Student ID
 * Column B: Department
 * Column C: Application Submit Date
 * Column D: Name
 * Column E: Exam Type
 * Column F: Semester
 * Column G: Section
 * Column H: Courses (multiline \n)
 * Column I: Reason
 * Column J: Authority status
 */
export const buildRowFromApplication = (application) => {
  return [
    application.studentId ? String(application.studentId).trim() : "",
    application.department || "",
    formatDateString(application.createdAt || application.missedExamDate),
    application.name || "",
    application.missedExamType || "",
    application.semester || "",
    application.section || "",
    formatCoursesString(application.courses),
    application.reason || "",
    application.authorityStatus || "Pending",
  ];
};

/**
 * High-speed row locator:
 * Fetches Column A from Google Sheet, matches studentId, and updates in-memory cache.
 * Returns 1-indexed row number (e.g. 2, 3) or null if not found.
 */
export const findRowNumberByStudentId = async (sheets, studentId, forceRefresh = false) => {
  if (!studentId) return null;
  const targetId = String(studentId).trim().toLowerCase();

  if (!forceRefresh && studentRowCache.has(targetId)) {
    return studentRowCache.get(targetId);
  }

  // Fast query: fetch only Column A
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `'${TAB_NAME}'!A:A`,
  });

  const rows = response.data.values || [];
  studentRowCache.clear();

  let targetRow = null;
  // Row 1 (index 0) is header ('Student ID')
  for (let i = 1; i < rows.length; i++) {
    const cellId = rows[i]?.[0] ? String(rows[i][0]).trim().toLowerCase() : "";
    if (cellId) {
      studentRowCache.set(cellId, i + 1);
      if (cellId === targetId) {
        targetRow = i + 1;
      }
    }
  }

  return targetRow;
};

/**
 * 1. Student applies: write application to Google Sheet (default status: "Pending")
 */
export const syncNewApplicationToSheet = async (application) => {
  const startTime = Date.now();
  try {
    if (!application || !application.studentId) return;

    const sheets = await getSheetsClient();
    const studentId = String(application.studentId).trim();

    // Default authority status to "Pending" upon initial submission
    if (!application.authorityStatus) {
      application.authorityStatus = "Pending";
    }

    const rowValues = buildRowFromApplication(application);

    // Check if this student ID is already in the sheet
    const existingRow = await findRowNumberByStudentId(sheets, studentId);

    if (existingRow) {
      console.log(`[GoogleSheet] Student ${studentId} already exists at row ${existingRow}. Updating row...`);
      await sheets.spreadsheets.values.update({
        spreadsheetId: SPREADSHEET_ID,
        range: `'${TAB_NAME}'!A${existingRow}:J${existingRow}`,
        valueInputOption: "USER_ENTERED",
        requestBody: {
          values: [rowValues],
        },
      });
      studentRowCache.set(studentId.toLowerCase(), existingRow);
      console.log(`[GoogleSheet] Row ${existingRow} updated for student ${studentId} in ${Date.now() - startTime}ms`);
      return;
    }

    // Append new row
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${TAB_NAME}'!A:J`,
      valueInputOption: "USER_ENTERED",
      insertDataOption: "INSERT_ROWS",
      requestBody: {
        values: [rowValues],
      },
    });

    // Determine row number from append response
    const updatedRange = response.data.updates?.updatedRange || "";
    const match = updatedRange.match(/!A(\d+):/i) || updatedRange.match(/(\d+)$/);
    if (match && match[1]) {
      studentRowCache.set(studentId.toLowerCase(), parseInt(match[1], 10));
    }

    console.log(`[GoogleSheet] New application appended for student ${studentId} (Status: Pending) in ${Date.now() - startTime}ms`);
  } catch (error) {
    console.error(`[GoogleSheet] Error syncing new application for student ${application?.studentId}:`, error.message);
  }
};

/**
 * 2. Authority approved or rejected: detect studentId, find row, and update Column J
 */
export const syncAuthorityStatusToSheet = async (studentId, newAuthorityStatus) => {
  const startTime = Date.now();
  try {
    if (!studentId) return;

    const sheets = await getSheetsClient();
    const cleanId = String(studentId).trim();
    const statusVal = newAuthorityStatus || "Pending";

    // Detect row on Google Sheet by student ID
    let rowNumber = await findRowNumberByStudentId(sheets, cleanId);

    // If not found in cache, force refresh from sheet
    if (!rowNumber) {
      rowNumber = await findRowNumberByStudentId(sheets, cleanId, true);
    }

    if (!rowNumber) {
      console.log(`[GoogleSheet] Student ${cleanId} not found in sheet for status update. Pulling full application from DB...`);
      const { default: StudentApplication } = await import("../models/StudentApplication.js");
      const app = await StudentApplication.findOne({ studentId: cleanId });
      if (app) {
        app.authorityStatus = statusVal;
        await syncNewApplicationToSheet(app);
      }
      return;
    }

    // Update ONLY Column J (Authority status) for that specific matched row
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${TAB_NAME}'!J${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [[statusVal]],
      },
    });

    console.log(`[GoogleSheet] Authority status updated to '${statusVal}' for student ${cleanId} at row ${rowNumber} in ${Date.now() - startTime}ms`);
  } catch (error) {
    console.error(`[GoogleSheet] Error updating Authority status for student ${studentId}:`, error.message);
  }
};

/**
 * 3. Student updates application: detect studentId, find row, and update full row data
 */
export const syncUpdatedApplicationToSheet = async (application) => {
  const startTime = Date.now();
  try {
    if (!application || !application.studentId) return;

    const sheets = await getSheetsClient();
    const studentId = String(application.studentId).trim();

    // Detect row on Google Sheet by student ID
    let rowNumber = await findRowNumberByStudentId(sheets, studentId);
    if (!rowNumber) {
      rowNumber = await findRowNumberByStudentId(sheets, studentId, true);
    }

    const rowValues = buildRowFromApplication(application);

    if (!rowNumber) {
      console.log(`[GoogleSheet] Student ${studentId} not found in sheet during update. Appending new row...`);
      await syncNewApplicationToSheet(application);
      return;
    }

    // Update all columns A through J for this matched student row
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${TAB_NAME}'!A${rowNumber}:J${rowNumber}`,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values: [rowValues],
      },
    });

    console.log(`[GoogleSheet] Updated application data for student ${studentId} at row ${rowNumber} in ${Date.now() - startTime}ms`);
  } catch (error) {
    console.error(`[GoogleSheet] Error syncing updated application for student ${application?.studentId}:`, error.message);
  }
};

/**
 * Bulk sync for startup reconciliation: skips already existing rows to stay super fast
 */
export const syncAllApplicationsToSheet = async (applications = []) => {
  const startTime = Date.now();
  try {
    if (!applications || !applications.length) return { success: true, count: 0 };
    const sheets = await getSheetsClient();

    // Populate row cache once from Column A
    await findRowNumberByStudentId(sheets, "warmup-probe", true);

    let count = 0;
    for (const app of applications) {
      if (!app || !app.studentId) continue;
      const cleanId = String(app.studentId).trim().toLowerCase();
      // Only insert if completely missing from sheet
      if (!studentRowCache.has(cleanId)) {
        await syncNewApplicationToSheet(app);
        count++;
      }
    }

    if (count > 0) {
      console.log(`[GoogleSheet] Synced ${count} missing applications in ${Date.now() - startTime}ms`);
    }
    return { success: true, count };
  } catch (error) {
    console.error("[GoogleSheet] Bulk sync error:", error.message);
    return { success: false, error: error.message };
  }
};

export default {
  syncNewApplicationToSheet,
  syncUpdatedApplicationToSheet,
  syncAuthorityStatusToSheet,
  syncAllApplicationsToSheet,
};
