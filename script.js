async function updatePrices() {
    alert("تابع اجرا شد!");

    try {
        const response = await fetch("https://api.persiantoolbox.ir/market");
        alert("پاسخ API: " + response.status);

        const data = await response.json();
        alert(JSON.stringify(data).slice(0, 500));

    } catch (error) {
        alert("خطا: " + error.message);
    }
}

updatePrices();
