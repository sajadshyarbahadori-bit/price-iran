let cachedData = null;
let cacheTime = 0;

const CACHE_TIME = 5 * 60 * 1000; // 5 دقیقه

export default async function handler(req, res) {

    try {

        // اگر کش هنوز معتبر است، بدون درخواست به Servix پاسخ بده
        if (
            cachedData &&
            Date.now() - cacheTime < CACHE_TIME
        ) {

            res.setHeader(
                "Cache-Control",
                "s-maxage=300, stale-while-revalidate=60"
            );

            res.setHeader(
                "X-Price-Cache",
                "HIT"
            );

            return res.status(200).json(cachedData);
        }


        const apiKey =
            process.env.SERVIX_API_KEY?.trim();


        if (!apiKey) {

            return res.status(500).json({
                error: "SERVIX_API_KEY is missing"
            });
        }


        const response = await fetch(
            "https://servix.cc/api/v1/assets",
            {
                method: "GET",

                headers: {
                    "X-API-Key": apiKey,
                    "Accept": "application/json"
                }
            }
        );


        const text =
            await response.text();


        let data;


        try {

            data = JSON.parse(text);

        } catch {

            return res.status(502).json({
                error: "INVALID_API_RESPONSE",
                message: text
            });
        }


        // اگر Servix خطا داد
        if (!response.ok) {

            return res.status(
                response.status
            ).json(data);
        }


        // ذخیره پاسخ موفق
        cachedData = data;
        cacheTime = Date.now();


        res.setHeader(
            "Cache-Control",
            "s-maxage=300, stale-while-revalidate=60"
        );


        res.setHeader(
            "X-Price-Cache",
            "MISS"
        );


        return res.status(200).json(data);


    } catch (error) {

        console.error(
            "SERVIX ERROR:",
            error
        );


        // اگر Servix موقتاً مشکل داشت ولی
        // قبلاً داده‌ای داریم، همان داده را بده
        if (cachedData) {

            res.setHeader(
                "X-Price-Cache",
                "STALE"
            );

            return res.status(200).json(
                cachedData
            );
        }


        return res.status(500).json({
            error: "API_ERROR",
            message: error.message
        });
    }
}
