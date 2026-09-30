// Utilitaire partagé : transforme un élément HTML (aperçu d'un devis ou
// d'une facture) en PDF au format A4, en le découpant sur plusieurs pages
// si le contenu est trop long.
//
// Utilisé à la fois pour le téléchargement local (bouton "Télécharger")
// et pour l'envoi par email (le PDF est alors joint en pièce jointe).

export type PdfGenere = {
  // Le PDF encodé en base64, sans le préfixe "data:application/pdf;...".
  // Prêt à être envoyé tel quel à l'API d'envoi d'email (Resend).
  base64: string;
  // Déclenche le téléchargement local du même PDF, sous le nom fourni.
  declencherTelechargement: (nomFichier: string) => void;
};

export async function genererPdfDepuisElement(
  element: HTMLDivElement
): Promise<PdfGenere | null> {
  const html2canvasModule = await import("html2canvas");
  const jsPDFModule = await import("jspdf");

  const html2canvas = html2canvasModule.default;
  const JsPDF = jsPDFModule.default;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: "#ffffff",
    logging: false,
    windowWidth: element.scrollWidth,
    windowHeight: element.scrollHeight,
  });

  if (!canvas.width || !canvas.height) {
    return null;
  }

  const imageData = canvas.toDataURL("image/jpeg", 0.95);

  const pdf = new JsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const margin = 8;
  const imageWidth = pageWidth - margin * 2;
  const imageHeight = (canvas.height * imageWidth) / canvas.width;

  let remainingHeight = imageHeight;
  let positionY = margin;

  pdf.addImage(
    imageData,
    "JPEG",
    margin,
    positionY,
    imageWidth,
    imageHeight
  );

  remainingHeight -= pageHeight - margin * 2;

  while (remainingHeight > 0) {
    pdf.addPage();
    positionY = margin - (imageHeight - remainingHeight);

    pdf.addImage(
      imageData,
      "JPEG",
      margin,
      positionY,
      imageWidth,
      imageHeight
    );

    remainingHeight -= pageHeight - margin * 2;
  }

  const dataUri = pdf.output("datauristring");
  const base64 = dataUri.split(",")[1] || "";

  return {
    base64,
    declencherTelechargement: (nomFichier: string) => pdf.save(nomFichier),
  };
}