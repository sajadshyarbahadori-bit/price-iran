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
                headers: {
                    "X-API-Key": apiKey,
                    "Accept": "application/json"
                },
                cache: "no-store"
            }
        );

        const data = await response.json();

        if (!response.ok || !Array.isArray(data)) {
            return res.status(response.status || 502).json({
                error: "SERVIX_API_ERROR",
                response: data
            });
        }

        const prices = data.map(item => ({
            code: item.code,
            name: item.name || item.code,
            value: Number(item.value),
            labelFa: item.labelFa,
            businessTime: item.businessTime
        }));

        res.setHeader(
            "Cache-Control",
            "s-maxage=60, stale-while-revalidate=300"
        );

        return res.status(200).json(prices);

    } catch (error) {
        console.error("SERVIX ERROR:", error);

        return res.status(500).json({
            error: "SERVIX_CONNECTION_ERROR"
        });
    }
}
