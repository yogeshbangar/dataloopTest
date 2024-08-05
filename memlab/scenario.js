function url() {
    console.log('url~~~~~~~~~~');
    return "https://local.dataloop.ai:8443/projects/f1bd5cf4-5ff6-47f6-9ed0-c58f349f20aa/datasets/61a3936851d78cf8bc37b1b2/items/636bc1b17972cbb6f343b36d?view=icons&browserDqlMode=filters&page=0&pageSize=100&current=%2F&sort=%7B%22by%22%3A%22type%22,%22order%22%3A%22ascending%22%7D&dqlFilter=%7B%22filter%22%3A%7B%22%24and%22%3A%5B%7B%22hidden%22%3Afalse%7D,%7B%22dir%22%3A%7B%22%24eq%22%3A%22%2F%22%7D%7D,%7B%22type%22%3A%22file%22%7D%5D%7D%7D";
}
async function action(page) {
    // await sleep(100000);
    console.log('action~~~~~~~~~~');
    for (let i = 0; i < 10; i++) {
        await someAsyncFunction(page);
        console.log(`Processed item ${i}`);
    }
    console.log('action End~~~~~~~~~~');
}

async function someAsyncFunction(page) {
    console.log('action~~~~~~~~~~');
    await firstFrame(page);
    await groupingListControls(page);
    await play(page);
    await checkbox(page);
    console.log('action End~~~~~~~~~~');
}


async function play(page) {
    console.time('play~~~~~~~~~~');
    await sleep(100);
    await page.click('[class="dl-btn column pendo-dlBtnicon-dl-playVideoControlBar justify-center "]');
    await sleep(10000);
    console.timeEnd('play~~~~~~~~~~');
}

async function firstFrame(page) {
    console.time('firstFrame~~~~~~~~~~');
    await sleep(1000);
    await page.click('[class="dl-btn column pendo-dlBtnicon-dl-backVideoControlBar justify-center "]');
    console.timeEnd('firstFrame~~~~~~~~~~');
}

async function checkbox(page) {
    console.time('checkbox~~~~~~~~~~');
    const elements = await page.$$('.annotation-list-item');
    let i = 0;
    for (let element of elements) {
        console.log(elements?.length, 'element~~~~~~~~~~', i);
        await sleep(300);
        await element.click();
        i++;
    }
    await sleep(1000);
    console.timeEnd('checkbox~~~~~~~~~~');
}

async function recipe(page) {
    console.time('recipe~~~~~~~~~~');
    await sleep(1000);
    await page.click('[id="go-to-recipe"]');
    console.timeEnd('recipe~~~~~~~~~~');
}
async function groupingListControls(page) {
    console.time('groupingListControls~~~~~~~~~~');
    await sleep(1000);
    const elements = await page.$('.pendo-dlBtnicon-dl-groupingListControls > div > button');
    await elements.click('[class="dl-btn column pendo-dlBtnicon-dl-groupingListControls justify-center "]');
    await sleep(10000);
    console.timeEnd('groupingListControls~~~~~~~~~~');
}

async function lastFrame(page) {
    console.time('lastFrame~~~~~~~~~~');
    await sleep(1000);
    await page.click('[class="dl-btn column pendo-dlBtnicon-dl-nextVideoControlBar justify-center "]');
    console.timeEnd('lastFrame~~~~~~~~~~');
}

async function sleep(ms) {
    const val = await new Promise(resolve => setTimeout(resolve, ms));
    return val;
}

module.exports = {
    action, url, leakFilter(node, snapshot, leakedNodeIds) {
        return node.retainedSize > 1000;
    }
};