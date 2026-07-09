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
      // Set fixed dimensions for high quality
      canvas.width = 800;
      canvas.height = 350; // Aspect ratio of SVG approx 326x142
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
  doc.text("Harvey Prince Organics", 14, 52);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("New York, NY", 14, 58);
  doc.text("U.S.A.", 14, 63);
  doc.text("www.harveyprince.com", 14, 68);
  doc.text("contact@harveyprince.com", 14, 73);

  // Document Title (Right Aligned)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(24);
  const titleWidth = doc.getTextWidth(documentType);
  doc.text(documentType, 196 - titleWidth, 30);

  // Reference Numbers
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  if (documentType === "Commercial Invoice" && documentData.invoice_id) {
    const invNoStr = `Invoice #: INV-${documentData.invoice_id}`;
    doc.text(invNoStr, 196 - doc.getTextWidth(invNoStr), 38);
    const refNoStr = `Order Ref: ${documentData.order_number}`;
    doc.text(refNoStr, 196 - doc.getTextWidth(refNoStr), 44);
  } else if (documentData.order_number) {
    const refNoStr = `Order Ref: ${documentData.order_number}`;
    doc.text(refNoStr, 196 - doc.getTextWidth(refNoStr), 38);
  }

  // Balance Due (Right Aligned)
  doc.setFontSize(10);
  doc.text("Balance Due", 196 - doc.getTextWidth("Balance Due"), 54);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  const totalAmountStr = `Rs. ${Number(documentData.total_amount).toFixed(2)}`;
  doc.text(totalAmountStr, 196 - doc.getTextWidth(totalAmountStr), 62);
  doc.setFont("helvetica", "normal");

  // Bill To
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("Bill To", 14, 95);
  doc.setFont("helvetica", "normal");
  doc.text(documentData.customer_name || "Client Name", 14, 101);
  doc.text(documentData.po_number || "N/A", 14, 106);

  // Ship To & Dates
  doc.setFont("helvetica", "bold");
  doc.text("Ship To", 14, 120);
  doc.setFont("helvetica", "normal");
  doc.text("Same as Billing", 14, 126);

  // Document Details (Right aligned block)
  const detailX = 140;
  const valX = 196;
  
  const drawRightAligned = (label, value, y) => {
    doc.text(label, detailX, y);
    doc.text(value, valX - doc.getTextWidth(value), y);
  };

  const formattedDate = new Date(documentData.order_date || documentData.invoice_date || new Date()).toLocaleDateString();

  drawRightAligned("Date :", formattedDate, 120);
  drawRightAligned("Terms :", "Due on Receipt", 126);
  drawRightAligned("Due Date :", formattedDate, 132);

  // Items Table
  const tableColumn = ["#", "SAP #", "UPC #", "Item & Description", "Qty", "Unit Cost", "Amount"];
  const tableRows = [];

  // Assuming itemsData is an array of objects
  if (itemsData && itemsData.length > 0) {
    itemsData.forEach((item, index) => {
      const rowData = [
        index + 1,
        item.sap_no || 'N/A',
        item.upc_no || 'N/A',
        item.product_name,
        `${item.total_units} pcs`,
        `Rs. ${Number(item.unit_price).toFixed(2)}`,
        `Rs. ${Number(item.sub_total).toFixed(2)}`
      ];
      tableRows.push(rowData);
    });
  } else {
    // Premium fallback if items are missing for any reason
    tableRows.push([
      "1",
      "-",
      "-",
      `Consolidated Order Items (${documentData.order_number})`,
      "1 Lot",
      `Rs. ${Number(documentData.total_amount).toFixed(2)}`,
      `Rs. ${Number(documentData.total_amount).toFixed(2)}`
    ]);
  }

  autoTable(doc, {
    startY: 145,
    head: [tableColumn],
    body: tableRows,
    theme: 'grid',
    headStyles: { fillColor: [40, 40, 40], textColor: [255, 255, 255] },
    alternateRowStyles: { fillColor: [250, 250, 250] },
    styles: { font: "helvetica", fontSize: 9 },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      4: { halign: 'right' },
      5: { halign: 'right' },
      6: { halign: 'right' }
    }
  });

  // Open PDF in a new tab for preview
  const pdfBlob = doc.output('blob');
  const blobUrl = URL.createObjectURL(pdfBlob);
  window.open(blobUrl, '_blank');
};
