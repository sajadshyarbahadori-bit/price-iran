export default async function handler(req, res) {
    try {
        const apiKey = process.env.OANOR_API_KEY?.trim();

        if (!apiKey) {
            return res.status(500).json({
                error: "OANOR_API_KEY_MISSING"
            });
        }

        const response = await fetch(
            "https://api.oanor.com/irr-api/v1/gold",
            {
                method: "GET",
                headers: {
                    "x-oanor-key": apiKey,
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
                error: "INVALID_OANOR_RESPONSE",
                raw: text
            });
        }

        if (!response.ok || !data.success) {
            return res.status(response.status || 502).json({
                error: "OANOR_API_ERROR",
                response: data
            });
        }

        const gold = data.data?.gold || [];

        const result = gold.map(item => ({
            code: item.symbol,
            name: item.name,
            value: Number(item.close),
            unit: item.unit,
            change: Number(item.change),
            change_pct: Number(item.change_pct),
            date: item.date,
            date_jalali: item.date_jalali,
            close_toman: item.close_toman
        }));

        res.setHeader(
            "Cache-Control",
            "s-maxage=60, stale-while-revalidate=300"
        );

        return res.status(200).json({
            success: true,
            source: data.data?.source || "OANOR",
            timestamp: data.meta?.timestamp,
            prices: result
        });

    } catch (error) {

        console.error("OANOR ERROR:", error);

        return res.status(500).json({
            error: "OANOR_CONNECTION_ERROR",
            message: error.message
        });
    }
}
