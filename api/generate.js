export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    console.error("ANTHROPIC_API_KEY is missing");

    return res.status(500).json({
      error:
        "Server is missing ANTHROPIC_API_KEY. Add it in Vercel Environment Variables."
    });
  }

  const { prompt, max_tokens } = req.body || {};

  if (!prompt || typeof prompt !== "string") {
    return res.status(400).json({
      error: 'Missing "prompt" string in request body.'
    });
  }

  try {
    const anthropicResponse = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01"
        },

        body: JSON.stringify({
          model: "claude-sonnet-4-6",

          max_tokens: Math.min(
            Math.max(
              parseInt(max_tokens, 10) || 1000,
              1
            ),
            8000
          ),

          messages: [
            {
              role: "user",
              content: prompt
            }
          ]
        })
      }
    );

    const data = await anthropicResponse.json();

    if (!anthropicResponse.ok) {
      console.error(
        "Anthropic API error:",
        data
      );

      return res.status(anthropicResponse.status).json({
        error:
          data?.error?.message ||
          "Anthropic API request failed."
      });
    }

    return res.status(200).json(data);

  } catch (error) {
    console.error(
      "Server error:",
      error
    );

    return res.status(500).json({
      error:
        "Server error calling Anthropic API: " +
        error.message
    });
  }
}
