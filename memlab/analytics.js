const TIME = 1000;
function url() {
    console.log('url~~~~~~~~~~');
    return "https://local.dataloop.ai:8443/projects/6d57385e-60e2-48af-8f3d-27b0c384d7b5/analytics/datasets/6458d7e0a4aaff79f2f8e16f";
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
    await onKeyframes(page);
    console.log('action End~~~~~~~~~~');
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
    console.log(element,'~~!!!~~~@@~~~l~~',eleString);
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