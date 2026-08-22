export default async function handler(request) {
    try {
        const response = await fetch(
            "https://servix.cc/api/v1/assets?codes=USD_RLS,GOLD_18_RLS",
            {
                headers: {
                    "X-API-Key": process.env.SERVIX_API_KEY
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
            JSON.stringify({ error: error.message }),
            { status: 500 }
        );
    }
}
