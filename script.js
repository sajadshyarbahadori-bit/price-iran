```javascript
async function updatePrices() {
    const updateTime = document.getElementById("updateTime");

    try {
        updateTime.textContent = "در حال بروزرسانی...";

        const response = await fetch("/api/prices", {
            method: "GET",
            cache: "no-store"
        });

        const text = await response.text();

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} - ${text}`);
        }

        const prices = JSON.parse(text);

        if (!Array.isArray(prices)) {
            throw new Error("فرمت پاسخ API آرایه نیست");
        }

        const data = {};

        prices.forEach(item => {
            if (item && item.code) {
                data[item.code] = item.value;
            }
        });

        const rial = value => {
            if (value == null || isNaN(value)) {
                return "داده موجود نیست";
            }

            return Math.round(value).toLocaleString("fa-IR") + " ریال";
        };

        const usd = value => {
            if (value == null || isNaN(value)) {
                return "داده موجود نیست";
            }

            return Number(value).toLocaleString("en-US", {
                maximumFractionDigits: 4
            }) + " USD";
        };


        // طلا
        document.getElementById("gold18").textContent =
            rial(data.GOLD_18_RLS);

        document.getElementById("gold24").textContent =
            rial(data.GOLD_24_RLS);

        document.getElementById("mesghal").textContent =
            rial(data.GOLD_MESGHAL_RLS);


        // نقره
        const silverOunce = data.SILVER_OUNCE_USD;
        const dollar = data.USD_RLS;

        if (silverOunce != null && dollar != null) {

            const silverGramUSD =
                silverOunce / 31.1034768;

            const silver999Rial =
                silverGramUSD * dollar;

            document.getElementById("silver999").textContent =
                rial(silver999Rial);

            document.getElementById("silver925").textContent =
                rial(silver999Rial * 0.925);

            document.getElementById("silverKg").textContent =
                rial(silver999Rial * 1000);

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


        // زمان
        updateTime.textContent =
            "آخرین بروزرسانی: " +
            new Date().toLocaleTimeString("fa-IR");

    } catch (error) {

        console.error("Price update error:", error);

        updateTime.textContent =
            "خطا در دریافت قیمت‌ها";
    }
}


// اجرای اولیه
updatePrices();
```
