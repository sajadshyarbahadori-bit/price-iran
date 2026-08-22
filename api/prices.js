module.exports = async function handler(req, res) {
    try {
        const apiKey = process.env.OANOR_API_KEY
            ?.replace(/\s/g, "");

        if (!apiKey) {
            return res.status(500).json({
                error: "OANOR_API_KEY is missing"
            });
        }

        const response = await fetch(
            "https://api.oanor.com/irr-api/v1/gold",
            {
                method: "GET",
                headers: {
                    "x-oanor-key": apiKey,
                    "Accept": "application/json"
                }
            }
        );

        const data = await response.text();

        res.status(response.status);
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store");

        return res.send(data);

    } catch (error) {
        console.error("OANOR ERROR:", error);

        return res.status(500).json({
            error: "API ERROR",
            message: error.message
        });
    }
};
