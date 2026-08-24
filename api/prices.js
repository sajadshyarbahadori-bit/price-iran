let cachedData = null;
let cacheTime = 0;
let rateLimitedUntil = 0;

const CACHE_TIME = 30 * 60 * 1000; // 30 دقیقه
const RATE_LIMIT_COOLDOWN = 30 * 60 * 1000; // 30 دقیقه

export default async function handler(req, res) {

    try {

        const now = Date.now();

        // اگر Rate Limit فعال است
        if (now < rateLimitedUntil) {

            if (cachedData) {

                res.setHeader(
                    "X-Price-Cache",
                    "RATE-LIMIT-CACHE"
                );

                return res.status(200).json(cachedData);
            }

            return res.status(429).json({
                error: "RATE_LIMITED",
                message:
                    "Servix temporarily rate limited"
            });
        }


        // اگر کش هنوز معتبر است
        if (
            cachedData &&
            now - cacheTime < CACHE_TIME
        ) {

            res.setHeader(
                "Cache-Control",
                "s-maxage=1800, stale-while-revalidate=300"
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


        // Rate Limit
        if (response.status === 429) {

            rateLimitedUntil =
                Date.now() +
                RATE_LIMIT_COOLDOWN;


            if (cachedData) {

                res.setHeader(
                    "X-Price-Cache",
                    "STALE"
                );

                return res.status(200).json(
                    cachedData
                );
            }


            return res.status(429).json({
                error: "RATE_LIMITED",
                message:
                    "Servix request limit reached"
            });
        }


        if (!response.ok) {

            return res.status(
                response.status
            ).json(data);
        }


        // ذخیره قیمت موفق
        cachedData = data;
        cacheTime = Date.now();


        res.setHeader(
            "Cache-Control",
            "s-maxage=1800, stale-while-revalidate=300"
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


        // اگر قبلاً قیمت داشتیم
        if (cachedData) {

            res.setHeader(
                "X-Price-Cache",
                "ERROR-CACHE"
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
