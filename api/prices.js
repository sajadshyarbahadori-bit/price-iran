export default async function handler(req, res) {
    try {

        const response = await fetch(
            "https://persiantoolbox.ir/api/market",
            {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                },
                cache: "no-store"
            }
        );

        const data = await response.json();

        if (!response.ok || !data.ok) {
            return res.status(502).json({
                error: "MARKET_API_ERROR",
                message: data?.message || "خطا در دریافت بازار"
            });
        }

        const market = data.data;

        /*
         * API جدید:
         *
         * currencies
         * gold
         * crypto
         */

        const usd =
            Number(market.currencies?.IRR?.rate);

        const gold =
            Number(market.gold?.pricePerGram);


        // تبدیل نرخ‌های ارز
        // نرخ‌ها نسبت به USD هستند.
        const eur =
            usd /
            Number(market.currencies?.EUR?.rate);

        const gbp =
            usd /
            Number(market.currencies?.GBP?.rate);

        const aed =
            usd /
            Number(market.currencies?.AED?.rate);

        const tryRate =
            usd /
            Number(market.currencies?.TRY?.rate);


        const prices = [

            {
                code: "USD_RLS",
                value: usd
            },

            {
                code: "EUR_RLS",
                value: eur
            },

            {
                code: "GBP_RLS",
                value: gbp
            },

            {
                code: "AED_RLS",
                value: aed
            },

            {
                code: "TRY_RLS",
                value: tryRate
            },


            // طلای 18 عیار
            {
                code: "GOLD_18_RLS",
                value: gold
            },

            // تخمین 24 عیار
            {
                code: "GOLD_24_RLS",
                value:
                    gold / 0.75
            },


            // مثقال تقریبی
            {
                code: "GOLD_MESGHAL_RLS",
                value:
                    gold * 4.6083
            },


            // کریپتو
            {
                code: "BTC_USD",
                value:
                    Number(
                        market.crypto?.BTC?.priceUSD
                    )
            },

            {
                code: "ETH_USD",
                value:
                    Number(
                        market.crypto?.ETH?.priceUSD
                    )
            }

        ];


        res.setHeader(
            "Cache-Control",
            "s-maxage=300, stale-while-revalidate=60"
        );


        return res.status(200).json(prices);


    } catch (error) {

        console.error(
            "MARKET API ERROR:",
            error
        );


        return res.status(500).json({
            error: "API_ERROR",
            message: error.message
        });
    }
}
