function updatePrices() {
    const gold18 = document.getElementById("gold18");
    const dollar = document.getElementById("dollar");
    const updateTime = document.getElementById("updateTime");

    if (gold18) {
        gold18.textContent = "۶,۵۰۰,۰۰۰ ریال";
    }

    if (dollar) {
        dollar.textContent = "۹۵۰,۰۰۰ ریال";
    }

    if (updateTime) {
        updateTime.textContent =
            "آخرین بروزرسانی: " +
            new Date().toLocaleTimeString("fa-IR");
    }
}

updatePrices();
