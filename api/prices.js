export default async function handler(req, res) {
    try {
        const apiKey = process.env.SERVIX_API_KEY?.trim();

        if (!apiKey) {
            return res.status(500).json({
                error: "SERVIX_API_KEY_MISSING"
            });
        }

        const response = await fetch(
            "https://api.servix.ir/price",
            {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${apiKey}`,
                    "Accept": "application/json"
                },
                cache: "no-store"
            }
        );

        const text = await response.text();

        let data;

        try {
            data = JSON.parse(text);
        } catch {
            return res.status(502).json({
                error: "INVALID_SERVIX_RESPONSE",
                raw: text
            });
        }

        if (!response.ok) {
            return res.status(response.status || 502).json({
                error: "SERVIX_API_ERROR",
                response: data
            });
        }

        console.log("SERVIX RESPONSE:", data);

        return res.status(200).json({
            success: true,
            source: "SERVIX",
            timestamp: new Date().toISOString(),
            prices: data
        });

    } catch (error) {
        console.error("SERVIX ERROR:", error);

        return res.status(500).json({
            error: "SERVIX_CONNECTION_ERROR",
            message: error.message
        });
    }
}
