const puppeteer = require('puppeteer');


const getDeals = async () => {
    const browser = await puppeteer.launch();

    function* generateURLs() {
        yield `https://forums.redflagdeals.com/hot-deals-f9/?sk=tt&rfd_sk=tt&sd=d`;
        for (let page_num = 1; page_num < 5; ++page_num) {
            yield `https://forums.redflagdeals.com/hot-deals-f9/${page_num}/?sk=tt&rfd_sk=tt`;
        }
    }

    for (let url of generateURLs()) {
        const page = await browser.newPage();
        await page.goto(url);
        const content = await page.content();
        console.log(content);
    }

    await browser.close();
};

getDeals();
