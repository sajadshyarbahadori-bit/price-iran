module.exports = async (req, res) => {
    try {
        const response = await fetch(
            "https://api.oanor.com/irr-api/v1/gold",
            {
                headers: {
                    "x-oanor-key": process.env.OANOR_API_KEY,
                    "Accept": "application/json"
                }
            }
        );

        const data = await response.text();

        res.status(response.status);
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");

        res.send(data);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: "API ERROR",
            message: error.message
        });
    }
};
