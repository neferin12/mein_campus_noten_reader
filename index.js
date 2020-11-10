const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        slowMo: 250
    });

    const page = await browser.newPage();
    await page.goto('https://campus.fau.de');

    const loginButton = await page.$(".allInclusive > a");
    await loginButton.click();
    await page.waitForNavigation();

    await browser.close();
})();