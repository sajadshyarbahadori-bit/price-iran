/* =========================================================
   بازار ایران PRO
   OANOR Gold API
========================================================= */

const API_URL = "/api/prices";

let prices = {};
let countdownValue = 60;
let countdownTimer = null;
let updateInProgress = false;


/* =========================================================
   ابزارهای عمومی
========================================================= */

function get(id) {
    return document.getElementById(id);
}

function setText(id, text) {
    const el = get(id);
    if (el) el.textContent = text;
}

function toNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
}

function formatRial(value) {
    const n = toNumber(value);

    if (n === null) return "داده موجود نیست";

    return (
        Math.round(n).toLocaleString("fa-IR") +
        " ریال"
    );
}

function formatToman(value) {
    const n = toNumber(value);

    if (n === null) return "داده موجود نیست";

    return (
        Math.round(n).toLocaleString("fa-IR") +
        " تومان"
    );
}

function formatUSD(value) {
    const n = toNumber(value);

    if (n === null) return "داده موجود نیست";

    return (
        n.toLocaleString("en-US", {
            maximumFractionDigits: 2
        }) +
        " دلار"
    );
}


/* =========================================================
   تبدیل داده API به ساختار داخلی
========================================================= */

function loadPrices(apiData) {

    prices = {};

    if (!Array.isArray(apiData)) {
        return;
    }

    apiData.forEach(item => {

        if (!item || !item.code) return;

        prices[item.code] = {
            name: item.name || "",
            value: toNumber(item.value),
            unit: item.unit || "",
            change: toNumber(item.change),
            change_pct: toNumber(item.change_pct),
            date: item.date || "",
            date_jalali: item.date_jalali || "",
            close_toman: toNumber(item.close_toman)
        };
    });
}


/* =========================================================
   نمایش قیمت
========================================================= */

function showPrice(id, symbol, formatter = formatRial) {

    const item = prices[symbol];

    if (!item || item.value === null) {
        setText(id, "داده موجود نیست");
        return;
    }

    setText(id, formatter(item.value));
}


/* =========================================================
   نمایش تغییرات
========================================================= */

function showChange(id, symbol) {

    const el = get(id);

    if (!el) return;

    const item = prices[symbol];

    if (
        !item ||
        item.change_pct === null
    ) {
        el.textContent = "داده موجود نیست";
        return;
    }

    const change = item.change_pct;

    if (change > 0) {

        el.textContent =
            `▲ +${change.toFixed(2)}٪`;

    } else if (change < 0) {

        el.textContent =
            `▼ ${change.toFixed(2)}٪`;

    } else {

        el.textContent =
            "— 0٪";
    }
}


/* =========================================================
   دریافت اطلاعات
========================================================= */

async function updatePrices() {

    if (updateInProgress) return;

    updateInProgress = true;

    setText(
        "lastMessage",
        "⏳ در حال دریافت قیمت‌ها..."
    );

    setText(
        "apiStatus",
        "🟡"
    );

    try {

        const response = await fetch(
            `${API_URL}?t=${Date.now()}`,
            {
                method: "GET",
                cache: "no-store"
            }
        );

        if (!response.ok) {

            if (response.status === 429) {
                throw new Error(
                    "محدودیت درخواست API"
                );
            }

            throw new Error(
                `API HTTP ${response.status}`
            );
        }


        const data =
            await response.json();


        if (
            !data.success ||
            !Array.isArray(data.prices)
        ) {

            console.error(
                "Invalid API response:",
                data
            );

            throw new Error(
                "ساختار پاسخ API نامعتبر است"
            );
        }


        loadPrices(data.prices);


        /* =================================================
           طلا
        ================================================= */

        showPrice(
            "gold18",
            "gram_18k"
        );

        showPrice(
            "gold24",
            "gram_24k"
        );

        showPrice(
            "mesghal",
            "mesghal"
        );


        showChange(
            "gold18Change",
            "gram_18k"
        );

        showChange(
            "gold24Change",
            "gram_24k"
        );


        /* =================================================
           سکه
        ================================================= */

        showPrice(
            "coin",
            "coin_emami"
        );

        showPrice(
            "bahar",
            "coin_bahar"
        );

        showPrice(
            "halfCoin",
            "half_coin"
        );

        showPrice(
            "quarterCoin",
            "quarter_coin"
        );

        showPrice(
            "gramCoin",
            "gerami_coin"
        );


        /* =================================================
           اونس جهانی
        ================================================= */

        showPrice(
            "goldOunce",
            "ounce",
            formatUSD
        );


        /* =================================================
           نقره
        ================================================= */

        setText(
            "silver999",
            "داده موجود نیست"
        );

        setText(
            "silver925",
            "داده موجود نیست"
        );

        setText(
            "silverKg",
            "داده موجود نیست"
        );

        setText(
            "silverOunce",
            "داده موجود نیست"
        );


        /* =================================================
           ارز
        ================================================= */

        setText(
            "dollar",
            "داده موجود نیست"
        );

        setText(
            "euro",
            "داده موجود نیست"
        );

        setText(
            "pound",
            "داده موجود نیست"
        );

        setText(
            "dirham",
            "داده موجود نیست"
        );

        setText(
            "lira",
            "داده موجود نیست"
        );


        /* =================================================
           حباب
        ================================================= */

        updateGoldBubble();


        /* =================================================
           داشبورد
        ================================================= */

        updateDashboard();


        /* =================================================
           Heatmap
        ================================================= */

        updateHeatmap();


        /* =================================================
           علاقه‌مندی‌ها
        ================================================= */

        renderFavorites();


        /* =================================================
           وضعیت
        ================================================= */

        setText(
            "apiStatus",
            "🟢"
        );

        setText(
            "lastMessage",
            "✅ قیمت‌ها بروزرسانی شدند"
        );


        setText(
            "updateTime",
            new Date().toLocaleTimeString(
                "fa-IR"
            )
        );


        countdownValue = 60;

        setText(
            "countdown",
            countdownValue
        );


    } catch (error) {

        console.error(
            "PRICE ERROR:",
            error
        );

        setText(
            "apiStatus",
            "🔴"
        );

        setText(
            "lastMessage",
            "❌ " + error.message
        );

    } finally {

        updateInProgress = false;
    }
}


/* =========================================================
   داشبورد
========================================================= */

function updateDashboard() {

    const assets = [
        ["gram_18k", "طلای ۱۸"],
        ["gram_24k", "طلای ۲۴"],
        ["mesghal", "مثقال"],
        ["coin_emami", "سکه امامی"],
        ["coin_bahar", "بهار آزادی"],
        ["half_coin", "نیم‌سکه"],
        ["quarter_coin", "ربع‌سکه"],
        ["gerami_coin", "سکه گرمی"]
    ];


    const valid = assets
        .map(([symbol, name]) => {

            const item = prices[symbol];

            if (
                !item ||
                item.change_pct === null
            ) {
                return null;
            }

            return {
                symbol,
                name,
                change: item.change_pct
            };

        })
        .filter(Boolean);


    if (!valid.length) {

        setText(
            "marketScore",
            "--"
        );

        setText(
            "marketMood",
            "در انتظار اطلاعات"
        );

        return;
    }


    const sorted = [...valid].sort(
        (a, b) =>
            b.change - a.change
    );


    const best = sorted[0];

    const worst =
        sorted[sorted.length - 1];


    setText(
        "topGainer",
        best.name
    );

    setText(
        "topGainerPercent",
        `▲ +${best.change.toFixed(2)}٪`
    );


    setText(
        "topLoser",
        worst.name
    );

    setText(
        "topLoserPercent",
        `${worst.change >= 0 ? "▲ +" : "▼ "}${worst.change.toFixed(2)}٪`
    );


    const average =
        valid.reduce(
            (sum, item) =>
                sum + item.change,
            0
        ) / valid.length;


    const score = Math.max(
        0,
        Math.min(
            100,
            50 + average * 8
        )
    );


    setText(
        "marketScore",
        Math.round(score)
    );


    const bar = get("scoreBar");

    if (bar) {
        bar.style.width =
            `${score}%`;
    }


    let mood = "⚪ بازار متعادل";

    if (average > 2) {
        mood = "🟢 بازار صعودی";
    } else if (average > 0.5) {
        mood = "🟢 تمایل صعودی";
    } else if (average < -2) {
        mood = "🔴 بازار نزولی";
    } else if (average < -0.5) {
        mood = "🔴 تمایل نزولی";
    }


    setText(
        "marketMood",
        mood
    );
}


/* =========================================================
   حباب طلا
========================================================= */

function updateGoldBubble() {

    const gold =
        prices["gram_18k"];

    const ounce =
        prices["ounce"];


    if (!gold || !ounce) {

        setText(
            "goldCalculated",
            "داده موجود نیست"
        );

        setText(
            "goldBubble",
            "داده موجود نیست"
        );

        setText(
            "goldBubblePercent",
            "داده کافی نیست"
        );

        setText(
            "bubbleStatus",
            "⏳ نیاز به نرخ دلار"
        );

        return;
    }


    /*
       برای محاسبه واقعی حباب،
       نرخ دلار باید از API ارز داشته باشیم.
    */

    setText(
        "goldCalculated",
        "منتظر نرخ دلار"
    );

    setText(
        "goldBubble",
        "منتظر نرخ دلار"
    );

    setText(
        "goldBubblePercent",
        "نیازمند نرخ دلار"
    );

    setText(
        "bubbleStatus",
        "⏳ در انتظار API ارز"
    );
}


/* =========================================================
   Heatmap
========================================================= */

function updateHeatmap() {

    const container =
        get("heatmap");

    if (!container) return;


    container.innerHTML = "";


    const assets = [
        ["gram_18k", "طلای ۱۸"],
        ["gram_24k", "طلای ۲۴"],
        ["mesghal", "مثقال"],
        ["coin_emami", "سکه امامی"],
        ["coin_bahar", "بهار آزادی"],
        ["half_coin", "نیم‌سکه"],
        ["quarter_coin", "ربع‌سکه"],
        ["gerami_coin", "سکه گرمی"],
        ["ounce", "اونس"]
    ];


    assets.forEach(
        ([symbol, name]) => {

            const item =
                prices[symbol];


            const box =
                document.createElement(
                    "div"
                );


            box.className =
                "heatmap-item";


            if (!item) {

                box.innerHTML = `
                    <strong>${name}</strong>
                    <span>داده موجود نیست</span>
                `;

            } else {

                const change =
                    item.change_pct ?? 0;


                box.innerHTML = `
                    <strong>${name}</strong>
                    <span>
                        ${
                            change >= 0
                                ? "▲ +"
                                : "▼ "
                        }${change.toFixed(2)}٪
                    </span>
                `;
            }


            container.appendChild(box);
        }
    );
}


/* =========================================================
   علاقه‌مندی‌ها
========================================================= */

function getFavorites() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "favorites"
            ) || "[]"
        );

    } catch {

        return [];
    }
}


function saveFavorites(list) {

    localStorage.setItem(
        "favorites",
        JSON.stringify(list)
    );
}


function setupFavorites() {

    document
        .querySelectorAll(".favorite")
        .forEach(button => {

            const key =
                button.dataset.key;


            const favorites =
                getFavorites();


            if (
                favorites.includes(key)
            ) {

                button.textContent =
                    "★";
            }


            button.addEventListener(
                "click",
                () => {

                    let list =
                        getFavorites();


                    if (
                        list.includes(key)
                    ) {

                        list =
                            list.filter(
                                x =>
                                    x !== key
                            );

                        button.textContent =
                            "☆";

                    } else {

                        list.push(key);

                        button.textContent =
                            "★";
                    }


                    saveFavorites(list);

                    renderFavorites();
                }
            );
        });
}


function renderFavorites() {

    const container =
        get("favorites");

    if (!container) return;


    const favorites =
        getFavorites();


    const map = {

        gold18: [
            "gram_18k",
            "طلای ۱۸ عیار"
        ],

        gold24: [
            "gram_24k",
            "طلای ۲۴ عیار"
        ],

        mesghal: [
            "mesghal",
            "مثقال طلا"
        ]
    };


    container.innerHTML = "";


    favorites.forEach(key => {

        const data =
            map[key];

        if (!data) return;


        const symbol =
            data[0];

        const name =
            data[1];


        const item =
            prices[symbol];


        const card =
            document.createElement(
                "div"
            );


        card.className =
            "card";


        card.innerHTML = `
            <span>${name}</span>
            <h3>
                ${
                    item
                        ? formatRial(
                            item.value
                        )
                        : "داده موجود نیست"
                }
            </h3>
        `;


        container.appendChild(card);
    });
}


/* =========================================================
   جستجو
========================================================= */

function setupSearch() {

    const input =
        get("search");

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
                    ".card[data-name]"
                )
                .forEach(card => {

                    const name =
                        (
                            card.dataset.name ||
                            ""
                        )
                        .toLowerCase();


                    card.style.display =
                        !query ||
                        name.includes(query)
                            ? ""
                            : "none";
                });
        }
    );
}


/* =========================================================
   محاسبه‌گر طلا
========================================================= */

function setupGoldCalculator() {

    const button =
        get("calculateGold");

    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            const weight =
                Number(
                    get("goldWeight")?.value
                );


            const karat =
                get("goldKarats")?.value;


            if (
                !Number.isFinite(weight) ||
                weight <= 0
            ) {

                setText(
                    "calculatorResult",
                    "❌ وزن را وارد کن"
                );

                return;
            }


            const symbol =
                karat === "24"
                    ? "gram_24k"
                    : "gram_18k";


            const item =
                prices[symbol];


            if (!item) {

                setText(
                    "calculatorResult",
                    "⏳ قیمت طلا هنوز دریافت نشده"
                );

                return;
            }


            const total =
                weight *
                item.value;


            setText(
                "calculatorResult",
                formatRial(total)
            );
        }
    );
}


/* =========================================================
   تبدیل ارز
========================================================= */

function setupCurrencyConverter() {

    const button =
        get("convertCurrency");

    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            setText(
                "currencyResult",
                "⚠️ API فعلی نرخ ارز ارائه نمی‌کند"
            );
        }
    );
}


/* =========================================================
   سناریوساز
========================================================= */

function setupScenario() {

    const button =
        get("scenarioButton");

    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            const dollar =
                Number(
                    get("scenarioDollar")?.value
                );

            const ounce =
                Number(
                    get("scenarioOunce")?.value
                );


            if (
                !Number.isFinite(dollar) ||
                !Number.isFinite(ounce) ||
                dollar <= 0 ||
                ounce <= 0
            ) {

                setText(
                    "scenarioResult",
                    "❌ دلار و اونس فرضی را وارد کن"
                );

                return;
            }


            /*
               فرمول تقریبی قیمت هر گرم
               طلای ۱۸ عیار
            */

            const result =
                (
                    ounce *
                    dollar /
                    31.1034768
                ) *
                0.75;


            setText(
                "scenarioResult",
                `قیمت تقریبی هر گرم طلای ۱۸:
                 ${formatRial(result)}`
            );
        }
    );
}


/* =========================================================
   هشدار قیمت
========================================================= */

let alerts = [];


function loadAlerts() {

    try {

        alerts =
            JSON.parse(
                localStorage.getItem(
                    "priceAlerts"
                ) || "[]"
            );

    } catch {

        alerts = [];
    }
}


function saveAlerts() {

    localStorage.setItem(
        "priceAlerts",
        JSON.stringify(alerts)
    );
}


function setupAlerts() {

    const button =
        get("setAlert");

    if (!button) return;


    loadAlerts();

    renderAlerts();


    button.addEventListener(
        "click",
        () => {

            const asset =
                get("alertAsset")?.value;


            const price =
                Number(
                    get("alertPrice")?.value
                );


            if (
                !asset ||
                !Number.isFinite(price) ||
                price <= 0
            ) {

                return;
            }


            alerts.push({
                asset,
                price,
                createdAt:
                    Date.now()
            });


            saveAlerts();

            renderAlerts();
        }
    );
}


function renderAlerts() {

    const container =
        get("alertsList");

    if (!container) return;


    container.innerHTML = "";


    alerts.forEach(
        (alert, index) => {

            const item =
                document.createElement(
                    "div"
                );


            item.className =
                "alert-item";


            item.innerHTML = `
                <span>
                    ${alert.asset}
                    →
                    ${formatRial(alert.price)}
                </span>

                <button
                    data-alert="${index}">
                    حذف
                </button>
            `;


            container.appendChild(item);
        }
    );


    container
        .querySelectorAll(
            "[data-alert]"
        )
        .forEach(button => {

            button.addEventListener(
                "click",
                () => {

                    const index =
                        Number(
                            button.dataset.alert
                        );


                    alerts.splice(
                        index,
                        1
                    );


                    saveAlerts();

                    renderAlerts();
                }
            );
        });
}


/* =========================================================
   پر کردن لیست هشدار
========================================================= */

function setupAssetSelects() {

    const select =
        get("alertAsset");

    const compareOne =
        get("compareOne");

    const compareTwo =
        get("compareTwo");


    const assets = [

        ["gram_18k", "طلای ۱۸ عیار"],

        ["gram_24k", "طلای ۲۴ عیار"],

        ["mesghal", "مثقال"],

        ["coin_emami", "سکه امامی"],

        ["coin_bahar", "بهار آزادی"],

        ["half_coin", "نیم‌سکه"],

        ["quarter_coin", "ربع‌سکه"],

        ["gerami_coin", "سکه گرمی"]

    ];


    if (select) {

        select.innerHTML =
            `<option value="">
                انتخاب دارایی
            </option>`;

        assets.forEach(
            ([value, text]) => {

                select.innerHTML += `
                    <option value="${value}">
                        ${text}
                    </option>
                `;
            }
        );
    }


    [compareOne, compareTwo]
        .forEach(element => {

            if (!element) return;

            element.innerHTML =
                `<option value="">
                    انتخاب دارایی
                </option>`;


            assets.forEach(
                ([value, text]) => {

                    element.innerHTML += `
                        <option value="${value}">
                            ${text}
                        </option>
                    `;
                }
            );
        });
}


/* =========================================================
   مقایسه
========================================================= */

function setupComparison() {

    const button =
        get("compareButton");

    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            const one =
                get("compareOne")?.value;

            const two =
                get("compareTwo")?.value;


            if (!one || !two) {

                setText(
                    "comparisonResult",
                    "❌ دو دارایی را انتخاب کن"
                );

                return;
            }


            const a =
                prices[one];

            const b =
                prices[two];


            if (!a || !b) {

                setText(
                    "comparisonResult",
                    "⏳ اطلاعات کافی نیست"
                );

                return;
            }


            const difference =
                a.value -
                b.value;


            setText(
                "comparisonResult",
                `اختلاف قیمت:
                 ${formatRial(
                     Math.abs(difference)
                 )}`
            );
        }
    );
}


/* =========================================================
   ساعت
========================================================= */

function updateClock() {

    const clock =
        get("clock");

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


/* =========================================================
   شمارنده
========================================================= */

function startCountdown() {

    if (countdownTimer) {

        clearInterval(
            countdownTimer
        );
    }


    countdownTimer =
        setInterval(
            () => {

                const auto =
                    get("autoUpdate");


                if (
                    auto &&
                    !auto.checked
                ) {
                    return;
                }


                countdownValue--;


                setText(
                    "countdown",
                    countdownValue
                );


                if (
                    countdownValue <= 0
                ) {

                    countdownValue = 60;

                    updatePrices();
                }

            },
            1000
        );
}


/* =========================================================
   دکمه بروزرسانی
========================================================= */

function setupRefresh() {

    const button =
        get("mainRefresh");

    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            countdownValue = 60;

            updatePrices();
        }
    );
}


/* =========================================================
   تم
========================================================= */

function setupTheme() {

    const button =
        get("themeButton");

    if (!button) return;


    button.addEventListener(
        "click",
        () => {

            document.body.classList.toggle(
                "dark"
            );

            button.textContent =
                document.body.classList.contains(
                    "dark"
                )
                    ? "🌙"
                    : "☀️";
        }
    );
}


/* =========================================================
   تمام صفحه
========================================================= */

function setupFullscreen() {

    const button =
        get("fullscreenButton");

    if (!button) return;


    button.addEventListener(
        "click",
        async () => {

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
        }
    );
}


/* =========================================================
   حذف کوچک‌نمایی
=========================================================

   minimizeButton عمداً استفاده نمی‌شود.
*/


/* =========================================================
   شروع
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        setupFavorites();

        setupSearch();

        setupGoldCalculator();

        setupCurrencyConverter();

        setupScenario();

        setupAlerts();

        setupAssetSelects();

        setupComparison();

        setupRefresh();

        setupTheme();

        setupFullscreen();

        updateClock();

        startCountdown();

        updatePrices();
    }
);
