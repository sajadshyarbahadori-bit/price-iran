function updatePrices() {
    document.getElementById("gold18").textContent = "در حال دریافت...";
    document.getElementById("mesghal").textContent = "در حال دریافت...";
    document.getElementById("coin").textContent = "در حال دریافت...";
    document.getElementById("dollar").textContent = "در حال دریافت...";

    document.getElementById("updateTime").textContent =
        "آخرین بروزرسانی: " + new Date().toLocaleTimeString("fa-IR");
}

updatePrices();