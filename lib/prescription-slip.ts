import { jsPDF } from "jspdf";

export interface PrescriptionSlipData {
  patientName: string;
  patientDob: string;
  patientGender: string;
  visitDate: string;
  doctorName: string;
  doctorSpecialization: string;
  doctorLicenseNumber: string;
  prescription: string;
  rxId: string;
  signedAt: string;
}

export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatSignedAt(date: Date | string): string {
  return new Date(date).toLocaleString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  });
}

export function buildRxId(appointmentId: string): string {
  return `MC-RX-${appointmentId.substring(0, 8).toUpperCase()}`;
}

export interface PrescriptionSlipSource {
  appointmentId: string;
  updatedAt: Date | string;
  prescription: string | null;
  timeSlotDate: Date | string;
  doctor: {
    user: { name: string | null };
    specialization: string;
    licenseNumber?: string | null;
  };
}

export function buildPrescriptionSlipData(
  source: PrescriptionSlipSource,
  patient: { name?: string | null; dob: string; gender: string }
): PrescriptionSlipData {
  const doctorName = source.doctor.user.name || "Unknown Provider";

  return {
    patientName: patient.name || "N/A",
    patientDob: patient.dob,
    patientGender: patient.gender,
    visitDate: new Date(source.timeSlotDate).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    }),
    doctorName,
    doctorSpecialization: source.doctor.specialization,
    doctorLicenseNumber: source.doctor.licenseNumber || "Not on file",
    prescription: source.prescription || "No prescription issued.",
    rxId: buildRxId(source.appointmentId),
    signedAt: formatSignedAt(source.updatedAt),
  };
}

export function buildPrescriptionSlipHtml(data: PrescriptionSlipData): string {
  const patientName = escapeHtml(data.patientName);
  const patientDob = escapeHtml(data.patientDob);
  const patientGender = escapeHtml(data.patientGender);
  const visitDate = escapeHtml(data.visitDate);
  const doctorName = escapeHtml(data.doctorName);
  const doctorSpecialization = escapeHtml(data.doctorSpecialization);
  const doctorLicenseNumber = escapeHtml(data.doctorLicenseNumber || "Not on file");
  const prescription = escapeHtml(data.prescription || "No prescription issued.");
  const rxId = escapeHtml(data.rxId);
  const signedAt = escapeHtml(data.signedAt);
  const generatedOn = escapeHtml(new Date().toLocaleDateString("en-US"));

  return `
    <html>
      <head>
        <title>Prescription Slip - ${patientName}</title>
        <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600&display=swap" rel="stylesheet" />
        <style>
          body { font-family: sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
          .header { border-bottom: 2px solid #0d9488; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
          .logo { font-size: 24px; font-weight: bold; color: #0d9488; }
          .clinic-info { text-align: right; font-size: 12px; color: #64748b; }
          .section { margin-bottom: 25px; }
          .section-title { font-weight: bold; font-size: 14px; text-transform: uppercase; color: #0d9488; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; margin-bottom: 15px; }
          .patient-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 13px; background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; }
          .rx-container { font-family: monospace; font-size: 14px; white-space: pre-wrap; background: #fff; padding: 20px; border: 1px dashed #cbd5e1; border-radius: 8px; margin-top: 15px; min-height: 180px; }
          .footer { margin-top: 60px; display: flex; justify-content: space-between; align-items: flex-end; font-size: 12px; color: #64748b; }
          .signature { border-top: 1px solid #94a3b8; min-width: 240px; text-align: center; padding-top: 12px; }
          .signature-name { font-family: 'Dancing Script', cursive; font-size: 26px; color: #0f766e; margin-bottom: 4px; }
          .signature-meta { font-size: 11px; line-height: 1.6; color: #475569; }
          @media print {
            body { padding: 0; }
            button { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="logo">MEDICONNECT</div>
            <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Premium Virtual Health Telehealth Portal</div>
          </div>
          <div class="clinic-info">
            <strong>MediConnect Care Network</strong><br />
            Digital Consultation Services<br />
            support@mediconnect.care
          </div>
        </div>

        <div class="section">
          <div class="section-title">Patient Information</div>
          <div class="patient-grid">
            <div>
              <strong>Name:</strong> ${patientName}<br />
              <strong>Date of Birth:</strong> ${patientDob}
            </div>
            <div>
              <strong>Gender:</strong> ${patientGender}<br />
              <strong>Date of Visit:</strong> ${visitDate}
            </div>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Consulting Practitioner</div>
          <div style="font-size: 13px;">
            <strong>Dr. ${doctorName}</strong><br />
            Specialization: ${doctorSpecialization}<br />
            License: ${doctorLicenseNumber}<br />
            MediConnect Verified Provider
          </div>
        </div>

        <div class="section">
          <div class="section-title">Rx (Prescribed Medications)</div>
          <div class="rx-container">${prescription}</div>
        </div>

        <div class="footer">
          <div>
            Generated on ${generatedOn}<br />
            Unique Rx ID: ${rxId}
          </div>
          <div class="signature">
            <div class="signature-name">Dr. ${doctorName}</div>
            <div class="signature-meta">
              License: ${doctorLicenseNumber}<br />
              Electronically signed via MediConnect<br />
              ${signedAt}
            </div>
          </div>
        </div>

        <script>window.print();</script>
      </body>
    </html>
  `;
}

export function openPrescriptionPrintWindow(data: PrescriptionSlipData): boolean {
  const printWindow = window.open("", "_blank");
  if (!printWindow) return false;

  printWindow.document.write(buildPrescriptionSlipHtml(data));
  printWindow.document.close();
  return true;
}

export function downloadPrescriptionPdf(data: PrescriptionSlipData): void {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 48;
  const pageWidth = doc.internal.pageSize.getWidth();
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addLine = (text: string, options?: { size?: number; bold?: boolean; color?: [number, number, number]; indent?: number }) => {
    const size = options?.size ?? 11;
    const indent = options?.indent ?? 0;
    doc.setFontSize(size);
    doc.setFont("helvetica", options?.bold ? "bold" : "normal");
    if (options?.color) doc.setTextColor(...options.color);
    else doc.setTextColor(30, 41, 59);

    const lines = doc.splitTextToSize(text, contentWidth - indent);
    lines.forEach((line: string) => {
      if (y > doc.internal.pageSize.getHeight() - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(line, margin + indent, y);
      y += size * 1.35;
    });
  };

  addLine("MEDICONNECT", { size: 20, bold: true, color: [13, 148, 136] });
  y += 4;
  addLine("Premium Virtual Health Telehealth Portal", { size: 10, color: [100, 116, 139] });
  y += 16;

  doc.setDrawColor(13, 148, 136);
  doc.line(margin, y, pageWidth - margin, y);
  y += 24;

  addLine("PATIENT INFORMATION", { size: 12, bold: true, color: [13, 148, 136] });
  y += 6;
  addLine(`Name: ${data.patientName}`);
  addLine(`Date of Birth: ${data.patientDob}`);
  addLine(`Gender: ${data.patientGender}`);
  addLine(`Date of Visit: ${data.visitDate}`);
  y += 10;

  addLine("CONSULTING PRACTITIONER", { size: 12, bold: true, color: [13, 148, 136] });
  y += 6;
  addLine(`Dr. ${data.doctorName}`, { bold: true });
  addLine(`Specialization: ${data.doctorSpecialization}`);
  addLine(`License: ${data.doctorLicenseNumber || "Not on file"}`);
  addLine("MediConnect Verified Provider");
  y += 10;

  addLine("RX (PRESCRIBED MEDICATIONS)", { size: 12, bold: true, color: [13, 148, 136] });
  y += 8;
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, 140, 6, 6, "S");
  y += 16;
  addLine(data.prescription || "No prescription issued.", { indent: 12 });
  y += 120;

  addLine(`Generated on ${new Date().toLocaleDateString("en-US")}`, { size: 10, color: [100, 116, 139] });
  addLine(`Unique Rx ID: ${data.rxId}`, { size: 10, color: [100, 116, 139] });
  y += 12;

  doc.setDrawColor(148, 163, 184);
  doc.line(pageWidth - margin - 220, y, pageWidth - margin, y);
  y += 14;
  addLine(`Dr. ${data.doctorName}`, { size: 16, bold: true, color: [15, 118, 110] });
  addLine(`License: ${data.doctorLicenseNumber || "Not on file"}`, { size: 10, color: [71, 85, 105] });
  addLine("Electronically signed via MediConnect", { size: 10, color: [71, 85, 105] });
  addLine(data.signedAt, { size: 10, color: [71, 85, 105] });

  doc.save(`MediConnect-Rx-${data.rxId}.pdf`);
}
