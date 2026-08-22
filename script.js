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

        // تبدیل ریال به نمایش فارسی
        const rial = value =>
            value == null
                ? "داده موجود نیست"
                : Math.round(value).toLocaleString("fa-IR") + " ریال";

        // نمایش قیمت دلاری
        const usd = value =>
            value == null
                ? "داده موجود نیست"
                : Number(value).toLocaleString("en-US", {
                    maximumFractionDigits: 4
                }) + " USD";

        // =========================
        // طلا
        // =========================

        document.getElementById("gold18").textContent =
            rial(data.GOLD_18_RLS);

        document.getElementById("gold24").textContent =
            rial(data.GOLD_24_RLS);

        document.getElementById("mesghal").textContent =
            rial(data.GOLD_MESGHAL_RLS);

        // آبشده و طلای دست دوم
        document.getElementById("abshodeh").textContent =
            "داده موجود نیست";

        document.getElementById("secondGold").textContent =
            "داده موجود نیست";


        // =========================
        // نقره
        // =========================

        const silverOunce = data.SILVER_OUNCE_USD;

        if (silverOunce != null) {

            // هر اونس تروا = 31.1034768 گرم
            const silverGramUSD =
                silverOunce / 31.1034768;

            // تبدیل تقریبی به ریال با نرخ دلار
            const silverGramRial =
                silverGramUSD * data.USD_RLS;

            // نقره 999
            document.getElementById("silver999").textContent =
                rial(silverGramRial);

            // نقره 925
            const silver925Rial =
                silverGramRial * 0.925;

            document.getElementById("silver925").textContent =
                rial(silver925Rial);

            // یک کیلو نقره 999
            const silverKgRial =
                silverGramRial * 1000;

            document.getElementById("silverKg").textContent =
                rial(silverKgRial);

        } else {

            document.getElementById("silver999").textContent =
                "داده موجود نیست";

            document.getElementById("silver925").textContent =
                "داده موجود نیست";

            document.getElementById("silverKg").textContent =
                "داده موجود نیست";
        }


        // =========================
        // سکه
        // =========================

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


        // =========================
        // ارز
        // =========================

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


        // =========================
        // بازار جهانی
        // =========================

        document.getElementById("goldOunce").textContent =
            usd(data.GOLD_OUNCE_USD);

        document.getElementById("silverOunce").textContent =
            usd(data.SILVER_OUNCE_USD);

        // DXY فعلاً در API موجود نیست
        document.getElementById("dxy").textContent =
            "داده موجود نیست";


        // =========================
        // زمان بروزرسانی
        // =========================

        updateTime.textContent =
            "آخرین بروزرسانی: " +
            new Date().toLocaleTimeString("fa-IR");

    } catch (error) {

        console.error(error);

        updateTime.textContent =
            "خطا در دریافت قیمت‌ها";
    }
}


// اجرای اولیه
updatePrices();
