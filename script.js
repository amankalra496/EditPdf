pdfjsLib.GlobalWorkerOptions.workerSrc = 
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

// Stock array with initial quantities of 0
let stockArray = {
  "dohar olive": 0,
"Purple Fitted": 0,
""
};

// Hardcoded SKU to stock mapping
const skuToStockMapping = {
  // Example mappings - modify these according to your actual SKUs
  'Purple Fitted': {
    "Fitted Purple": 1
  },
  'Purple 60x78': {
    "60x78 Purple": 1
  },
  'Purple 36x78': {
    "36x78 Purple": 1
  },
  '2pc box,foot,grey,pista': {
    "pillow box": 2,
    "pillow foot": 2,
    "pillow grey": 2,
    "pillow pista": 2
  },
  'Florica Fitted': {
    "Fitted Florica": 1
  },
  'Harmony Fitted': {
    "Fitted Harmony": 1
  },
  'Graphix 60x78': {
    "60x78 Graphix": 1
  },
  'Harmony 60x78': {
    "60x78 Harmony": 1
  },
  'Florica 36x78': {
    "36x78 Florica": 1
  },
  'Graphix 36x78': {
    "36x78 Graphix": 1
  },
  'Florica 60x78': {
    "60x78 Florica": 1
  },
  'Harmony 36x78': {
    "36x78 Harmony": 1
  },
  'CubeBrwon Fitted': {
    "Fitted CubeBrwon": 1
  },
  'CubeBrown 60x78': {
    "60x78 CubeBrown": 1
  },
  'Olive 36x78': {
    "36x78 Olive": 1
  },
  'GeoFusion 36x78': {
    "36x78 GeoFusion": 1
  },
  'Olive 60x78': {
    "60x78 Olive": 1
  },
  'GeoFusion Fitted': {
    "Fitted GeoFusion": 1
  },
  'GeoFusion 60x78': {
    "60x78 GeoFusion": 1
  },
  'Olive Fitted': {
    "Fitted Olive": 1
  },
  'Beige 60x78': {
    "60x78 Beige": 1
  },
  'Beige Fitted': {
    "Fitted Beige": 1
  },
  'Beige 36x78': {
    "36x78 Beige": 1
  },
  'Vintage 60x78': {
    "60x78 Vintage": 1
  },
  'Linear 60x78': {
    "60x78 Linear": 1
  },
  'Silver Fitted': {
    "Fitted Silver": 1
  },
  'Silver 36x78': {
    "36x78 Silver": 1
  },
  'Vintage Fitted': {
    "Fitted Vintage": 1
  },
  'Cube 36x78': {
    "36x78 Cube": 1
  },
  'Vintage 36x78': {
    "36x78 Vintage": 1
  },
  'Cube 60x78': {
    "60x78 Cube": 1
  },
  'Cube Fitted': {
    "Fitted Cube": 1
  },
  'Linear Fitted': {
    "Fitted Linear": 1
  },
  'Linear 36x78': {
    "36x78 Linear": 1
  },
  'Silver 60x78': {
    "60x78 Silver": 1
  }
  // Add more SKU mappings here as needed
};

// Initialize file handling when DOM loads
document.addEventListener('DOMContentLoaded', function() {
  // Enhanced file input handling
  document.getElementById('upload').addEventListener('change', function(e) {
    const fileName = e.target.files[0]?.name;
    const fileNameDiv = document.getElementById('fileName');
    const processBtn = document.getElementById('processBtn');
    
    if (fileName) {
      fileNameDiv.textContent = `Selected: ${fileName}`;
      fileNameDiv.style.display = 'block';
      processBtn.disabled = false;
    } else {
      fileNameDiv.style.display = 'none';
      processBtn.disabled = true;
    }
  });
});

// Add loading state management
function setLoadingState(isLoading) {
  const processBtn = document.getElementById('processBtn');
  if (isLoading) {
    processBtn.classList.add('loading');
    processBtn.disabled = true;
  } else {
    processBtn.classList.remove('loading');
    processBtn.disabled = false;
  }
}

async function processPDF() {
  const fileInput = document.getElementById("upload");
  if (!fileInput.files.length) {
    alert("Please upload a PDF file.");
    return;
  }
  
  // Set loading state
  setLoadingState(true);
  
  const file = fileInput.files[0];
  const arrayBuffer = await file.arrayBuffer();
  const pdfLibDoc = await PDFLib.PDFDocument.load(arrayBuffer);
  const pdfJsDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pages = pdfLibDoc.getPages();
  
  // Reset stock array to 0
  for (let key in stockArray) {
    stockArray[key] = 0;
  }
  
  console.log('pages >>> ', pages);
  console.log('Initial stock array:', stockArray);
  
  for (let i = 1; i < pdfJsDoc.numPages; i += 2) {
    const pageTextContent = await pdfJsDoc.getPage(i + 1).then(p => p.getTextContent());
    const text = pageTextContent.items.map(item => item.str).join(" ");
    console.log('text >>> ', text);
    
    // Find all SKU matches on this specific detail page
    const skuMatches = text.match(/\(\s*([^)]+?)\s*\)\s*HSN/gi);
    const orderItemsOnThisPage = [];
    
    if (skuMatches) {
      for (const match of skuMatches) {
        const skuMatch = match.match(/\(\s*([^)]+?)\s*\)\s*HSN/i);
        if (skuMatch) {
          const sku = skuMatch[1].trim();
          
          // Find quantity for this SKU - look for quantity in table structure
          // Pattern: HSN:#### ₹price qty ₹total
          const hsnPattern = new RegExp(`HSN:\\d+\\s+₹[\\d,\\.]+\\s+(\\d+)`, 'i');
          const qtyMatch = text.match(hsnPattern);
          
          let qty = null;
          if (qtyMatch) {
            qty = qtyMatch[1];
          } else {
            // Fallback to original method
            const allNumbers = text.match(/\d+/g);
            const qtyIndex = text.search(/Qty/i);
            if (qtyIndex !== -1 && allNumbers) {
              const afterQty = text.substring(qtyIndex);
              const nextNumberMatch = afterQty.match(/\d+/);
              if (nextNumberMatch) {
                qty = nextNumberMatch[0];
              }
            }
          }
          
          console.log(`Found SKU: ${sku}, Quantity: ${qty}`);
          
          if (qty) {
            const orderQty = parseInt(qty);
            orderItemsOnThisPage.push({
              sku: sku,
              qty: orderQty
            });
            
            // Process stock requirements based on SKU mapping
            if (skuToStockMapping[sku]) {
              console.log(`Processing SKU: ${sku} with quantity: ${orderQty}`);
              
              for (const [stockItem, baseQty] of Object.entries(skuToStockMapping[sku])) {
                const totalToAdd = baseQty * orderQty;
                stockArray[stockItem] += totalToAdd;
                
                console.log(`Added ${totalToAdd} to ${stockItem} (base: ${baseQty} * order qty: ${orderQty})`);
              }
            } else {
              console.log(`No stock mapping found for SKU: ${sku}`);
            }
          }
        }
      }
    }
    
    console.log(`Page ${i + 1} has ${orderItemsOnThisPage.length} order items:`, orderItemsOnThisPage);
    
    // Continue with original barcode page logic
    if (orderItemsOnThisPage.length > 0) {
      const barcodePageIndex = i - 1;
      const barcodePage = pages[barcodePageIndex];
      console.log('printing on page index:', barcodePageIndex);
      
      if (barcodePage) {
        const { width, height } = barcodePage.getSize();
        const font = await pdfLibDoc.embedFont(PDFLib.StandardFonts.HelveticaBold);
        const textY = 180;
        const textX = 60;
        
        let insertText;
        let fontSize;
        
        if (orderItemsOnThisPage.length > 1) {
          // Multiple order items on this specific page - print 'Multi' ONLY
          insertText = 'Multi';
          fontSize = 16;
          
          console.log(`Placing text "${insertText}" at x: ${textX}, y: ${textY}, page height: ${height}, fontSize: ${fontSize}`);
          
          barcodePage.drawText(insertText, {
            x: textX,
            y: textY,
            size: fontSize,
            font: font,
            color: PDFLib.rgb(0, 0, 0)
          });
        } else {
          // Single order item on this page - check quantity
          const item = orderItemsOnThisPage[0];
          
          if (item.qty > 1) {
            // Draw quantity in larger font, then " * SKU" in normal font
            const qtyText = item.qty.toString();
            const restText = ` * ${item.sku}`;
            
            // Draw quantity in larger font
            barcodePage.drawText(qtyText, {
              x: textX,
              y: textY,
              size: 20,
              font: font,
              color: PDFLib.rgb(0, 0, 0)
            });
            
            // Calculate width of quantity text to position the rest
            const qtyWidth = font.widthOfTextAtSize(qtyText, 18);
            
            // Draw " * SKU" in normal font
            barcodePage.drawText(restText, {
              x: textX + qtyWidth,
              y: textY,
              size: 16,
              font: font,
              color: PDFLib.rgb(0, 0, 0)
            });
            
            console.log(`Placing quantity "${qtyText}" (size 18) and "${restText}" (size 12) at x: ${textX}, y: ${textY}`);
          } else {
            // Quantity is 1, draw normally
            insertText = `${item.qty} * ${item.sku}`;
            barcodePage.drawText(insertText, {
              x: textX,
              y: textY,
              size: 12,
              font: font,
              color: PDFLib.rgb(0, 0, 0)
            });
            
            console.log(`Placing text "${insertText}" at x: ${textX}, y: ${textY}, fontSize: 12`);
          }
        }
      }
    }
  }
  
  // Display final stock array
  displayStockArray();
  
  const modifiedPdfBytes = await pdfLibDoc.save();
  const blob = new Blob([modifiedPdfBytes], { type: "application/pdf" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "updated.pdf";
  link.click();
  
  // Remove loading state
  setLoadingState(false);
}

function displayStockArray() {
  const resultsDiv = document.getElementById('results');
  
  // Define the custom sort order
  const sortOrder = [
    "1+1", "1+2", "fitted", "60x78", "36x78", "72x72",
    "Dohar Single", "Dohar", "Set", 
    "Com Double", "Com Single"
  ];
  
  // Filter out items with zero quantity
  const filteredStock = Object.entries(stockArray).filter(([item, qty]) => qty > 0);
  
  // Sort according to the custom order
  filteredStock.sort(([itemA], [itemB]) => {
    const indexA = sortOrder.findIndex(order => itemA.toLowerCase().includes(order.toLowerCase()));
    const indexB = sortOrder.findIndex(order => itemB.toLowerCase().includes(order.toLowerCase()));
    
    // If both items match the sort order, use their order index
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB;
    }
    
    // If only one matches, put the matching one first
    if (indexA !== -1) return -1;
    if (indexB !== -1) return 1;
    
    // If neither matches, sort alphabetically
    return itemA.localeCompare(itemB);
  });
  
  let html = '<h3><i class="fas fa-chart-bar"></i> Stock Summary</h3>';
  
  if (filteredStock.length === 0) {
    html += '<div class="no-items"><i class="fas fa-info-circle"></i> No items with quantity greater than 0</div>';
  } else {
    // Create copyable text format
    let copyText = "📦 Stock Summary:\n";
    for (const [stockItem, quantity] of filteredStock) {
      copyText += `• ${stockItem} -- ${quantity}\n`;
    }
    
    html += '<div class="stock-grid">';
    for (const [stockItem, quantity] of filteredStock) {
      html += `
        <div class="stock-item">
          <span class="stock-name">${stockItem}</span>
          <span class="stock-quantity">${quantity}</span>
        </div>
      `;
    }
    html += '</div>';
    
    // Add copyable text area
    html += `
      <div class="copy-section">
        <h4><i class="fas fa-copy"></i> Copy for WhatsApp</h4>
        <textarea id="copyText" class="copy-textarea" readonly>${copyText}</textarea>
        <button class="copy-btn" onclick="copyToClipboard()">
          <i class="fas fa-copy"></i> Copy Text
        </button>
      </div>
    `;
  }
  
  resultsDiv.innerHTML = html;
  resultsDiv.classList.add('show');
  
  console.log('Filtered and Sorted Stock Array:', filteredStock);
  console.log('Full Stock Array:', stockArray);
}

function copyToClipboard() {
  const copyText = document.getElementById('copyText');
  copyText.select();
  copyText.setSelectionRange(0, 99999); // For mobile devices
  
  try {
    document.execCommand('copy');
    
    // Visual feedback
    const copyBtn = document.querySelector('.copy-btn');
    const originalText = copyBtn.innerHTML;
    copyBtn.innerHTML = '<i class="fas fa-check"></i> Copied!';
    copyBtn.style.background = '#28a745';
    
    setTimeout(() => {
      copyBtn.innerHTML = originalText;
      copyBtn.style.background = '';
    }, 2000);
    
  } catch (err) {
    // Fallback for mobile
    copyText.focus();
    copyText.select();
    alert('Text selected! Press Ctrl+C (or Cmd+C on Mac) to copy, or long-press and select "Copy" on mobile.');
  }
}
