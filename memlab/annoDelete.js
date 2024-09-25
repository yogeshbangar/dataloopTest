const TIME = 1000;

function url() {
    return "https://rc-product-demo.dataloop.ai/projects/c7219414-d4ea-4d45-a4ca-5ecfe629f896/datasets/65cb28a6593fb14c90719bf4/items/65cb294c52036535a9878b0c?view=icons&browserDqlMode=filters&page=0&pageSize=100&current=%2F&sort=%7B%22by%22%3A%22type%22,%22order%22%3A%22ascending%22%7D&dqlFilter=%7B%22filter%22%3A%7B%22%24and%22%3A%5B%7B%22hidden%22%3Afalse%7D,%7B%22type%22%3A%22file%22%7D%5D%7D%7D";
}
async function action(page) {
    for (let i = 0; i < 5; i++) {
        await someAsyncFunction(page);
        console.log(`Processed item ${i}`);
    }
    console.log('action End~~~~~~~~~~');
}
const random = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
async function someAsyncFunction(page) {
    console.log('someAsyncFunction Start~~~~~~~~~~');
    await onClick(page, '.dl-btn.pendo-dlBtnicon-dl-polygonToolBtn');
    // await page.move(page,  100+random(0,400), 100+random(0,400));
    page.mouse.move(100+random(0,400), 100+random(0,400))
    await sleep(200);
    page.mouse.move(100+random(0,400), 100+random(0,400))
    await sleep(200);
    page.mouse.move(100+random(0,400), 100+random(0,400))
    await sleep(200);
    console.log('someAsyncFunction End~~~~~~~~~~');
}

async function onKeyframes(page) {
    await sleep(TIME);
    const elements = await page.$$('.dl-tabs div.q-tab__label');
    console.log(elements,'~~!!!~~~~~~l~~',elements?.length);
    for (let element of elements) {
        onClick(page,'i.q-select__dropdown-icon.q-icon.icon-dl-down-chevron');
        onClick(page,'div.filter-input .q-field__inner');
        await sleep(TIME);
        await element.click();
    }
    
}
async function onClick(page,eleString) {
    const element = await page.$(eleString)
    
    if(element){    
        await sleep(TIME);
        await element.click();
    }
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