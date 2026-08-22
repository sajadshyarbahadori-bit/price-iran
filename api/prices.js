export default async function handler(request) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
        const response = await fetch(
            "https://servix.cc/api/v1/assets?codes=USD_RLS,EUR_RLS,GOLD_18_RLS",
            {
                headers: {
                    "X-API-Key": process.env.SERVIX_API_KEY,
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
                error: "Servix API failed",
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
