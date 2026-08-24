let previousPrices =
    JSON.parse(
        localStorage.getItem("previousPrices") || "{}"
    );

let currentPrices = {};

let history =
    JSON.parse(
        localStorage.getItem("priceHistory") || "{}"
    );

let favorites =
    JSON.parse(
        localStorage.getItem("favorites") || "[]"
    );

let alerts =
    JSON.parse(
        localStorage.getItem("priceAlerts") || "[]"
    );

let chart = null;

let countdown = 60;

let autoTimer = null;


const assets = {

    gold18: [
        "طلای ۱۸ عیار",
        "GOLD_18_RLS"
    ],

    gold24: [
        "طلای ۲۴ عیار",
        "GOLD_24_RLS"
    ],

    mesghal: [
        "مثقال طلا",
        "GOLD_MESGHAL_RLS"
    ],

    coin: [
        "سکه امامی",
        "SEKKEH_RLS"
    ],

    bahar: [
        "بهار آزادی",
        "BAHAR_RLS"
    ],

    halfCoin: [
        "نیم‌سکه",
        "NIM_SEKKEH_RLS"
    ],

    quarterCoin: [
        "ربع‌سکه",
        "ROB_SEKKEH_RLS"
    ],

    gramCoin: [
        "سکه گرمی",
        "GERAMI_SEKKEH_RLS"
    ],

    dollar: [
        "دلار",
        "USD_RLS"
    ],

    euro: [
        "یورو",
        "EUR_RLS"
    ],

    pound: [
        "پوند",
        "GBP_RLS"
    ],

    dirham: [
        "درهم",
        "AED_RLS"
    ],

    lira: [
        "لیر",
        "TRY_RLS"
    ]

};


const $ = id =>
    document.getElementById(id);


function rial(value) {

    if (!Number.isFinite(value)) {

        return "--";

    }

    return (
        Math.round(value)
            .toLocaleString("fa-IR")
        + " ریال"
    );

}


function percent(value) {

    if (!Number.isFinite(value)) {

        return "--";

    }

    return (
        value >= 0
            ? "▲ "
            : "▼ "
    )
    +
    Math.abs(value).toFixed(2)
    +
    "٪";

}


function getPercent(value, old) {

    if (
        !Number.isFinite(value) ||
        !Number.isFinite(old) ||
        old === 0
    ) {

        return null;

    }

    return (
        (value - old) /
        old
    ) * 100;

}


function getAssetValue(key) {

    if (key === "silver999") {

        if (
            !Number.isFinite(
                currentPrices.SILVER_OUNCE_USD
            ) ||
            !Number.isFinite(
                currentPrices.USD_RLS
            )
        ) {

            return NaN;

        }

        return (
            currentPrices.SILVER_OUNCE_USD /
            31.1034768
        ) *
        currentPrices.USD_RLS;

    }


    if (key === "silver925") {

        return (
            getAssetValue("silver999")
            * 0.925
        );

    }


    if (key === "silverKg") {

        return (
            getAssetValue("silver999")
            * 1000
        );

    }


    if (!assets[key]) {

        return NaN;

    }


    return currentPrices[
        assets[key][1]
    ];

}


function allAssets() {

    return {

        ...assets,

        silver999: [
            "نقره ۹۹۹",
            "SILVER_999"
        ],

        silver925: [
            "نقره ۹۲۵",
            "SILVER_925"
        ],

        silverKg: [
            "نقره یک کیلو",
            "SILVER_KG"
        ]

    };

}


function setupSelectors() {

    const options =
        Object.entries(
            allAssets()
        )
        .map(
            ([key, value]) =>

                `<option value="${key}">
                    ${value[0]}
                </option>`

        )
        .join("");


    $("compareOne").innerHTML =
        options;

    $("compareTwo").innerHTML =
        options;

    $("alertAsset").innerHTML =
        options;

}


function renderCards() {

    const all =
        allAssets();


    Object.entries(all)
        .forEach(
            ([key]) => {

                const value =
                    getAssetValue(key);

                const old =
                    previousPrices[key];

                const change =
                    getPercent(
                        value,
                        old
                    );


                const idMap = {

                    gold18: "gold18",

                    gold24: "gold24",

                    mesghal: "mesghal",

                    coin: "coin",

                    bahar: "bahar",

                    halfCoin: "halfCoin",

                    quarterCoin:
                        "quarterCoin",

                    gramCoin:
                        "gramCoin",

                    dollar: "dollar",

                    euro: "euro",

                    pound: "pound",

                    dirham: "dirham",

                    lira: "lira",

                    silver999:
                        "silver999",

                    silver925:
                        "silver925",

                    silverKg:
                        "silverKg"

                };


                const element =
                    $(idMap[key]);


                if (!element) {

                    return;

                }


                element.textContent =
                    rial(value);


                const changeElement =
                    $(
                        idMap[key] +
                        "Change"
                    );


                if (changeElement) {

                    changeElement.textContent =
                        change === null
                            ? "--"
                            : percent(change);

                }

            }
        );

}


function saveHistory() {

    Object.keys(
        allAssets()
    )
    .forEach(
        key => {

            const value =
                getAssetValue(key);


            if (
                !Number.isFinite(value)
            ) {

                return;

            }


            if (!history[key]) {

                history[key] = [];

            }


            history[key].push(value);


            if (
                history[key].length > 60
            ) {

                history[key].shift();

            }

        }
    );


    localStorage.setItem(
        "priceHistory",
        JSON.stringify(history)
    );

}


function updateBubble() {

    const ounce =
        currentPrices.GOLD_OUNCE_USD;

    const dollar =
        currentPrices.USD_RLS;

    const gold =
        currentPrices.GOLD_18_RLS;


    if (
        !Number.isFinite(ounce) ||
        !Number.isFinite(dollar) ||
        !Number.isFinite(gold)
    ) {

        $("goldCalculated")
            .textContent = "--";

        $("goldBubble")
            .textContent = "--";

        $("goldBubblePercent")
            .textContent = "--";

        $("bubbleStatus")
            .textContent = "داده کافی نیست";

        return;

    }


    /*
        محاسبه تقریبی ارزش ذاتی طلای ۱۸ عیار:

        اونس ÷ 31.1034768
        × دلار
        × 0.75

        0.75 = نسبت طلای خالص
        در طلای ۱۸ عیار
    */

    const calculated =
        (
            ounce /
            31.1034768
        )
        *
        dollar
        *
        0.75;


    const bubble =
        gold -
        calculated;


    const bubblePercent =
        (
            bubble /
            calculated
        ) *
        100;


    $("goldCalculated")
        .textContent =
        rial(calculated);


    $("goldBubble")
        .textContent =
        rial(bubble);


    $("goldBubblePercent")
        .textContent =
        bubblePercent.toFixed(2)
        + "٪";


    if (bubblePercent > 5) {

        $("bubbleStatus")
            .textContent =
            "🔴 حباب بالا";

    }

    else if (bubblePercent > 2) {

        $("bubbleStatus")
            .textContent =
            "🟡 حباب متوسط";

    }

    else if (bubblePercent >= 0) {

        $("bubbleStatus")
            .textContent =
            "🟢 حباب کم";

    }

    else {

        $("bubbleStatus")
            .textContent =
            "🔵 زیر ارزش محاسباتی";

    }

}


function updateHeatmap() {

    const all =
        allAssets();


    const heatmap =
        $("heatmap");


    heatmap.innerHTML = "";


    Object.entries(all)
        .forEach(
            ([key, value]) => {

                const current =
                    getAssetValue(key);

                const old =
                    previousPrices[key];


                const change =
                    getPercent(
                        current,
                        old
                    );


                const box =
                    document.createElement(
                        "div"
                    );


                box.className =
                    "heat-item";


                if (
                    change > 0
                ) {

                    box.classList.add(
                        "up"
                    );

                }


                if (
                    change < 0
                ) {

                    box.classList.add(
                        "down"
                    );

                }


                box.innerHTML = `

                    <span>
                        ${value[0]}
                    </span>

                    <strong>
                        ${
                            change === null
                                ? "--"
                                : percent(change)
                        }
                    </strong>

                `;


                heatmap.appendChild(
                    box
                );

            }
        );

}


function updateDashboard() {

    const changes = [];


    Object.entries(
        allAssets()
    )
    .forEach(
        ([key, value]) => {

            const current =
                getAssetValue(key);

            const old =
                previousPrices[key];


            const change =
                getPercent(
                    current,
                    old
                );


            if (
                change !== null
            ) {

                changes.push({

                    key,

                    name:
                        value[0],

                    change

                });

            }

        }
    );


    if (!changes.length) {

        return;

    }


    const sorted =
        [...changes]
        .sort(
            (a, b) =>
                b.change -
                a.change
        );


    const best =
        sorted[0];


    const worst =
        sorted[
            sorted.length - 1
        ];


    $("topGainer")
        .textContent =
        best.name;


    $("topGainerPercent")
        .textContent =
        percent(best.change);


    $("topLoser")
        .textContent =
        worst.name;


    $("topLoserPercent")
        .textContent =
        percent(worst.change);


    const average =
        changes.reduce(
            (sum, item) =>
                sum + item.change,
            0
        )
        /
        changes.length;


    let score =
        50 +
        average * 8;


    score =
        Math.max(
            0,
            Math.min(
                100,
                score
            )
        );


    $("marketScore")
        .textContent =
        Math.round(score);


    $("scoreBar")
        .style.width =
        score + "%";


    if (score >= 60) {

        $("marketMood")
            .textContent =
            "🟢 بازار متمایل به رشد";

    }

    else if (score <= 40) {

        $("marketMood")
            .textContent =
            "🔴 بازار متمایل به افت";

    }

    else {

        $("marketMood")
            .textContent =
            "🟡 بازار متعادل";

    }

}


function updateFavorites() {

    const container =
        $("favorites");


    container.innerHTML = "";


    if (
        favorites.length === 0
    ) {

        container.innerHTML =
            `<div class="result">
                هنوز دارایی‌ای اضافه نکرده‌ای ⭐
            </div>`;

        return;

    }


    const all =
        allAssets();


    favorites.forEach(
        key => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "card";


            card.innerHTML = `

                <span>
                    ⭐ ${all[key][0]}
                </span>

                <h3>
                    ${rial(
                        getAssetValue(key)
                    )}
                </h3>

            `;


            container.appendChild(
                card
            );

        }
    );

}


function setupFavorites() {

    document
        .querySelectorAll(
            ".favorite"
        )
        .forEach(
            button => {

                button.onclick =
                    () => {

                        const key =
                            button.dataset.key;


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

                            button.textContent =
                                "☆";

                        }

                        else {

                            favorites.push(
                                key
                            );

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

                    };

            }
        );

}


function renderChart() {

    if (
        typeof Chart ===
        "undefined"
    ) {

        return;

    }


    const key =
        $("chartSelect").value;


    const data =
        history[key] || [];


    if (chart) {

        chart.destroy();

    }


    chart =
        new Chart(
            $("priceChart"),
            {

                type: "line",

                data: {

                    labels:
                        data.map(
                            (_, index) =>
                                index + 1
                        ),

                    datasets: [

                        {

                            label:
                                allAssets()[
                                    key
                                ]?.[0] ||
                                key,

                            data,

                            tension:
                                0.35,

                            borderWidth:
                                3,

                            pointRadius:
                                2

                        }

                    ]

                },

                options: {

                    responsive:
                        true,

                    maintainAspectRatio:
                        false,

                    plugins: {

                        legend: {
                            display:
                                true
                        }

                    }

                }

            }
        );

}


function ticker() {

    const items = [];


    Object.entries(
        allAssets()
    )
    .slice(0, 12)
    .forEach(
        ([key, value]) => {

            items.push(
                `${value[0]}: ${rial(
                    getAssetValue(key)
                )}`
            );

        }
    );


    $("tickerText")
        .textContent =
        items.join(
            "   •   "
        );

}


function compareAssets() {

    const first =
        $("compareOne").value;

    const second =
        $("compareTwo").value;


    const firstValue =
        getAssetValue(first);

    const secondValue =
        getAssetValue(second);


    if (
        !Number.isFinite(
            firstValue
        ) ||
        !Number.isFinite(
            secondValue
        )
    ) {

        $("comparisonResult")
            .textContent =
            "داده کافی نیست.";

        return;

    }


    const ratio =
        firstValue /
        secondValue;


    $("comparisonResult")
        .innerHTML = `

            ${allAssets()[first][0]}
            :
            <b>
                ${rial(firstValue)}
            </b>

            <br><br>

            ${allAssets()[second][0]}
            :
            <b>
                ${rial(secondValue)}
            </b>

            <br><br>

            نسبت:
            <b>
                ${ratio.toFixed(4)}
            </b>

        `;

}


function calculateGold() {

    const weight =
        Number(
            $("goldWeight").value
        );


    const karat =
        Number(
            $("goldKarats").value
        );


    const price =
        karat === 24
            ? currentPrices.GOLD_24_RLS
            : currentPrices.GOLD_18_RLS;


    if (
        !Number.isFinite(weight) ||
        !Number.isFinite(price)
    ) {

        $("calculatorResult")
            .textContent =
            "اطلاعات معتبر وارد کنید.";

        return;

    }


    $("calculatorResult")
        .innerHTML = `

            ارزش تقریبی:

            <b>
                ${rial(
                    weight * price
                )}
            </b>

        `;

}


function convertCurrency() {

    const amount =
        Number(
            $("currencyAmount").value
        );


    const type =
        $("currencyType").value;


    const price =
        currentPrices[type];


    if (
        !Number.isFinite(amount) ||
        !Number.isFinite(price)
    ) {

        $("currencyResult")
            .textContent =
            "اطلاعات معتبر وارد کنید.";

        return;

    }


    $("currencyResult")
        .innerHTML = `

            نتیجه:

            <b>
                ${rial(
                    amount * price
                )}
            </b>

        `;

}


function scenario() {

    const dollar =
        Number(
            $("scenarioDollar").value
        );


    const ounce =
        Number(
            $("scenarioOunce").value
        );


    if (
        !dollar ||
        !ounce
    ) {

        $("scenarioResult")
            .textContent =
            "مقادیر معتبر وارد کنید.";

        return;

    }


    const result =
        (
            ounce /
            31.1034768
        )
        *
        dollar
        *
        0.75;


    $("scenarioResult")
        .innerHTML = `

            قیمت تقریبی طلای ۱۸:

            <b>
                ${rial(result)}
            </b>

        `;

}


function updateAlerts() {

    const container =
        $("alertsList");


    container.innerHTML = "";


    if (
        alerts.length === 0
    ) {

        container.innerHTML =
            `<div class="result">
                هشداری ثبت نشده.
            </div>`;

        return;

    }


    alerts.forEach(
        (alertItem, index) => {

            const row =
                document.createElement(
                    "div"
                );


            row.className =
                "result";


            row.innerHTML = `

                🔔

                ${allAssets()[
                    alertItem.key
                ][0]}

                رسید به:

                ${rial(
                    alertItem.price
                )}

                <button
                    onclick="deleteAlert(${index})"
                >
                    حذف
                </button>

            `;


            container.appendChild(
                row
            );

        }
    );

}


function deleteAlert(index) {

    alerts.splice(
        index,
        1
    );


    localStorage.setItem(
        "priceAlerts",
        JSON.stringify(
            alerts
        )
    );


    updateAlerts();

}


function checkAlerts() {

    alerts =
        alerts.filter(
            item => {

                const value =
                    getAssetValue(
                        item.key
                    );


                if (
                    Number.isFinite(
                        value
                    ) &&
                    value >=
                    item.price
                ) {

                    alert(
                        "🔔 هشدار قیمت\n" +
                        allAssets()[
                            item.key
                        ][0] +
                        "\n" +
                        rial(value)
                    );


                    return false;

                }


                return true;

            }
        );


    localStorage.setItem(
        "priceAlerts",
        JSON.stringify(
            alerts
        )
    );


    updateAlerts();

}


async function updatePrices() {

    $("lastMessage")
        .textContent =
        "در حال دریافت قیمت‌ها...";


    try {

        const response =
            await fetch(
                "/api/prices?time=" +
                Date.now(),
                {

                    method:
                        "GET",

                    cache:
                        "no-store"

                }
            );


        if (
            !response.ok
        ) {

            throw new Error(
                response.status
            );

        }


        const prices =
            await response.json();


        if (
            !Array.isArray(
                prices
            )
        ) {

            throw new Error(
                "API format"
            );

        }


        currentPrices = {};


        prices.forEach(
            item => {

                if (
                    item &&
                    item.code != null
                ) {

                    currentPrices[
                        String(
                            item.code
                        )
                    ] =
                        Number(
                            item.value
                        );

                }

            }
        );


        saveHistory();


        renderCards();

        updateBubble();

        updateHeatmap();

        updateDashboard();

        updateFavorites();

        ticker();

        renderChart();

        checkAlerts();


        previousPrices =
            {};


        Object.keys(
            allAssets()
        )
        .forEach(
            key => {

                previousPrices[key] =
                    getAssetValue(key);

            }
        );


        localStorage.setItem(
            "previousPrices",
            JSON.stringify(
                previousPrices
            )
        );


        $("apiStatus")
            .textContent =
            "🟢 متصل";


        $("updateTime")
            .textContent =
            "آخرین بروزرسانی: " +
            new Date()
                .toLocaleTimeString(
                    "fa-IR"
                );


        $("lastMessage")
            .textContent =
            "قیمت‌ها بروزرسانی شدند ✅";


        countdown = 60;

    }

    catch (error) {

        console.error(
            error
        );


        $("apiStatus")
            .textContent =
            "🔴";


        $("lastMessage")
            .textContent =
            "خطا در دریافت قیمت‌ها ❌";

    }

}


function setupEvents() {

    $("mainRefresh")
        .onclick =
        updatePrices;


    $("chartSelect")
        .onchange =
        renderChart;


    $("compareButton")
        .onclick =
        compareAssets;


    $("calculateGold")
        .onclick =
        calculateGold;


    $("convertCurrency")
        .onclick =
        convertCurrency;


    $("scenarioButton")
        .onclick =
        scenario;


    $("search")
        .oninput =
        function () {

            const text =
                this.value
                    .trim()
                    .toLowerCase();


            document
                .querySelectorAll(
                    ".card"
                )
                .forEach(
                    card => {

                        const name =
                            card.dataset.name ||
                            card.innerText;


                        card.style.display =
                            name
                                .toLowerCase()
                                .includes(
                                    text
                                )
                                ? ""
                                : "none";

                    }
                );

        };


    $("themeButton")
        .onclick =
        function () {

            document.body
                .classList.toggle(
                    "light"
                );


            this.textContent =
                document.body
                    .classList.contains(
                        "light"
                    )
                    ? "🌙"
                    : "☀️";

        };


    $("fullscreenButton")
        .onclick =
        function () {

            if (
                document.documentElement
                    .requestFullscreen
            ) {

                document.documentElement
                    .requestFullscreen();

            }

        };


    $("setAlert")
        .onclick =
        function () {

            const key =
                $("alertAsset").value;


            const price =
                Number(
                    $("alertPrice").value
                );


            if (
                !Number.isFinite(
                    price
                ) ||
                price <= 0
            ) {

                return;

            }


            alerts.push({

                key,

                price

            });


            localStorage.setItem(
                "priceAlerts",
                JSON.stringify(
                    alerts
                )
            );


            updateAlerts();

        };

}


setupSelectors();

setupFavorites();

setupEvents();

updateAlerts();

updatePrices();


setInterval(
    () => {

        const clock =
            new Date()
                .toLocaleTimeString(
                    "fa-IR"
                );


        $("clock")
            .textContent =
            clock;

    },
    1000
);


setInterval(
    () => {

        countdown =
            Math.max(
                0,
                countdown - 1
            );


        $("countdown")
            .textContent =
            countdown;

    },
    1000
);


setInterval(
    () => {

        if (
            $("autoUpdate").checked
        ) {

            updatePrices();

        }

    },
    60000
);
