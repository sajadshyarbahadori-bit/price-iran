const API_URL = "https://api.persiantoolbox.ir/market";

async function updatePrices() {
    const ids = [
        "gold18",
        "mesghal",
        "coin",
        "dollar"
    ];

    ids.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = "در حال دریافت...";
        }
    });

    try {
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("خطا در دریافت اطلاعات");
        }

        const data = await response.json();

        console.log("اطلاعات API:", data);
        alert(JSON.stringify(data, null, 2));

        // فعلاً زمان بروزرسانی را نمایش می‌دهیم
        const timeElement = document.getElementById("updateTime");

        if (timeElement) {
            timeElement.textContent =
                "آخرین بروزرسانی: " +
                new Date().toLocaleTimeString("fa-IR");
        }

    } catch (error) {
        console.error(error);

        const timeElement = document.getElementById("updateTime");

        if (timeElement) {
            timeElement.textContent =
                "❌ دریافت قیمت‌ها ناموفق بود";
        }
    }
}

// اجرای اولیه
updatePrices();
