module.exports = async function handler(req, res) {
    try {
        const apiKey = process.env.SERVIX_API_KEY?.replace(/\s/g, "");

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

        const data = await response.text();

        res.status(response.status);
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store");

        return res.send(data);

    } catch (error) {
        console.error("SERVIX ERROR:", error);

        return res.status(500).json({
            error: "API ERROR",
            message: error.message
        });
    }
};
