let previousPrices = {};
let currentPrices = {};
let priceHistory = {};

let favorites = JSON.parse(
    localStorage.getItem("favorites") || "[]"
);

let alerts = JSON.parse(
    localStorage.getItem("alerts") || "[]"
);

let countdownValue = 1800; // 30 دقیقه
let autoUpdateEnabled = true;
let isUpdating = false;

let chart = null;


/* =========================
   ابزار
========================= */

const $ = id =>
    document.getElementById(id);


function rial(value) {

    if (!Number.isFinite(value)) {
        return "داده موجود نیست";
    }

    return (
        Math.round(value)
            .toLocaleString("fa-IR")
        + " ریال"
    );
}


function usd(value) {

    if (!Number.isFinite(value)) {
        return "داده موجود نیست";
    }

    return (
        Number(value)
            .toLocaleString("en-US", {
                maximumFractionDigits: 4
            })
        + " USD"
    );
}


function percent(value) {

    if (!Number.isFinite(value)) {
        return "--";
    }

    return (
        value >= 0 ? "+" : ""
    )
    + value.toFixed(2)
    + "٪";
}


/* =========================
   دریافت قیمت
========================= */

async function updatePrices() {

    if (isUpdating) {
        return;
    }

    isUpdating = true;


    const message =
        $("lastMessage");

    const apiStatus =
        $("apiStatus");


    if (message) {
        message.textContent =
            "در حال دریافت قیمت‌ها...";
    }


    if (apiStatus) {
        apiStatus.textContent =
            "🟡";
    }


    try {

        const response =
            await fetch(
                "/api/prices",
                {
                    method: "GET",
                    cache: "no-store",
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            if (
                response.status === 429
            ) {

                throw new Error(
                    "RATE_LIMITED"
                );
            }


            throw new Error(
                "API_HTTP_" +
                response.status
            );
        }


        currentPrices =
            parsePrices(data);


        if (
            Object.keys(
                currentPrices
            ).length === 0
        ) {

            throw new Error(
                "NO_DATA"
            );
        }


        renderPrices(
            currentPrices
        );


        if (apiStatus) {
            apiStatus.textContent =
                "🟢";
        }


        if (message) {

            message.textContent =
                "آخرین بروزرسانی: " +
                new Date()
                    .toLocaleTimeString(
                        "fa-IR"
                    );
        }


        countdownValue =
            1800;


    } catch (error) {

        console.error(
            "PRICE ERROR:",
            error
        );


        if (apiStatus) {
            apiStatus.textContent =
                "🔴";
        }


        if (message) {

            if (
                error.message ===
                "RATE_LIMITED"
            ) {

                message.textContent =
                    "⏳ سرویس موقتاً محدود شده؛ بعداً دوباره تلاش می‌کنیم";

                // درخواست بعدی را 30 دقیقه عقب بینداز
                countdownValue =
                    1800;

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
   تبدیل پاسخ API
========================= */

function parsePrices(result) {

    const data = {};


    let array = [];


    if (Array.isArray(result)) {

        array = result;

    } else if (
        Array.isArray(result?.data)
    ) {

        array = result.data;

    } else if (
        Array.isArray(result?.assets)
    ) {

        array = result.assets;

    } else if (
        result?.data &&
        typeof result.data === "object"
    ) {

        array =
            Object.entries(
                result.data
            ).map(
                ([code, value]) => ({
                    code,
                    value
                })
            );

    } else if (
        result &&
        typeof result === "object"
    ) {

        array =
            Object.entries(result)
                .map(
                    ([code, value]) => ({
                        code,
                        value
                    })
                );
    }


    array.forEach(item => {

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


        const number =
            Number(value);


        if (
            code != null &&
            Number.isFinite(number)
        ) {

            data[String(code)] =
                number;
        }
    });


    return data;
}


/* =========================
   نمایش قیمت
========================= */

function showPrice(
    id,
    key,
    value,
    formatter
) {

    const element =
        $(id);


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
        previousPrices[key] !==
        undefined &&
        previousPrices[key] !== 0
    ) {

        change =
            (
                (value -
                    previousPrices[key]) /
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
                "▲ " +
                percent(change);

        } else if (change < 0) {

            changeElement.textContent =
                "▼ " +
                percent(change);

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
   رندر
========================= */

function renderPrices(data) {

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
}


/* =========================
   حباب
========================= */

function calculateBubble(data) {

    if (
        !Number.isFinite(
            data.GOLD_18_RLS
        ) ||
        !Number.isFinite(
            data.GOLD_OUNCE_USD
        ) ||
        !Number.isFinite(
            data.USD_RLS
        )
    ) {

        return;
    }


    const pureGold =
        (
            data.GOLD_OUNCE_USD /
            31.1034768
        ) *
        data.USD_RLS;


    const calculated18 =
        pureGold * 0.75;


    const bubble =
        data.GOLD_18_RLS -
        calculated18;


    const bubblePercent =
        (
            bubble /
            calculated18
        ) * 100;


    if ($("goldCalculated")) {

        $("goldCalculated")
            .textContent =
            rial(calculated18);
    }


    if ($("goldBubble")) {

        $("goldBubble")
            .textContent =
            rial(bubble);
    }


    if ($("goldBubblePercent")) {

        $("goldBubblePercent")
            .textContent =
            percent(bubblePercent);
    }


    if ($("bubbleStatus")) {

        if (bubblePercent > 5) {

            $("bubbleStatus")
                .textContent =
                "🔴 حباب بالا";

        } else if (
            bubblePercent > 2
        ) {

            $("bubbleStatus")
                .textContent =
                "🟠 حباب متوسط";

        } else if (
            bubblePercent < -2
        ) {

            $("bubbleStatus")
                .textContent =
                "🟢 زیر ارزش";

        } else {

            $("bubbleStatus")
                .textContent =
                "🟡 نزدیک ارزش ذاتی";
        }
    }
}


/* =========================
   ساعت
========================= */

function updateClock() {

    if ($("clock")) {

        $("clock").textContent =
            new Date()
                .toLocaleTimeString(
                    "fa-IR"
                );
    }
}


setInterval(
    updateClock,
    1000
);


/* =========================
   تایمر 30 دقیقه
========================= */

setInterval(
    () => {

        if (
            !autoUpdateEnabled
        ) {
            return;
        }


        countdownValue--;


        if (
            countdownValue <= 0
        ) {

            countdownValue =
                1800;

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
   دکمه بروزرسانی
========================= */

function setupRefresh() {

    const button =
        $("mainRefresh");


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            if (isUpdating) {
                return;
            }


            updatePrices();
        }
    );
}


/* =========================
   تم
========================= */

function setupTheme() {

    const button =
        $("themeButton");


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        () => {

            document.body
                .classList
                .toggle("light");
        }
    );
}


/* =========================
   تمام صفحه
========================= */

function setupFullscreen() {

    const button =
        $("fullscreenButton");


    if (!button) {
        return;
    }


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
   تنظیمات
========================= */

function setupSettings() {

    const auto =
        $("autoUpdate");


    if (auto) {

        autoUpdateEnabled =
            auto.checked;


        auto.addEventListener(
            "change",
            () => {

                autoUpdateEnabled =
                    auto.checked;
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
        setupRefresh();
        setupSettings();

        updateClock();

        updatePrices();
    }
);
