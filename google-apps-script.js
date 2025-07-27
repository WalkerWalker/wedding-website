/**
 * Google Apps Script for Wedding RSVP Email Processing
 * 
 * This script monitors Gmail for RSVP emails from EmailJS
 * and automatically populates a Google Sheets spreadsheet
 * with one row per person (main contact + each plus-one)
 * 
 * Setup Instructions:
 * 1. Create a new Google Sheets document for RSVP responses
 * 2. Note the Sheets ID from the URL
 * 3. Go to script.google.com and create a new project
 * 4. Paste this code and update the SHEET_ID
 * 5. Set up a time-driven trigger to run processRSVPEmails() every 5-10 minutes
 */

// Configuration - UPDATE THESE VALUES
const SHEET_ID = '1MSFDGq1rO45bLdMTjhiXWZEjD3-R8azFiTghApYjbzY'; // Get from Google Sheets URL
const SHEET_NAME = 'Wedding RSVP Responses'; // Name of the sheet tab
const EMAIL_SEARCH_QUERY = 'subject:"New Wedding RSVP from"'; // Gmail search query

/**
 * Main function to process RSVP emails
 * Set this to run automatically with a time-driven trigger
 */
function processRSVPEmails() {
  console.log('Starting RSVP email processing...');
  
  try {
    // Search for unread RSVP emails
    const threads = GmailApp.search(EMAIL_SEARCH_QUERY + ' is:unread', 0, 50);
    console.log(`Found ${threads.length} unread RSVP emails`);
    
    if (threads.length === 0) {
      console.log('No new RSVP emails to process');
      return;
    }
    
    // Get the spreadsheet
    const sheet = getOrCreateSheet();
    
    // Process each email thread
    for (const thread of threads) {
      const messages = thread.getMessages();
      
      for (const message of messages) {
        if (message.isUnread()) {
          try {
            processRSVPEmail(message, sheet);
            message.markRead(); // Mark as read after successful processing
          } catch (error) {
            console.error(`Error processing message: ${error.message}`);
            // Don't mark as read if there was an error
          }
        }
      }
    }
    
    console.log('RSVP email processing completed');
    
  } catch (error) {
    console.error(`Error in processRSVPEmails: ${error.message}`);
  }
}

/**
 * Process a single RSVP email and add to spreadsheet
 */
function processRSVPEmail(message, sheet) {
  const body = message.getPlainBody();
  const htmlBody = message.getBody();
  const subject = message.getSubject();
  const date = message.getDate();
  
  console.log(`Processing email: ${subject}`);
  
  // Try to extract structured data from HTML body first (hidden div)
  let dataMatch = htmlBody.match(/RSVP-DATA-START\s*([\s\S]*?)\s*RSVP-DATA-END/);
  
  // If not found in HTML, try plain text body
  if (!dataMatch) {
    dataMatch = body.match(/RSVP-DATA-START\s*([\s\S]*?)\s*RSVP-DATA-END/);
  }
  
  // If still not found, try to parse from visible email content
  if (!dataMatch) {
    console.log('No structured data found, parsing from visible content');
    parseFromVisibleContent(body, sheet, subject, date);
    return;
  }
  
  const dataSection = dataMatch[1];
  const rsvpData = parseRSVPData(dataSection);
  
  // Add timestamp and email metadata
  rsvpData.email_received_date = date;
  rsvpData.email_subject = subject;
  
  // Create rows for main contact and each plus-one
  createPersonRows(sheet, rsvpData);
  
  console.log(`Successfully processed RSVP from ${rsvpData.main_contact_name}`);
}

/**
 * Parse from visible email content when structured data is missing
 */
function parseFromVisibleContent(body, sheet, subject, date) {
  const lines = body.split('\n');
  const data = {};
  
  // Extract main contact name from subject
  const nameMatch = subject.match(/New Wedding RSVP from (.+)/);
  data.main_contact_name = nameMatch ? nameMatch[1] : 'Unknown';
  
  // Parse visible content
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.includes('Email:')) {
      data.main_contact_email = trimmed.replace('Email:', '').trim();
    } else if (trimmed.includes('Attending:')) {
      data.attendance = trimmed.replace('Attending:', '').trim();
    } else if (trimmed.includes('#1 Plus-One:')) {
      const parts = trimmed.replace('#1 Plus-One:', '').split(' - ');
      data.plus_one_1_name = parts[0]?.trim() || '';
      data.plus_one_1_notes = parts[1]?.trim() || '';
    } else if (trimmed.includes('#2 Plus-One:')) {
      const parts = trimmed.replace('#2 Plus-One:', '').split(' - ');
      data.plus_one_2_name = parts[0]?.trim() || '';
      data.plus_one_2_notes = parts[1]?.trim() || '';
    } else if (trimmed.includes('#3 Plus-One:')) {
      const parts = trimmed.replace('#3 Plus-One:', '').split(' - ');
      data.plus_one_3_name = parts[0]?.trim() || '';
      data.plus_one_3_notes = parts[1]?.trim() || '';
    } else if (trimmed.includes('General Notes:')) {
      data.general_notes = trimmed.replace('General Notes:', '').trim();
    }
  }
  
  data.email_received_date = date;
  data.email_subject = subject;
  
  // Create rows for main contact and each plus-one
  createPersonRows(sheet, data);
  
  console.log(`Parsed from visible content: ${data.main_contact_name}`);
}

/**
 * Parse the structured RSVP data from email
 */
function parseRSVPData(dataText) {
  const data = {};
  const lines = dataText.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && trimmed.includes(':')) {
      const [key, ...valueParts] = trimmed.split(':');
      const value = valueParts.join(':').trim();
      
      // Clean up the key (remove spaces, convert to lowercase)
      const cleanKey = key.trim().toLowerCase().replace(/\s+/g, '_');
      data[cleanKey] = value;
    }
  }
  
  return data;
}

/**
 * Create one row per person (main contact + each plus-one)
 */
function createPersonRows(sheet, data) {
  const baseData = {
    main_contact: data.main_contact_name || '',
    email: data.main_contact_email || '',
    attendance: data.attendance || '',
    email_received: data.email_received_date || new Date(),
    email_subject: data.email_subject || '',
    timestamp: data.timestamp || ''
  };
  
  // Add main contact row (with general notes in the notes column)
  const mainContactRow = [
    baseData.main_contact,      // Main Contact
    baseData.email,             // Email  
    baseData.attendance,        // Attendance
    baseData.main_contact,      // Person Name
    'Main Contact',             // Person Type
    data.general_notes || '',   // Notes (include general notes here)
    baseData.timestamp,         // Timestamp
    baseData.email_received,    // Email Received
    baseData.email_subject      // Email Subject
  ];
  
  sheet.appendRow(mainContactRow);
  console.log(`Added main contact: ${baseData.main_contact}`);
  
  // Add plus-one rows
  for (let i = 1; i <= 3; i++) {
    const plusOneName = data[`plus_one_${i}_name`] || '';
    const plusOneNotes = data[`plus_one_${i}_notes`] || '';
    
    if (plusOneName.trim()) {
      const plusOneRow = [
        baseData.main_contact,      // Main Contact
        baseData.email,             // Email
        baseData.attendance,        // Attendance  
        plusOneName,                // Person Name
        `Plus-One #${i}`,          // Person Type
        plusOneNotes,               // Notes
        baseData.timestamp,         // Timestamp
        baseData.email_received,    // Email Received
        baseData.email_subject      // Email Subject
      ];
      
      sheet.appendRow(plusOneRow);
      console.log(`Added plus-one #${i}: ${plusOneName}`);
    }
  }
}

/**
 * Get or create the RSVP spreadsheet and set up headers
 */
function getOrCreateSheet() {
  const spreadsheet = SpreadsheetApp.openById(SHEET_ID);
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    // Create the sheet if it doesn't exist
    sheet = spreadsheet.insertSheet(SHEET_NAME);
  }
  
  // Check if headers exist (check if A1 is empty)
  if (!sheet.getRange('A1').getValue()) {
    // Add headers for one-row-per-person structure
    const headers = [
      'Main Contact',    // A
      'Email',          // B  
      'Attendance',     // C
      'Person Name',    // D
      'Person Type',    // E
      'Notes',          // F
      'Timestamp',      // G
      'Email Received', // H
      'Email Subject'   // I
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Format the header row
    sheet.getRange(1, 1, 1, headers.length)
      .setFontWeight('bold')
      .setBackground('#4285f4')
      .setFontColor('white');
    
    console.log('Created new RSVP sheet with headers');
  }
  
  return sheet;
}

/**
 * Setup function - run this once to configure the script
 */
function setupRSVPProcessor() {
  console.log('Setting up RSVP email processor...');
  
  // Test access to Gmail and Sheets
  try {
    const testThreads = GmailApp.search('in:inbox', 0, 1);
    console.log('Gmail access: OK');
  } catch (error) {
    console.error('Gmail access failed:', error.message);
    return;
  }
  
  try {
    const sheet = getOrCreateSheet();
    console.log('Sheets access: OK');
  } catch (error) {
    console.error('Sheets access failed:', error.message);
    return;
  }
  
  // Create time-driven trigger to run every 5 minutes
  ScriptApp.newTrigger('processRSVPEmails')
    .timeBased()
    .everyMinutes(5)
    .create();
  
  console.log('Setup completed! RSVP processor will run every 5 minutes.');
  console.log('You can also run processRSVPEmails() manually to test.');
}

/**
 * Test function to verify email parsing with new format
 */
function testEmailParsing() {
  const sampleEmailBody = `
Wedding RSVP from Jiamin

Email: hello@jiamin.io

Attending: go

Submitted: 2025-07-27T16:22:29.163Z

#1 Plus-One: guest 1 - none

#2 Plus-One: guest 2 - none

#3 Plus-One: guest 3 - none

General Notes: dsf test with new forms

Email sent via EmailJS.com
  `;
  
  console.log('Testing email parsing with visible content...');
  
  // Test the visible content parser
  const sheet = getOrCreateSheet();
  parseFromVisibleContent(sampleEmailBody, sheet, 'New Wedding RSVP from Jiamin', new Date());
}

/**
 * Manual function to mark all RSVP emails as read (use carefully!)
 */
function markAllRSVPEmailsAsRead() {
  const threads = GmailApp.search(EMAIL_SEARCH_QUERY);
  console.log(`Found ${threads.length} RSVP emails`);
  
  for (const thread of threads) {
    thread.markRead();
  }
  
  console.log('Marked all RSVP emails as read');
}

/**
 * Clear all data and reset sheet (for testing)
 */
function resetSheet() {
  const sheet = getOrCreateSheet();
  sheet.clear();
  
  // Recreate headers
  const headers = [
    'Main Contact',
    'Email',
    'Attendance', 
    'Person Name',
    'Person Type',
    'Notes',
    'Timestamp',
    'Email Received',
    'Email Subject'
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length)
    .setFontWeight('bold')
    .setBackground('#4285f4')
    .setFontColor('white');
    
  console.log('Sheet reset with new headers');
}
