import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const address =
      typeof body.address === "string"
        ? body.address.trim()
        : "";

    if (!address) {
      return NextResponse.json(
        {
          error: "Adresse obligatoire.",
        },
        {
          status: 400,
        }
      );
    }

    const apiKey =
      process.env.GOOGLE_MAPS_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "La clé Google Maps n'est pas configurée.",
        },
        {
          status: 500,
        }
      );
    }

    const url =
      `https://geocode.googleapis.com/v4/geocode/address/${encodeURIComponent(
        address
      )}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "results.location,results.formattedAddress,results.placeId",
      },
      cache: "no-store",
    });

    if (!response.ok) {
  const errorText = await response.text();

  console.error(
    "ERREUR GOOGLE GEOCODING :",
    response.status,
    errorText
  );

  return NextResponse.json(
    {
      error: "Erreur Google Geocoding",
      status: response.status,
      details: errorText,
    },
    {
      status: response.status,
    }
  );
}
    const data = await response.json();

    const premierResultat =
      data?.results?.[0];

    if (
      !premierResultat?.location
    ) {
      return NextResponse.json(
        {
          error:
            "Adresse non trouvée.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      latitude:
        premierResultat.location.latitude,
      longitude:
        premierResultat.location.longitude,
      formattedAddress:
        premierResultat.formattedAddress ||
        address,
      placeId:
        premierResultat.placeId || null,
    });
  } catch (error) {
    console.error(
      "Erreur route geocode :",
      error
    );

    return NextResponse.json(
      {
        error:
          "Erreur interne de géocodage.",
      },
      {
        status: 500,
      }
    );
  }
}