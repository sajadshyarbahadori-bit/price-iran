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


// ===============================
// ابزارهای عمومی
// ===============================

function rial(value) {

    if (!Number.isFinite(value)) {
        return "داده موجود نیست";
    }

    return Math.round(value).toLocaleString("fa-IR") + " ریال";
}


function number(value) {

    if (!Number.isFinite(value)) {
        return "داده موجود نیست";
    }

    return Math.round(value).toLocaleString("fa-IR");
}


function usd(value) {

    if (!Number.isFinite(value)) {
        return "داده موجود نیست";
    }

    return Number(value).toLocaleString("en-US", {
        maximumFractionDigits: 4
    }) + " USD";
}


function percent(value) {

    if (!Number.isFinite(value)) {
        return "--";
    }

    return value.toFixed(2) + "٪";
}


// ===============================
// نمایش قیمت
// ===============================

function showPrice(id, key, value, formatter) {

    const element =
        document.getElementById(id);

    if (!element) return;

    if (!Number.isFinite(value)) {

        element.textContent =
            "داده موجود نیست";

        return;
    }

    let changeText = "";

    if (previousPrices[key] !== undefined) {

        const oldValue =
            previousPrices[key];

        if (
            Number.isFinite(oldValue) &&
            oldValue !== 0
        ) {

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

                    changeElement.style.color =
                        "";
                }
            }
        }
    }

    element.textContent =
        formatter(value) + changeText;

    previousPrices[key] = value;
}


// ===============================
// دریافت قیمت‌ها
// ===============================

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
        apiStatus.textContent = "🟡";
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

        console.log(
            "Prices:",
            prices
        );

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


        // ===============================
        // طلا
        // ===============================

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


        // ===============================
        // نقره
        // ===============================

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


        // ===============================
        // سکه
        // ===============================

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


        // ===============================
        // ارز
        // ===============================

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


        // ===============================
        // بازار جهانی
        // ===============================

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


        // ===============================
        // تاریخچه نمودار
        // ===============================

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

            const silver =
                (
                    data.SILVER_OUNCE_USD /
                    31.1034768
                ) *
                data.USD_RLS;

            addHistory(
                "silver999",
                silver
            );
        }


        // ===============================
        // حباب طلا
        // ===============================

        calculateGoldBubble(
            data.GOLD_18_RLS,
            data.GOLD_OUNCE_USD,
            data.USD_RLS
        );


        // ===============================
        // داشبورد
        // ===============================

        updateDashboard(data);

        updateHeatmap(data);

        updateFavorites();

        updateAlerts();


        // ===============================
        // وضعیت API
        // ===============================

        if (apiStatus) {
            apiStatus.textContent = "🟢 آنلاین";
        }

        const now =
            new Date().toLocaleTimeString(
                "fa-IR"
            );

        if (updateTime) {

            updateTime.textContent =
                "آخرین بروزرسانی: " +
                now;
        }

        if (lastMessage) {

            lastMessage.textContent =
                "قیمت‌ها با موفقیت بروزرسانی شدند ✅";
        }

        countdown = 60;

    } catch (error) {

        console.error(
            "Price update error:",
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


// ===============================
// تاریخچه قیمت
// ===============================

function addHistory(
    key,
    value
) {

    if (!Number.isFinite(value)) {
        return;
    }

    if (!priceHistory[key]) {
        priceHistory[key] = [];
    }

    priceHistory[key].push({
        time:
            new Date().toLocaleTimeString(
                "fa-IR"
            ),
        value: value
    });

    if (
        priceHistory[key].length > 30
    ) {

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


// ===============================
// نمودار
// ===============================

function drawChart(key) {

    const canvas =
        document.getElementById(
            "priceChart"
        );

    if (!canvas) return;

    if (
        typeof Chart === "undefined"
    ) {
        return;
    }

    const history =
        priceHistory[key] || [];

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

    chart = new Chart(
        canvas,
        {
            type: "line",

            data: {
                labels: labels,

                datasets: [{
                    label:
                        getAssetName(key),

                    data: values,

                    tension: 0.35,

                    fill: true
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
                    y: {
                        beginAtZero: false
                    }
                }
            }
        }
    );
}


// ===============================
// نام دارایی
// ===============================

function getAssetName(key) {

    const names = {

        gold18:
            "طلای ۱۸ عیار",

        dollar:
            "دلار آمریکا",

        coin:
            "سکه امامی",

        silver999:
            "نقره ۹۹۹"
    };

    return names[key] || key;
}


// ===============================
// حباب طلا
// ===============================

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
        !Number.isFinite(
            marketPrice
        ) ||
        !Number.isFinite(
            ounce
        ) ||
        !Number.isFinite(
            dollar
        )
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


    /*
        قیمت تقریبی یک گرم طلای ۱۸ عیار

        اونس ÷ 31.1034768
        × دلار
        × 0.75
    */

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
        ) *
        100;


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

        bubblePercent.style.color =
            bubblePercentValue > 0
                ? "#ff6b6b"
                : "#31d39a";
    }


    if (status) {

        if (bubblePercentValue > 5) {

            status.textContent =
                "🔴 حباب بالا";

        } else if (
            bubblePercentValue > 2
        ) {

            status.textContent =
                "🟠 حباب متوسط";

        } else if (
            bubblePercentValue < -2
        ) {

            status.textContent =
                "🟢 زیر ارزش محاسباتی";

        } else {

            status.textContent =
                "🔵 نزدیک به ارزش محاسباتی";
        }
    }
}


// ===============================
// داشبورد بازار
// ===============================

function updateDashboard(data) {

    const assets = [

        {
            name: "طلای ۱۸",
            key: "GOLD_18_RLS",
            value: data.GOLD_18_RLS
        },

        {
            name: "دلار",
            key: "USD_RLS",
            value: data.USD_RLS
        },

        {
            name: "سکه امامی",
            key: "SEKKEH_RLS",
            value: data.SEKKEH_RLS
        },

        {
            name: "یورو",
            key: "EUR_RLS",
            value: data.EUR_RLS
        },

        {
            name: "طلای ۲۴",
            key: "GOLD_24_RLS",
            value: data.GOLD_24_RLS
        }
    ];


    let changes = [];

    assets.forEach(asset => {

        const old =
            previousPrices[asset.key];

        if (
            Number.isFinite(asset.value) &&
            Number.isFinite(old) &&
            old !== 0
        ) {

            const change =
                (
                    (asset.value - old) /
                    old
                ) * 100;

            changes.push({
                name: asset.name,
                change: change
            });
        }
    });


    let score = 50;

    if (changes.length) {

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
    }


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

        if (score >= 65) {

            mood.textContent =
                "🟢 بازار صعودی";

        } else if (score <= 35) {

            mood.textContent =
                "🔴 بازار نزولی";

        } else {

            mood.textContent =
                "🟡 بازار متعادل";
        }
    }


    if (changes.length) {

        changes.sort(
            (a, b) =>
                b.change -
                a.change
        );

        const top =
            changes[0];

        const bottom =
            changes[changes.length - 1];


        const topName =
            document.getElementById(
                "topGainer"
            );

        const topPercent =
            document.getElementById(
                "topGainerPercent"
            );

        const loserName =
            document.getElementById(
                "topLoser"
            );

        const loserPercent =
            document.getElementById(
                "topLoserPercent"
            );


        if (topName)
            topName.textContent =
                top.name;

        if (topPercent)
            topPercent.textContent =
                "▲ " +
                percent(top.change);


        if (loserName)
            loserName.textContent =
                bottom.name;

        if (loserPercent)
            loserPercent.textContent =
                "▼ " +
                percent(
                    Math.abs(
                        bottom.change
                    )
                );
    }
}


// ===============================
// Heatmap
// ===============================

function updateHeatmap(data) {

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
        ["سکه امامی", "SEKKEH_RLS"],
        ["نقره", "SILVER_999"]
    ];


    container.innerHTML = "";


    assets.forEach(
        ([name, key]) => {

            const value =
                key === "SILVER_999"
                    ? calculateSilver(data)
                    : data[key];

            const old =
                previousPrices[key];

            let change = 0;

            if (
                Number.isFinite(value) &&
                Number.isFinite(old) &&
                old !== 0
            ) {

                change =
                    (
                        (value - old) /
                        old
                    ) * 100;
            }


            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "heat-item " +
                (
                    change > 0
                        ? "up"
                        : change < 0
                            ? "down"
                            : ""
                );


            item.innerHTML = `
                <span>${name}</span>
                <strong>
                    ${
                        Number.isFinite(value)
                            ? percent(change)
                            : "--"
                    }
                </strong>
            `;


            container.appendChild(item);
        }
    );
}


function calculateSilver(data) {

    if (
        !Number.isFinite(
            data.SILVER_OUNCE_USD
        ) ||
        !Number.isFinite(
            data.USD_RLS
        )
    ) {
        return NaN;
    }

    return (
        data.SILVER_OUNCE_USD /
        31.1034768
    ) *
    data.USD_RLS;
}


// ===============================
// علاقه‌مندی‌ها
// ===============================

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
                هنوز چیزی به علاقه‌مندی‌ها اضافه نکرده‌ای ⭐
            </div>`;

        return;
    }


    favorites.forEach(key => {

        const value =
            getFavoriteValue(key);

        const name =
            getFavoriteName(key);


        const card =
            document.createElement(
                "div"
            );

        card.className =
            "card";

        card.innerHTML = `
            <span>⭐ ${name}</span>
            <h3>${rial(value)}</h3>
        `;

        container.appendChild(card);
    });
}


function getFavoriteValue(key) {

    const map = {

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

    return map[key];
}


function getFavoriteName(key) {

    const map = {

        gold18: "طلای ۱۸ عیار",
        gold24: "طلای ۲۴ عیار",
        mesghal: "مثقال طلا",
        dollar: "دلار آمریکا",
        euro: "یورو",
        pound: "پوند",
        coin: "سکه امامی"
    };

    return map[key] || key;
}


// ===============================
// جستجو
// ===============================

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

                    const name =
                        card
                            .dataset
                            .name
                            .toLowerCase();

                    card.style.display =
                        name.includes(query)
                            ? ""
                            : "none";
                });
        }
    );
}


// ===============================
// ستاره علاقه‌مندی
// ===============================

document
    .querySelectorAll(
        ".favorite"
    )
    .forEach(button => {

        const key =
            button.dataset.key;

        if (
            favorites.includes(key)
        ) {

            button.textContent =
                "★";
        }


        button.addEventListener(
            "click",
            function () {

                if (
                    favorites.includes(
                        key
                    )
                ) {

                    favorites =
                        favorites.filter(
                            item =>
                                item !== key
                        );

                    this.textContent =
                        "☆";

                } else {

                    favorites.push(key);

                    this.textContent =
                        "★";
                }


                localStorage.setItem(
                    "marketFavorites",
                    JSON.stringify(
                        favorites
                    )
                );


                updateFavorites();
            }
        );
    });


// ===============================
// حالت شب / روز
// ===============================

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
            light
                ? "🌙"
                : "☀️";
    }
}


applyTheme();


if (themeButton) {

    themeButton.onclick =
        function () {

            const isLight =
                document.body.classList.toggle(
                    "light"
                );

            localStorage.setItem(
                "marketTheme",
                isLight
                    ? "light"
                    : "dark"
            );

            this.textContent =
                isLight
                    ? "🌙"
                    : "☀️";
        };
}


// ===============================
// کوچک‌نمایی داشبورد
// ===============================

const minimizeButton =
    document.getElementById(
        "minimizeButton"
    );

const dashboard =
    document.getElementById(
        "dashboard"
    );


if (
    minimizeButton &&
    dashboard
) {

    minimizeButton.onclick =
        function () {

            const minimized =
                dashboard.classList.toggle(
                    "minimized"
                );


            this.textContent =
                minimized
                    ? "➕"
                    : "➖";


            this.title =
                minimized
                    ? "باز کردن داشبورد"
                    : "کوچک‌نمایی";
        };
}


// ===============================
// تمام صفحه
// ===============================

const fullscreenButton =
    document.getElementById(
        "fullscreenButton"
    );


if (fullscreenButton) {

    fullscreenButton.onclick =
        async function () {

            try {

                if (
                    !document.fullscreenElement
                ) {

                    await document.documentElement
                        .requestFullscreen();

                } else {

                    await document.exitFullscreen();
                }

            } catch (error) {

                console.error(
                    "Fullscreen error:",
                    error
                );
            }
        };
}


// ===============================
// ساعت
// ===============================

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


setInterval(
    updateClock,
    1000
);

updateClock();


// ===============================
// شمارش معکوس
// ===============================

setInterval(
    function () {

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

        if (
            countdown <= 0
        ) {

            countdown = 60;

            updatePrices();
        }


        const element =
            document.getElementById(
                "countdown"
            );

        if (element) {

            element.textContent =
                countdown;
        }

    },
    1000
);


// ===============================
// انتخاب نمودار
// ===============================

const chartSelect =
    document.getElementById(
        "chartSelect"
    );


if (chartSelect) {

    chartSelect.addEventListener(
        "change",
        function () {

            drawChart(
                this.value
            );
        }
    );
}


// ===============================
// محاسبه‌گر طلا
// ===============================

const calculateGold =
    document.getElementById(
        "calculateGold"
    );


if (calculateGold) {

    calculateGold.onclick =
        function () {

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


            if (
                !Number.isFinite(
                    weight
                ) ||
                weight <= 0
            ) {

                document.getElementById(
                    "calculatorResult"
                ).textContent =
                    "وزن معتبر وارد کن.";

                return;
            }


            const price =
                karat === 24
                    ? currentPrices.GOLD_24_RLS
                    : currentPrices.GOLD_18_RLS;


            if (
                !Number.isFinite(price)
            ) {

                document.getElementById(
                    "calculatorResult"
                ).textContent =
                    "قیمت طلا موجود نیست.";

                return;
            }


            const total =
                weight * price;


            document.getElementById(
                "calculatorResult"
            ).textContent =
                "ارزش تقریبی: " +
                rial(total);
        };
}


// ===============================
// تبدیل ارز
// ===============================

const convertCurrency =
    document.getElementById(
        "convertCurrency"
    );


if (convertCurrency) {

    convertCurrency.onclick =
        function () {

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


            const rate =
                currentPrices[type];


            if (
                !Number.isFinite(amount) ||
                amount <= 0 ||
                !Number.isFinite(rate)
            ) {

                document.getElementById(
                    "currencyResult"
                ).textContent =
                    "اطلاعات معتبر وارد کن.";

                return;
            }


            document.getElementById(
                "currencyResult"
            ).textContent =
                rial(
                    amount * rate
                );
        };
}


// ===============================
// سناریوساز طلا
// ===============================

const scenarioButton =
    document.getElementById(
        "scenarioButton"
    );


if (scenarioButton) {

    scenarioButton.onclick =
        function () {

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


            if (
                !Number.isFinite(
                    dollar
                ) ||
                !Number.isFinite(
                    ounce
                )
            ) {

                document.getElementById(
                    "scenarioResult"
                ).textContent =
                    "دلار و اونس فرضی را وارد کن.";

                return;
            }


            const result =
                (
                    ounce /
                    31.1034768
                ) *
                dollar *
                0.75;


            document.getElementById(
                "scenarioResult"
            ).textContent =
                "قیمت محاسباتی هر گرم طلای ۱۸: " +
                rial(result);
        };
}


// ===============================
// مقایسه دارایی‌ها
// ===============================

const compareAssets = {

    gold18: {
        name: "طلای ۱۸",
        get: () =>
            currentPrices.GOLD_18_RLS
    },

    dollar: {
        name: "دلار",
        get: () =>
            currentPrices.USD_RLS
    },

    euro: {
        name: "یورو",
        get: () =>
            currentPrices.EUR_RLS
    },

    coin: {
        name: "سکه امامی",
        get: () =>
            currentPrices.SEKKEH_RLS
    }
};


function fillCompareSelects() {

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


    if (!one || !two) {
        return;
    }


    const options =
        Object.entries(
            compareAssets
        )
        .map(
            ([key, asset]) =>
                `<option value="${key}">
                    ${asset.name}
                </option>`
        )
        .join("");


    one.innerHTML =
        options;

    two.innerHTML =
        options;


    if (alertSelect) {

        alertSelect.innerHTML =
            options;
    }
}


fillCompareSelects();


const compareButton =
    document.getElementById(
        "compareButton"
    );


if (compareButton) {

    compareButton.onclick =
        function () {

            const oneKey =
                document.getElementById(
                    "compareOne"
                ).value;


            const twoKey =
                document.getElementById(
                    "compareTwo"
                ).value;


            const one =
                compareAssets[
                    oneKey
                ];


            const two =
                compareAssets[
                    twoKey
                ];


            const valueOne =
                one.get();


            const valueTwo =
                two.get();


            const result =
                document.getElementById(
                    "comparisonResult"
                );


            if (
                !Number.isFinite(
                    valueOne
                ) ||
                !Number.isFinite(
                    valueTwo
                )
            ) {

                result.textContent =
                    "قیمت یکی از دارایی‌ها موجود نیست.";

                return;
            }


            const ratio =
                valueOne /
                valueTwo;


            result.textContent =
                `${one.name} حدوداً ${ratio.toFixed(2)} برابر ${two.name} است.`;
        };
}


// ===============================
// هشدار قیمت
// ===============================

const setAlert =
    document.getElementById(
        "setAlert"
    );


if (setAlert) {

    setAlert.onclick =
        function () {

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
                !Number.isFinite(
                    target
                ) ||
                target <= 0
            ) {

                return;
            }


            alerts.push({
                asset: asset,
                target: target
            });


            localStorage.setItem(
                "marketAlerts",
                JSON.stringify(
                    alerts
                )
            );


            updateAlerts();
        };
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
                asset.get();


            const active =
                Number.isFinite(value) &&
                value >= alert.target;


            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "result";


            item.style.marginTop =
                "10px";


            item.innerHTML = `
                🔔 ${asset.name}
                — هدف:
                ${rial(alert.target)}
                <br>
                ${
                    active
                        ? "🚨 به قیمت هدف رسید!"
                        : "⏳ منتظر رسیدن به قیمت هدف"
                }
                <button
                    onclick="removeAlert(${index})"
                    style="
                        float:left;
                        border:0;
                        background:none;
                        color:#ff6b6b;
                        cursor:pointer;
                    "
                >
                    حذف
                </button>
            `;


            container.appendChild(item);


            if (active) {

                try {

                    if (
                        "Notification"
                        in window
                    ) {

                        if (
                            Notification.permission ===
                            "granted"
                        ) {

                            new Notification(
                                "هشدار بازار",
                                {
                                    body:
                                        asset.name +
                                        " به قیمت هدف رسید."
                                }
                            );
                        }
                    }

                } catch (e) {}
            }
        }
    );
}


function removeAlert(index) {

    alerts.splice(
        index,
        1
    );

    localStorage.setItem(
        "marketAlerts",
        JSON.stringify(
            alerts
        )
    );

    updateAlerts();
}


// ===============================
// درخواست اجازه اعلان
// ===============================

if (
    "Notification" in window &&
    Notification.permission ===
        "default"
) {

    document.addEventListener(
        "click",
        function requestNotification() {

            Notification.requestPermission();

            document.removeEventListener(
                "click",
                requestNotification
            );
        },
        {
            once: true
        }
    );
}


// ===============================
// تنظیمات
// ===============================

const dashboardMode =
    document.getElementById(
        "dashboardMode"
    );


if (dashboardMode) {

    dashboardMode.addEventListener(
        "change",
        function () {

            document.body.classList.toggle(
                "compact",
                this.checked
            );
        }
    );
}


// ===============================
// بروزرسانی دستی
// ===============================

const mainRefresh =
    document.getElementById(
        "mainRefresh"
    );


if (mainRefresh) {

    mainRefresh.onclick =
        function () {

            updatePrices();
        };
}


// ===============================
// اجرای اولیه
// ===============================

updatePrices();
