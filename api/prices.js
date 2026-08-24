export default async function handler(req, res) {
    try {
        const key = process.env.OANOR_API_KEY?.trim();

        if (!key) {
            return res.status(500).json({
                error: "OANOR_API_KEY_MISSING"
            });
        }

        const response = await fetch(
            "https://api.oanor.com/irr-api/v1/gold",
            {
                headers: {
                    "x-oanor-key": key,
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
                error: "INVALID_RESPONSE",
                status: response.status,
                raw: text
            });
        }

        if (!response.ok) {
            return res.status(response.status).json({
                error: "OANOR_ERROR",
                status: response.status,
                data
            });
        }

        return res.status(200).json(data);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "SERVER_ERROR",
            message: error.message
        });
    }
}
