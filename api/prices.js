```javascript
export default async function handler(request) {
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

        return new Response(data, {
            status: response.status,
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*"
            }
        });

    } catch (error) {
        return new Response(
            JSON.stringify({
                error: "Oanor API did not respond",
                message: error.name === "AbortError"
                    ? "Request timed out"
                    : error.message
            }),
            {
                status: 504,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*"
                }
            }
        );
    } finally {
        clearTimeout(timeout);
    }
}
```
