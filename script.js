function updatePrices() {
    const time = document.getElementById("updateTime");

    if (time) {
        time.textContent =
            "آخرین بروزرسانی: " +
            new Date().toLocaleTimeString("fa-IR");
    }
}

updatePrices();
