

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST required" });
  }

  try {
    const key = process.env.GEMINI_API_KEY;

    if (!key) {
      return res.status(500).json({
        error: "Gemini API key is not configured"
      });
    }

    const { image, mimeType } = req.body || {};
    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (!allowed.includes(mimeType) || typeof image !== "string") {
      return res.status(400).json({
        error: "Invalid palm image"
      });
    }

    const base64 = image.replace(
      /^data:image\/(?:jpeg|png|webp);base64,/,
      ""
    );

    if (
      !base64 ||
      base64.length > 5000000 ||
      !/^[A-Za-z0-9+/]+={0,2}$/.test(base64)
    ) {
      return res.status(400).json({
        error: "Image too large or invalid"
      });
    }

    const generate = async (model) => fetch(
      `https://generativelanguage.googleapis.com/v1beta/${model}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Analyze this palm photograph using
traditional palmistry for entertainment.
Describe visible heart, head, life and fate lines.
If features are unclear, say so.
Do not predict health, lifespan or real events.
Give a personalized reading and explain that
palmistry is not scientifically validated.`
              },
              {
                inline_data: {
                  mime_type: mimeType,
                  data: base64
                }
              }
            ]
          }],
          generationConfig: {
            maxOutputTokens: 1000
          }
        })
      }
    );

    let response = await generate("models/gemini-2.5-flash");
    if ([404,429,500,502,503,504].includes(response.status)) {
      const catalogResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=100", {headers: {"x-goog-api-key": key}});
      if (catalogResponse.ok) {
        const catalog = await catalogResponse.json();
        const candidates = (catalog.models || []).filter(m => m.supportedGenerationMethods?.includes("generateContent") && /^models\/gemini-[0-9].*flash/.test(m.name) && !/audio|tts|image|live|robot|embedding|preview|experimental|exp-|gemini-2\.5-flash$/.test(m.name)).sort((a,b)=>b.name.localeCompare(a.name,undefined,{numeric:true}));
        for (const model of candidates.slice(0,3)) {
          console.info("Trying Gemini model:", model.name);
          response = await generate(model.name);
          if (![404,429,500,502,503,504].includes(response.status)) break;
        }
      } else {console.error("Gemini catalog HTTP status:", catalogResponse.status);}
    }
    if (!response.ok) {
      console.error("Gemini HTTP status:", response.status);
      return res.status(502).json({
        error: response.status === 404 ? "No compatible Gemini model available" : [500,502,503,504].includes(response.status) ? "Gemini is temporarily unavailable. Please try again shortly." : response.status === 429 ? "Gemini quota exceeded. Try again later." : [401,403].includes(response.status) ? "Gemini API access denied. Check key permissions." : "Gemini request failed (" + response.status + ")"
      });
    }

    const data = await response.json();

    const reading = data.candidates?.[0]?.content?.parts
      ?.map(p => p.text || "")
      .join("\n")
      .trim();

    if (!reading) {
      return res.status(502).json({
        error: "No reading returned"
      });
    }

    return res.status(200).json({ reading });

  } catch (error) {
    console.error("Scanner error:", error);
    return res.status(500).json({
      error: "Scanner unavailable"
    });
  }
}

