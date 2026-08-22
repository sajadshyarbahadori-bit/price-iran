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

        // طلا
        document.getElementById("gold18").textContent =
            rial(data.GOLD_18_RLS);

        document.getElementById("gold24").textContent =
            rial(data.GOLD_24_RLS);

        document.getElementById("mesghal").textContent =
            rial(data.GOLD_MESGHAL_RLS);

        // نقره
        if (
            Number.isFinite(data.SILVER_OUNCE_USD) &&
            Number.isFinite(data.USD_RLS)
        ) {
            const silver999 =
                (data.SILVER_OUNCE_USD / 31.1034768) *
                data.USD_RLS;

            document.getElementById("silver999").textContent =
                rial(silver999);

            document.getElementById("silver925").textContent =
                rial(silver999 * 0.925);

            document.getElementById("silverKg").textContent =
                rial(silver999 * 1000);
        } else {
            document.getElementById("silver999").textContent =
                "داده موجود نیست";

            document.getElementById("silver925").textContent =
                "داده موجود نیست";

            document.getElementById("silverKg").textContent =
                "داده موجود نیست";
        }

        // سکه
        document.getElementById("coin").textContent =
            rial(data.SEKKEH_RLS);

        document.getElementById("bahar").textContent =
            rial(data.BAHAR_RLS);

        document.getElementById("halfCoin").textContent =
            rial(data.NIM_SEKKEH_RLS);

        document.getElementById("quarterCoin").textContent =
            rial(data.ROB_SEKKEH_RLS);

        document.getElementById("gramCoin").textContent =
            rial(data.GERAMI_SEKKEH_RLS);

        // ارز
        document.getElementById("dollar").textContent =
            rial(data.USD_RLS);

        document.getElementById("euro").textContent =
            rial(data.EUR_RLS);

        document.getElementById("pound").textContent =
            rial(data.GBP_RLS);

        document.getElementById("dirham").textContent =
            rial(data.AED_RLS);

        document.getElementById("lira").textContent =
            rial(data.TRY_RLS);

        // بازار جهانی
        document.getElementById("goldOunce").textContent =
            usd(data.GOLD_OUNCE_USD);

        document.getElementById("silverOunce").textContent =
            usd(data.SILVER_OUNCE_USD);

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
