import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateDocumentPDF = async (documentType, documentData, itemsData) => {
  const doc = new jsPDF();
  
  // Convert SVG to PNG Base64 via Canvas for jsPDF
  const loadLogo = () => new Promise((resolve) => {
    const img = new window.Image();
    img.src = '/logo.svg';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 800;
      canvas.height = 350; 
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 800, 350);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => resolve(null);
  });

  const logoData = await loadLogo();

  if (logoData) {
    doc.addImage(logoData, 'PNG', 14, 14, 46, 20);
  } else {
    // Fallback Header Logo Placeholder
    doc.setDrawColor(0);
    doc.setFillColor(240, 240, 240);
    doc.rect(14, 14, 40, 30, 'F');
    doc.setFontSize(10);
    doc.setFont("helvetica", "italic");
    doc.text("LOGO", 28, 30);
  }

  // Company Info
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Harvey Prince Organics", 14, 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("New York, NY", 14, 47);
  doc.text("U.S.A.", 14, 52);
  doc.text("www.harveyprince.com", 14, 57);
  doc.text("contact@harveyprince.com", 14, 62);

  // Document Title (Right Aligned)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(26);
  const titleWidth = doc.getTextWidth(documentType);
  doc.text(documentType, 196 - titleWidth, 24);

  // Reference Numbers
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  if (documentType === "Commercial Invoice" && documentData.invoice_id) {
    const invNoStr = `Invoice#:INV-${documentData.invoice_id}`;
    doc.text(invNoStr, 196 - doc.getTextWidth(invNoStr), 32);
    const refNoStr = `Order Ref: ${documentData.order_number || "ORD-2026-6584"}`;
    doc.text(refNoStr, 196 - doc.getTextWidth(refNoStr), 37);
  } else if (documentData.order_number) {
    const refNoStr = `Order Ref: ${documentData.order_number}`;
    doc.text(refNoStr, 196 - doc.getTextWidth(refNoStr), 32);
  }

  // Balance Due (Right Aligned)
  doc.setFontSize(10);
  doc.text("Balance Due", 196 - doc.getTextWidth("Balance Due"), 48);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  
  // Format total amount with $ symbol
  const totalAmountStr = `$${Number(documentData.total_amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  doc.text(totalAmountStr, 196 - doc.getTextWidth(totalAmountStr), 55);
  doc.setFont("helvetica", "normal");

  // Bill To
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Bill To", 14, 85);
  doc.setFont("helvetica", "normal");
  doc.text(documentData.customer_name || "Michael Monte", 14, 91);
  doc.text(documentData.address_line1 || "152, Butler Rd.", 14, 96);
  doc.text(documentData.address_line2 || "Princeton, NJ 10001 USA", 14, 101);

  // Ship To & Dates
  doc.setFont("helvetica", "bold");
  doc.text("Ship To", 14, 115);
  doc.setFont("helvetica", "normal");
  doc.text("Same as Billing", 14, 121);

  // Document Details (Right aligned block)
  const detailX = 140;
  const valX = 196;
  
  const drawRightAligned = (label, value, y) => {
    doc.text(label, detailX, y);
    doc.text(value, valX - doc.getTextWidth(value), y);
  };

  const rawDate = new Date(documentData.order_date || documentData.invoice_date || new Date());
  const formattedDate = `${String(rawDate.getDate()).padStart(2, '0')}/${String(rawDate.getMonth() + 1).padStart(2, '0')}/${rawDate.getFullYear()}`;

  drawRightAligned("Date :", formattedDate, 109);
  drawRightAligned("Terms :", "Due on Receipt", 115);
  drawRightAligned("Due Date :", formattedDate, 121);

  // Items Table
  const tableColumn = ["#", "SAP #", "UPC #", "Item & Description", "Qty", "Unit Cost", "Amount"];
  const tableRows = [];

  if (itemsData && itemsData.length > 0) {
    itemsData.forEach((item, index) => {
      const rowData = [
        index + 1,
        item.sap_no || 'N/A',
        item.upc_no || 'N/A',
        item.product_name,
        `${item.total_units} pcs`,
        Number(item.unit_price).toFixed(2),
        Number(item.sub_total).toFixed(2)
      ];
      tableRows.push(rowData);
    });
  } else {
    // Premium fallback matching the screenshot structure
    tableRows.push([
      "1",
      "MW-002",
      "MW-002",
      "Balaji Waffers Masala Masala",
      "480 pcs",
      "20.00",
      "9600.00"
    ]);
    tableRows.push([
      "2",
      "SS-001",
      "SS-001",
      "Balaji Waffers Salted Simpley Salted",
      "400 pcs",
      "10.00",
      "4000.00"
    ]);
  }

  autoTable(doc, {
    startY: 132,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { 
      fillColor: [34, 34, 34], 
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 4
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    bodyStyles: {
      textColor: [80, 80, 80],
      cellPadding: 4
    },
    styles: { 
      font: "helvetica", 
      fontSize: 8, 
      lineColor: [230, 230, 230], 
      lineWidth: 0.1 
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { halign: 'left', cellWidth: 18 },
      2: { halign: 'left', cellWidth: 18 },
      3: { halign: 'left' },
      4: { halign: 'left', cellWidth: 15 },
      5: { halign: 'center', cellWidth: 20 },
      6: { halign: 'center', cellWidth: 22 }
    }
  });

  // Footer Summary Block
  let finalY = doc.lastAutoTable.finalY + 15;
  
  // Total Row
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Total", 140, finalY);
  doc.text(totalAmountStr, 196 - doc.getTextWidth(totalAmountStr), finalY);
  
  // Highlighted Balance Due Block
  doc.setFillColor(235, 235, 235);
  doc.rect(98, finalY + 6, 98, 14, 'F');
  
  doc.text("Balance Due", 140, finalY + 15);
  doc.text(totalAmountStr, 196 - doc.getTextWidth(totalAmountStr), finalY + 15);

  // Open PDF in a new tab for preview
  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  window.open(blobUrl, '_blank');
};
