```js
let previousPrices = {};

async function updatePrices() {
    const updateTime = document.getElementById("updateTime");

    updateTime.textContent = "در حال دریافت قیمت‌ها...";

    try {
        const response = await fetch("/api/prices?time=" + Date.now(), {
            method: "GET",
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("API status: " + response.status);
        }

        const prices = await response.json();

        console.log("Prices:", prices);

        if (!Array.isArray(prices)) {
            throw new Error("فرمت پاسخ API آرایه نیست");
        }

        const data = {};

        prices.forEach(item => {
            if (item && item.code != null) {
                data[String(item.code)] = Number(item.value);
            }
        });

        function rial(value) {
            if (!Number.isFinite(value)) {
                return "داده موجود نیست";
            }

            return Math.round(value).toLocaleString("fa-IR") + " ریال";
        }

        function usd(value) {
            if (!Number.isFinite(value)) {
                return "داده موجود نیست";
            }

            return Number(value).toLocaleString("en-US", {
                maximumFractionDigits: 4
            }) + " USD";
        }

        function showChange(id, key, value, formatter) {
            const element = document.getElementById(id);

            if (!element) return;

            element.textContent = formatter(value);

            if (!Number.isFinite(value)) return;

            if (previousPrices[key] !== undefined) {
                const oldValue = previousPrices[key];

                if (oldValue !== 0) {
                    const changePercent =
                        ((value - oldValue) / oldValue) * 100;

                    let changeText = "";

                    if (changePercent > 0) {
                        changeText =
                            ` ↑ ${changePercent.toFixed(2)}٪ افزایش`;
                    } else if (changePercent < 0) {
                        changeText =
                            ` ↓ ${Math.abs(changePercent).toFixed(2)}٪ کاهش`;
                    } else {
                        changeText = " ـ بدون تغییر";
                    }

                    element.textContent =
                        formatter(value) + changeText;
                }
            }

            previousPrices[key] = value;
        }

        // طلا
        showChange(
            "gold18",
            "GOLD_18_RLS",
            data.GOLD_18_RLS,
            rial
        );

        showChange(
            "gold24",
            "GOLD_24_RLS",
            data.GOLD_24_RLS,
            rial
        );

        showChange(
            "mesghal",
            "GOLD_MESGHAL_RLS",
            data.GOLD_MESGHAL_RLS,
            rial
        );

        // نقره
        if (
            Number.isFinite(data.SILVER_OUNCE_USD) &&
            Number.isFinite(data.USD_RLS)
        ) {
            const silver999 =
                (data.SILVER_OUNCE_USD / 31.1034768) *
                data.USD_RLS;

            showChange(
                "silver999",
                "SILVER_999",
                silver999,
                rial
            );

            showChange(
                "silver925",
                "SILVER_925",
                silver999 * 0.925,
                rial
            );

            showChange(
                "silverKg",
                "SILVER_KG",
                silver999 * 1000,
                rial
            );
        } else {
            document.getElementById("silver999").textContent =
                "داده موجود نیست";

            document.getElementById("silver925").textContent =
                "داده موجود نیست";

            document.getElementById("silverKg").textContent =
                "داده موجود نیست";
        }

        // سکه
        showChange(
            "coin",
            "SEKKEH_RLS",
            data.SEKKEH_RLS,
            rial
        );

        showChange(
            "bahar",
            "BAHAR_RLS",
            data.BAHAR_RLS,
            rial
        );

        showChange(
            "halfCoin",
            "NIM_SEKKEH_RLS",
            data.NIM_SEKKEH_RLS,
            rial
        );

        showChange(
            "quarterCoin",
            "ROB_SEKKEH_RLS",
            data.ROB_SEKKEH_RLS,
            rial
        );

        showChange(
            "gramCoin",
            "GERAMI_SEKKEH_RLS",
            data.GERAMI_SEKKEH_RLS,
            rial
        );

        // ارز
        showChange(
            "dollar",
            "USD_RLS",
            data.USD_RLS,
            rial
        );

        showChange(
            "euro",
            "EUR_RLS",
            data.EUR_RLS,
            rial
        );

        showChange(
            "pound",
            "GBP_RLS",
            data.GBP_RLS,
            rial
        );

        showChange(
            "dirham",
            "AED_RLS",
            data.AED_RLS,
            rial
        );

        showChange(
            "lira",
            "TRY_RLS",
            data.TRY_RLS,
            rial
        );

        // بازار جهانی
        showChange(
            "goldOunce",
            "GOLD_OUNCE_USD",
            data.GOLD_OUNCE_USD,
            usd
        );

        showChange(
            "silverOunce",
            "SILVER_OUNCE_USD",
            data.SILVER_OUNCE_USD,
            usd
        );

        updateTime.textContent =
            "آخرین بروزرسانی: " +
            new Date().toLocaleTimeString("fa-IR");

    } catch (error) {
        console.error("Price update error:", error);

        updateTime.textContent =
            "خطا در دریافت قیمت‌ها ❌";
    }
}

// دریافت خودکار هنگام باز شدن سایت
updatePrices();
```
