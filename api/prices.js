export default async function handler(req, res) {
    try {
        const response = await fetch(
            "https://api.oanor.com/irr-api/v1/gold",
            {
                headers: {
                    "x-oanor-key": process.env.OANOR_API_KEY
                }
            }
        );

        const data = await response.json();

        res.status(response.status).json(data);

    } catch (error) {
        res.status(500).json({
            error: "API connection failed"
        });
    }
}
