const FIAT_URL =
    "https://raw.githubusercontent.com/HosseinOdd/Navasan-API/main/data/fiat.json";

const GOLD_URL =
    "https://raw.githubusercontent.com/HosseinOdd/Navasan-API/main/data/gold.json";

function formatPrice(value) {
    if (value === undefined || value === null) {
        return "ناموجود";
    }

    return Number(value).toLocaleString("fa-IR") + " ریال";
}

function setPrice(id, value) {
    const element = document.getElementById(id);

    if (element) {
        element.textContent = formatPrice(value);
    }
}

async function updatePrices() {
    const updateTime = document.getElementById("updateTime");

    if (updateTime) {
        updateTime.textContent = "در حال دریافت قیمت‌ها...";
    }

    try {
        const [fiatResponse, goldResponse] = await Promise.all([
            fetch(FIAT_URL),
            fetch(GOLD_URL)
        ]);

        if (!fiatResponse.ok || !goldResponse.ok) {
            throw new Error("خطا در دریافت اطلاعات");
        }

        const fiat = await fiatResponse.json();
        const gold = await goldResponse.json();

        // طلا
        setPrice("gold18", gold["18ayar"]?.value);
        setPrice("mesghal", gold["abshodeh"]?.value);

        // سکه
        setPrice("coin", gold["sekkeh"]?.value);

        // ارز
        setPrice("dollar", fiat["usd"]?.value);

        // زمان بروزرسانی
        if (updateTime) {
            updateTime.textContent =
                "آخرین بروزرسانی: " +
                new Date().toLocaleTimeString("fa-IR");
        }

    } catch (error) {
        console.error(error);

        if (updateTime) {
            updateTime.textContent =
                "❌ دریافت قیمت‌ها ناموفق بود";
        }
    }
}

updatePrices();
