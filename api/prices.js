export default async function handler(req, res) {
    try {
        const apiKey = process.env.SERVIX_API_KEY?.trim();

        if (!apiKey) {
            return res.status(500).json({
                error: "SERVIX_API_KEY is missing"
            });
        }

        const response = await fetch("https://servix.cc/api/v1/assets", {
            method: "GET",
            headers: {
                "X-API-Key": apiKey,
                "Accept": "application/json"
            }
        });

        const text = await response.text();

        let data;

        try {
            data = JSON.parse(text);
        } catch {
            return res.status(502).json({
                error: "INVALID_API_RESPONSE",
                message: text
            });
        }

        if (!response.ok) {
            return res.status(response.status).json(data);
        }

        res.setHeader("Cache-Control", "no-store");

        return res.status(200).json(data);

    } catch (error) {
        console.error("SERVIX ERROR:", error);

        return res.status(500).json({
            error: "API_ERROR",
            message: error.message
        });
    }
}
