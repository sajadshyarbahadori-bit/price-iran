let previousPrices = {};
let currentData = {};

let chart;
let chartHistory = {
    gold18: [],
    dollar: [],
    coin: [],
    silver: []
};

let priceAlert = null;
let autoUpdateTimer = null;


// ===============================
// ابزارها
// ===============================

function rial(value) {

    if (!Number.isFinite(value)) {
        return "داده موجود نیست";
    }

    return Math.round(value).toLocaleString("fa-IR") + " ریال";
}


function usd(value) {

    if (!Number.isFinite(value)) {
        return "داده موجود نیست";
    }

    return Number(value).toLocaleString("en-US", {
        maximumFractionDigits: 4
    }) + " USD";
}


function number(value) {

    return Number(value).toLocaleString("fa-IR", {
        maximumFractionDigits: 2
    });
}


function percent(value) {

    if (!Number.isFinite(value)) {
        return "---";
    }

    return (value >= 0 ? "+" : "") +
        value.toFixed(2) +
        "٪";
}


// ===============================
// نمایش قیمت
// ===============================

function showPrice(id, key, value, formatter) {

    const element = document.getElementById(id);

    if (!element) return;

    if (!Number.isFinite(value)) {
        element.textContent = "داده موجود نیست";
        return;
    }

    let changeText = "";

    if (
        previousPrices[key] !== undefined &&
        previousPrices[key] !== 0
    ) {

        const oldValue = previousPrices[key];

        if (value > oldValue) {

            const p =
                ((value - oldValue) / oldValue) * 100;

            changeText =
                ` ↑ ${p.toFixed(2)}٪`;

        } else if (value < oldValue) {

            const p =
                ((oldValue - value) / oldValue) * 100;

            changeText =
                ` ↓ ${p.toFixed(2)}٪`;

        } else {

            changeText = " ـ بدون تغییر";
        }
    }

    element.textContent =
        formatter(value) + changeText;

    previousPrices[key] = value;
}


// ===============================
// حباب طلا
// ===============================

function calculateGoldBubble() {

    const gold18 = currentData.GOLD_18_RLS;
    const goldOunce = currentData.GOLD_OUNCE_USD;
    const dollar = currentData.USD_RLS;

    const calculatedElement =
        document.getElementById("gold18Calculated");

    const bubbleElement =
        document.getElementById("gold18Bubble");

    const percentElement =
        document.getElementById("gold18BubblePercent");

    if (
        !Number.isFinite(gold18) ||
        !Number.isFinite(goldOunce) ||
        !Number.isFinite(dollar)
    ) {

        calculatedElement.textContent = "داده موجود نیست";
        bubbleElement.textContent = "داده موجود نیست";
        percentElement.textContent = "داده موجود نیست";

        return;
    }

    const pureGoldPerGram =
        (goldOunce * dollar) / 31.1034768;

    const calculatedGold18 =
        pureGoldPerGram * 0.75;

    const bubble =
        gold18 - calculatedGold18;

    const bubblePercent =
        (bubble / calculatedGold18) * 100;

    calculatedElement.textContent =
        rial(calculatedGold18);

    bubbleElement.textContent =
        rial(bubble);

    percentElement.textContent =
        percent(bubblePercent);

    bubbleElement.className =
        bubble >= 0 ? "up" : "down";
}


// ===============================
// حباب سکه
// ===============================

function calculateCoinBubbles() {

    const gold18 = currentData.GOLD_18_RLS;

    if (!Number.isFinite(gold18)) return;

    /*
       وزن تقریبی سکه‌ها:
       امامی / بهار آزادی = 8.133 گرم
       نیم = 4.0665 گرم
       ربع = 2.03225 گرم
       گرمی = 1.01 گرم

       طلای خالص سکه ≈ 90%
    */

    const coins = [

        {
            price: currentData.SEKKEH_RLS,
            id: "coinBubble",
            weight: 8.133
        },

        {
            price: currentData.BAHAR_RLS,
            id: "baharBubble",
            weight: 8.133
        },

        {
            price: currentData.NIM_SEKKEH_RLS,
            id: "halfCoinBubble",
            weight: 4.0665
        },

        {
            price: currentData.ROB_SEKKEH_RLS,
            id: "quarterCoinBubble",
            weight: 2.03225
        },

        {
            price: currentData.GERAMI_SEKKEH_RLS,
            id: "gramCoinBubble",
            weight: 1.01
        }

    ];


    coins.forEach(coin => {

        const element =
            document.getElementById(coin.id);

        if (
            !element ||
            !Number.isFinite(coin.price)
        ) return;

        const intrinsic =
            gold18 *
            coin.weight *
            0.9;

        const bubble =
            coin.price - intrinsic;

        const bubblePercent =
            (bubble / intrinsic) * 100;

        element.textContent =
            "حباب: " +
            rial(bubble) +
            " (" +
            percent(bubblePercent) +
            ")";

        element.className =
            bubble >= 0 ? "up" : "down";
    });
}


// ===============================
// داشبورد
// ===============================

function updateDashboard() {

    const assets = [

        {
            name: "طلای ۱۸ عیار",
            value: currentData.GOLD_18_RLS,
            previous: previousPrices.GOLD_18_RLS
        },

        {
            name: "دلار",
            value: currentData.USD_RLS,
            previous: previousPrices.USD_RLS
        },

        {
            name: "سکه امامی",
            value: currentData.SEKKEH_RLS,
            previous: previousPrices.SEKKEH_RLS
        },

        {
            name: "نقره",
            value: currentData.SILVER_OUNCE_USD,
            previous: previousPrices.SILVER_OUNCE_USD
        }

    ];


    document.getElementById("dashboardGold").textContent =
        rial(currentData.GOLD_18_RLS);

    document.getElementById("dashboardDollar").textContent =
        rial(currentData.USD_RLS);

    document.getElementById("dashboardCoin").textContent =
        rial(currentData.SEKKEH_RLS);

    document.getElementById("dashboardSilver").textContent =
        usd(currentData.SILVER_OUNCE_USD);


    const changes = assets.map(asset => {

        if (
            !Number.isFinite(asset.value) ||
            !Number.isFinite(asset.previous) ||
            asset.previous === 0
        ) {
            return {
                ...asset,
                change: 0
            };
        }

        return {
            ...asset,
            change:
                ((asset.value - asset.previous) /
                    asset.previous) * 100
        };

    });


    const biggestUp =
        [...changes].sort(
            (a, b) => b.change - a.change
        )[0];

    const biggestDown =
        [...changes].sort(
            (a, b) => a.change - b.change
        )[0];


    if (biggestUp) {

        document.getElementById("topGainer").textContent =
            biggestUp.name;

        document.getElementById("topGainerPercent").textContent =
            percent(biggestUp.change);

        document.getElementById("topGainerPercent").className =
            "up";
    }


    if (biggestDown) {

        document.getElementById("topLoser").textContent =
            biggestDown.name;

        document.getElementById("topLoserPercent").textContent =
            percent(biggestDown.change);

        document.getElementById("topLoserPercent").className =
            "down";
    }


    const average =
        changes.reduce(
            (sum, item) => sum + item.change,
            0
        ) / changes.length;


    const status =
        document.getElementById("marketStatus");


    if (average > 0.15) {

        status.textContent = "🟢 بازار صعودی";

    } else if (average < -0.15) {

        status.textContent = "🔴 بازار نزولی";

    } else {

        status.textContent = "🟡 بازار تقریباً ثابت";
    }
}


// ===============================
// نمودار
// ===============================

function addChartData() {

    const time =
        new Date().toLocaleTimeString("fa-IR", {
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit"
        });


    chartHistory.gold18.push({
        time,
        value: currentData.GOLD_18_RLS
    });

    chartHistory.dollar.push({
        time,
        value: currentData.USD_RLS
    });

    chartHistory.coin.push({
        time,
        value: currentData.SEKKEH_RLS
    });


    if (
        Number.isFinite(currentData.SILVER_OUNCE_USD) &&
        Number.isFinite(currentData.USD_RLS)
    ) {

        const silver =
            (currentData.SILVER_OUNCE_USD / 31.1034768) *
            currentData.USD_RLS;

        chartHistory.silver.push({
            time,
            value: silver
        });
    }


    Object.keys(chartHistory).forEach(key => {

        if (chartHistory[key].length > 40) {
            chartHistory[key].shift();
        }

    });
}


function updateChart() {

    const select =
        document.getElementById("chartSelect");

    const selected =
        select.value;

    const history =
        chartHistory[selected] || [];


    const labels =
        history.map(item => item.time);

    const values =
        history.map(item => item.value);


    if (!chart) {

        const ctx =
            document.getElementById("priceChart")
                .getContext("2d");


        chart = new Chart(ctx, {

            type: "line",

            data: {

                labels,

                datasets: [{
                    label: "قیمت",
                    data: values,
                    borderWidth: 3,
                    tension: 0.35,
                    fill: false
                }]

            },

            options: {

                responsive: true,

                maintainAspectRatio: false,

                interaction: {
                    intersect: false,
                    mode: "index"
                },

                plugins: {
                    legend: {
                        display: true
                    }
                },

                scales: {

                    y: {
                        beginAtZero: false
                    }

                }

            }

        });

    } else {

        chart.data.labels = labels;

        chart.data.datasets[0].data =
            values;

        chart.update();
    }
}


// ===============================
// ماشین حساب طلا
// ===============================

document.getElementById("calculateGold")
    .addEventListener("click", () => {

        const weight =
            Number(
                document.getElementById("goldWeight").value
            );

        const karat =
            Number(
                document.getElementById("goldKarats").value
            );


        if (
            !Number.isFinite(weight) ||
            weight <= 0
        ) {

            document.getElementById("calculatorResult")
                .textContent =
                "لطفاً وزن معتبر وارد کنید.";

            return;
        }


        let price;


        if (karat === 18) {
            price = currentData.GOLD_18_RLS;
        } else {
            price = currentData.GOLD_24_RLS;
        }


        if (!Number.isFinite(price)) {

            document.getElementById("calculatorResult")
                .textContent =
                "قیمت طلا هنوز دریافت نشده.";

            return;
        }


        const result =
            weight * price;


        document.getElementById("calculatorResult")
            .textContent =
            `${number(weight)} گرم طلای ${karat} عیار ≈ ${rial(result)}`;
    });


// ===============================
// تبدیل ارز
// ===============================

document.getElementById("convertCurrency")
    .addEventListener("click", () => {

        const amount =
            Number(
                document.getElementById("currencyAmount").value
            );

        const type =
            document.getElementById("currencyType").value;


        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            document.getElementById("currencyResult")
                .textContent =
                "لطفاً مقدار معتبر وارد کنید.";

            return;
        }


        const price =
            currentData[type];


        if (!Number.isFinite(price)) {

            document.getElementById("currencyResult")
                .textContent =
                "قیمت این ارز دریافت نشده.";

            return;
        }


        const result =
            amount * price;


        document.getElementById("currencyResult")
            .textContent =
            `${number(amount)} واحد ≈ ${rial(result)}`;
    });


// ===============================
// هشدار قیمت
// ===============================

document.getElementById("setAlert")
    .addEventListener("click", () => {

        const asset =
            document.getElementById("alertAsset").value;

        const target =
            Number(
                document.getElementById("alertPrice").value
            );


        if (
            !Number.isFinite(target) ||
            target <= 0
        ) {

            document.getElementById("alertResult")
                .textContent =
                "قیمت هدف معتبر وارد کنید.";

            return;
        }


        priceAlert = {
            asset,
            target,
            triggered: false
        };


        document.getElementById("alertResult")
            .textContent =
            "🔔 هشدار فعال شد.";
    });


function checkPriceAlert() {

    if (!priceAlert || priceAlert.triggered) {
        return;
    }


    const map = {

        gold18: currentData.GOLD_18_RLS,

        dollar: currentData.USD_RLS,

        coin: currentData.SEKKEH_RLS

    };


    const current =
        map[priceAlert.asset];


    if (
        !Number.isFinite(current)
    ) {
        return;
    }


    if (current >= priceAlert.target) {

        priceAlert.triggered = true;


        const message =
            "🔔 قیمت هدف شما رسید!";


        document.getElementById("alertResult")
            .textContent =
            message;


        if ("Notification" in window) {

            if (Notification.permission === "granted") {

                new Notification(
                    "بازار ایران",
                    {
                        body:
                            message +
                            " قیمت فعلی: " +
                            rial(current)
                    }
                );

            } else if (
                Notification.permission !== "denied"
            ) {

                Notification.requestPermission();
            }
        }

        alert(
            message +
            "\nقیمت فعلی: " +
            rial(current)
        );
    }
}


// ===============================
// Dark Mode
// ===============================

const themeButton =
    document.getElementById("themeButton");


function updateThemeButton() {

    if (document.body.classList.contains("dark")) {

        themeButton.textContent =
            "☀️ حالت روز";

    } else {

        themeButton.textContent =
            "🌙 حالت شب";
    }
}


themeButton.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    localStorage.setItem(
        "marketTheme",
        document.body.classList.contains("dark")
            ? "dark"
            : "light"
    );

    updateThemeButton();
});


if (
    localStorage.getItem("marketTheme") === "dark"
) {

    document.body.classList.add("dark");
}


updateThemeButton();


// ===============================
// دریافت قیمت‌ها
// ===============================

async function updatePrices() {

    const updateTime =
        document.getElementById("updateTime");


    updateTime.textContent =
        "در حال دریافت قیمت‌ها...";


    try {

        const response =
            await fetch(
                "/api/prices?time=" +
                Date.now(),
                {
                    method: "GET",
                    cache: "no-store"
                }
            );


        if (!response.ok) {

            throw new Error(
                "API status: " +
                response.status
            );
        }


        const prices =
            await response.json();


        if (!Array.isArray(prices)) {

            throw new Error(
                "فرمت پاسخ API آرایه نیست"
            );
        }


        const data = {};


        prices.forEach(item => {

            if (
                item &&
                item.code != null
            ) {

                data[String(item.code)] =
                    Number(item.value);
            }

        });


        currentData = data;


        // طلا

        showPrice(
            "gold18",
            "GOLD_18_RLS",
            data.GOLD_18_RLS,
            rial
        );

        showPrice(
            "gold24",
            "GOLD_24_RLS",
            data.GOLD_24_RLS,
            rial
        );

        showPrice(
            "mesghal",
            "GOLD_MESGHAL_RLS",
            data.GOLD_MESGHAL_RLS,
            rial
        );


        // نقره

        if (
            Number.isFinite(data.SILVER_OUNCE_USD) &&
            Number.isFinite(data.USD_RLS)
        ) {

            const silver999 =
                (data.SILVER_OUNCE_USD /
                    31.1034768) *
                data.USD_RLS;


            showPrice(
                "silver999",
                "SILVER_999",
                silver999,
                rial
            );


            showPrice(
                "silver925",
                "SILVER_925",
                silver999 * 0.925,
                rial
            );


            showPrice(
                "silverKg",
                "SILVER_KG",
                silver999 * 1000,
                rial
            );
        }


        // سکه

        showPrice(
            "coin",
            "SEKKEH_RLS",
            data.SEKKEH_RLS,
            rial
        );

        showPrice(
            "bahar",
            "BAHAR_RLS",
            data.BAHAR_RLS,
            rial
        );

        showPrice(
            "halfCoin",
            "NIM_SEKKEH_RLS",
            data.NIM_SEKKEH_RLS,
            rial
        );

        showPrice(
            "quarterCoin",
            "ROB_SEKKEH_RLS",
            data.ROB_SEKKEH_RLS,
            rial
        );

        showPrice(
            "gramCoin",
            "GERAMI_SEKKEH_RLS",
            data.GERAMI_SEKKEH_RLS,
            rial
        );


        // ارز

        showPrice(
            "dollar",
            "USD_RLS",
            data.USD_RLS,
            rial
        );

        showPrice(
            "euro",
            "EUR_RLS",
            data.EUR_RLS,
            rial
        );

        showPrice(
            "pound",
            "GBP_RLS",
            data.GBP_RLS,
            rial
        );

        showPrice(
            "dirham",
            "AED_RLS",
            data.AED_RLS,
            rial
        );

        showPrice(
            "lira",
            "TRY_RLS",
            data.TRY_RLS,
            rial
        );


        // جهانی

        showPrice(
            "goldOunce",
            "GOLD_OUNCE_USD",
            data.GOLD_OUNCE_USD,
            usd
        );

        showPrice(
            "silverOunce",
            "SILVER_OUNCE_USD",
            data.SILVER_OUNCE_USD,
            usd
        );


        // محاسبات

        calculateGoldBubble();

        calculateCoinBubbles();


        // داشبورد

        updateDashboard();


        // تاریخچه نمودار

        addChartData();

        updateChart();


        // هشدار

        checkPriceAlert();


        updateTime.textContent =
            "آخرین بروزرسانی: " +
            new Date().toLocaleTimeString(
                "fa-IR"
            );


    } catch (error) {

        console.error(
            "Price update error:",
            error
        );


        updateTime.textContent =
            "خطا در دریافت قیمت‌ها ❌";
    }
}


// ===============================
// انتخاب نمودار
// ===============================

document.getElementById("chartSelect")
    .addEventListener(
        "change",
        updateChart
    );


// ===============================
// بروزرسانی خودکار
// ===============================

function setupAutoUpdate() {

    if (autoUpdateTimer) {

        clearInterval(
            autoUpdateTimer
        );
    }


    const enabled =
        document.getElementById(
            "autoUpdate"
        ).checked;


    if (enabled) {

        autoUpdateTimer =
            setInterval(
                updatePrices,
                30000
            );
    }
}


document.getElementById("autoUpdate")
    .addEventListener(
        "change",
        setupAutoUpdate
    );


// ===============================
// شروع
// ===============================

updatePrices();

setupAutoUpdate();
