import puppeteer, {Browser, Page} from "puppeteer"
import {log} from "./index"

/**
 * The Scrapper to read from meinCampus
 */
export default class Scrapper {
    private static scrapper: Scrapper = null;
    private browser: Browser
    private readonly page: Page

    /**
     * Creates a new Scrapper. If there already is one, it will be closed beforehand
     */
    static async initScrapper(): Promise<Scrapper> {
        if (Scrapper.scrapper) {
            await Scrapper.scrapper.browser.close();
            Scrapper.scrapper = null;
        }

        const DEBUG = false;

        const debugOptions = {
            headless: false,
            slowMo: 100
        };

        const browser = await puppeteer.launch({
            ...(DEBUG ? debugOptions : {}),
            args: ['--lang=de-DE,de --no-sandbox'],
            pipe: true,
            executablePath: process.env.BROWSER ? process.env.BROWSER : undefined
        });

        Scrapper.scrapper = new Scrapper(browser, await browser.newPage())

        return Scrapper.scrapper;

    }

    private constructor(browser: Browser, page: Page) {
        this.browser = browser;
        this.page = page;
    }

    /**
     * Closes the Scrapper
     */
    async close() {
        await this.browser.close();
        Scrapper.scrapper = null;
    }

    /**
     * Executes a given function with an timeout
     * @param time the time after which the execution is canceled
     * @param f the function
     */
    static timeout(time: number, f: () => Promise<any>):Promise<any> {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => reject("Promise timed out"), time);
            f().then(resolve).catch(reject).finally(() => clearTimeout(timer));
        });
    }

    /**
     * Pulls the actual data from meinCampus
     */
    getData(): Promise<Array<Record<string, string| null>>|null> {
        const page = this.page;
        return new Promise(async (resolve, reject) => {
            try {
                await page.goto('https://campus.fau.de');
                const loginButton = await page.$(".allInclusive > a");
                if (loginButton) {
                    await loginButton.click();
                    await page.waitForNavigation();
                    log.debug("Logging in " + process.env.IDM_USERNAME);
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
                    log.warn("Notenspiegel konnte nicht gefunden werden");
                    resolve(null);
                }
                await page.waitForNavigation();
                await page.waitForSelector("#notenspiegel");
                resolve(await this.getObjectsFromTable());
            } catch (e) {
                reject(e);
            }
        });


    }

    /**
     * Normalize a given string
     * @param s
     * @param defaultVal
     * @private
     */
    private static normalize(s?: any, defaultVal: string = null): string | null {
        if (s && typeof s === "string") {
            return s.replace(/(<([^>]+)>)/gi, "").replace(/\n/g, "").replace(/\t/g, "").trim() || null;
        } else if (s) {
            return s;
        } else {
            return defaultVal;
        }
    }

    /**
     * Parses the lines in the html table to objects
     * @private
     */
    private async getObjectsFromTable(): Promise<Array<Record<string, string| null>>> {
        const page = this.page;
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
            head = await(await head.getProperty('innerHTML')).jsonValue();
            keys.push(Scrapper.normalize(head, 'noTitle'));
        }
        let objects = [];
        for (let i = 1; i < table.length; i++) {
            const tds = await table[i].$$("td");
            let obj = {};
            obj['isExam'] = !!(await table[i].evaluate(el => window.getComputedStyle(el).background)).match(/0, 0, 0/)
            for (let j = 0; j < keys.length; j++) {
                const key = keys[j];
                let temp = (await(await tds[j]?.getProperty("innerHTML"))?.jsonValue())
                obj[key] = Scrapper.normalize(temp);
            }
            objects.push(obj);
        }
        return objects;
    }
}


