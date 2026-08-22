export default async function handler(request) {
    try {
        const response = await fetch(
            "https://api.oanor.com/irr-api/v1/gold",
            {
                headers: {
                    "x-oanor-key": process.env.OANOR_API_KEY
                }
            }
        );

        const data = await response.text();

        return new Response(data, {
            status: response.status,
            headers: {
                "Content-Type": "application/json"
            }
        });

    } catch (error) {
        return new Response(
            JSON.stringify({
                error: "API connection failed",
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
