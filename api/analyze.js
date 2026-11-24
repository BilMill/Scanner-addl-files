

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

    const { image, mimeType, kind } = req.body || {};
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
        signal: AbortSignal.timeout(15000),
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": key
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: kind === 'prosperity' ? `Analyze visible palm features for a Millionaire & Prosperity Reading, purely as folklore entertainment. Discuss traditional money triangle, sun and fate lines, ambition and entrepreneurial symbolism, and three reflective affirmations. If markings are unclear say so; never invent markings or infer actual financial ability, future wealth, income or investment outcomes. Use plain text headings, 250–350 words, and a disclaimer that palmistry cannot predict wealth.` : `Analyze this palm photograph using
traditional palmistry for entertainment.
Describe visible heart, head, life and fate lines.
If features are unclear, say so.
Do not predict health, lifespan or real events.
Give a concise personalized reading of 250 to 350 words total. Cover all four lines, even if some are unclear. Use plain text, no Markdown symbols. Put each line heading on its own line. Finish every section and explain that palmistry is not scientifically validated.`
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
            maxOutputTokens: 4096,
            ...(model.includes("2.5") ? {thinkingConfig:{thinkingBudget:0}} : {})
          }
        })
      }
    );

    const catalogResponse = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=100",{signal:AbortSignal.timeout(4000),headers:{"x-goog-api-key":key}});
    if (!catalogResponse.ok) return res.status(502).json({error:"AI model catalog unavailable"});
    const catalog = await catalogResponse.json();
    const models = (catalog.models||[]).filter(m=>m.supportedGenerationMethods?.includes("generateContent") && /^models\/gemini-.*flash/.test(m.name) && !/audio|tts|image|live|robot|embedding/.test(m.name)).map(m=>m.name);
    models.sort((a,b)=>Number(!a.includes("lite"))-Number(!b.includes("lite")) || Number(/preview|experimental/.test(a))-Number(/preview|experimental/.test(b)) || b.localeCompare(a,undefined,{numeric:true}));
    console.info("Available scanner models:",models.join(","));
    if (!models.length) return res.status(502).json({error:"No compatible AI model available"});
    let response;
    for (const model of models.slice(0,3)) {
      response = await generate(model).catch(()=>({ok:false,status:504}));
      console.info("Gemini model result:",model,response.status);
      if (response.ok || ![400,404,429,500,502,503,504].includes(response.status)) break;
    }
    if (!response.ok) {
      console.error("Gemini HTTP status:", response.status);
      return res.status(502).json({
        error: response.status === 404 ? "No compatible Gemini model available" : [500,502,503,504].includes(response.status) ? "Gemini is temporarily unavailable. Please try again shortly." : response.status === 429 ? "Gemini quota exceeded. Try again later." : [401,403].includes(response.status) ? "Gemini API access denied. Check key permissions." : "Gemini request failed (" + response.status + ")"
      });
    }

    const data = await response.json();

    const reading = data.candidates?.[0]?.content?.parts
      ?.filter(p => !p.thought)
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

