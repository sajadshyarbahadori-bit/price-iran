async function updatePrices() {
    const updateTime = document.getElementById("updateTime");

    try {
        updateTime.textContent = "در حال دریافت قیمت‌ها...";

        const response = await fetch("/api/prices", {
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("API status: " + response.status);
        }

        const data = await response.json();

        console.log("API:", data);

        updateTime.textContent =
            "اتصال به API موفق بود ✅";

    } catch (error) {
        console.error(error);

        updateTime.textContent =
            "خطا در اتصال به API ❌";
    }
}

updatePrices();
