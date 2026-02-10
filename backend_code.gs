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
