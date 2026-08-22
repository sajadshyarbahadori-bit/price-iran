async function updatePrices() {
    const gold18 = document.getElementById("gold18");
    const dollar = document.getElementById("dollar");
    const updateTime = document.getElementById("updateTime");

    gold18.textContent = "در حال دریافت...";
    dollar.textContent = "در حال دریافت...";
    updateTime.textContent = "🔄 در حال بروزرسانی...";

    try {
        const response = await fetch(
            "https://api.tgju.org/v1/market/indicator/price_dollar_rl"
        );

        if (!response.ok) {
            throw new Error("API Error");
        }

        const data = await response.json();

        console.log("TGJU:", data);

        dollar.textContent =
            Number(data.data?.p).toLocaleString("fa-IR") + " ریال";

        gold18.textContent = "تست اتصال";

        updateTime.textContent =
            "آخرین بروزرسانی: " +
            new Date().toLocaleTimeString("fa-IR");

    } catch (error) {
        console.error(error);

        gold18.textContent = "خطا";
        dollar.textContent = "خطا";
        updateTime.textContent = "❌ دریافت قیمت ناموفق بود";
    }
}

updatePrices();
