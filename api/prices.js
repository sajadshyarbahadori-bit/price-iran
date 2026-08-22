```javascript
module.exports = async function handler(req, res) {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, 8000);

    try {
        const response = await fetch(
            "https://api.oanor.com/irr-api/v1/gold",
            {
                method: "GET",
                headers: {
                    "x-oanor-key": process.env.OANOR_API_KEY,
                    "Accept": "application/json"
                },
                signal: controller.signal
            }
        );

        const data = await response.text();

        res.status(response.status);
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.end(data);

    } catch (error) {
        res.status(504);
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");

        res.end(JSON.stringify({
            error: "Oanor API did not respond",
            message: error.name === "AbortError"
                ? "Request timed out"
                : error.message
        }));

    } finally {
        clearTimeout(timeout);
    }
};
```
