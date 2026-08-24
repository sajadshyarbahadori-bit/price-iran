export default async function handler(req, res) {
    try {
        const apiKey = process.env.SERVIX_API_KEY?.trim();

        if (!apiKey) {
            return res.status(500).json({
                error: "SERVIX_API_KEY_MISSING"
            });
        }

        const response = await fetch(
            "https://servix.cc/api/v1/assets",
            {
                method: "GET",
                headers: {
                    "X-API-Key": apiKey,
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
            console.error("SERVIX API ERROR:", data);

            return res.status(response.status || 502).json({
                error: "SERVIX_API_ERROR",
                response: data
            });
        }

        if (!Array.isArray(data)) {
            return res.status(502).json({
                error: "SERVIX_RESPONSE_NOT_ARRAY",
                response: data
            });
        }

        const prices = data.map(item => ({
            code: item.code,
            name: item.name || item.code,
            value: Number(item.value),
            labelFa: item.labelFa,
            labelEn: item.labelEn,
            businessTime: item.businessTime
        }));

        res.setHeader(
            "Cache-Control",
            "s-maxage=60, stale-while-revalidate=300"
        );

        return res.status(200).json(prices);

    } catch (error) {

        console.error("SERVIX CONNECTION ERROR:", error);

        return res.status(500).json({
            error: "SERVIX_CONNECTION_ERROR",
            message: error.message
        });
    }
}
