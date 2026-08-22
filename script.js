async function updatePrices() {
    const updateTime = document.getElementById("updateTime");

    try {
        updateTime.textContent = "در حال بروزرسانی...";

        const response = await fetch("/api/prices");

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const prices = await response.json();

        const data = {};

        prices.forEach(item => {
            data[item.code] = item.value;
        });

        const rial = value =>
            value == null
                ? "ناموجود"
                : Math.round(value).toLocaleString("fa-IR") + " ریال";

        const usd = value =>
            value == null
                ? "ناموجود"
                : Number(value).toLocaleString("en-US", {
                    maximumFractionDigits: 4
                }) + " USD";

        document.getElementById("gold18").textContent =
            rial(data.GOLD_18_RLS);

        document.getElementById("gold24").textContent =
            rial(data.GOLD_24_RLS);

        document.getElementById("mesghal").textContent =
            rial(data.GOLD_MESGHAL_RLS);

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

        document.getElementById("goldOunce").textContent =
            usd(data.GOLD_OUNCE_USD);

        document.getElementById("silverOunce").textContent =
            usd(data.SILVER_OUNCE_USD);

        updateTime.textContent =
            "آخرین بروزرسانی: " +
            new Date().toLocaleTimeString("fa-IR");

    } catch (error) {
        console.error(error);
        updateTime.textContent =
            "خطا در دریافت قیمت‌ها";
    }
}

updatePrices();
