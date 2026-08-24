let previousPrices = {};

async function updatePrices() {

    const updateTime =
        document.getElementById("updateTime");

    updateTime.textContent =
        "در حال دریافت قیمت‌ها...";

    try {

        const response =
            await fetch(
                "/api/prices?time=" + Date.now(),
                {
                    method: "GET",
                    cache: "no-store"
                }
            );

        if (!response.ok) {

            throw new Error(
                "API status: " +
                response.status
            );
        }

        const prices =
            await response.json();

        console.log("API:", prices);

        if (!Array.isArray(prices)) {

            throw new Error(
                "API response is not an array"
            );
        }

        const data = {};

        prices.forEach(item => {

            if (
                item &&
                item.code != null
            ) {

                data[String(item.code)] =
                    Number(item.value);
            }
        });


        function rial(value) {

            if (!Number.isFinite(value)) {
                return "داده موجود نیست";
            }

            return (
                Math.round(value)
                    .toLocaleString("fa-IR")
                + " ریال"
            );
        }


        function show(id, key) {

            const element =
                document.getElementById(id);

            if (!element) return;

            const value =
                data[key];

            if (!Number.isFinite(value)) {

                element.textContent =
                    "داده موجود نیست";

                return;
            }

            element.textContent =
                rial(value);
        }


        // طلا
        show(
            "gold18",
            "GOLD_18_RLS"
        );

        show(
            "gold24",
            "GOLD_24_RLS"
        );

        show(
            "mesghal",
            "GOLD_MESGHAL_RLS"
        );


        // نقره
        if (
            Number.isFinite(
                data.SILVER_OUNCE_USD
            ) &&
            Number.isFinite(
                data.USD_RLS
            )
        ) {

            const silver999 =
                (
                    data.SILVER_OUNCE_USD /
                    31.1034768
                ) *
                data.USD_RLS;


            const silver925 =
                silver999 * 0.925;


            const silverKg =
                silver999 * 1000;


            document.getElementById(
                "silver999"
            ).textContent =
                rial(silver999);


            document.getElementById(
                "silver925"
            ).textContent =
                rial(silver925);


            document.getElementById(
                "silverKg"
            ).textContent =
                rial(silverKg);
        }


        // سکه
        show(
            "coin",
            "SEKKEH_RLS"
        );

        show(
            "bahar",
            "BAHAR_RLS"
        );

        show(
            "halfCoin",
            "NIM_SEKKEH_RLS"
        );

        show(
            "quarterCoin",
            "ROB_SEKKEH_RLS"
        );

        show(
            "gramCoin",
            "GERAMI_SEKKEH_RLS"
        );


        // ارز
        show(
            "dollar",
            "USD_RLS"
        );

        show(
            "euro",
            "EUR_RLS"
        );

        show(
            "pound",
            "GBP_RLS"
        );

        show(
            "dirham",
            "AED_RLS"
        );

        show(
            "lira",
            "TRY_RLS"
        );


        // بازار جهانی
        const goldOunce =
            document.getElementById(
                "goldOunce"
            );

        if (
            goldOunce &&
            Number.isFinite(
                data.GOLD_OUNCE_USD
            )
        ) {

            goldOunce.textContent =
                data.GOLD_OUNCE_USD
                    .toLocaleString(
                        "en-US",
                        {
                            maximumFractionDigits: 4
                        }
                    )
                + " USD";
        }


        const silverOunce =
            document.getElementById(
                "silverOunce"
            );

        if (
            silverOunce &&
            Number.isFinite(
                data.SILVER_OUNCE_USD
            )
        ) {

            silverOunce.textContent =
                data.SILVER_OUNCE_USD
                    .toLocaleString(
                        "en-US",
                        {
                            maximumFractionDigits: 4
                        }
                    )
                + " USD";
        }


        updateTime.textContent =
            "آخرین بروزرسانی: " +
            new Date().toLocaleTimeString(
                "fa-IR"
            );

    } catch (error) {

        console.error(
            "PRICE API ERROR:",
            error
        );

        updateTime.textContent =
            "❌ خطا در دریافت قیمت‌ها";
    }
}


updatePrices();
