const fs = require("fs")
const puppeteer = require('puppeteer');
const dotenv = require('dotenv');
dotenv.config();

function delay(time) {
    return new Promise(function(resolve) {
        setTimeout(resolve, time)
    });
}

function tableToObject(table) {
    const data = [];

    // first row needs to be headers
    const headers = [];
    for (let i=0; i<table.rows[0].cells.length; i++) {
        headers[i] = table.rows[0].cells[i].innerHTML.toLowerCase().replace(/ /gi,'');
    }

    // go through cells
    for (let i=1; i<table.rows.length; i++) {

        const tableRow = table.rows[i];
        const rowData = {};

        for (let j=0; j<tableRow.cells.length; j++) {

            rowData[ headers[j] ] = tableRow.cells[j].innerHTML;

        }

        data.push(rowData);
    }

    return data;
}


async function getObjectsFromTable(page) {
    let table = await page.$$("#notenspiegel tbody tr");
    table.shift();
    let keys = [];
    for (let head of await table[0].$$("th")) {
        const abbr = await head.$("abbr");
        if (abbr) {
            head = abbr;
        }
        head = await (await head.getProperty('innerHTML')).jsonValue();
        keys.push(head);
    }
    let objects = [];
    for (let i = 1; i < table.length; i++) {
        const tds = await table[i].$$("td");
        let obj = {};
        for (let j = 0; j < keys.length; j++) {
            const key = keys[j];
            obj[key] = (await (await tds[j].getProperty("innerHTML")).jsonValue()).trim().replace(/\n/g, "").replace(/\t/g, "");
        }
        objects.push(obj);
    }
    return objects;
}

(async () => {
    const debugOptions = {
        headless: false,
        slowMo: 100
    };

    const browser = await puppeteer.launch();

    const page = await browser.newPage();
    await page.goto('https://campus.fau.de');

    const loginButton = await page.$(".allInclusive > a");
    await loginButton.click();
    await page.waitForNavigation();

    await page.type("#username", process.env.USER);
    await page.type("#password", process.env.PASSWORD);
    await page.click("#submit_button");
    await page.waitForSelector("#pruefungen")

    await page.click("#pruefungen");

    const [link] = await page.$x("//a[contains(., 'Notenspiegel')]");
    if (link) {
        await link.click();
    } else {
        console.error("Notenspiegel konnte nicht gefunden werden");
        await browser.close();
        return;
    }
    await page.waitForNavigation();
    await page.waitForSelector("#notenspiegel")
    fs.writeFile("out.json", JSON.stringify(await getObjectsFromTable(page)), err => {
        if (err) return console.log(err);
        console.log('written');
    });
    await browser.close();
})();