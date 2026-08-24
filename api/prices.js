export default async function handler(req, res) {
    try {
        const apiKey = process.env.OANOR_API_KEY?.trim();

        if (!apiKey) {
            return res.status(500).json({
                error: "OANOR_API_KEY_MISSING"
            });
        }

        const response = await fetch(
            "https://api.oanor.com/irr-api/v1/gold",
            {
                method: "GET",
                headers: {
                    "x-oanor-key": apiKey,
                    "Accept": "application/json"
                },
                cache: "no-store"
            }
        );

        const text = await response.text();

        let data;

        try {
            data = JSON.parse(text);
        } catch {
            return res.status(502).json({
                error: "INVALID_OANOR_RESPONSE",
                status: response.status,
                response: text
            });
        }

        if (!response.ok) {
            return res.status(response.status).json({
                error: "OANOR_API_ERROR",
                status: response.status,
                response: data
            });
        }

        /*
         * OANOR gold endpoint
         * شامل:
         * اونس طلا
         * طلای 18 و 24
         * مثقال
         * سکه امامی
         * بهار آزادی
         * نیم سکه
         * ربع سکه
         * سکه گرمی
         */

        const source = data.data ?? data;

        const result = [];

        function add(code, value) {
            if (value !== undefined && value !== null) {
                const number = Number(value);

                if (Number.isFinite(number)) {
                    result.push({
                        code,
                        value: number
                    });
                }
            }
        }

        /*
         * اگر پاسخ API به شکل مستقیم باشد
         */
        add("GOLD_18_RLS",
            source.GOLD_18_RLS ??
            source.gold18 ??
            source.gold_18
        );

        add("GOLD_24_RLS",
            source.GOLD_24_RLS ??
            source.gold24 ??
            source.gold_24
        );

        add("GOLD_MESGHAL_RLS",
            source.GOLD_MESGHAL_RLS ??
            source.mesghal
        );

        add("SEKKEH_RLS",
            source.SEKKEH_RLS ??
            source.emami ??
            source.coin
        );

        add("BAHAR_RLS",
            source.BAHAR_RLS ??
            source.bahar
        );

        add("NIM_SEKKEH_RLS",
            source.NIM_SEKKEH_RLS ??
            source.half
        );

        add("ROB_SEKKEH_RLS",
            source.ROB_SEKKEH_RLS ??
            source.quarter
        );

        add("GERAMI_SEKKEH_RLS",
            source.GERAMI_SEKKEH_RLS ??
            source.gerami
        );

        add("GOLD_OUNCE_USD",
            source.GOLD_OUNCE_USD ??
            source.ounce
        );


        /*
         * اگر API خودش آرایه instruments داشته باشد
         */
        if (Array.isArray(source)) {

            source.forEach(item => {

                if (!item) return;

                const code = String(
                    item.code ??
                    item.symbol ??
                    ""
                ).toUpperCase();

                const value = Number(
                    item.value ??
                    item.price ??
                    item.close
                );

                if (!Number.isFinite(value)) return;

                const mapping = {
                    USD_RLS: "USD_RLS",
                    EUR_RLS: "EUR_RLS",
                    GBP_RLS: "GBP_RLS",
                    AED_RLS: "AED_RLS",
                    TRY_RLS: "TRY_RLS",

                    GOLD_18_RLS: "GOLD_18_RLS",
                    GOLD_24_RLS: "GOLD_24_RLS",
                    GOLD_MESGHAL_RLS: "GOLD_MESGHAL_RLS",

                    SEKKEH_RLS: "SEKKEH_RLS",
                    BAHAR_RLS: "BAHAR_RLS",
                    NIM_SEKKEH_RLS: "NIM_SEKKEH_RLS",
                    ROB_SEKKEH_RLS: "ROB_SEKKEH_RLS",
                    GERAMI_SEKKEH_RLS: "GERAMI_SEKKEH_RLS",

                    GOLD_OUNCE_USD: "GOLD_OUNCE_USD"
                };

                if (mapping[code]) {
                    add(mapping[code], value);
                }
            });
        }


        /*
         * بعضی پاسخ‌های API ممکن است currencies داشته باشند
         */
        const currencies =
            source.currencies ??
            data.currencies;

        if (currencies) {

            function currency(code) {
                const item = currencies[code];

                if (!item) return;

                const value =
                    item.rate ??
                    item.value ??
                    item.price;

                add(code + "_RLS", value);
            }

            currency("USD");
            currency("EUR");
            currency("GBP");
            currency("AED");
            currency("TRY");
        }


        /*
         * اگر هیچ داده‌ای پیدا نشد،
         * پاسخ خام را برای تشخیص نگه می‌داریم.
         */
        if (result.length === 0) {
            return res.status(502).json({
                error: "UNKNOWN_OANOR_FORMAT",
                raw: data
            });
        }


        res.setHeader(
            "Cache-Control",
            "s-maxage=60, stale-while-revalidate=300"
        );

        return res.status(200).json(result);

    } catch (error) {

        console.error("OANOR ERROR:", error);

        return res.status(500).json({
            error: "OANOR_CONNECTION_ERROR",
            message: error.message
        });
    }
}
