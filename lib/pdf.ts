// Utilitaire partagé : transforme un élément HTML (aperçu d'un devis ou
// d'une facture) en PDF au format A4.
//
// Utilisé à la fois pour le téléchargement local (bouton "Télécharger")
// et pour l'envoi par email (le PDF est alors joint en pièce jointe).
//
// Le document (devis/facture) est pensé pour une largeur fixe de 1000px,
// avec des colonnes côte à côte (émetteur/client, notes/totaux). La
// fenêtre du visiteur peut être plus étroite au moment du clic, ce qui
// ferait s'empiler ces colonnes et doublerait la hauteur du document —
// on force donc une largeur fixe pendant la capture pour obtenir une mise
// en page identique à chaque fois, qui tient sur une seule page A4 pour
// un devis ou une facture de taille normale.

const LARGEUR_CAPTURE_PX = 1000;

export type PdfGenere = {
  // Le PDF encodé en base64, sans le préfixe "data:application/pdf;...".
  // Prêt à être envoyé tel quel à l'API d'envoi d'email (Resend).
  base64: string;
  // Déclenche le téléchargement local du même PDF, sous le nom fourni.
  declencherTelechargement: (nomFichier: string) => void;
};

async function capturerElementEnCanvas(
  element: HTMLDivElement
): Promise<HTMLCanvasElement> {
  const html2canvasModule = await import("html2canvas");
  const html2canvas = html2canvasModule.default;

  // Certains textes (liens, titres en gras) apparaissent délavés si la
  // police n'est pas encore chargée au moment de la capture.
  if (typeof document !== "undefined" && document.fonts?.ready) {
    await document.fonts.ready;
  }

  const largeurOriginale = element.style.width;
  const maxLargeurOriginale = element.style.maxWidth;

  element.style.width = `${LARGEUR_CAPTURE_PX}px`;
  element.style.maxWidth = `${LARGEUR_CAPTURE_PX}px`;

  try {
    return await html2canvas(element, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
      windowWidth: LARGEUR_CAPTURE_PX + 100,
      windowHeight: element.scrollHeight + 100,
    });
  } finally {
    element.style.width = largeurOriginale;
    element.style.maxWidth = maxLargeurOriginale;
  }
}

export async function genererPdfDepuisElement(
  element: HTMLDivElement
): Promise<PdfGenere | null> {
  const jsPDFModule = await import("jspdf");
  const JsPDF = jsPDFModule.default;

  const canvas = await capturerElementEnCanvas(element);

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

  const margin = 10;
  const largeurDisponible = pageWidth - margin * 2;
  const hauteurDisponible = pageHeight - margin * 2;

  let imageWidth = largeurDisponible;
  let imageHeight = (canvas.height * imageWidth) / canvas.width;

  if (imageHeight > hauteurDisponible && imageHeight <= hauteurDisponible * 1.15) {
    // Léger dépassement : on réduit légèrement l'image pour tout faire
    // tenir sur une seule page plutôt que de créer une deuxième page
    // presque vide pour quelques millimètres de trop.
    const facteurReduction = hauteurDisponible / imageHeight;
    imageHeight = hauteurDisponible;
    imageWidth = imageWidth * facteurReduction;
  }

  const positionX = margin + (largeurDisponible - imageWidth) / 2;

  if (imageHeight <= hauteurDisponible) {
    pdf.addImage(
      imageData,
      "JPEG",
      positionX,
      margin,
      imageWidth,
      imageHeight
    );
  } else {
    // Document réellement long (beaucoup de prestations) : on le
    // découpe sur plusieurs pages A4.
    let hauteurRestante = imageHeight;
    let positionY = margin;

    pdf.addImage(
      imageData,
      "JPEG",
      positionX,
      positionY,
      imageWidth,
      imageHeight
    );

    hauteurRestante -= hauteurDisponible;

    while (hauteurRestante > 0) {
      pdf.addPage();
      positionY = margin - (imageHeight - hauteurRestante);

      pdf.addImage(
        imageData,
        "JPEG",
        positionX,
        positionY,
        imageWidth,
        imageHeight
      );

      hauteurRestante -= hauteurDisponible;
    }
  }

  const dataUri = pdf.output("datauristring");
  const base64 = dataUri.split(",")[1] || "";

  return {
    base64,
    declencherTelechargement: (nomFichier: string) => pdf.save(nomFichier),
  };
}