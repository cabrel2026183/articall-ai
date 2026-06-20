import { Resend } from "resend";
import { NextResponse } from "next/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  try {
    const { email, clientName, pdfBase64, filename, subject } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email client manquant" },
        { status: 400 }
      );
    }
console.log("API SEND-PDF APPELÉE");
    const data = await resend.emails.send({
      from: "ArtiCall AI <support@articallai.com>",
      to: email,
      subject: subject || "Votre bon d'intervention",
      html: `
        <h2>Bonjour ${clientName || ""}</h2>
        <p>Merci pour votre confiance.</p>
        <p>Votre intervention a bien été enregistrée.</p>
        <p>Cordialement,<br/>ArtiCall AI</p>
      `,
      attachments: [
  {
    filename: filename || "bon-intervention.pdf",
    content: pdfBase64,
  },
],
    });
console.log("RESEND RESPONSE :", data);
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json(
      {
        error: error?.message || "Erreur envoi email",
      },
      { status: 500 }
    );
  }
}