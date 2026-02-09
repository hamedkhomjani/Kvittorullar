---
description: How to connect your website forms to Google Sheets for free
---

Follow these steps to receive orders and messages directly in a Google Spreadsheet:

1. **Create a Google Sheet**:
   - Go to [Google Sheets](https://sheets.google.com) and create a new blank spreadsheet.
   - Name it "NordicRoll Orders".

2. **Open Script Editor**:
   - In your Google Sheet, go to **Extensions** > **Apps Script**.

3. **Paste the Script**:
   - Delete any code in the editor and paste the following:

```javascript
function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getActiveSheet();
    var data = e.parameter;
    
    // Add a timestamp
    var timestamp = new Date();
    
    // Prepare headers if the sheet is empty
    if (sheet.getLastRow() == 0) {
      var headers = ["Tidstämpel", "Status", "Typ", "Ordernummer", "Detaljer", "Kundnamn", "E-post", "Telefon", "Adress", "Stad", "Betalningsmetod", "Totalbelopp"];
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight("bold").setBackground("#f3f3f3");
    }
    
    // Determine if it's an order or a lead
    var formType = data['Order Number'] ? "Beställning" : "Kontaktförfrågan";
    
    sheet.appendRow([
      timestamp,
      data['Status'] || "New",
      formType,
      data['Order Number'] || "N/A",
      data['Order Details'] || data['message'] || "N/A",
      data['name'],
      data['email'],
      data['phone'],
      data['address'] || "N/A",
      data['city'] || "N/A",
      data['payment'] || "N/A",
      data['Total Amount'] || "N/A"
    ]);
    
    // Formatting: Enable text wrapping and vertical alignment only
    var lastRow = sheet.getLastRow();
    sheet.getRange(lastRow, 1, 1, 12).setWrap(true).setVerticalAlignment("top");
    
    return ContentService.createTextOutput(JSON.stringify({"result": "success"}))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({"result": "error", "error": error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}破
```

4. **Deploy the Script**:
   - Click **Deploy** > **New Deployment**.
   - Select type: **Web app**.
   - Description: "Form Handler".
   - Execute as: **Me** (your email).
   - Who has access: **Anyone**. (This is important so your website can send data).
   - Click **Deploy**.
   - Copy the **Web App URL** (it will look like `https://script.google.com/macros/s/.../exec`).

5. **Update Website**:
   - Paste the URL into your `checkout.html` and `script.js` where indicated.
