const FIAT_URL =
    "https://raw.githubusercontent.com/HosseinOdd/Navasan-API/main/data/fiat.json";

const GOLD_URL =
    "https://raw.githubusercontent.com/HosseinOdd/Navasan-API/main/data/gold.json";

function setPrice(id, value) {
    const el = document.getElementById(id);

    if (!el) return;

    if (value === undefined || value === null || value === "") {
        el.textContent = "ناموجود";
        return;
    }

    el.textContent = Number(value).toLocaleString("fa-IR") + " ریال";
}

async function updatePrices() {

    const time = document.getElementById("updateTime");

    if (time) {
        time.textContent = "🔄 در حال دریافت قیمت‌ها...";
    }

    try {

        const [fiatResponse, goldResponse] = await Promise.all([
            fetch(FIAT_URL),
            fetch(GOLD_URL)
        ]);

        const fiat = await fiatResponse.json();
        const gold = await goldResponse.json();

        console.log("FIAT:", fiat);
        console.log("GOLD:", gold);

        // طلا
        setPrice("gold18", gold["18ayar"]?.value);
        setPrice("gold24", gold["24ayar"]?.value);
        setPrice("mesghal", gold["mesghal"]?.value);
        setPrice("abshodeh", gold["abshodeh"]?.value);
        setPrice("secondGold", gold["gold_18"]?.value);

        // سکه
        setPrice("coin", gold["sekkeh"]?.value);
        setPrice("bahar", gold["bahar"]?.value);
        setPrice("halfCoin", gold["nim"]?.value);
        setPrice("quarterCoin", gold["rob"]?.value);
        setPrice("gramCoin", gold["gerami"]?.value);

        // ارز
        setPrice("dollar", fiat["usd"]?.value);
        setPrice("euro", fiat["eur"]?.value);
        setPrice("pound", fiat["gbp"]?.value);
        setPrice("dirham", fiat["aed"]?.value);
        setPrice("lira", fiat["try"]?.value);

        if (time) {
            time.textContent =
                "آخرین بروزرسانی: " +
                new Date().toLocaleTimeString("fa-IR");
        }

    } catch (error) {

        console.error(error);

        if (time) {
            time.textContent = "❌ دریافت قیمت‌ها ناموفق بود";
        }
    }
}

updatePrices();
