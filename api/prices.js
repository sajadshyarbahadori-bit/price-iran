export default async function handler(req, res) {
    try {
        const apiKey = process.env.SERVIX_API_KEY?.trim();

        if (!apiKey) {
            return res.status(500).json({
                error: "SERVIX_API_KEY is missing"
            });
        }

        const response = await fetch(
            "https://servix.cc/api/v1/assets",
            {
                method: "GET",
                headers: {
                    "X-API-Key": apiKey,
                    "Accept": "application/json"
                }
            }
        );

        const text = await response.text();

        return res.status(response.status).json({
            servixStatus: response.status,
            servixResponse: text
        });

    } catch (error) {
        return res.status(500).json({
            error: "API_ERROR",
            message: error.message
        });
    }
}
