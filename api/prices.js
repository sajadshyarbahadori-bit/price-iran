```javascript
export default async function handler(req, res) {
    try {
        const apiKey = process.env.OANOR_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "OANOR_API_KEY is missing"
            });
        }

        const response = await fetch(
            "https://api.oanor.com/irr-api/v1/assets",
            {
                method: "GET",
                headers: {
                    "x-oanor-key": apiKey,
                    "Accept": "application/json"
                }
            }
        );

        const text = await response.text();

        res.status(response.status);
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Cache-Control", "no-store");

        return res.end(text);

    } catch (error) {
        console.error(error);

        return res.status(500).json({
            error: "Server error",
            message: error.message
        });
    }
}
```
