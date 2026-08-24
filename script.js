let previousPrices = {};
let currentPrices = {};
let priceHistory = {};
let favorites = JSON.parse(localStorage.getItem("favorites") || "[]");
let alerts = JSON.parse(localStorage.getItem("priceAlerts") || "[]");
let chart = null;
let autoUpdateTimer = null;

const assetNames = {
    gold18: "طلای ۱۸ عیار",
    gold24: "طلای ۲۴ عیار",
    mesghal: "مثقال طلا",
    silver999: "نقره ۹۹۹",
    silver925: "نقره ۹۲۵",
    silverKg: "نقره یک کیلو",
    coin: "سکه امامی",
    bahar: "بهار آزادی",
    halfCoin: "نیم‌سکه",
    quarterCoin: "ربع‌سکه",
    gramCoin: "سکه گرمی",
    dollar: "دلار",
    euro: "یورو",
    pound: "پوند",
    dirham: "درهم",
    lira: "لیر"
};

const apiKeys = {
    gold18: "GOLD_18_RLS",
    gold24: "GOLD_24_RLS",
    mesghal: "GOLD_MESGHAL_RLS",
    coin: "SEKKEH_RLS",
    bahar: "BAHAR_RLS",
    halfCoin: "NIM_SEKKEH_RLS",
    quarterCoin: "ROB_SEKKEH_RLS",
    gramCoin: "GERAMI_SEKKEH_RLS",
    dollar: "USD_RLS",
    euro: "EUR_RLS",
    pound: "GBP_RLS",
    dirham: "AED_RLS",
    lira: "TRY_RLS"
};


/* ================= FORMAT ================= */

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


/* ================= CHANGE ================= */

function getChange(value, oldValue) {

    if (!Number.isFinite(value) || !Number.isFinite(oldValue)) {
        return null;
    }

    if (oldValue === 0) {
        return null;
    }

    return ((value - oldValue) / oldValue) * 100;
}


function changeText(value, oldValue) {

    const change = getChange(value, oldValue);

    if (change === null) {
        return "";
    }

    if (change > 0) {
        return ` ↑ ${change.toFixed(2)}٪`;
    }

    if (change < 0) {
        return ` ↓ ${Math.abs(change).toFixed(2)}٪`;
    }

    return " ـ بدون تغییر";
}


/* ================= SHOW PRICE ================= */

function showPrice(id, key, value, formatter = rial) {

    const element = document.getElementById(id);

    if (!element) return;

    if (!Number.isFinite(value)) {
        element.textContent = "داده موجود نیست";
        return;
    }

    const oldValue = previousPrices[key];

    element.textContent =
        formatter(value) +
        changeText(value, oldValue);

    const card = element.closest(".card");

    if (
        card &&
        document.getElementById("priceAnimation")?.checked &&
        Number.isFinite(oldValue)
    ) {

        card.classList.remove("price-up", "price-down");

        void card.offsetWidth;

        if (value > oldValue) {
            card.classList.add("price-up");
        }

        if (value < oldValue) {
            card.classList.add("price-down");
        }
    }

    previousPrices[key] = value;
}


/* ================= FETCH ================= */

async function updatePrices() {

    const updateTime =
        document.getElementById("updateTime");

    const apiStatus =
        document.getElementById("apiStatus");

    updateTime.textContent =
        "در حال دریافت قیمت‌ها...";

    if (apiStatus) {
        apiStatus.textContent =
            "🟡 در حال اتصال به API...";
        apiStatus.className = "api-status";
    }

    try {

        const response = await fetch(
            "/api/prices?time=" + Date.now(),
            {
                method: "GET",
                cache: "no-store"
            }
        );

        if (!response.ok) {
            throw new Error(
                "API status: " + response.status
            );
        }

        const prices = await response.json();

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

        currentPrices = data;

        if (apiStatus) {
            apiStatus.textContent =
                "🟢 اتصال به API برقرار است";
            apiStatus.className =
                "api-status ok";
        }


        /* ================= GOLD ================= */

        showPrice(
            "gold18",
            "GOLD_18_RLS",
            data.GOLD_18_RLS
        );

        showPrice(
            "gold24",
            "GOLD_24_RLS",
            data.GOLD_24_RLS
        );

        showPrice(
            "mesghal",
            "GOLD_MESGHAL_RLS",
            data.GOLD_MESGHAL_RLS
        );


        /* ================= SILVER ================= */

        let silver999 = NaN;
        let silver925 = NaN;
        let silverKg = NaN;

        if (
            Number.isFinite(
                data.SILVER_OUNCE_USD
            ) &&
            Number.isFinite(
                data.USD_RLS
            )
        ) {

            silver999 =
                (
                    data.SILVER_OUNCE_USD /
                    31.1034768
                ) *
                data.USD_RLS;

            silver925 =
                silver999 * 0.925;

            silverKg =
                silver999 * 1000;
        }

        showPrice(
            "silver999",
            "SILVER_999",
            silver999
        );

        showPrice(
            "silver925",
            "SILVER_925",
            silver925
        );

        showPrice(
            "silverKg",
            "SILVER_KG",
            silverKg
        );


        /* ================= COINS ================= */

        showPrice(
            "coin",
            "SEKKEH_RLS",
            data.SEKKEH_RLS
        );

        showPrice(
            "bahar",
            "BAHAR_RLS",
            data.BAHAR_RLS
        );

        showPrice(
            "halfCoin",
            "NIM_SEKKEH_RLS",
            data.NIM_SEKKEH_RLS
        );

        showPrice(
            "quarterCoin",
            "ROB_SEKKEH_RLS",
            data.ROB_SEKKEH_RLS
        );

        showPrice(
            "gramCoin",
            "GERAMI_SEKKEH_RLS",
            data.GERAMI_SEKKEH_RLS
        );


        /* ================= CURRENCY ================= */

        showPrice(
            "dollar",
            "USD_RLS",
            data.USD_RLS
        );

        showPrice(
            "euro",
            "EUR_RLS",
            data.EUR_RLS
        );

        showPrice(
            "pound",
            "GBP_RLS",
            data.GBP_RLS
        );

        showPrice(
            "dirham",
            "AED_RLS",
            data.AED_RLS
        );

        showPrice(
            "lira",
            "TRY_RLS",
            data.TRY_RLS
        );


        /* ================= GLOBAL ================= */

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


        /* ================= HISTORY ================= */

        saveHistory(
            "gold18",
            data.GOLD_18_RLS
        );

        saveHistory(
            "dollar",
            data.USD_RLS
        );

        saveHistory(
            "coin",
            data.SEKKEH_RLS
        );

        saveHistory(
            "silver",
            silver999
        );


        /* ================= DASHBOARD ================= */

        updateDashboard(
            data,
            silver999
        );


        /* ================= HEATMAP ================= */

        updateHeatmap(
            data,
            silver999
        );


        /* ================= MOVERS ================= */

        updateMovers(
            data,
            silver999
        );


        /* ================= BUBBLES ================= */

        calculateBubbles(
            data
        );


        /* ================= FAVORITES ================= */

        renderFavorites();


        /* ================= ALERTS ================= */

        checkAlerts();


        /* ================= CHART ================= */

        updateChart();


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

        if (apiStatus) {
            apiStatus.textContent =
                "🔴 خطا در اتصال به API";
            apiStatus.className =
                "api-status error";
        }

        updateTime.textContent =
            "خطا در دریافت قیمت‌ها ❌";
    }
}


/* ================= HISTORY ================= */

function saveHistory(key, value) {

    if (!Number.isFinite(value)) {
        return;
    }

    if (!priceHistory[key]) {
        priceHistory[key] = [];
    }

    priceHistory[key].push({
        time: new Date().toLocaleTimeString(
            "fa-IR"
        ),
        value: value
    });

    if (priceHistory[key].length > 60) {
        priceHistory[key].shift();
    }
}


/* ================= DASHBOARD ================= */

function updateDashboard(data, silver) {

    setDashboard(
        "dashboardGold",
        "dashboardGoldChange",
        data.GOLD_18_RLS,
        "GOLD_18_RLS"
    );

    setDashboard(
        "dashboardDollar",
        "dashboardDollarChange",
        data.USD_RLS,
        "USD_RLS"
    );

    setDashboard(
        "dashboardCoin",
        "dashboardCoinChange",
        data.SEKKEH_RLS,
        "SEKKEH_RLS"
    );

    setDashboard(
        "dashboardSilver",
        "dashboardSilverChange",
        silver,
        "SILVER_999"
    );
}


function setDashboard(
    priceId,
    changeId,
    value,
    key
) {

    const price =
        document.getElementById(priceId);

    const change =
        document.getElementById(changeId);

    if (!price) return;

    price.textContent =
        Number.isFinite(value)
            ? rial(value)
            : "---";

    const old =
        previousPrices[key];

    const percent =
        getChange(value, old);

    if (change) {

        if (percent === null) {
            change.textContent = "---";
        } else {

            change.textContent =
                percent > 0
                    ? `▲ ${percent.toFixed(2)}٪`
                    : percent < 0
                        ? `▼ ${Math.abs(percent).toFixed(2)}٪`
                        : "بدون تغییر";

            change.style.color =
                percent > 0
                    ? "var(--green)"
                    : percent < 0
                        ? "var(--red)"
                        : "var(--yellow)";
        }
    }
}


/* ================= HEATMAP ================= */

function updateHeatmap(data, silver) {

    setHeat(
        "heatGold",
        "GOLD_18_RLS",
        data.GOLD_18_RLS
    );

    setHeat(
        "heatDollar",
        "USD_RLS",
        data.USD_RLS
    );

    setHeat(
        "heatCoin",
        "SEKKEH_RLS",
        data.SEKKEH_RLS
    );

    setHeat(
        "heatSilver",
        "SILVER_999",
        silver
    );

    setHeat(
        "heatEuro",
        "EUR_RLS",
        data.EUR_RLS
    );

    setHeat(
        "heatPound",
        "GBP_RLS",
        data.GBP_RLS
    );
}


function setHeat(
    id,
    key,
    value
) {

    const element =
        document.getElementById(id);

    if (!element) return;

    const box =
        element.closest(".heat-item");

    if (!Number.isFinite(value)) {
        element.textContent = "---";
        return;
    }

    const percent =
        getChange(
            value,
            previousPrices[key]
        );

    if (percent === null) {
        element.textContent = "---";
        return;
    }

    element.textContent =
        `${percent > 0 ? "+" : ""}${percent.toFixed(2)}٪`;

    box.classList.remove(
        "up",
        "down",
        "neutral"
    );

    if (percent > 0) {
        box.classList.add("up");
    } else if (percent < 0) {
        box.classList.add("down");
    } else {
        box.classList.add("neutral");
    }
}


/* ================= MOVERS ================= */

function updateMovers(data, silver) {

    const items = [
        ["طلای ۱۸", data.GOLD_18_RLS, "GOLD_18_RLS"],
        ["دلار", data.USD_RLS, "USD_RLS"],
        ["سکه امامی", data.SEKKEH_RLS, "SEKKEH_RLS"],
        ["نقره", silver, "SILVER_999"],
        ["یورو", data.EUR_RLS, "EUR_RLS"],
        ["پوند", data.GBP_RLS, "GBP_RLS"]
    ];

    const changes = items
        .map(item => {

            const percent =
                getChange(
                    item[1],
                    previousPrices[item[2]]
                );

            return {
                name: item[0],
                percent: percent
            };

        })
        .filter(item =>
            item.percent !== null
        );

    if (!changes.length) {
        return;
    }

    const gain =
        [...changes]
            .sort((a,b) =>
                b.percent - a.percent
            )[0];

    const loss =
        [...changes]
            .sort((a,b) =>
                a.percent - b.percent
            )[0];

    document.getElementById(
        "topGainer"
    ).textContent =
        gain.name;

    document.getElementById(
        "topGainerPercent"
    ).textContent =
        `▲ ${gain.percent.toFixed(2)}٪`;


    document.getElementById(
        "topLoser"
    ).textContent =
        loss.name;

    document.getElementById(
        "topLoserPercent"
    ).textContent =
        `▼ ${Math.abs(loss.percent).toFixed(2)}٪`;


    const status =
        document.getElementById(
            "marketStatus"
        );

    if (gain.percent > Math.abs(loss.percent)) {

        status.textContent =
            "🟢 بازار متمایل به رشد";

        status.className =
            "status-badge up";

    } else {

        status.textContent =
            "🔴 بازار متمایل به افت";

        status.className =
            "status-badge down";
    }
}


/* ================= GOLD BUBBLE ================= */

function calculateBubbles(data) {

    if (
        Number.isFinite(data.GOLD_OUNCE_USD) &&
        Number.isFinite(data.USD_RLS)
    ) {

        const pureGold =
            (
                data.GOLD_OUNCE_USD /
                31.1034768
            ) *
            data.USD_RLS;

        const theoretical18 =
            pureGold * 0.75;

        const market18 =
            data.GOLD_18_RLS;

        const bubble =
            market18 -
            theoretical18;

        const bubblePercent =
            (
                bubble /
                theoretical18
            ) * 100;

        setText(
            "gold18Calculated",
            rial(theoretical18)
        );

        setText(
            "gold18Bubble",
            rial(bubble)
        );

        setText(
            "gold18BubblePercent",
            `${bubblePercent.toFixed(2)}٪`
        );
    }
}


/* ================= FAVORITES ================= */

function renderFavorites() {

    const container =
        document.getElementById(
            "favorites"
        );

    if (!container) return;

    if (!favorites.length) {

        container.innerHTML =
            `<div class="empty-message">
                هنوز دارایی‌ای اضافه نکرده‌ای ⭐
            </div>`;

        return;
    }

    container.innerHTML = "";

    favorites.forEach(key => {

        const value =
            getAssetValue(key);

        const card =
            document.createElement("div");

        card.className = "card";

        card.innerHTML = `
            <span>⭐ ${assetNames[key] || key}</span>
            <h3>${Number.isFinite(value) ? rial(value) : "---"}</h3>
            <small>دارایی مورد علاقه</small>
        `;

        container.appendChild(card);
    });

    document
        .querySelectorAll(".favorite-button")
        .forEach(button => {

            const key =
                button.dataset.favorite;

            button.textContent =
                favorites.includes(key)
                    ? "★"
                    : "☆";

            button.classList.toggle(
                "active",
                favorites.includes(key)
            );
        });
}


function toggleFavorite(key) {

    if (favorites.includes(key)) {

        favorites =
            favorites.filter(
                item => item !== key
            );

    } else {

        favorites.push(key);
    }

    localStorage.setItem(
        "favorites",
        JSON.stringify(favorites)
    );

    renderFavorites();
}


/* ================= SEARCH ================= */

function setupSearch() {

    const input =
        document.getElementById(
            "assetSearch"
        );

    if (!input) return;

    input.addEventListener(
        "input",
        () => {

            const query =
                input.value
                    .trim()
                    .toLowerCase();

            document
                .querySelectorAll(
                    ".asset-card"
                )
                .forEach(card => {

                    const name =
                        card.dataset.name
                            .toLowerCase();

                    card.style.display =
                        name.includes(query)
                            ? ""
                            : "none";
                });
        }
    );
}


/* ================= COPY ================= */

function copyPrice(key) {

    const value =
        getAssetValue(key);

    if (!Number.isFinite(value)) {
        return;
    }

    navigator.clipboard
        .writeText(
            Math.round(value).toString()
        )
        .then(() => {

            alert(
                `قیمت ${assetNames[key]} کپی شد 📋`
            );

        })
        .catch(() => {});
}


/* ================= GET ASSET ================= */

function getAssetValue(key) {

    if (key === "silver999") {

        if (
            Number.isFinite(
                currentPrices.SILVER_OUNCE_USD
            ) &&
            Number.isFinite(
                currentPrices.USD_RLS
            )
        ) {

            return (
                currentPrices.SILVER_OUNCE_USD /
                31.1034768
            ) *
            currentPrices.USD_RLS;
        }
    }

    if (key === "silver925") {

        const value =
            getAssetValue("silver999");

        return Number.isFinite(value)
            ? value * 0.925
            : NaN;
    }

    if (key === "silverKg") {

        const value =
            getAssetValue("silver999");

        return Number.isFinite(value)
            ? value * 1000
            : NaN;
    }

    const apiKey =
        apiKeys[key];

    return apiKey
        ? currentPrices[apiKey]
        : NaN;
}


/* ================= CHART ================= */

function updateChart() {

    const canvas =
        document.getElementById(
            "priceChart"
        );

    if (!canvas || typeof Chart === "undefined") {
        return;
    }

    const selected =
        document.getElementById(
            "chartSelect"
        )?.value || "gold18";

    const history =
        priceHistory[selected] || [];

    const labels =
        history.map(
            item => item.time
        );

    const values =
        history.map(
            item => item.value
        );

    if (chart) {
        chart.destroy();
    }

    chart =
        new Chart(
            canvas.getContext("2d"),
            {
                type: "line",

                data: {
                    labels,

                    datasets: [{
                        label:
                            assetNames[selected] ||
                            selected,

                        data: values,

                        borderWidth: 3,

                        tension: .35,

                        pointRadius: 2,

                        fill: false
                    }]
                },

                options: {
                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {
                        legend: {
                            display: true
                        }
                    },

                    scales: {

                        x: {
                            ticks: {
                                maxTicksLimit: 8
                            }
                        },

                        y: {
                            beginAtZero: false
                        }
                    }
                }
            }
        );
}


/* ================= COMPARISON ================= */

function compareAssets() {

    const one =
        document.getElementById(
            "compareOne"
        ).value;

    const two =
        document.getElementById(
            "compareTwo"
        ).value;

    const valueOne =
        getAssetValue(one);

    const valueTwo =
        getAssetValue(two);

    const result =
        document.getElementById(
            "comparisonResult"
        );

    if (
        !Number.isFinite(valueOne) ||
        !Number.isFinite(valueTwo)
    ) {

        result.textContent =
            "داده کافی برای مقایسه وجود ندارد.";

        return;
    }

    const ratio =
        valueOne / valueTwo;

    result.innerHTML = `
        <strong>${assetNames[one]}</strong>
        = ${rial(valueOne)}
        <br><br>
        <strong>${assetNames[two]}</strong>
        = ${rial(valueTwo)}
        <br><br>
        نسبت قیمت:
        <strong>${ratio.toFixed(4)}</strong>
    `;
}


/* ================= SCENARIO ================= */

function calculateScenario() {

    const dollar =
        Number(
            document.getElementById(
                "scenarioDollar"
            ).value
        );

    const ounce =
        Number(
            document.getElementById(
                "scenarioOunce"
            ).value
        );

    const result =
        document.getElementById(
            "scenarioResult"
        );

    if (
        !Number.isFinite(dollar) ||
        !Number.isFinite(ounce) ||
        dollar <= 0 ||
        ounce <= 0
    ) {

        result.textContent =
            "لطفاً هر دو مقدار را وارد کنید.";

        return;
    }

    const calculated =
        (
            ounce /
            31.1034768
        ) *
        dollar *
        .75;

    result.innerHTML = `
        🥇 قیمت محاسباتی تقریبی طلای ۱۸ عیار:
        <strong>${rial(calculated)}</strong>
    `;
}


/* ================= GOLD CALCULATOR ================= */

function calculateGold() {

    const weight =
        Number(
            document.getElementById(
                "goldWeight"
            ).value
        );

    const karat =
        Number(
            document.getElementById(
                "goldKarats"
            ).value
        );

    const result =
        document.getElementById(
            "calculatorResult"
        );

    if (
        !Number.isFinite(weight) ||
        weight <= 0
    ) {

        result.textContent =
            "وزن معتبر وارد کنید.";

        return;
    }

    const price =
        karat === 24
            ? currentPrices.GOLD_24_RLS
            : currentPrices.GOLD_18_RLS;

    if (!Number.isFinite(price)) {

        result.textContent =
            "قیمت طلا هنوز دریافت نشده.";

        return;
    }

    const total =
        weight * price;

    result.innerHTML = `
        وزن:
        <strong>${weight}</strong> گرم
        <br>
        عیار:
        <strong>${karat}</strong>
        <br>
        ارزش تقریبی:
        <strong>${rial(total)}</strong>
    `;
}


/* ================= CURRENCY ================= */

function convertCurrency() {

    const amount =
        Number(
            document.getElementById(
                "currencyAmount"
            ).value
        );

    const type =
        document.getElementById(
            "currencyType"
        ).value;

    const result =
        document.getElementById(
            "currencyResult"
        );

    if (
        !Number.isFinite(amount) ||
        amount < 0
    ) {

        result.textContent =
            "مقدار معتبر وارد کنید.";

        return;
    }

    const rate =
        currentPrices[type];

    if (!Number.isFinite(rate)) {

        result.textContent =
            "نرخ ارز موجود نیست.";

        return;
    }

    result.innerHTML = `
        ${amount.toLocaleString("fa-IR")}
        واحد
        ≈
        <strong>${rial(amount * rate)}</strong>
    `;
}


/* ================= ALERTS ================= */

function setupAlert() {

    const asset =
        document.getElementById(
            "alertAsset"
        ).value;

    const target =
        Number(
            document.getElementById(
                "alertPrice"
            ).value
        );

    const result =
        document.getElementById(
            "alertResult"
        );

    if (
        !Number.isFinite(target) ||
        target <= 0
    ) {

        result.textContent =
            "قیمت هدف معتبر وارد کنید.";

        return;
    }

    alerts.push({
        asset,
        target
    });

    localStorage.setItem(
        "priceAlerts",
        JSON.stringify(alerts)
    );

    result.innerHTML =
        `🔔 هشدار برای
        <strong>${assetNames[asset]}</strong>
        روی
        <strong>${rial(target)}</strong>
        فعال شد.`;
}


function checkAlerts() {

    alerts.forEach(alertItem => {

        const value =
            getAssetValue(
                alertItem.asset
            );

        if (
            Number.isFinite(value) &&
            value >= alertItem.target
        ) {

            alert(
                `🔔 هشدار قیمت!\n\n` +
                `${assetNames[alertItem.asset]}\n` +
                `قیمت: ${rial(value)}`
            );
        }
    });
}


/* ================= THEME ================= */

function setupTheme() {

    const button =
        document.getElementById(
            "themeButton"
        );

    const saved =
        localStorage.getItem(
            "theme"
        );

    if (saved === "light") {
        document.body.classList.add(
            "light"
        );
    }

    updateThemeIcon();

    button?.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "light"
            );

            localStorage.setItem(
                "theme",
                document.body.classList.contains(
                    "light"
                )
                    ? "light"
                    : "dark"
            );

            updateThemeIcon();
        }
    );
}


function updateThemeIcon() {

    const button =
        document.getElementById(
            "themeButton"
        );

    if (!button) return;

    button.textContent =
        document.body.classList.contains(
            "light"
        )
            ? "🌙"
            : "☀️";
}


/* ================= AUTO UPDATE ================= */

function setupAutoUpdate() {

    const checkbox =
        document.getElementById(
            "autoUpdate"
        );

    function start() {

        clearInterval(
            autoUpdateTimer
        );

        if (checkbox.checked) {

            autoUpdateTimer =
                setInterval(
                    updatePrices,
                    60000
                );
        }
    }

    checkbox?.addEventListener(
        "change",
        start
    );

    start();
}


/* ================= HELPERS ================= */

function setText(id, text) {

    const element =
        document.getElementById(id);

    if (element) {
        element.textContent = text;
    }
}


/* ================= EVENTS ================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupTheme();

        setupSearch();

        setupAutoUpdate();


        document
            .getElementById(
                "mainRefresh"
            )
            ?.addEventListener(
                "click",
                updatePrices
            );


        document
            .getElementById(
                "refreshTop"
            )
            ?.addEventListener(
                "click",
                updatePrices
            );


        document
            .querySelectorAll(
                ".favorite-button"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        toggleFavorite(
                            button.dataset.favorite
                        );
                    }
                );
            });


        document
            .querySelectorAll(
                ".copy-price"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        copyPrice(
                            button.dataset.copy
                        );
                    }
                );
            });


        document
            .getElementById(
                "compareButton"
            )
            ?.addEventListener(
                "click",
                compareAssets
            );


        document
            .getElementById(
                "scenarioButton"
            )
            ?.addEventListener(
                "click",
                calculateScenario
            );


        document
            .getElementById(
                "calculateGold"
            )
            ?.addEventListener(
                "click",
                calculateGold
            );


        document
            .getElementById(
                "convertCurrency"
            )
            ?.addEventListener(
                "click",
                convertCurrency
            );


        document
            .getElementById(
                "setAlert"
            )
            ?.addEventListener(
                "click",
                setupAlert
            );


        document
            .getElementById(
                "chartSelect"
            )
            ?.addEventListener(
                "change",
                updateChart
            );


        updatePrices();

    }
);
