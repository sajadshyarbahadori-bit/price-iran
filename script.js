let previousPrices = {};
let currentPrices = {};
let priceHistory = {};

let favorites = JSON.parse(
    localStorage.getItem("favorites") || "[]"
);

let alerts = JSON.parse(
    localStorage.getItem("alerts") || "[]"
);

let countdownValue = 60;
let autoUpdateEnabled = true;
let isUpdating = false;

let chart = null;


/* =========================
   ابزارها
========================= */

const $ = id => document.getElementById(id);

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

function percent(value) {
    if (!Number.isFinite(value)) {
        return "--";
    }

    return (value >= 0 ? "+" : "") +
        value.toFixed(2) +
        "٪";
}


/* =========================
   دریافت قیمت‌ها
========================= */

async function updatePrices() {

    // جلوگیری از چند درخواست همزمان
    if (isUpdating) {
        return;
    }

    isUpdating = true;

    const message = $("lastMessage");
    const apiStatus = $("apiStatus");

    if (message) {
        message.textContent =
            "در حال دریافت قیمت‌ها...";
    }

    if (apiStatus) {
        apiStatus.textContent = "🟡";
    }

    try {

        const response = await fetch(
            "/api/prices?t=" + Date.now(),
            {
                method: "GET",
                cache: "no-store",
                headers: {
                    "Accept": "application/json"
                }
            }
        );

        let result = null;

        try {
            result = await response.json();
        } catch {
            result = null;
        }


        /* خطای API */

        if (!response.ok) {

            if (response.status === 429) {

                throw new Error(
                    "API_LIMIT"
                );
            }

            if (response.status === 401) {

                throw new Error(
                    "API_UNAUTHORIZED"
                );
            }

            if (response.status === 403) {

                throw new Error(
                    "API_FORBIDDEN"
                );
            }

            throw new Error(
                "API_HTTP_" + response.status
            );
        }


        console.log(
            "SERVIX DATA:",
            result
        );


        /* =========================
           تبدیل پاسخ API
        ========================= */

        let pricesArray = [];

        if (Array.isArray(result)) {

            pricesArray = result;

        } else if (Array.isArray(result?.data)) {

            pricesArray = result.data;

        } else if (Array.isArray(result?.assets)) {

            pricesArray = result.assets;

        } else if (
            result?.data &&
            typeof result.data === "object"
        ) {

            pricesArray =
                Object.entries(result.data)
                    .map(([code, value]) => ({
                        code,
                        value
                    }));

        } else if (
            result &&
            typeof result === "object"
        ) {

            pricesArray =
                Object.entries(result)
                    .filter(([key, value]) =>
                        typeof value === "number" ||
                        !isNaN(Number(value))
                    )
                    .map(([code, value]) => ({
                        code,
                        value
                    }));
        }


        const data = {};


        pricesArray.forEach(item => {

            if (!item) {
                return;
            }

            const code =
                item.code ??
                item.symbol ??
                item.name;

            const value =
                item.value ??
                item.price ??
                item.last;

            if (
                code != null &&
                value != null
            ) {

                const number =
                    Number(value);

                if (Number.isFinite(number)) {

                    data[String(code)] =
                        number;
                }
            }
        });


        if (
            Object.keys(data).length === 0
        ) {

            throw new Error(
                "NO_PRICE_DATA"
            );
        }


        currentPrices = data;


        /* نمایش قیمت‌ها */

        renderPrices(data);


        if (apiStatus) {
            apiStatus.textContent = "🟢";
        }

        if (message) {

            message.textContent =
                "آخرین بروزرسانی: " +
                new Date()
                    .toLocaleTimeString("fa-IR");
        }


        countdownValue = 60;


    } catch (error) {

        console.error(
            "PRICE ERROR:",
            error
        );


        if (apiStatus) {
            apiStatus.textContent = "🔴";
        }


        if (message) {

            if (error.message === "API_LIMIT") {

                message.textContent =
                    "⏳ محدودیت درخواست API؛ کمی بعد دوباره تلاش کنید";

            } else if (
                error.message ===
                "API_UNAUTHORIZED"
            ) {

                message.textContent =
                    "🔑 کلید API معتبر نیست";

            } else if (
                error.message ===
                "API_FORBIDDEN"
            ) {

                message.textContent =
                    "🚫 دسترسی API مجاز نیست";

            } else if (
                error.message ===
                "NO_PRICE_DATA"
            ) {

                message.textContent =
                    "⚠️ API پاسخ داد ولی قیمت‌ها پیدا نشد";

            } else {

                message.textContent =
                    "❌ خطا در دریافت قیمت‌ها";
            }
        }

    } finally {

        isUpdating = false;
    }
}


/* =========================
   نمایش قیمت‌ها
========================= */

function showPrice(
    id,
    key,
    value,
    formatter
) {

    const element = $(id);

    if (!element) {
        return;
    }


    if (!Number.isFinite(value)) {

        element.textContent =
            "داده موجود نیست";

        return;
    }


    let change = 0;


    if (
        previousPrices[key] !== undefined &&
        previousPrices[key] !== 0
    ) {

        change =
            (
                (value - previousPrices[key]) /
                previousPrices[key]
            ) * 100;
    }


    element.textContent =
        formatter(value);


    const changeElement =
        $(id + "Change");


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


    previousPrices[key] =
        value;


    if (!priceHistory[key]) {

        priceHistory[key] = [];
    }


    priceHistory[key].push(value);


    if (
        priceHistory[key].length > 30
    ) {

        priceHistory[key].shift();
    }
}


/* =========================
   رندر قیمت‌ها
========================= */

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


    /* بازار جهانی */

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
    ) {
        return;
    }


    const pureGoldPerGram =
        (
            ounce /
            31.1034768
        ) *
        dollar;


    const calculated18 =
        pureGoldPerGram * 0.75;


    const bubble =
        gold - calculated18;


    const bubblePercent =
        (
            bubble /
            calculated18
        ) * 100;


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
   داشبورد
========================= */

function updateMarketDashboard() {

    if (!$("marketScore")) {
        return;
    }

    const assets = [];

    const list = [
        ["طلای ۱۸", "GOLD_18_RLS"],
        ["دلار", "USD_RLS"],
        ["یورو", "EUR_RLS"],
        ["سکه امامی", "SEKKEH_RLS"],
        ["نقره", "SILVER_999"]
    ];


    list.forEach(([name, key]) => {

        const current =
            currentPrices[key];

        const old =
            previousPrices[key];


        if (
            Number.isFinite(current) &&
            Number.isFinite(old) &&
            old !== 0
        ) {

            assets.push({
                name,
                change:
                    ((current - old) /
                        old) * 100
            });
        }
    });


    if (!assets.length) {
        return;
    }


    assets.sort(
        (a, b) =>
            b.change - a.change
    );


    const gain =
        assets[0];

    const lose =
        assets[assets.length - 1];


    if ($("topGainer")) {

        $("topGainer").textContent =
            gain.name;
    }


    if ($("topGainerPercent")) {

        $("topGainerPercent").textContent =
            percent(gain.change);
    }


    if ($("topLoser")) {

        $("topLoser").textContent =
            lose.name;
    }


    if ($("topLoserPercent")) {

        $("topLoserPercent").textContent =
            percent(lose.change);
    }


    const average =
        assets.reduce(
            (sum, item) =>
                sum + item.change,
            0
        ) / assets.length;


    const score =
        Math.max(
            0,
            Math.min(
                100,
                50 + average * 10
            )
        );


    $("marketScore").textContent =
        score.toFixed(0);


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


    search.addEventListener(
        "input",
        () => {

            const value =
                search.value
                    .trim()
                    .toLowerCase();


            document
                .querySelectorAll(
                    ".card[data-name]"
                )
                .forEach(card => {

                    const name =
                        card.dataset.name
                            .toLowerCase();


                    card.style.display =
                        !value ||
                        name.includes(value)
                            ? ""
                            : "none";
                });
        }
    );
}


/* =========================
   تم
========================= */

function setupTheme() {

    const button =
        $("themeButton");

    if (!button) return;


    const saved =
        localStorage.getItem(
            "theme"
        );


    if (saved === "light") {

        document.body
            .classList
            .add("light");

        button.textContent =
            "🌙";
    }


    button.addEventListener(
        "click",
        () => {

            document.body
                .classList
                .toggle("light");


            const light =
                document.body
                    .classList
                    .contains("light");


            localStorage.setItem(
                "theme",
                light
                    ? "light"
                    : "dark"
            );


            button.textContent =
                light
                    ? "🌙"
                    : "☀️";
        }
    );
}


/* =========================
   تمام صفحه
========================= */

function setupFullscreen() {

    const button =
        $("fullscreenButton");

    if (!button) return;


    button.addEventListener(
        "click",
        async () => {

            try {

                if (
                    !document.fullscreenElement
                ) {

                    await document
                        .documentElement
                        .requestFullscreen();

                } else {

                    await document
                        .exitFullscreen();
                }

            } catch (error) {

                console.error(error);
            }
        }
    );
}


/* =========================
   علاقه‌مندی
========================= */

function setupFavorites() {

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
                () => {

                    if (
                        favorites.includes(
                            key
                        )
                    ) {

                        favorites =
                            favorites.filter(
                                x => x !== key
                            );

                        button.textContent =
                            "☆";

                    } else {

                        favorites.push(key);

                        button.textContent =
                            "★";
                    }


                    localStorage.setItem(
                        "favorites",
                        JSON.stringify(
                            favorites
                        )
                    );


                    updateFavorites();
                }
            );
        });
}


function updateFavorites() {

    const box =
        $("favorites");

    if (!box) return;


    box.innerHTML = "";


    const map = {

        gold18:
            ["طلای ۱۸", "gold18"],

        gold24:
            ["طلای ۲۴", "gold24"],

        mesghal:
            ["مثقال", "mesghal"]
    };


    favorites.forEach(key => {

        if (!map[key]) return;


        const [
            name,
            id
        ] = map[key];


        const div =
            document.createElement(
                "div"
            );


        div.className =
            "card";


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

    const box =
        $("heatmap");

    if (!box) return;


    const items = [
        ["طلا", "GOLD_18_RLS"],
        ["دلار", "USD_RLS"],
        ["یورو", "EUR_RLS"],
        ["سکه", "SEKKEH_RLS"],
        ["نقره", "SILVER_999"]
    ];


    box.innerHTML = "";


    items.forEach(
        ([name, key]) => {

            const current =
                currentPrices[key];

            const old =
                previousPrices[key];


            let change = 0;


            if (
                Number.isFinite(current) &&
                Number.isFinite(old) &&
                old !== 0
            ) {

                change =
                    ((current - old) /
                        old) * 100;
            }


            const div =
                document.createElement(
                    "div"
                );


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
        }
    );
}


/* =========================
   مقایسه
========================= */

const comparisonAssets = {

    gold18:
        ["طلای ۱۸", "GOLD_18_RLS"],

    dollar:
        ["دلار", "USD_RLS"],

    euro:
        ["یورو", "EUR_RLS"],

    coin:
        ["سکه امامی", "SEKKEH_RLS"],

    silver999:
        ["نقره", "SILVER_999"]
};


function updateComparisonOptions() {

    const one =
        $("compareOne");

    const two =
        $("compareTwo");


    if (!one || !two) return;


    if (one.options.length) {
        return;
    }


    Object.entries(
        comparisonAssets
    ).forEach(
        ([key, value]) => {

            one.add(
                new Option(
                    value[0],
                    key
                )
            );

            two.add(
                new Option(
                    value[0],
                    key
                )
            );
        }
    );


    if (two.options.length > 1) {

        two.selectedIndex = 1;
    }
}


function setupComparison() {

    const button =
        $("compareButton");

    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            const a =
                comparisonAssets[
                    $("compareOne").value
                ];

            const b =
                comparisonAssets[
                    $("compareTwo").value
                ];


            if (!a || !b) return;


            const priceA =
                currentPrices[a[1]];

            const priceB =
                currentPrices[b[1]];


            if (
                !Number.isFinite(priceA) ||
                !Number.isFinite(priceB)
            ) {

                $("comparisonResult")
                    .textContent =
                    "قیمت کافی نیست";

                return;
            }


            const difference =
                (
                    (priceA - priceB) /
                    priceB
                ) * 100;


            $("comparisonResult")
                .textContent =
                `${a[0]} نسبت به ${b[0]} حدود ${percent(difference)} اختلاف دارد.`;
        }
    );
}


/* =========================
   محاسبه‌گر طلا
========================= */

function setupCalculator() {

    const button =
        $("calculateGold");

    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            const weight =
                Number(
                    $("goldWeight").value
                );

            const karat =
                Number(
                    $("goldKarats").value
                );


            const price =
                karat === 18
                    ? currentPrices.GOLD_18_RLS
                    : currentPrices.GOLD_24_RLS;


            if (
                !weight ||
                !Number.isFinite(price)
            ) {

                $("calculatorResult")
                    .textContent =
                    "وزن یا قیمت معتبر نیست";

                return;
            }


            $("calculatorResult")
                .textContent =
                rial(weight * price);
        }
    );
}


/* =========================
   تبدیل ارز
========================= */

function setupCurrency() {

    const button =
        $("convertCurrency");

    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            const amount =
                Number(
                    $("currencyAmount").value
                );


            const type =
                $("currencyType").value;


            const price =
                currentPrices[type];


            if (
                !amount ||
                !Number.isFinite(price)
            ) {

                $("currencyResult")
                    .textContent =
                    "اطلاعات کافی نیست";

                return;
            }


            $("currencyResult")
                .textContent =
                rial(amount * price);
        }
    );
}


/* =========================
   سناریو
========================= */

function setupScenario() {

    const button =
        $("scenarioButton");

    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            const dollar =
                Number(
                    $("scenarioDollar").value
                );

            const ounce =
                Number(
                    $("scenarioOunce").value
                );


            if (!dollar || !ounce) {

                $("scenarioResult")
                    .textContent =
                    "دلار و اونس را وارد کن";

                return;
            }


            const calculated =
                (
                    ounce /
                    31.1034768
                ) *
                dollar *
                0.75;


            $("scenarioResult")
                .textContent =
                "قیمت فرضی طلای ۱۸: " +
                rial(calculated);
        }
    );
}


/* =========================
   هشدار
========================= */

function setupAlerts() {

    const button =
        $("setAlert");

    const select =
        $("alertAsset");


    if (!button || !select) {
        return;
    }


    Object.entries(
        comparisonAssets
    ).forEach(
        ([key, value]) => {

            select.add(
                new Option(
                    value[0],
                    value[1]
                )
            );
        }
    );


    button.addEventListener(
        "click",
        () => {

            const key =
                select.value;

            const target =
                Number(
                    $("alertPrice").value
                );


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
        }
    );
}


function updateAlerts() {

    const box =
        $("alertsList");

    if (!box) return;


    box.innerHTML = "";


    alerts.forEach(
        (alert, index) => {

            const current =
                currentPrices[
                    alert.key
                ];


            const div =
                document.createElement(
                    "div"
                );


            div.className =
                "alert-item";


            div.innerHTML = `
                🔔 ${alert.key}
                | هدف: ${rial(alert.target)}
                | فعلی: ${rial(current)}
                <button data-index="${index}">
                    حذف
                </button>
            `;


            box.appendChild(div);
        }
    );


    box.querySelectorAll(
        "button"
    ).forEach(button => {

        button.addEventListener(
            "click",
            () => {

                alerts.splice(
                    Number(
                        button.dataset.index
                    ),
                    1
                );


                localStorage.setItem(
                    "alerts",
                    JSON.stringify(
                        alerts
                    )
                );


                updateAlerts();
            }
        );
    });
}


/* =========================
   نمودار
========================= */

function updateChart() {

    const canvas =
        $("priceChart");

    if (
        !canvas ||
        typeof Chart === "undefined"
    ) {
        return;
    }


    const keyMap = {

        gold18:
            "GOLD_18_RLS",

        dollar:
            "USD_RLS",

        coin:
            "SEKKEH_RLS",

        silver999:
            "SILVER_999"
    };


    const select =
        $("chartSelect");

    if (!select) return;


    const key =
        keyMap[select.value];


    if (!key) return;


    const history =
        priceHistory[key] || [];


    if (!history.length) return;


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
                        (_, i) =>
                            i + 1
                    ),

                datasets: [{
                    label: "قیمت",

                    data: history,

                    tension: 0.35
                }]
            },

            options: {
                responsive: true
            }
        }
    );
}


/* =========================
   ساعت
========================= */

function updateClock() {

    const clock =
        $("clock");

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


/* =========================
   شمارش معکوس
========================= */

setInterval(
    () => {

        if (!autoUpdateEnabled) {
            return;
        }


        countdownValue--;


        if (
            countdownValue <= 0
        ) {

            countdownValue = 60;

            updatePrices();
        }


        if ($("countdown")) {

            $("countdown")
                .textContent =
                countdownValue;
        }

    },
    1000
);


/* =========================
   بروزرسانی دستی
========================= */

function setupRefresh() {

    const button =
        $("mainRefresh");

    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            countdownValue = 60;

            updatePrices();
        }
    );
}


/* =========================
   تنظیمات
========================= */

function setupSettings() {

    const auto =
        $("autoUpdate");


    if (auto) {

        auto.addEventListener(
            "change",
            () => {

                autoUpdateEnabled =
                    auto.checked;
            }
        );
    }


    const animation =
        $("priceAnimation");


    if (animation) {

        animation.addEventListener(
            "change",
            () => {

                document.body
                    .classList
                    .toggle(
                        "no-animation",
                        !animation.checked
                    );
            }
        );
    }


    const dashboard =
        $("dashboardMode");


    if (dashboard) {

        dashboard.addEventListener(
            "change",
            () => {

                document.body
                    .classList
                    .toggle(
                        "dashboard-mode",
                        dashboard.checked
                    );
            }
        );
    }
}


/* =========================
   شروع
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

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
    }
);
