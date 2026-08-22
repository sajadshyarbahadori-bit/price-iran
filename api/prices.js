export default async function handler(req, res) {
    try {
        const response = await fetch(
            "https://servix.cc/api/v1/assets",
            {
                headers: {
                    "X-API-Key": process.env.SERVIX_API_KEY,
                    "Accept": "application/json"
                }
            }
        );

        const data = await response.json();

        res.status(response.status).json(data);

    } catch (error) {
        res.status(500).json({
            error: "Servix API failed",
            message: error.message
        });
    }
}
