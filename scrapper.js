import puppeteer from "puppeteer"

async function getObjectsFromTable(page) {
    const screenshotTable = await page.$('#notenspiegel');
    await screenshotTable.screenshot({path: 'notenspiegel.png'});
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
            obj[key] = (await (await tds[j]?.getProperty("innerHTML"))?.jsonValue())?.trim().replace(/\n/g, "").replace(/\t/g, "");
        }
        objects.push(obj);
    }
    return objects;
}

export default {
    getData: async function () {
        const DEBUG = false;

        const debugOptions = {
            headless: false,
            slowMo: 100
        };

        const browser = await puppeteer.launch({
            ...(DEBUG ? debugOptions : {}),
            args: ['--lang=de-DE, de --no-sandbox'],
            pipe: true
        });

        try {
            const page = await browser.newPage();
            await page.goto('https://campus.fau.de');

            const loginButton = await page.$(".allInclusive > a");
            await loginButton.click();
            await page.waitForNavigation();

            console.log("Logging in " + process.env.IDM_USERNAME);
            await page.type("#username", process.env.IDM_USERNAME);
            await page.type("#password", process.env.PASSWORD);
            await page.click("#submit_button");
            await page.waitForSelector("#pruefungen");

            await page.click("#pruefungen");

            const [link] = await page.$x("//a[contains(., 'Notenspiegel')]");
            if (link) {
                await link.click();
            } else {
                console.error("Notenspiegel konnte nicht gefunden werden");
                await browser.close();
            }
            await page.waitForNavigation();
            await page.waitForSelector("#notenspiegel");
            return await getObjectsFromTable(page);
        } catch (e){
            return e;
        }finally {
            await browser.close();
            console.log("Closed Browser");
        }
    },

    detectChanges: function (olds, news) {
        return news.filter(item => !olds.map(obj => obj['#']).includes(item['#']));
    }
}
