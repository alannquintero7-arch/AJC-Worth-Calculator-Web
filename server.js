const express = require("express");
const fs = require("fs");
const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.static("images"));

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});

const items = JSON.parse(fs.readFileSync("items.json"));

function parseSide(text) {
    const lines = text.split("\n");
    const out = [];

    for (let line of lines) {
        if (!line.trim()) continue;

        let qty = 1;
        let name = line;

        if (line.includes("x")) {
            const parts = line.split("x");
            qty = parseInt(parts[0].trim());
            name = parts[1].trim();
        }

        out.push({ name, qty });
    }

    return out;
}

function tradeValue(list) {
    let total = 0;
    for (let item of list) {
        if (items[item.name]) {
            total += items[item.name].value * item.qty;
        }
    }
    return total;
}

app.post("/trade", (req, res) => {
    const give = parseSide(req.body.give || "");
    const get = parseSide(req.body.get || "");

    const giveTotal = tradeValue(give);
    const getTotal = tradeValue(get);

    let verdict = "Fair";
    const diff = getTotal - giveTotal;

    if (Math.abs(diff) < 0.5) verdict = "Fair";
    else if (diff > 0) verdict = "Win";
    else verdict = "Lose";

    res.json({
        giveTotal,
        getTotal,
        verdict,
        give,
        get
    });
});

app.listen(3000, () => console.log("Server running on port 3000"));