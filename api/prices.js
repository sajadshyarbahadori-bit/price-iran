module.exports = async (req, res) => {
    try {
        const apiKey = process.env.OANOR_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "OANOR_API_KEY is missing"
            });
        }

        const cleanKey = apiKey.trim();

        const response = await fetch(
            "https://api.oanor.com/irr-api/v1/gold",
            {
                method: "GET",
                headers: {
                    "x-oanor-key": cleanKey,
                    "Accept": "application/json"
                }
            }
        );

        const data = await response.text();

        return res
            .status(response.status)
            .setHeader("Content-Type", "application/json")
            .send(data);

    } catch (error) {
        console.error("API ERROR:", error);

        return res.status(500).json({
            error: "API ERROR",
            message: error.message
        });
    }
};
