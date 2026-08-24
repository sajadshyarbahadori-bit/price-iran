let previousPrices = {};
let currentPrices = {};

let priceHistory = {
    gold18: [],
    dollar: [],
    coin: [],
    silver999: []
};

let chart = null;
let countdown = 60;

let alerts = JSON.parse(
    localStorage.getItem("marketAlerts") || "[]"
);

let favorites = JSON.parse(
    localStorage.getItem("marketFavorites") || "[]"
);


// ================================
// ابزارها
// ================================

function rial(value) {

    if (!Number.isFinite(value)) {
        return "داده موجود نیست";
    }

    return (
        Math.round(value).toLocaleString("fa-IR")
        + " ریال"
    );
}


function usd(value) {

    if (!Number.isFinite(value)) {
        return "داده موجود نیست";
    }

    return (
        Number(value).toLocaleString("en-US", {
            maximumFractionDigits: 4
        })
        + " USD"
    );
}


// ================================
// نمایش قیمت
// ================================

function showPrice(id, key, value, formatter = rial) {

    const element =
        document.getElementById(id);

    if (!element) return;

    if (!Number.isFinite(value)) {

        element.textContent =
            "داده موجود نیست";

        return;
    }


    let changeText = "";


    if (
        previousPrices[key] !== undefined &&
        Number.isFinite(previousPrices[key])
    ) {

        const oldValue =
            previousPrices[key];


        if (oldValue !== 0) {

            const change =
                ((value - oldValue) / oldValue) * 100;


            if (change > 0) {

                changeText =
                    ` ↑ ${change.toFixed(2)}٪`;

            } else if (change < 0) {

                changeText =
                    ` ↓ ${Math.abs(change).toFixed(2)}٪`;

            } else {

                changeText =
                    " ـ بدون تغییر";
            }


            const changeElement =
                document.getElementById(
                    id + "Change"
                );


            if (changeElement) {

                if (change > 0) {

                    changeElement.textContent =
                        `▲ ${change.toFixed(2)}٪`;

                    changeElement.style.color =
                        "#31d39a";

                } else if (change < 0) {

                    changeElement.textContent =
                        `▼ ${Math.abs(change).toFixed(2)}٪`;

                    changeElement.style.color =
                        "#ff6b6b";

                } else {

                    changeElement.textContent =
                        "بدون تغییر";
                }
            }
        }
    }


    element.textContent =
        formatter(value) + changeText;


    previousPrices[key] = value;
}


// ================================
// دریافت API
// ================================

async function updatePrices() {

    const updateTime =
        document.getElementById("updateTime");

    const lastMessage =
        document.getElementById("lastMessage");

    const apiStatus =
        document.getElementById("apiStatus");


    if (updateTime) {
        updateTime.textContent =
            "در حال دریافت...";
    }


    if (lastMessage) {
        lastMessage.textContent =
            "در حال دریافت قیمت‌ها...";
    }


    if (apiStatus) {
        apiStatus.textContent =
            "🟡";
    }


    try {

        const response =
            await fetch(
                "/api/prices?time=" + Date.now(),
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


        currentPrices =
            data;


        // ============================
        // طلا
        // ============================

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


        // ============================
        // حباب طلا
        // ============================

        calculateGoldBubble(
            data.GOLD_18_RLS,
            data.GOLD_OUNCE_USD,
            data.USD_RLS
        );


        // ============================
        // نقره
        // ============================

        if (
            Number.isFinite(
                data.SILVER_OUNCE_USD
            ) &&
            Number.isFinite(
                data.USD_RLS
            )
        ) {

            const silver999 =
                (
                    data.SILVER_OUNCE_USD /
                    31.1034768
                ) *
                data.USD_RLS;


            showPrice(
                "silver999",
                "SILVER_999",
                silver999
            );


            showPrice(
                "silver925",
                "SILVER_925",
                silver999 * 0.925
            );


            showPrice(
                "silverKg",
                "SILVER_KG",
                silver999 * 1000
            );
        }


        // ============================
        // سکه
        // ============================

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


        // ============================
        // ارز
        // ============================

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


        // ============================
        // بازار جهانی
        // ============================

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


        // ============================
        // تاریخچه
        // ============================

        addHistory(
            "gold18",
            data.GOLD_18_RLS
        );

        addHistory(
            "dollar",
            data.USD_RLS
        );

        addHistory(
            "coin",
            data.SEKKEH_RLS
        );


        if (
            Number.isFinite(
                data.SILVER_OUNCE_USD
            ) &&
            Number.isFinite(
                data.USD_RLS
            )
        ) {

            const silver999 =
                (
                    data.SILVER_OUNCE_USD /
                    31.1034768
                ) *
                data.USD_RLS;


            addHistory(
                "silver999",
                silver999
            );
        }


        // ============================
        // داشبورد
        // ============================

        updateDashboard();

        updateHeatmap();

        updateFavorites();

        updateAlerts();

        setupAssetSelectors();


        if (apiStatus) {
            apiStatus.textContent =
                "🟢 آنلاین";
        }


        if (updateTime) {

            updateTime.textContent =
                new Date().toLocaleTimeString(
                    "fa-IR"
                );
        }


        if (lastMessage) {

            lastMessage.textContent =
                "قیمت‌ها با موفقیت بروزرسانی شدند ✅";
        }


        countdown = 60;


    } catch (error) {

        console.error(
            "API ERROR:",
            error
        );


        if (apiStatus) {
            apiStatus.textContent =
                "🔴 خطا";
        }


        if (updateTime) {

            updateTime.textContent =
                "خطا در دریافت قیمت‌ها ❌";
        }


        if (lastMessage) {

            lastMessage.textContent =
                "اتصال به API ناموفق بود ❌";
        }
    }
}


// ================================
// حباب طلا
// ================================

function calculateGoldBubble(
    marketPrice,
    ounce,
    dollar
) {

    const calculated =
        document.getElementById(
            "goldCalculated"
        );

    const bubble =
        document.getElementById(
            "goldBubble"
        );

    const bubblePercent =
        document.getElementById(
            "goldBubblePercent"
        );

    const status =
        document.getElementById(
            "bubbleStatus"
        );


    if (
        !Number.isFinite(marketPrice) ||
        !Number.isFinite(ounce) ||
        !Number.isFinite(dollar)
    ) {

        if (calculated)
            calculated.textContent = "--";

        if (bubble)
            bubble.textContent = "--";

        if (bubblePercent)
            bubblePercent.textContent = "--";

        if (status)
            status.textContent = "--";

        return;
    }


    const calculatedPrice =
        (
            ounce /
            31.1034768
        ) *
        dollar *
        0.75;


    const bubbleValue =
        marketPrice -
        calculatedPrice;


    const bubblePercentValue =
        (
            bubbleValue /
            calculatedPrice
        ) * 100;


    if (calculated) {

        calculated.textContent =
            rial(calculatedPrice);
    }


    if (bubble) {

        bubble.textContent =
            rial(bubbleValue);

        bubble.style.color =
            bubbleValue > 0
                ? "#ff6b6b"
                : "#31d39a";
    }


    if (bubblePercent) {

        bubblePercent.textContent =
            "حباب: " +
            bubblePercentValue.toFixed(2) +
            "٪";
    }


    if (status) {

        if (bubblePercentValue > 5) {

            status.textContent =
                "🔴 حباب بالا";

        } else if (bubblePercentValue > 2) {

            status.textContent =
                "🟠 حباب متوسط";

        } else if (bubblePercentValue < -2) {

            status.textContent =
                "🟢 زیر ارزش محاسباتی";

        } else {

            status.textContent =
                "🔵 نزدیک به ارزش محاسباتی";
        }
    }
}


// ================================
// تاریخچه و نمودار
// ================================

function addHistory(key, value) {

    if (!Number.isFinite(value)) return;


    if (!priceHistory[key]) {
        priceHistory[key] = [];
    }


    priceHistory[key].push({
        time: new Date().toLocaleTimeString("fa-IR"),
        value: value
    });


    if (priceHistory[key].length > 30) {
        priceHistory[key].shift();
    }


    const select =
        document.getElementById(
            "chartSelect"
        );


    if (
        select &&
        select.value === key
    ) {

        drawChart(key);
    }
}


function drawChart(key) {

    const canvas =
        document.getElementById(
            "priceChart"
        );


    if (
        !canvas ||
        typeof Chart === "undefined"
    ) {
        return;
    }


    const history =
        priceHistory[key] || [];


    if (chart) {
        chart.destroy();
    }


    chart = new Chart(
        canvas,
        {
            type: "line",

            data: {

                labels:
                    history.map(
                        item => item.time
                    ),

                datasets: [{
                    label:
                        getAssetName(key),

                    data:
                        history.map(
                            item => item.value
                        ),

                    tension: 0.35,

                    fill: true
                }]
            },

            options: {

                responsive: true,

                maintainAspectRatio: false
            }
        }
    );
}


function getAssetName(key) {

    const names = {

        gold18: "طلای ۱۸ عیار",
        dollar: "دلار",
        coin: "سکه امامی",
        silver999: "نقره ۹۹۹"
    };


    return names[key] || key;
}


const chartSelect =
    document.getElementById(
        "chartSelect"
    );


if (chartSelect) {

    chartSelect.addEventListener(
        "change",
        () => {

            drawChart(
                chartSelect.value
            );
        }
    );
}


// ================================
// داشبورد
// ================================

function updateDashboard() {

    const assets = [

        ["طلای ۱۸", "GOLD_18_RLS"],
        ["دلار", "USD_RLS"],
        ["یورو", "EUR_RLS"],
        ["سکه امامی", "SEKKEH_RLS"]
    ];


    let changes = [];


    assets.forEach(
        ([name, key]) => {

            const value =
                currentPrices[key];

            const old =
                previousPrices[key];


            if (
                Number.isFinite(value) &&
                Number.isFinite(old) &&
                old !== 0
            ) {

                changes.push({

                    name,

                    change:
                        ((value - old) /
                            old) * 100
                });
            }
        }
    );


    if (!changes.length) return;


    changes.sort(
        (a, b) =>
            b.change - a.change
    );


    const top =
        changes[0];

    const bottom =
        changes[changes.length - 1];


    const gainer =
        document.getElementById(
            "topGainer"
        );

    const gainerPercent =
        document.getElementById(
            "topGainerPercent"
        );

    const loser =
        document.getElementById(
            "topLoser"
        );

    const loserPercent =
        document.getElementById(
            "topLoserPercent"
        );


    if (gainer) {
        gainer.textContent =
            top.name;
    }

    if (gainerPercent) {
        gainerPercent.textContent =
            `▲ ${top.change.toFixed(2)}٪`;
    }

    if (loser) {
        loser.textContent =
            bottom.name;
    }

    if (loserPercent) {
        loserPercent.textContent =
            `▼ ${Math.abs(bottom.change).toFixed(2)}٪`;
    }


    let score = 50;


    const average =
        changes.reduce(
            (sum, item) =>
                sum + item.change,
            0
        ) / changes.length;


    score =
        Math.max(
            0,
            Math.min(
                100,
                50 + average * 8
            )
        );


    const scoreElement =
        document.getElementById(
            "marketScore"
        );

    const mood =
        document.getElementById(
            "marketMood"
        );

    const bar =
        document.getElementById(
            "scoreBar"
        );


    if (scoreElement) {
        scoreElement.textContent =
            Math.round(score);
    }


    if (bar) {
        bar.style.width =
            score + "%";
    }


    if (mood) {

        mood.textContent =
            score >= 65
                ? "🟢 بازار صعودی"
                : score <= 35
                    ? "🔴 بازار نزولی"
                    : "🟡 بازار متعادل";
    }
}


// ================================
// Heatmap
// ================================

function updateHeatmap() {

    const container =
        document.getElementById(
            "heatmap"
        );


    if (!container) return;


    const assets = [

        ["طلای ۱۸", "GOLD_18_RLS"],
        ["طلای ۲۴", "GOLD_24_RLS"],
        ["دلار", "USD_RLS"],
        ["یورو", "EUR_RLS"],
        ["سکه امامی", "SEKKEH_RLS"]
    ];


    container.innerHTML = "";


    assets.forEach(
        ([name, key]) => {

            const value =
                currentPrices[key];

            const old =
                previousPrices[key];


            let change = 0;


            if (
                Number.isFinite(value) &&
                Number.isFinite(old) &&
                old !== 0
            ) {

                change =
                    ((value - old) /
                        old) * 100;
            }


            const item =
                document.createElement("div");


            item.className =
                "heat-item";


            item.innerHTML = `
                <span>${name}</span>
                <strong>
                    ${change >= 0 ? "▲" : "▼"}
                    ${Math.abs(change).toFixed(2)}٪
                </strong>
            `;


            container.appendChild(item);
        }
    );
}


// ================================
// علاقه‌مندی
// ================================

const favoriteNames = {

    gold18: "طلای ۱۸ عیار",
    gold24: "طلای ۲۴ عیار",
    mesghal: "مثقال طلا",
    dollar: "دلار",
    euro: "یورو",
    pound: "پوند",
    coin: "سکه امامی"
};


function favoriteValue(key) {

    const values = {

        gold18:
            currentPrices.GOLD_18_RLS,

        gold24:
            currentPrices.GOLD_24_RLS,

        mesghal:
            currentPrices.GOLD_MESGHAL_RLS,

        dollar:
            currentPrices.USD_RLS,

        euro:
            currentPrices.EUR_RLS,

        pound:
            currentPrices.GBP_RLS,

        coin:
            currentPrices.SEKKEH_RLS
    };


    return values[key];
}


function updateFavorites() {

    const container =
        document.getElementById(
            "favorites"
        );


    if (!container) return;


    container.innerHTML = "";


    if (!favorites.length) {

        container.innerHTML =
            `<div class="result">
                هنوز دارایی‌ای اضافه نشده ⭐
            </div>`;

        return;
    }


    favorites.forEach(key => {

        const card =
            document.createElement("div");

        card.className =
            "card";


        card.innerHTML = `
            <span>⭐ ${favoriteNames[key]}</span>
            <h3>${rial(favoriteValue(key))}</h3>
        `;


        container.appendChild(card);
    });
}


document
    .querySelectorAll(".favorite")
    .forEach(button => {

        const key =
            button.dataset.key;


        if (favorites.includes(key)) {
            button.textContent = "★";
        }


        button.addEventListener(
            "click",
            () => {

                if (
                    favorites.includes(key)
                ) {

                    favorites =
                        favorites.filter(
                            item =>
                                item !== key
                        );

                    button.textContent =
                        "☆";

                } else {

                    favorites.push(key);

                    button.textContent =
                        "★";
                }


                localStorage.setItem(
                    "marketFavorites",
                    JSON.stringify(favorites)
                );


                updateFavorites();
            }
        );
    });


// ================================
// جستجو
// ================================

const search =
    document.getElementById(
        "search"
    );


if (search) {

    search.addEventListener(
        "input",
        function () {

            const query =
                this.value
                    .trim()
                    .toLowerCase();


            document
                .querySelectorAll(
                    ".card[data-name]"
                )
                .forEach(card => {

                    card.style.display =
                        card.dataset.name
                            .toLowerCase()
                            .includes(query)
                            ? ""
                            : "none";
                });
        }
    );
}


// ================================
// حالت شب / روز
// ================================

const themeButton =
    document.getElementById(
        "themeButton"
    );


function applyTheme() {

    const light =
        localStorage.getItem(
            "marketTheme"
        ) === "light";


    document.body.classList.toggle(
        "light",
        light
    );


    if (themeButton) {

        themeButton.textContent =
            light ? "🌙" : "☀️";
    }
}


applyTheme();


if (themeButton) {

    themeButton.addEventListener(
        "click",
        () => {

            const light =
                document.body.classList.toggle(
                    "light"
                );


            localStorage.setItem(
                "marketTheme",
                light
                    ? "light"
                    : "dark"
            );


            themeButton.textContent =
                light ? "🌙" : "☀️";
        }
    );
}


// ================================
// ساعت
// ================================

function updateClock() {

    const clock =
        document.getElementById(
            "clock"
        );


    if (!clock) return;


    clock.textContent =
        new Date().toLocaleTimeString(
            "fa-IR"
        );
}


updateClock();


setInterval(
    updateClock,
    1000
);


// ================================
// شمارش معکوس
// ================================

setInterval(
    () => {

        const auto =
            document.getElementById(
                "autoUpdate"
            );


        if (
            auto &&
            !auto.checked
        ) {
            return;
        }


        countdown--;


        if (countdown <= 0) {

            countdown = 60;

            updatePrices();
        }


        const counter =
            document.getElementById(
                "countdown"
            );


        if (counter) {

            counter.textContent =
                countdown;
        }

    },
    1000
);


// ================================
// مقایسه
// ================================

const compareAssets = {

    gold18: {
        name: "طلای ۱۸",
        key: "GOLD_18_RLS"
    },

    gold24: {
        name: "طلای ۲۴",
        key: "GOLD_24_RLS"
    },

    dollar: {
        name: "دلار",
        key: "USD_RLS"
    },

    euro: {
        name: "یورو",
        key: "EUR_RLS"
    },

    coin: {
        name: "سکه امامی",
        key: "SEKKEH_RLS"
    },

    silver999: {
        name: "نقره ۹۹۹",
        key: "SILVER_999"
    }
};


function setupAssetSelectors() {

    const one =
        document.getElementById(
            "compareOne"
        );

    const two =
        document.getElementById(
            "compareTwo"
        );

    const alertSelect =
        document.getElementById(
            "alertAsset"
        );


    const options =
        Object.entries(
            compareAssets
        );


    if (
        one &&
        one.options.length === 0
    ) {

        options.forEach(
            ([key, asset]) => {

                one.add(
                    new Option(
                        asset.name,
                        key
                    )
                );
            }
        );
    }


    if (
        two &&
        two.options.length === 0
    ) {

        options.forEach(
            ([key, asset]) => {

                two.add(
                    new Option(
                        asset.name,
                        key
                    )
                );
            }
        );


        if (two.options.length > 1) {
            two.selectedIndex = 1;
        }
    }


    if (
        alertSelect &&
        alertSelect.options.length === 0
    ) {

        options.forEach(
            ([key, asset]) => {

                alertSelect.add(
                    new Option(
                        asset.name,
                        key
                    )
                );
            }
        );
    }
}


function assetValue(key) {

    const asset =
        compareAssets[key];


    if (!asset) return NaN;


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


    return currentPrices[asset.key];
}


const compareButton =
    document.getElementById(
        "compareButton"
    );


if (compareButton) {

    compareButton.addEventListener(
        "click",
        () => {

            const one =
                document.getElementById(
                    "compareOne"
                ).value;

            const two =
                document.getElementById(
                    "compareTwo"
                ).value;


            const result =
                document.getElementById(
                    "comparisonResult"
                );


            const valueOne =
                assetValue(one);

            const valueTwo =
                assetValue(two);


            if (
                !Number.isFinite(valueOne) ||
                !Number.isFinite(valueTwo)
            ) {

                result.textContent =
                    "اطلاعات کافی نیست.";

                return;
            }


            const difference =
                Math.abs(
                    valueOne - valueTwo
                );


            result.textContent =
                `${compareAssets[one].name} و ${compareAssets[two].name}
                | اختلاف: ${rial(difference)}`;
        }
    );
}


// ================================
// محاسبه طلا
// ================================

const calculateGold =
    document.getElementById(
        "calculateGold"
    );


if (calculateGold) {

    calculateGold.addEventListener(
        "click",
        () => {

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


            const price =
                karat === 24
                    ? currentPrices.GOLD_24_RLS
                    : currentPrices.GOLD_18_RLS;


            const result =
                document.getElementById(
                    "calculatorResult"
                );


            if (
                !Number.isFinite(weight) ||
                weight <= 0 ||
                !Number.isFinite(price)
            ) {

                result.textContent =
                    "اطلاعات معتبر وارد کن.";

                return;
            }


            result.textContent =
                "ارزش تقریبی: " +
                rial(weight * price);
        }
    );
}


// ================================
// تبدیل ارز
// ================================

const convertCurrency =
    document.getElementById(
        "convertCurrency"
    );


if (convertCurrency) {

    convertCurrency.addEventListener(
        "click",
        () => {

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


            const rate =
                currentPrices[type];


            if (
                !Number.isFinite(amount) ||
                amount <= 0 ||
                !Number.isFinite(rate)
            ) {

                result.textContent =
                    "اطلاعات معتبر وارد کن.";

                return;
            }


            result.textContent =
                `${amount.toLocaleString("fa-IR")}
                واحد ≈
                ${rial(amount * rate)}`;
        }
    );
}


// ================================
// سناریوساز
// ================================

const scenarioButton =
    document.getElementById(
        "scenarioButton"
    );


if (scenarioButton) {

    scenarioButton.addEventListener(
        "click",
        () => {

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
                    "مقادیر معتبر وارد کن.";

                return;
            }


            const calculated =
                (
                    ounce /
                    31.1034768
                ) *
                dollar *
                0.75;


            result.textContent =
                "قیمت فرضی طلای ۱۸: " +
                rial(calculated);
        }
    );
}


// ================================
// هشدار
// ================================

const setAlert =
    document.getElementById(
        "setAlert"
    );


if (setAlert) {

    setAlert.addEventListener(
        "click",
        () => {

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


            if (
                !asset ||
                !Number.isFinite(target) ||
                target <= 0
            ) {
                return;
            }


            alerts.push({
                asset,
                target
            });


            localStorage.setItem(
                "marketAlerts",
                JSON.stringify(alerts)
            );


            updateAlerts();
        }
    );
}


function updateAlerts() {

    const container =
        document.getElementById(
            "alertsList"
        );


    if (!container) return;


    container.innerHTML = "";


    alerts.forEach(
        (alert, index) => {

            const asset =
                compareAssets[
                    alert.asset
                ];


            if (!asset) return;


            const value =
                assetValue(
                    alert.asset
                );


            const reached =
                Number.isFinite(value) &&
                value >= alert.target;


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "result";


            item.innerHTML = `
                🔔 ${asset.name}
                — هدف: ${rial(alert.target)}
                <br>
                ${
                    reached
                        ? "🚨 قیمت هدف رسید!"
                        : "⏳ در انتظار قیمت هدف"
                }

                <button
                    onclick="removeAlert(${index})"
                    style="
                        float:left;
                        border:0;
                        background:none;
                        cursor:pointer;
                    "
                >
                    حذف
                </button>
            `;


            container.appendChild(item);
        }
    );
}


function removeAlert(index) {

    alerts.splice(index, 1);


    localStorage.setItem(
        "marketAlerts",
        JSON.stringify(alerts)
    );


    updateAlerts();
}


// ================================
// تنظیمات داشبورد
// ================================

const dashboardMode =
    document.getElementById(
        "dashboardMode"
    );


if (dashboardMode) {

    dashboardMode.addEventListener(
        "change",
        () => {

            document.body.classList.toggle(
                "dashboard-focus",
                dashboardMode.checked
            );
        }
    );
}


// ================================
// انیمیشن قیمت
// ================================

const priceAnimation =
    document.getElementById(
        "priceAnimation"
    );


if (priceAnimation) {

    priceAnimation.addEventListener(
        "change",
        () => {

            document.body.classList.toggle(
                "no-price-animation",
                !priceAnimation.checked
            );
        }
    );
}


// ================================
// بروزرسانی دستی
// ================================

const mainRefresh =
    document.getElementById(
        "mainRefresh"
    );


if (mainRefresh) {

    mainRefresh.addEventListener(
        "click",
        updatePrices
    );
}


// ================================
// شروع سایت
// ================================

setupAssetSelectors();

updatePrices();
