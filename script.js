const API_URL = "https://persiantoolbox.ir/api/market";

async function updatePrices() {
    const timeElement = document.getElementById("updateTime");

    try {
        if (timeElement) {
            timeElement.textContent = "در حال دریافت قیمت‌ها...";
        }

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("خطای سرور: " + response.status);
        }

        const result = await response.json();

        if (!result.ok) {
            throw new Error("داده معتبر نیست");
        }

        const data = result.data;

        console.log("اطلاعات بازار:", data);

        // طلای ۱۸ عیار
        const gold18 = document.getElementById("gold18");
        if (gold18 && data.gold) {
            gold18.textContent =
                Math.round(data.gold.pricePerGram * 0.75).toLocaleString("fa-IR") + " ریال";
        }

        // دلار
        const dollar = document.getElementById("dollar");
        if (dollar && data.currencies?.USD) {
            dollar.textContent =
                Number(data.currencies.USD.rate).toLocaleString("fa-IR") + " ریال";
        }

        // زمان بروزرسانی
        if (timeElement) {
            const time = new Date(data.timestamp);

            timeElement.textContent =
                "آخرین بروزرسانی: " +
                time.toLocaleTimeString("fa-IR");
        }

    } catch (error) {
        console.error("خطا:", error);

        if (timeElement) {
            timeElement.textContent =
                "❌ دریافت قیمت‌ها ناموفق بود";
        }
    }
}

// دریافت اولیه
updatePrices();
