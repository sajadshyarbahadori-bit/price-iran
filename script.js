let previousPrices = {};
let currentPrices = {};
let priceHistory = {};
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
let alerts = JSON.parse(localStorage.getItem("alerts") || "[]");

let countdownValue = 60;
let autoUpdateEnabled = true;

const $ = id => document.getElementById(id);

function rial(value) {
    if (!Number.isFinite(value)) return "داده موجود نیست";

    return Math.round(value).toLocaleString("fa-IR") + " ریال";
}

function usd(value) {
    if (!Number.isFinite(value)) return "داده موجود نیست";

    return Number(value).toLocaleString("en-US", {
        maximumFractionDigits: 4
    }) + " USD";
}

function percent(value) {
    if (!Number.isFinite(value)) return "--";

    return (value >= 0 ? "+" : "") +
        value.toFixed(2) + "٪";
}


/* =========================
   دریافت API
========================= */

async function updatePrices() {

    const message = $("lastMessage");
    const apiStatus = $("apiStatus");

    if (message) {
        message.textContent = "در حال دریافت قیمت‌ها...";
    }

    if (apiStatus) {
        apiStatus.textContent = "🟡";
    }

    try {

        const response = await fetch(
            "/api/prices?t=" + Date.now(),
            {
                method: "GET",
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error("API HTTP " + response.status);
        }

        const result = await response.json();

        console.log("API:", result);

        let pricesArray = [];

        if (Array.isArray(result)) {
            pricesArray = result;
        } else if (Array.isArray(result.data)) {
            pricesArray = result.data;
        } else if (Array.isArray(result.assets)) {
            pricesArray = result.assets;
        } else if (result.data && typeof result.data === "object") {
            pricesArray = Object.entries(result.data).map(([code, value]) => ({
                code,
                value
            }));
        }

        const data = {};

        pricesArray.forEach(item => {

            if (!item) return;

            const code =
                item.code ??
                item.symbol ??
                item.name;

            const value =
                item.value ??
                item.price ??
                item.last;

            if (code != null && value != null) {
                data[String(code)] = Number(value);
            }
        });

        currentPrices = data;

        if (Object.keys(data).length === 0) {
            throw new Error("داده قیمت پیدا نشد");
        }

        renderPrices(data);

        if (apiStatus) {
            apiStatus.textContent = "🟢";
        }

        if (message) {
            message.textContent =
                "آخرین بروزرسانی: " +
                new Date().toLocaleTimeString("fa-IR");
        }

        countdownValue = 60;

    } catch (error) {

        console.error("PRICE ERROR:", error);

        if (apiStatus) {
            apiStatus.textContent = "🔴";
        }

        if (message) {
            message.textContent =
                "خطا در دریافت قیمت‌ها ❌";
        }
    }
}


/* =========================
   نمایش قیمت‌ها
========================= */

function showPrice(id, key, value, formatter) {

    const element = $(id);

    if (!element) return;

    if (!Number.isFinite(value)) {
        element.textContent = "داده موجود نیست";
        return;
    }

    let change = 0;
    let changeText = "";

    if (
        previousPrices[key] !== undefined &&
        previousPrices[key] !== 0
    ) {

        change =
            ((value - previousPrices[key]) /
                previousPrices[key]) * 100;

        changeText = " " + percent(change);
    }

    element.textContent =
        formatter(value) + changeText;

    const changeElement = $(id + "Change");

    if (changeElement) {

        if (change > 0) {
            changeElement.textContent =
                "▲ " + percent(change);
        } else if (change < 0) {
            changeElement.textContent =
                "▼ " + percent(change);
        } else {
            changeElement.textContent =
                "بدون تغییر";
        }
    }

    previousPrices[key] = value;

    if (!priceHistory[key]) {
        priceHistory[key] = [];
    }

    priceHistory[key].push(value);

    if (priceHistory[key].length > 30) {
        priceHistory[key].shift();
    }
}


function renderPrices(data) {

    /* طلا */

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


    /* نقره */

    if (
        Number.isFinite(data.SILVER_OUNCE_USD) &&
        Number.isFinite(data.USD_RLS)
    ) {

        const silver999 =
            (data.SILVER_OUNCE_USD / 31.1034768) *
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


    /* سکه */

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


    /* ارز */

    showPrice("dollar", "USD_RLS", data.USD_RLS, rial);
    showPrice("euro", "EUR_RLS", data.EUR_RLS, rial);
    showPrice("pound", "GBP_RLS", data.GBP_RLS, rial);
    showPrice("dirham", "AED_RLS", data.AED_RLS, rial);
    showPrice("lira", "TRY_RLS", data.TRY_RLS, rial);


    /* جهانی */

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


    calculateBubble(data);
    updateMarketDashboard();
    updateHeatmap();
    updateFavorites();
    updateAlerts();
    updateComparisonOptions();
    updateChart();
}


/* =========================
   حباب طلا
========================= */

function calculateBubble(data) {

    const gold =
        data.GOLD_18_RLS;

    const ounce =
        data.GOLD_OUNCE_USD;

    const dollar =
        data.USD_RLS;

    if (
        !Number.isFinite(gold) ||
        !Number.isFinite(ounce) ||
        !Number.isFinite(dollar)
    ) return;


    /*
       تبدیل اونس جهانی به گرم
       سپس تبدیل طلای خالص به ۱۸ عیار
    */

    const pureGoldPerGram =
        (ounce / 31.1034768) * dollar;

    const calculated18 =
        pureGoldPerGram * 0.75;


    const bubble =
        gold - calculated18;

    const bubblePercent =
        (bubble / calculated18) * 100;


    if ($("goldCalculated")) {
        $("goldCalculated").textContent =
            rial(calculated18);
    }

    if ($("goldBubble")) {
        $("goldBubble").textContent =
            rial(bubble);
    }

    if ($("goldBubblePercent")) {
        $("goldBubblePercent").textContent =
            percent(bubblePercent);
    }

    if ($("bubbleStatus")) {

        if (bubblePercent > 5) {
            $("bubbleStatus").textContent =
                "🔴 حباب بالا";
        } else if (bubblePercent > 2) {
            $("bubbleStatus").textContent =
                "🟠 حباب متوسط";
        } else if (bubblePercent < -2) {
            $("bubbleStatus").textContent =
                "🟢 زیر ارزش";
        } else {
            $("bubbleStatus").textContent =
                "🟡 نزدیک ارزش ذاتی";
        }
    }
}


/* =========================
   داشبورد بازار
========================= */

function updateMarketDashboard() {

    const assets = [];

    const list = [
        ["طلای ۱۸", currentPrices.GOLD_18_RLS],
        ["دلار", currentPrices.USD_RLS],
        ["یورو", currentPrices.EUR_RLS],
        ["سکه امامی", currentPrices.SEKKEH_RLS],
        ["نقره", currentPrices.SILVER_999]
    ];

    list.forEach(item => {

        const old = previousPrices[item[0]];

        if (
            Number.isFinite(item[1]) &&
            Number.isFinite(old) &&
            old !== 0
        ) {

            assets.push({
                name: item[0],
                change: ((item[1] - old) / old) * 100
            });
        }
    });

    if (!assets.length) return;

    assets.sort((a, b) => b.change - a.change);

    const gain = assets[0];
    const lose = assets[assets.length - 1];

    if ($("topGainer")) {
        $("topGainer").textContent = gain.name;
    }

    if ($("topGainerPercent")) {
        $("topGainerPercent").textContent =
            percent(gain.change);
    }

    if ($("topLoser")) {
        $("topLoser").textContent = lose.name;
    }

    if ($("topLoserPercent")) {
        $("topLoserPercent").textContent =
            percent(lose.change);
    }

    const average =
        assets.reduce((a, b) => a + b.change, 0) /
        assets.length;

    const score =
        Math.max(0, Math.min(100, 50 + average * 10));

    if ($("marketScore")) {
        $("marketScore").textContent =
            score.toFixed(0);
    }

    if ($("scoreBar")) {
        $("scoreBar").style.width =
            score + "%";
    }

    if ($("marketMood")) {

        if (score >= 65) {
            $("marketMood").textContent =
                "🟢 بازار صعودی";
        } else if (score <= 35) {
            $("marketMood").textContent =
                "🔴 بازار نزولی";
        } else {
            $("marketMood").textContent =
                "🟡 بازار متعادل";
        }
    }
}


/* =========================
   جستجو
========================= */

function setupSearch() {

    const search = $("search");

    if (!search) return;

    search.addEventListener("input", () => {

        const value =
            search.value.trim().toLowerCase();

        document
            .querySelectorAll(".card[data-name]")
            .forEach(card => {

                const name =
                    card.dataset.name.toLowerCase();

                card.style.display =
                    !value || name.includes(value)
                        ? ""
                        : "none";
            });
    });
}


/* =========================
   حالت شب / روز
========================= */

function setupTheme() {

    const button = $("themeButton");

    if (!button) return;

    const saved =
        localStorage.getItem("theme");

    if (saved === "light") {
        document.body.classList.add("light");
        button.textContent = "🌙";
    }

    button.addEventListener("click", () => {

        document.body.classList.toggle("light");

        const light =
            document.body.classList.contains("light");

        localStorage.setItem(
            "theme",
            light ? "light" : "dark"
        );

        button.textContent =
            light ? "🌙" : "☀️";
    });
}


/* =========================
   تمام صفحه
========================= */

function setupFullscreen() {

    const button = $("fullscreenButton");

    if (!button) return;

    button.addEventListener("click", async () => {

        try {

            if (!document.fullscreenElement) {
                await document.documentElement.requestFullscreen();
            } else {
                await document.exitFullscreen();
            }

        } catch (error) {
            console.error(error);
        }
    });
}


/* =========================
   علاقه‌مندی
========================= */

function setupFavorites() {

    document
        .querySelectorAll(".favorite")
        .forEach(button => {

            const key = button.dataset.key;

            if (favorites.includes(key)) {
                button.textContent = "★";
            }

            button.addEventListener("click", () => {

                if (favorites.includes(key)) {

                    favorites =
                        favorites.filter(x => x !== key);

                    button.textContent = "☆";

                } else {

                    favorites.push(key);

                    button.textContent = "★";
                }

                localStorage.setItem(
                    "favorites",
                    JSON.stringify(favorites)
                );

                updateFavorites();
            });
        });
}


function updateFavorites() {

    const box = $("favorites");

    if (!box) return;

    box.innerHTML = "";

    favorites.forEach(key => {

        const map = {
            gold18: ["طلای ۱۸", "gold18"],
            gold24: ["طلای ۲۴", "gold24"],
            mesghal: ["مثقال", "mesghal"]
        };

        if (!map[key]) return;

        const [name, id] = map[key];

        const div = document.createElement("div");

        div.className = "card";

        div.innerHTML = `
            <span>⭐ ${name}</span>
            <h3>${$(id)?.textContent || "--"}</h3>
        `;

        box.appendChild(div);
    });
}


/* =========================
   Heatmap
========================= */

function updateHeatmap() {

    const box = $("heatmap");

    if (!box) return;

    const items = [
        ["طلا", "GOLD_18_RLS"],
        ["دلار", "USD_RLS"],
        ["یورو", "EUR_RLS"],
        ["سکه", "SEKKEH_RLS"],
        ["نقره", "SILVER_999"]
    ];

    box.innerHTML = "";

    items.forEach(([name, key]) => {

        const value = currentPrices[key];

        const old = previousPrices[key];

        let change = 0;

        if (Number.isFinite(value) && Number.isFinite(old)) {
            change = ((value - old) / old) * 100;
        }

        const div = document.createElement("div");

        div.className =
            change > 0
                ? "heat-up"
                : change < 0
                    ? "heat-down"
                    : "heat-neutral";

        div.innerHTML = `
            <strong>${name}</strong>
            <span>${percent(change)}</span>
        `;

        box.appendChild(div);
    });
}


/* =========================
   مقایسه
========================= */

const comparisonAssets = {
    gold18: ["طلای ۱۸", "GOLD_18_RLS"],
    dollar: ["دلار", "USD_RLS"],
    euro: ["یورو", "EUR_RLS"],
    coin: ["سکه امامی", "SEKKEH_RLS"],
    silver999: ["نقره", "SILVER_999"]
};

function updateComparisonOptions() {

    const one = $("compareOne");
    const two = $("compareTwo");

    if (!one || !two) return;

    if (one.options.length) return;

    Object.entries(comparisonAssets)
        .forEach(([key, value]) => {

            const option1 =
                new Option(value[0], key);

            const option2 =
                new Option(value[0], key);

            one.add(option1);
            two.add(option2);
        });

    if (two.options.length > 1) {
        two.selectedIndex = 1;
    }
}


function setupComparison() {

    const button = $("compareButton");

    if (!button) return;

    button.addEventListener("click", () => {

        const a = comparisonAssets[$("compareOne").value];
        const b = comparisonAssets[$("compareTwo").value];

        if (!a || !b) return;

        const priceA = currentPrices[a[1]];
        const priceB = currentPrices[b[1]];

        if (!Number.isFinite(priceA) ||
            !Number.isFinite(priceB)) {

            $("comparisonResult").textContent =
                "قیمت کافی نیست";

            return;
        }

        const difference =
            ((priceA - priceB) / priceB) * 100;

        $("comparisonResult").textContent =
            `${a[0]} نسبت به ${b[0]} حدود ${percent(difference)} اختلاف دارد.`;
    });
}


/* =========================
   محاسبه‌گر طلا
========================= */

function setupCalculator() {

    const button = $("calculateGold");

    if (!button) return;

    button.addEventListener("click", () => {

        const weight =
            Number($("goldWeight").value);

        const karat =
            Number($("goldKarats").value);

        const price =
            karat === 18
                ? currentPrices.GOLD_18_RLS
                : currentPrices.GOLD_24_RLS;

        if (!weight || !Number.isFinite(price)) {

            $("calculatorResult").textContent =
                "وزن یا قیمت معتبر نیست";

            return;
        }

        $("calculatorResult").textContent =
            rial(weight * price);
    });
}


/* =========================
   تبدیل ارز
========================= */

function setupCurrency() {

    const button = $("convertCurrency");

    if (!button) return;

    button.addEventListener("click", () => {

        const amount =
            Number($("currencyAmount").value);

        const type =
            $("currencyType").value;

        const price =
            currentPrices[type];

        if (!amount || !Number.isFinite(price)) {

            $("currencyResult").textContent =
                "اطلاعات کافی نیست";

            return;
        }

        $("currencyResult").textContent =
            rial(amount * price);
    });
}


/* =========================
   سناریوساز
========================= */

function setupScenario() {

    const button = $("scenarioButton");

    if (!button) return;

    button.addEventListener("click", () => {

        const dollar =
            Number($("scenarioDollar").value);

        const ounce =
            Number($("scenarioOunce").value);

        if (!dollar || !ounce) {

            $("scenarioResult").textContent =
                "دلار و اونس را وارد کن";

            return;
        }

        const calculated =
            (ounce / 31.1034768) *
            dollar *
            0.75;

        $("scenarioResult").textContent =
            "قیمت فرضی طلای ۱۸: " +
            rial(calculated);
    });
}


/* =========================
   هشدار قیمت
========================= */

function setupAlerts() {

    const button = $("setAlert");

    if (!button) return;

    const select = $("alertAsset");

    Object.entries(comparisonAssets)
        .forEach(([key, value]) => {

            select.add(
                new Option(value[0], value[1])
            );
        });

    button.addEventListener("click", () => {

        const key = select.value;

        const target =
            Number($("alertPrice").value);

        if (!target) return;

        alerts.push({
            key,
            target,
            created: Date.now()
        });

        localStorage.setItem(
            "alerts",
            JSON.stringify(alerts)
        );

        $("alertPrice").value = "";

        updateAlerts();
    });
}


function updateAlerts() {

    const box = $("alertsList");

    if (!box) return;

    box.innerHTML = "";

    alerts.forEach((alert, index) => {

        const current =
            currentPrices[alert.key];

        const div =
            document.createElement("div");

        div.className = "alert-item";

        div.innerHTML = `
            🔔 ${alert.key}
            | هدف: ${rial(alert.target)}
            | فعلی: ${rial(current)}
            <button data-index="${index}">حذف</button>
        `;

        box.appendChild(div);
    });

    box.querySelectorAll("button")
        .forEach(button => {

            button.addEventListener("click", () => {

                alerts.splice(
                    Number(button.dataset.index),
                    1
                );

                localStorage.setItem(
                    "alerts",
                    JSON.stringify(alerts)
                );

                updateAlerts();
            });
        });
}


/* =========================
   نمودار
========================= */

let chart;

function updateChart() {

    const canvas = $("priceChart");

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    const keyMap = {
        gold18: "GOLD_18_RLS",
        dollar: "USD_RLS",
        coin: "SEKKEH_RLS",
        silver999: "SILVER_999"
    };

    const key =
        keyMap[$("chartSelect")?.value];

    if (!key) return;

    const history =
        priceHistory[key] || [];

    if (!history.length) return;

    if (chart) {
        chart.destroy();
    }

    chart = new Chart(canvas, {

        type: "line",

        data: {
            labels: history.map((_, i) => i + 1),

            datasets: [{
                label: "قیمت",
                data: history,
                tension: 0.35
            }]
        },

        options: {
            responsive: true,

            plugins: {
                legend: {
                    display: true
                }
            }
        }
    });
}


/* =========================
   ساعت
========================= */

function updateClock() {

    const clock = $("clock");

    if (!clock) return;

    clock.textContent =
        new Date().toLocaleTimeString("fa-IR");
}

setInterval(updateClock, 1000);


/* =========================
   شمارش معکوس
========================= */

setInterval(() => {

    if (!autoUpdateEnabled) return;

    countdownValue--;

    if (countdownValue <= 0) {

        countdownValue = 60;

        updatePrices();
    }

    if ($("countdown")) {
        $("countdown").textContent =
            countdownValue;
    }

}, 1000);


/* =========================
   دکمه بروزرسانی
========================= */

function setupRefresh() {

    const button = $("mainRefresh");

    if (!button) return;

    button.addEventListener("click", () => {

        countdownValue = 60;

        updatePrices();
    });
}


/* =========================
   تنظیمات
========================= */

function setupSettings() {

    const auto = $("autoUpdate");

    if (auto) {

        auto.addEventListener("change", () => {

            autoUpdateEnabled =
                auto.checked;
        });
    }

    const animation = $("priceAnimation");

    if (animation) {

        animation.addEventListener("change", () => {

            document.body.classList.toggle(
                "no-animation",
                !animation.checked
            );
        });
    }

    const dashboard = $("dashboardMode");

    if (dashboard) {

        dashboard.addEventListener("change", () => {

            document.body.classList.toggle(
                "dashboard-mode",
                dashboard.checked
            );
        });
    }
}


/* =========================
   شروع سایت
========================= */

document.addEventListener("DOMContentLoaded", () => {

    setupTheme();
    setupFullscreen();
    setupSearch();
    setupFavorites();
    setupComparison();
    setupCalculator();
    setupCurrency();
    setupScenario();
    setupAlerts();
    setupRefresh();
    setupSettings();

    updateClock();
    updateComparisonOptions();

    updatePrices();
});
