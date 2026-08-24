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

        function showPrice(id, key, value, formatter) {
            const element = document.getElementById(id);

            if (!element) return;

            if (!Number.isFinite(value)) {
                element.textContent = "داده موجود نیست";
                return;
            }

            let changeText = "";

            if (previousPrices[key] !== undefined) {
                const oldValue = previousPrices[key];

                if (value > oldValue) {
                    const percent = ((value - oldValue) / oldValue) * 100;
                    changeText = ` ↑ ${percent.toFixed(2)}٪`;
                } else if (value < oldValue) {
                    const percent = ((oldValue - value) / oldValue) * 100;
                    changeText = ` ↓ ${percent.toFixed(2)}٪`;
                } else {
                    changeText = " ـ بدون تغییر";
                }
            }

            element.textContent = formatter(value) + changeText;

            previousPrices[key] = value;
        }


        // =========================
        // طلا
        // =========================

        showPrice(
            "gold18",
            "GOLD_18_RLS",
            data.GOLD_18_RLS,
            rial
        );

        showPrice(
            "gold24",
            "GOLD_24_RLS",
            data.GOLD_24_RLS,
            rial
        );

        showPrice(
            "mesghal",
            "GOLD_MESGHAL_RLS",
            data.GOLD_MESGHAL_RLS,
            rial
        );


        // =========================
        // حباب محاسباتی طلای ۱۸
        // =========================

        const calculatedElement =
            document.getElementById("gold18Calculated");

        const bubbleElement =
            document.getElementById("gold18Bubble");

        const percentElement =
            document.getElementById("gold18BubblePercent");

        const gold18 = data.GOLD_18_RLS;
        const goldOunce = data.GOLD_OUNCE_USD;
        const dollar = data.USD_RLS;

        if (
            Number.isFinite(gold18) &&
            Number.isFinite(goldOunce) &&
            Number.isFinite(dollar)
        ) {

            // هر اونس = 31.1034768 گرم
            const pureGoldPerGram =
                (goldOunce * dollar) / 31.1034768;

            // طلای ۱۸ عیار = ۷۵٪ طلای خالص
            const calculatedGold18 =
                pureGoldPerGram * 0.75;

            // اختلاف قیمت بازار و قیمت محاسباتی
            const bubble =
                gold18 - calculatedGold18;

            // درصد حباب
            const bubblePercent =
                (bubble / calculatedGold18) * 100;

            calculatedElement.textContent =
                rial(calculatedGold18);

            bubbleElement.textContent =
                rial(bubble);

            percentElement.textContent =
                bubblePercent.toFixed(2) + "٪";

        } else {

            calculatedElement.textContent =
                "داده موجود نیست";

            bubbleElement.textContent =
                "داده موجود نیست";

            percentElement.textContent =
                "داده موجود نیست";
        }


        // =========================
        // نقره
        // =========================

        if (
            Number.isFinite(data.SILVER_OUNCE_USD) &&
            Number.isFinite(data.USD_RLS)
        ) {

            const silver999 =
                (data.SILVER_OUNCE_USD / 31.1034768) *
                data.USD_RLS;

            showPrice(
                "silver999",
                "SILVER_999",
                silver999,
                rial
            );

            showPrice(
                "silver925",
                "SILVER_925",
                silver999 * 0.925,
                rial
            );

            showPrice(
                "silverKg",
                "SILVER_KG",
                silver999 * 1000,
                rial
            );
        }


        // =========================
        // سکه
        // =========================

        showPrice(
            "coin",
            "SEKKEH_RLS",
            data.SEKKEH_RLS,
            rial
        );

        showPrice(
            "bahar",
            "BAHAR_RLS",
            data.BAHAR_RLS,
            rial
        );

        showPrice(
            "halfCoin",
            "NIM_SEKKEH_RLS",
            data.NIM_SEKKEH_RLS,
            rial
        );

        showPrice(
            "quarterCoin",
            "ROB_SEKKEH_RLS",
            data.ROB_SEKKEH_RLS,
            rial
        );

        showPrice(
            "gramCoin",
            "GERAMI_SEKKEH_RLS",
            data.GERAMI_SEKKEH_RLS,
            rial
        );


        // =========================
        // ارز
        // =========================

        showPrice(
            "dollar",
            "USD_RLS",
            data.USD_RLS,
            rial
        );

        showPrice(
            "euro",
            "EUR_RLS",
            data.EUR_RLS,
            rial
        );

        showPrice(
            "pound",
            "GBP_RLS",
            data.GBP_RLS,
            rial
        );

        showPrice(
            "dirham",
            "AED_RLS",
            data.AED_RLS,
            rial
        );

        showPrice(
            "lira",
            "TRY_RLS",
            data.TRY_RLS,
            rial
        );


        // =========================
        // بازار جهانی
        // =========================

        showPrice(
            "goldOunce",
            "GOLD_OUNCE_USD",
            data.GOLD_OUNCE_USD,
            usd
        );

        showPrice(
            "silverOunce",
            "SILVER_OUNCE_USD",
            data.SILVER_OUNCE_USD,
            usd
        );


        // =========================
        // زمان بروزرسانی
        // =========================

        updateTime.textContent =
            "آخرین بروزرسانی: " +
            new Date().toLocaleTimeString("fa-IR");

    } catch (error) {

        console.error("Price update error:", error);

        updateTime.textContent =
            "خطا در دریافت قیمت‌ها ❌";
    }
}


// اجرای اولیه
updatePrices();
