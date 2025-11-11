import jsPDF from "jspdf";
import type { QuoteData } from "../types";
import { formatCurrency, formatDate } from "./utils";

export async function generatePDFQuote(quoteData: QuoteData) {
  const { project, materialItems, laborItems, serviceItems, total } = quoteData;

  const doc = new jsPDF();
  let yPosition = 20;

  // Header
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("CABINET QUOTE", 105, yPosition, { align: "center" });

  yPosition += 15;

  // Company Info (you can customize this)
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Your Cabinet Company", 105, yPosition, { align: "center" });
  yPosition += 5;
  doc.text("Phone: (555) 123-4567 | Email: info@cabinets.com", 105, yPosition, {
    align: "center",
  });

  yPosition += 15;

  // Quote Details
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("QUOTE DETAILS", 20, yPosition);

  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Project: ${project.projectName}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Date: ${formatDate(new Date())}`, 20, yPosition);

  yPosition += 12;

  // Client Details
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("CLIENT INFORMATION", 20, yPosition);

  yPosition += 8;
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Name: ${project.clientName}`, 20, yPosition);
  yPosition += 6;
  doc.text(`Phone: ${project.clientContact}`, 20, yPosition);
  if (project.clientEmail) {
    yPosition += 6;
    doc.text(`Email: ${project.clientEmail}`, 20, yPosition);
  }

  yPosition += 15;

  // Materials Section
  if (materialItems.length > 0) {
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("MATERIALS", 20, yPosition);
    yPosition += 8;

    // Table header
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Item", 20, yPosition);
    doc.text("Qty", 110, yPosition);
    doc.text("Unit", 130, yPosition);
    doc.text("Unit Cost", 150, yPosition);
    doc.text("Total", 180, yPosition);
    yPosition += 5;

    // Draw line
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 5;

    // Table rows
    doc.setFont("helvetica", "normal");
    materialItems.forEach((item) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.text(item.itemName, 20, yPosition);
      doc.text(item.quantity.toString(), 110, yPosition);
      doc.text(item.unit, 130, yPosition);
      doc.text(formatCurrency(item.unitCost), 150, yPosition);
      doc.text(formatCurrency(item.budgetAmount), 180, yPosition);
      yPosition += 6;

      if (item.description) {
        doc.setFontSize(8);
        doc.setTextColor(100);
        doc.text(item.description, 20, yPosition);
        doc.setTextColor(0);
        doc.setFontSize(9);
        yPosition += 5;
      }
    });

    yPosition += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Materials Subtotal:", 150, yPosition);
    doc.text(
      formatCurrency(materialItems.reduce((sum, item) => sum + item.budgetAmount, 0)),
      180,
      yPosition
    );
    yPosition += 10;
  }

  // Labor Section
  if (laborItems.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("LABOR", 20, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    doc.text("Item", 20, yPosition);
    doc.text("Qty", 110, yPosition);
    doc.text("Unit", 130, yPosition);
    doc.text("Unit Cost", 150, yPosition);
    doc.text("Total", 180, yPosition);
    yPosition += 5;

    doc.line(20, yPosition, 190, yPosition);
    yPosition += 5;

    doc.setFont("helvetica", "normal");
    laborItems.forEach((item) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.text(item.itemName, 20, yPosition);
      doc.text(item.quantity.toString(), 110, yPosition);
      doc.text(item.unit, 130, yPosition);
      doc.text(formatCurrency(item.unitCost), 150, yPosition);
      doc.text(formatCurrency(item.budgetAmount), 180, yPosition);
      yPosition += 6;
    });

    yPosition += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Labor Subtotal:", 150, yPosition);
    doc.text(
      formatCurrency(laborItems.reduce((sum, item) => sum + item.budgetAmount, 0)),
      180,
      yPosition
    );
    yPosition += 10;
  }

  // Services Section
  if (serviceItems.length > 0) {
    if (yPosition > 250) {
      doc.addPage();
      yPosition = 20;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("SERVICES", 20, yPosition);
    yPosition += 8;

    doc.setFontSize(9);
    doc.text("Item", 20, yPosition);
    doc.text("Qty", 110, yPosition);
    doc.text("Unit", 130, yPosition);
    doc.text("Unit Cost", 150, yPosition);
    doc.text("Total", 180, yPosition);
    yPosition += 5;

    doc.line(20, yPosition, 190, yPosition);
    yPosition += 5;

    doc.setFont("helvetica", "normal");
    serviceItems.forEach((item) => {
      if (yPosition > 270) {
        doc.addPage();
        yPosition = 20;
      }

      doc.text(item.itemName, 20, yPosition);
      doc.text(item.quantity.toString(), 110, yPosition);
      doc.text(item.unit, 130, yPosition);
      doc.text(formatCurrency(item.unitCost), 150, yPosition);
      doc.text(formatCurrency(item.budgetAmount), 180, yPosition);
      yPosition += 6;
    });

    yPosition += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Services Subtotal:", 150, yPosition);
    doc.text(
      formatCurrency(serviceItems.reduce((sum, item) => sum + item.budgetAmount, 0)),
      180,
      yPosition
    );
    yPosition += 10;
  }

  // Total
  if (yPosition > 260) {
    doc.addPage();
    yPosition = 20;
  }

  yPosition += 5;
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.line(20, yPosition, 190, yPosition);
  yPosition += 8;
  doc.text("GRAND TOTAL:", 150, yPosition);
  doc.text(formatCurrency(total), 180, yPosition);

  // Footer
  yPosition += 15;
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.text(
    "This quote is valid for 30 days from the date of issue.",
    105,
    yPosition,
    { align: "center" }
  );
  yPosition += 5;
  doc.text("Thank you for your business!", 105, yPosition, { align: "center" });

  // Save the PDF
  doc.save(`Quote_${project.projectName.replace(/\s+/g, "_")}_${Date.now()}.pdf`);
}
