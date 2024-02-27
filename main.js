const puppeteer = require('puppeteer');


const getDeals = async () => {
    const browser = await puppeteer.launch();

    let deals = []

    function* generateURLs() {
        yield `https://forums.redflagdeals.com/hot-deals-f9/?sk=tt&rfd_sk=tt&sd=d`;
        for (let page_num = 1; page_num < 5; ++page_num) {
            yield `https://forums.redflagdeals.com/hot-deals-f9/${page_num}/?sk=tt&rfd_sk=tt`;
        }
    }

    for (url of generateURLs()) {
        const page = await browser.newPage();
        await page.goto(url);

        const page_deals = await page.evaluate(() => {
            const entries = document.querySelectorAll("li.row.topic");

            var ret = []

            for (entry of entries) {
                const thread_id = entry.getAttribute("data-thread-id")
                const title = entry.querySelector(".topic_title_link").innerText;
                const post_time = entry.querySelector(".first-post-time").innerText;
                const description_list = entry.querySelector(".post_voting");
                let votes = NaN;
                if (description_list) {
                    votes = Number(description_list.getAttribute("data-total"));
                }
                const deal = { thread_id, title, votes, post_time };

                function filter(deal) {
                    if (deal.votes != NaN && deal.votes > 10) {
                        return true;
                    }
                    return false;
                }

                if (filter(deal)) {
                    ret.push(deal);
                }
            }

            return ret;
        });

        deals = deals.concat(page_deals);
    }

    // Remove duplicate thread_ids (new deal during scrapping pushing deal to next page)
    let visited = {}
    for (let deal of deals) {
        if (deal.thread_id in visited) {
            visited[deal.thread_id] += 1;
        } else {
            visited[deal.thread_id] = 1;
        }
    }
    deals = deals.filter((deal) => {
        return visited[deal.thread_id] == 1
    })

    console.log(deals);

    await browser.close();
};

getDeals();
