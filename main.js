const Apify = require('apify');
const puppeteer = require('puppeteer');

Apify.main(async () => {
    const input = await Apify.getInput();
    const { searchUrl, maxProfiles = 10 } = input;

    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.goto(searchUrl, { waitUntil: 'networkidle2' });

    const results = await page.$$eval('.entity-result__content', nodes =>
        nodes.map(el => {
            const name = el.querySelector('.entity-result__title-text')?.innerText.trim();
            const title = el.querySelector('.entity-result__primary-subtitle')?.innerText.trim();
            const location = el.querySelector('.entity-result__secondary-subtitle')?.innerText.trim();
            return { name, title, location };
        })
    );

    await Apify.pushData(results.slice(0, maxProfiles));
    await browser.close();
});
