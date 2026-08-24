let prices = {};
let previousPrices = {};

let favorites = JSON.parse(
    localStorage.getItem("favorites") || "[]"
);

let alerts = JSON.parse(
    localStorage.getItem("alerts") || "[]"
);

let chart = null;
let countdown = 60;

const assetNames = {
    GOLD_18_RLS: "طلای ۱۸ عیار",
    GOLD_24_RLS: "طلای ۲۴ عیار",
    GOLD_MESGHAL_RLS: "مثقال طلا",

    SEKKEH_RLS: "سکه امامی",
    BAHAR_RLS: "بهار آزادی",
    NIM_SEKKEH_RLS: "نیم‌سکه",
    ROB_SEKKEH_RLS: "ربع‌سکه",
    GERAMI_SEKKEH_RLS: "سکه گرمی",

    USD_RLS: "دلار",
    EUR_RLS: "یورو",
    GBP_RLS: "پوند",
    AED_RLS: "درهم",
    TRY_RLS: "لیر",

    GOLD_OUNCE_USD: "اونس طلا",
    SILVER_OUNCE_USD: "اونس نقره"
};

const elementMap = {
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


/* =========================
   ابزارها
========================= */

function rial(value) {

    if (!Number.isFinite(value)) {
        return "داده موجود نیست";
    }

    return (
        Math.round(value).toLocaleString("fa-IR")
        + " ریال"
    );
}


/* =========================
   دریافت قیمت‌ها
========================= */

async function updatePrices() {

    const updateTime =
        document.getElementById("updateTime");

    const apiStatus =
        document.getElementById("apiStatus");

    if (updateTime) {
        updateTime.textContent =
            "در حال دریافت قیمت‌ها...";
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

        const result =
            await response.json();

        console.log("API:", result);

        if (!Array.isArray(result)) {
            throw new Error(
                "API response is not an array"
            );
        }

        previousPrices = {
            ...prices
        };

        prices = {};

        result.forEach(item => {

            if (
                !item ||
                item.code == null
            ) {
                return;
            }

            const value =
                Number(item.value);

            if (Number.isFinite(value)) {

                prices[String(item.code)] =
                    value;
            }
        });


        /* قیمت‌ها */

        Object.entries(elementMap)
            .forEach(([id, key]) => {

                const element =
                    document.getElementById(id);

                if (!element) return;

                element.textContent =
                    rial(prices[key]);

                updateChange(id, key);
            });


        /* اونس طلا */

        const goldOunce =
            document.getElementById(
                "goldOunce"
            );

        if (goldOunce) {

            goldOunce.textContent =
                Number.isFinite(
                    prices.GOLD_OUNCE_USD
                )
                    ? prices.GOLD_OUNCE_USD
                        .toLocaleString(
                            "en-US",
                            {
                                maximumFractionDigits: 4
                            }
                        )
                        + " USD"
                    : "داده موجود نیست";
        }


        /* اونس نقره */

        const silverOunce =
            document.getElementById(
                "silverOunce"
            );

        if (silverOunce) {

            silverOunce.textContent =
                Number.isFinite(
                    prices.SILVER_OUNCE_USD
                )
                    ? prices.SILVER_OUNCE_USD
                        .toLocaleString(
                            "en-US",
                            {
                                maximumFractionDigits: 4
                            }
                        )
                        + " USD"
                    : "داده موجود نیست";
        }


        calculateSilver();
        calculateBubble();

        updateDashboard(result);

        renderFavorites();

        populateSelects();

        checkAlerts();

        renderAlerts();

        if (apiStatus) {
            apiStatus.textContent = "🟢";
        }

        if (updateTime) {

            updateTime.textContent =
                "آخرین بروزرسانی: " +
                new Date()
                    .toLocaleTimeString("fa-IR");
        }

        countdown = 60;

        updateChart();


    } catch (error) {

        console.error(
            "PRICE API ERROR:",
            error
        );

        if (apiStatus) {
            apiStatus.textContent = "🔴";
        }

        if (updateTime) {
            updateTime.textContent =
                "❌ خطا در دریافت قیمت‌ها";
        }
    }
}


/* =========================
   تغییر قیمت
========================= */

function updateChange(id, key) {

    const element =
        document.getElementById(
            id + "Change"
        );

    if (!element) return;

    const current =
        prices[key];

    const previous =
        previousPrices[key];

    if (
        !Number.isFinite(current) ||
        !Number.isFinite(previous)
    ) {

        element.textContent = "--";

        return;
    }

    const difference =
        current - previous;

    const percent =
        previous !== 0
            ? (difference / previous) * 100
            : 0;

    if (difference > 0) {

        element.textContent =
            "▲ +" +
            percent.toFixed(2) +
            "%";

    } else if (difference < 0) {

        element.textContent =
            "▼ " +
            percent.toFixed(2) +
            "%";

    } else {

        element.textContent =
            "━ 0%";
    }
}


/* =========================
   نقره
========================= */

function calculateSilver() {

    const ounce =
        prices.SILVER_OUNCE_USD;

    const dollar =
        prices.USD_RLS;

    if (
        !Number.isFinite(ounce) ||
        !Number.isFinite(dollar)
    ) {
        return;
    }

    const silver999 =
        (ounce / 31.1034768) *
        dollar;

    const silver925 =
        silver999 * 0.925;

    const silverKg =
        silver999 * 1000;


    const s999 =
        document.getElementById(
            "silver999"
        );

    const s925 =
        document.getElementById(
            "silver925"
        );

    const skg =
        document.getElementById(
            "silverKg"
        );


    if (s999) {
        s999.textContent =
            rial(silver999);
    }

    if (s925) {
        s925.textContent =
            rial(silver925);
    }

    if (skg) {
        skg.textContent =
            rial(silverKg);
    }
}


/* =========================
   حباب طلا
========================= */

function calculateBubble() {

    const gold =
        prices.GOLD_18_RLS;

    const ounce =
        prices.GOLD_OUNCE_USD;

    const dollar =
        prices.USD_RLS;

    if (
        !Number.isFinite(gold) ||
        !Number.isFinite(ounce) ||
        !Number.isFinite(dollar)
    ) {
        return;
    }

    const calculated =
        (ounce / 31.1034768) *
        dollar *
        0.75;

    const bubble =
        gold - calculated;

    const percent =
        calculated !== 0
            ? (bubble / calculated) * 100
            : 0;


    const calculatedElement =
        document.getElementById(
            "goldCalculated"
        );

    const bubbleElement =
        document.getElementById(
            "goldBubble"
        );

    const percentElement =
        document.getElementById(
            "goldBubblePercent"
        );

    const statusElement =
        document.getElementById(
            "bubbleStatus"
        );


    if (calculatedElement) {
        calculatedElement.textContent =
            rial(calculated);
    }

    if (bubbleElement) {
        bubbleElement.textContent =
            rial(bubble);
    }

    if (percentElement) {
        percentElement.textContent =
            percent.toFixed(2) + "%";
    }

    if (statusElement) {

        if (percent > 5) {

            statusElement.textContent =
                "حباب بالا";

        } else if (percent > 0) {

            statusElement.textContent =
                "حباب مثبت";

        } else {

            statusElement.textContent =
                "حباب منفی";
        }
    }
}


/* =========================
   علاقه‌مندی
========================= */

function renderFavorites() {

    const container =
        document.getElementById(
            "favorites"
        );

    if (!container) return;

    container.innerHTML = "";

    favorites.forEach(key => {

        if (
            !Number.isFinite(
                prices[key]
            )
        ) {
            return;
        }

        const card =
            document.createElement(
                "div"
            );

        card.className = "card";

        card.innerHTML = `
            <span>
                ⭐ ${assetNames[key] || key}
            </span>

            <h3>
                ${rial(prices[key])}
            </h3>
        `;

        container.appendChild(card);
    });


    document.querySelectorAll(
        ".favorite"
    ).forEach(button => {

        const key =
            button.dataset.key;

        button.textContent =
            favorites.includes(key)
                ? "★"
                : "☆";
    });
}


document.addEventListener(
    "click",
    event => {

        const button =
            event.target.closest(
                ".favorite"
            );

        if (!button) return;

        const key =
            button.dataset.key;

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
);


/* =========================
   جستجو
========================= */

const search =
    document.getElementById(
        "search"
    );

if (search) {

    search.addEventListener(
        "input",
        () => {

            const query =
                search.value
                    .trim()
                    .toLowerCase();

            document.querySelectorAll(
                ".card"
            ).forEach(card => {

                const name =
                    card.dataset.name ||
                    card.textContent;

                card.style.display =
                    !query ||
                    name
                        .toLowerCase()
                        .includes(query)
                        ? ""
                        : "none";
            });
        }
    );
}


/* =========================
   حالت شب / روز
========================= */

const themeButton =
    document.getElementById(
        "themeButton"
    );


function applyTheme() {

    const light =
        localStorage.getItem(
            "lightMode"
        ) === "1";

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


if (themeButton) {

    themeButton.addEventListener(
        "click",
        () => {

            const isLight =
                document.body
                    .classList
                    .contains("light");

            localStorage.setItem(
                "lightMode",
                isLight
                    ? "0"
                    : "1"
            );

            applyTheme();
        }
    );
}

applyTheme();


/* =========================
   انتخاب‌ها
========================= */

function populateSelects() {

    const selects = [

        document.getElementById(
            "compareOne"
        ),

        document.getElementById(
            "compareTwo"
        ),

        document.getElementById(
            "alertAsset"
        )
    ];


    selects.forEach(select => {

        if (!select) return;

        const current =
            select.value;

        select.innerHTML = "";


        Object.keys(prices)
            .forEach(key => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value = key;

                option.textContent =
                    assetNames[key] ||
                    key;

                select.appendChild(
                    option
                );
            });


        if (
            current &&
            prices[current] !== undefined
        ) {
            select.value =
                current;
        }
    });
}


/* =========================
   مقایسه
========================= */

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
                )?.value;

            const two =
                document.getElementById(
                    "compareTwo"
                )?.value;

            const result =
                document.getElementById(
                    "comparisonResult"
                );


            if (
                !one ||
                !two ||
                !result
            ) {
                return;
            }


            if (
                !Number.isFinite(
                    prices[one]
                ) ||
                !Number.isFinite(
                    prices[two]
                )
            ) {

                result.textContent =
                    "قیمت کافی نیست";

                return;
            }


            const difference =
                prices[one] -
                prices[two];


            result.textContent =
                `${assetNames[one] || one}
                : ${rial(prices[one])}
                | ${assetNames[two] || two}
                : ${rial(prices[two])}
                | اختلاف: ${rial(difference)}`;
        }
    );
}


/* =========================
   محاسبه طلا
========================= */

const calculateGoldButton =
    document.getElementById(
        "calculateGold"
    );

if (calculateGoldButton) {

    calculateGoldButton.addEventListener(
        "click",
        () => {

            const weight =
                Number(
                    document.getElementById(
                        "goldWeight"
                    )?.value
                );

            const karat =
                Number(
                    document.getElementById(
                        "goldKarats"
                    )?.value
                );

            const result =
                document.getElementById(
                    "calculatorResult"
                );


            if (
                !weight ||
                weight <= 0 ||
                !result
            ) {

                if (result) {
                    result.textContent =
                        "وزن معتبر وارد کن";
                }

                return;
            }


            const key =
                karat === 24
                    ? "GOLD_24_RLS"
                    : "GOLD_18_RLS";


            if (
                !Number.isFinite(
                    prices[key]
                )
            ) {

                result.textContent =
                    "قیمت طلا موجود نیست";

                return;
            }


            result.textContent =
                rial(
                    weight *
                    prices[key]
                );
        }
    );
}


/* =========================
   تبدیل ارز
========================= */

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
                    )?.value
                );

            const type =
                document.getElementById(
                    "currencyType"
                )?.value;

            const result =
                document.getElementById(
                    "currencyResult"
                );


            if (
                !amount ||
                amount <= 0 ||
                !result
            ) {

                if (result) {
                    result.textContent =
                        "مقدار معتبر وارد کن";
                }

                return;
            }


            const rate =
                prices[type];


            if (!Number.isFinite(rate)) {

                result.textContent =
                    "قیمت ارز موجود نیست";

                return;
            }


            result.textContent =
                rial(
                    amount * rate
                );
        }
    );
}


/* =========================
   سناریوساز
========================= */

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
                    )?.value
                );

            const ounce =
                Number(
                    document.getElementById(
                        "scenarioOunce"
                    )?.value
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
                    "دلار و اونس معتبر وارد کن";

                return;
            }


            const calculated =
                (ounce / 31.1034768) *
                dollar *
                0.75;


            result.textContent =
                "قیمت فرضی طلای ۱۸: " +
                rial(calculated);
        }
    );
}


/* =========================
   هشدار
========================= */

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
                )?.value;

            const target =
                Number(
                    document.getElementById(
                        "alertPrice"
                    )?.value
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
                "alerts",
                JSON.stringify(alerts)
            );


            renderAlerts();
        }
    );
}


function renderAlerts() {

    const container =
        document.getElementById(
            "alertsList"
        );

    if (!container) return;

    container.innerHTML = "";


    alerts.forEach(
        (alert, index) => {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "result";


            item.innerHTML = `
                ${assetNames[alert.asset] || alert.asset}
                →
                ${rial(alert.target)}

                <button
                    onclick="removeAlert(${index})"
                >
                    حذف
                </button>
            `;

            container.appendChild(item);
        }
    );
}


window.removeAlert =
    function(index) {

        alerts.splice(
            index,
            1
        );

        localStorage.setItem(
            "alerts",
            JSON.stringify(alerts)
        );

        renderAlerts();
    };


function checkAlerts() {

    alerts.forEach(alert => {

        const current =
            prices[alert.asset];

        if (
            Number.isFinite(current) &&
            current >= alert.target
        ) {

            console.log(
                "PRICE ALERT:",
                assetNames[alert.asset]
            );
        }
    });
}


/* =========================
   نمودار
========================= */

const chartSelect =
    document.getElementById(
        "chartSelect"
    );


function updateChart() {

    if (!chartSelect) return;

    const key =
        elementMap[
            chartSelect.value
        ] ||
        chartSelect.value;


    const canvas =
        document.getElementById(
            "priceChart"
        );


    if (
        !canvas ||
        !Number.isFinite(
            prices[key]
        )
    ) {
        return;
    }


    if (chart) {
        chart.destroy();
    }


    chart =
        new Chart(
            canvas,
            {
                type: "line",

                data: {

                    labels: [
                        "اکنون"
                    ],

                    datasets: [
                        {
                            label:
                                assetNames[key] ||
                                key,

                            data: [
                                prices[key]
                            ]
                        }
                    ]
                },

                options: {

                    responsive: true,

                    maintainAspectRatio:
                        false
                }
            }
        );
}


if (chartSelect) {

    chartSelect.addEventListener(
        "change",
        updateChart
    );
}


/* =========================
   بروزرسانی دستی
========================= */

const mainRefresh =
    document.getElementById(
        "mainRefresh"
    );

if (mainRefresh) {

    mainRefresh.addEventListener(
        "click",
        async () => {

            mainRefresh.disabled =
                true;

            mainRefresh.textContent =
                "⏳ در حال بروزرسانی...";

            await updatePrices();

            mainRefresh.disabled =
                false;

            mainRefresh.textContent =
                "🔄 بروزرسانی قیمت‌ها";
        }
    );
}


/* =========================
   ساعت
========================= */

function updateClock() {

    const clock =
        document.getElementById(
            "clock"
        );

    if (!clock) return;

    clock.textContent =
        new Date()
            .toLocaleTimeString(
                "fa-IR"
            );
}

setInterval(
    updateClock,
    1000
);

updateClock();


/* =========================
   شمارش معکوس
========================= */

setInterval(
    () => {

        const element =
            document.getElementById(
                "countdown"
            );

        if (!element) return;

        countdown--;

        if (countdown <= 0) {

            countdown = 60;

            const auto =
                document.getElementById(
                    "autoUpdate"
                );

            if (
                !auto ||
                auto.checked
            ) {
                updatePrices();
            }
        }

        element.textContent =
            countdown;

    },
    1000
);


/* =========================
   تنظیمات
========================= */

const autoUpdate =
    document.getElementById(
        "autoUpdate"
    );

if (autoUpdate) {

    autoUpdate.addEventListener(
        "change",
        () => {
            countdown = 60;
        }
    );
}


const dashboardMode =
    document.getElementById(
        "dashboardMode"
    );

if (dashboardMode) {

    dashboardMode.addEventListener(
        "change",
        () => {

            document.body.classList.toggle(
                "dashboard-mode",
                dashboardMode.checked
            );
        }
    );
}


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


/* =========================
   داشبورد
========================= */

function updateDashboard(result) {

    const changes = [];

    result.forEach(item => {

        if (
            item &&
            item.code &&
            Number.isFinite(
                Number(item.change_pct)
            )
        ) {

            changes.push({
                code: item.code,

                name:
                    item.name ||
                    assetNames[item.code] ||
                    item.code,

                change:
                    Number(item.change_pct)
            });
        }
    });


    if (!changes.length) {
        return;
    }


    changes.sort(
        (a, b) =>
            b.change - a.change
    );


    const top =
        changes[0];

    const bottom =
        changes[changes.length - 1];


    const topGainer =
        document.getElementById(
            "topGainer"
        );

    const topGainerPercent =
        document.getElementById(
            "topGainerPercent"
        );

    const topLoser =
        document.getElementById(
            "topLoser"
        );

    const topLoserPercent =
        document.getElementById(
            "topLoserPercent"
        );


    if (topGainer) {
        topGainer.textContent =
            top.name;
    }

    if (topGainerPercent) {
        topGainerPercent.textContent =
            "+" +
            top.change.toFixed(2) +
            "%";
    }

    if (topLoser) {
        topLoser.textContent =
            bottom.name;
    }

    if (topLoserPercent) {
        topLoserPercent.textContent =
            bottom.change.toFixed(2) +
            "%";
    }


    const score =
        Math.max(
            0,
            Math.min(
                100,

                50 +
                changes.reduce(
                    (sum, item) =>
                        sum + item.change,
                    0
                ) /
                changes.length *
                10
            )
        );


    const marketScore =
        document.getElementById(
            "marketScore"
        );

    const marketMood =
        document.getElementById(
            "marketMood"
        );

    const scoreBar =
        document.getElementById(
            "scoreBar"
        );


    if (marketScore) {
        marketScore.textContent =
            Math.round(score);
    }

    if (scoreBar) {
        scoreBar.style.width =
            score + "%";
    }


    if (marketMood) {

        if (score >= 65) {

            marketMood.textContent =
                "📈 بازار صعودی";

        } else if (score <= 35) {

            marketMood.textContent =
                "📉 بازار نزولی";

        } else {

            marketMood.textContent =
                "⚖️ بازار متعادل";
        }
    }
}


/* =========================
   شروع
========================= */

renderAlerts();

updatePrices();
