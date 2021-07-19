import puppeteer, {Browser, Page} from "puppeteer"

function normalize(s?: any, defaultVal:string=null): string | null {
    if (s && typeof s === "string") {
        return s.replace(/(<([^>]+)>)/gi, "").replace(/\n/g, "").replace(/\t/g, "").trim();
    } else if (s) {
        return s;
    } else {
        return defaultVal;
    }
}

async function getObjectsFromTable(page: Page): Promise<Array<object>> {
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
        keys.push(normalize(head, 'noTitle'));
    }
    let objects = [];
    for (let i = 1; i < table.length; i++) {
        const tds = await table[i].$$("td");
        let obj = {};
        for (let j = 0; j < keys.length; j++) {
            const key = keys[j];
            let temp = (await (await tds[j]?.getProperty("innerHTML"))?.jsonValue())
            obj[key] = normalize(temp);
        }
        objects.push(obj);
    }
    return objects;
}

interface Scrapper {
    browser: Browser
    page: Page
}

export async function initScrapper(): Promise<Scrapper> {
    const DEBUG = false;

    const debugOptions = {
        headless: false,
        slowMo: 100
    };


    const ret: Scrapper = {
        browser: null,
        page: null
    };
    ret.browser = await puppeteer.launch({
        ...(DEBUG ? debugOptions : {}),
        args: ['--lang=de-DE,de --no-sandbox'],
        pipe: true,
        executablePath: process.env.BROWSER ? process.env.BROWSER : undefined
    });
    ret.page = await ret.browser.newPage();

    return ret;
}


interface getDataParams {
    page: Page
}

export default {
    getData: async function ({page}: getDataParams) {
        try {
            await page.goto('https://campus.fau.de');
            const loginButton = await page.$(".allInclusive > a");
            if (loginButton) {
                await loginButton.click();
                await page.waitForNavigation();
                console.log("Logging in " + process.env.IDM_USERNAME);
                await page.type("#username", process.env.IDM_USERNAME);
                await page.type("#password", process.env.PASSWORD);
                await page.click("#submit_button");
            }

            await page.waitForSelector("#pruefungen");

            await page.click("#pruefungen");

            const [link] = await page.$x("//a[contains(., 'Notenspiegel')]");
            if (link) {
                await link.click();
            } else {
                console.error("Notenspiegel konnte nicht gefunden werden");
                return null;
            }
            await page.waitForNavigation();
            await page.waitForSelector("#notenspiegel");
            return await getObjectsFromTable(page);
        } catch (e) {
            return e;
        }
    },

    detectChanges: function (olds, news) {
        return news.filter(item => !olds.map(obj => obj['#']).includes(item['#']));
    }
}
