```javascript
export default async function handler(request) {
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
                error: "API request failed",
                message: error.message
            }),
            {
                status: 500,
                headers: {
                    "Content-Type": "application/json"
                }
            }
        );
    }
}
```
