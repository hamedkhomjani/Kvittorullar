// --- 1. INVENTORY LOGIC (Do NOT remove this if you want products to load) ---
function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  // Try to find a sheet named "Products" or "Inventory"
  var sheet = ss.getSheetByName("Products") || ss.getSheetByName("Inventory");
  
  // Fallback: If no specific sheet found, use the very first sheet
  if (!sheet) {
    sheet = ss.getSheets()[0];
  }
  
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var products = [];
  
  // Convert rows to array of objects
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      // Create keys like "name_en", "price_box", etc.
      obj[headers[j]] = row[j];
    }
    // Add internal row index (optional but useful)
    obj['rowIndex'] = i + 1;
    products.push(obj);
  }
  
  return ContentService.createTextOutput(JSON.stringify(products))
    .setMimeType(ContentService.MimeType.JSON);
}

// --- 2. ORDER LOGIC (Your custom code) ---
function doPost(e) {
  var lock = LockService.getScriptLock();
  // Wait up to 10 seconds for other processes to finish
  lock.tryLock(10000);
  
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var data = e.parameter;
    
    // 1. Get Month and Year
    var timestamp = new Date();
    var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var sheetName = monthNames[timestamp.getMonth()] + " " + timestamp.getFullYear();
    
    // 2. Find or Create sheet for that Month
    var sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      // Create Headers if new sheet
      var headers = ["Tidstämpel", "Status", "Typ", "Ordernummer", "Detaljer", "Kundnamn", "E-post", "Telefon", "Adress", "Stad", "Betalningsmetod", "Totalbelopp"];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f3f3");
      // Freeze header row
      sheet.setFrozenRows(1);
    }
    
    // 3. Log the Data
    var formType = data['Order Number'] ? "Beställning" : "Kontaktförfrågan";
    
    // Fallback for form source if not order number
    if (!data['Order Number'] && data['FormSource']) {
        formType = data['FormSource'];
    }

    var phoneVal = data['phone'] || "N/A";
    // Prepend a single quote to treat as text (Fixes #ERROR! in Google Sheets)
    if (phoneVal !== "N/A") phoneVal = "'" + phoneVal;

    sheet.appendRow([
      timestamp,
      data['Status'] || "New",
      formType,
      data['Order Number'] || "N/A",
      data['Order Details'] || data['message'] || "N/A",
      data['name'] || "N/A",
      data['email'] || "N/A",
      phoneVal,
      data['address'] || "N/A",
      data['city'] || "N/A",
      data['payment'] || "N/A",
      data['Total Amount'] || "N/A"
    ]);
    
    // 4. Formatting
    var lastRow = sheet.getLastRow();
    var range = sheet.getRange(lastRow, 1, 1, 12);
    range.setWrap(true);
    range.setVerticalAlignment("top");
    // This line adjusts the row height automatically based on content
    sheet.autoResizeRows(lastRow, 1);
    
    return ContentService.createTextOutput(JSON.stringify({"result": "success", "sheet": sheetName}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"result": "error", "error": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// --- 3. INVOICE GENERATOR (Swedish Standard) ---

/**
 * Adds a custom menu to the spreadsheet.
 */
function onOpen() {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('🚀 NordicRoll Tools')
      .addItem('Generate Invoice for Selected Row', 'createInvoiceFromRow')
      .addToUi();
}

/**
 * Generates a PDF invoice based on the currently selected row.
 */
function createInvoiceFromRow() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getActiveSheet();
  var currentRow = sheet.getActiveCell().getRow();
  
  if (currentRow < 2) {
    SpreadsheetApp.getUi().alert("Please select a row with order data.");
    return;
  }
  
  var data = sheet.getRange(currentRow, 1, 1, 12).getValues()[0];
  
  // Mapping data from your sheet columns
  var invoiceData = {
    date: Utilities.formatDate(new Date(data[0]), "GMT+1", "yyyy-MM-dd"),
    orderNum: data[3],
    details: data[4],
    clientName: data[5],
    clientEmail: data[6],
    clientPhone: data[7],
    clientAddress: data[8],
    clientCity: data[9],
    total: data[11],
    dueDate: Utilities.formatDate(new Date(new Date().getTime() + 14 * 24 * 60 * 60 * 1000), "GMT+1", "yyyy-MM-dd") // 14 days net
  };

  // --- BUSINESS DETAILS (Change these to yours!) ---
  var myCompany = {
    name: "NordicRoll AB",
    orgNum: "55XXXX-XXXX",
    vatNum: "SE55XXXXXXXX01",
    address: "Storgatan 1, 111 22 Stockholm",
    email: "billing@nordicroll.com",
    bankgiro: "123-4567",
    swish: "123 456 78 90"
  };

  var htmlBody = `
    <div style="font-family: Arial, sans-serif; padding: 40px; color: #333; line-height: 1.5;">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td><h1 style="color: #1d4ed8; margin: 0; font-size: 28px;">FAKTURA</h1></td>
          <td style="text-align: right; font-size: 14px;">
            <strong style="font-size: 18px;">${myCompany.name}</strong><br>
            ${myCompany.address}<br>
            Org.nr: ${myCompany.orgNum}<br>
            VAT: ${myCompany.vatNum}
          </td>
        </tr>
      </table>
      
      <hr style="margin: 30px 0; border: 0; border-top: 2px solid #eee;">
      
      <table style="width: 100%; margin-bottom: 40px;">
        <tr>
          <td style="width: 50%; vertical-align: top;">
            <strong style="color: #64748b; font-size: 12px; text-transform: uppercase;">Faktureras till:</strong><br>
            <div style="font-size: 15px; margin-top: 5px;">
              <strong>${invoiceData.clientName}</strong><br>
              ${invoiceData.clientAddress}<br>
              ${invoiceData.clientCity}<br>
              ${invoiceData.clientEmail}
            </div>
          </td>
          <td style="text-align: right; vertical-align: top; font-size: 14px;">
            <strong>Fakturanummer:</strong> ${invoiceData.orderNum}<br>
            <strong>Fakturadatum:</strong> ${invoiceData.date}<br>
            <strong>Förfallodatum:</strong> ${invoiceData.dueDate}<br>
            <strong>Betalningsvillkor:</strong> 14 dagar
          </td>
        </tr>
      </table>
      
      <table style="width: 100%; margin-top: 20px; border-collapse: collapse;">
        <thead>
          <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
            <th style="text-align: left; padding: 12px; font-size: 14px;">Beskrivning</th>
            <th style="text-align: right; padding: 12px; font-size: 14px;">Belopp (inkl. moms)</th>
          </tr>
        </thead>
        <tbody>
          <tr style="border-bottom: 1px solid #eee;">
            <td style="padding: 15px 12px; white-space: pre-line; font-size: 14px;">${invoiceData.details}</td>
            <td style="text-align: right; padding: 15px 12px; font-size: 14px; font-weight: bold;">${invoiceData.total}</td>
          </tr>
        </tbody>
      </table>
      
      <div style="margin-top: 30px; text-align: right;">
        <table style="width: auto; margin-left: auto; border-collapse: collapse;">
          <tr>
            <td style="padding: 5px 10px; text-align: right; color: #64748b;">Totalt exkl. moms:</td>
            <td style="padding: 5px 10px; text-align: right;">${(parseFloat(invoiceData.total) / 1.25).toFixed(2)} kr</td>
          </tr>
          <tr>
            <td style="padding: 5px 10px; text-align: right; color: #64748b;">Moms (25%):</td>
            <td style="padding: 5px 10px; text-align: right;">${(parseFloat(invoiceData.total) - (parseFloat(invoiceData.total) / 1.25)).toFixed(2)} kr</td>
          </tr>
          <tr style="font-size: 20px; font-weight: bold; color: #1d4ed8;">
            <td style="padding: 10px; text-align: right; border-top: 2px solid #1d4ed8;">Att betala:</td>
            <td style="padding: 10px; text-align: right; border-top: 2px solid #1d4ed8;">${invoiceData.total}</td>
          </tr>
        </table>
      </div>
      
      <div style="margin-top: 100px; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 12px; color: #475569;">
        <table style="width: 100%;">
          <tr>
            <td style="width: 33%;">
              <strong>Företagsinformation</strong><br>
              ${myCompany.name}<br>
              ${myCompany.address}
            </td>
            <td style="width: 33%; text-align: center;">
              <strong>Betalningsinformation</strong><br>
              Bankgiro: ${myCompany.bankgiro}<br>
              Swish: ${myCompany.swish}
            </td>
            <td style="width: 33%; text-align: right; vertical-align: bottom;">
              Godkänd för F-skatt
            </td>
          </tr>
        </table>
      </div>
    </div>
  `;

  var blob = Utilities.newBlob(htmlBody, 'text/html', 'Invoice-' + invoiceData.orderNum + '.html');
  var pdf = DriveApp.createFile(blob.getAs('application/pdf')).setName('Invoice-' + invoiceData.orderNum + '.pdf');
  
  SpreadsheetApp.getUi().alert("Invoice created successfully in your Google Drive!\\nName: " + pdf.getName());
}
