const { GoogleSpreadsheet } = require('google-spreadsheet');

let global_doc;

const getDoc = async () => {
    if (global_doc) return global_doc;

    const unready_doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
    await unready_doc.useServiceAccountAuth({
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_CLIENT_PRIVATE_KEY.replace(/\\n/gm, '\n')
    });
    await unready_doc.loadInfo();
    global_doc = unready_doc;
    return global_doc;
}

const getPlatformConfig = async (doc, { offset, title_to_id }) => {
    const index = title_to_id['Platform config'];
    const rows = await doc.sheetsByIndex[index].getRows({ offset });
    const platform_config = {};
    for (row of rows) {
        platform_config[row._rawData[0]] = row._rawData[1];
    }
    return platform_config;
}

const getSize = async (doc, { tab, offset, title_to_id }) => {
    const list_sheet_index = title_to_id[tab];
    //ensure an non empty columns exists after the last filled column in that top row
    const sheet_rows = await doc.sheetsByIndex[list_sheet_index].getRows({ offset });
    let n_rows = 0;
    let total_size = 0;
    for (row of sheet_rows) {
        if (row._rawData[0] !== '') {
            total_size += row._rawData.length; //.reduce((a, c) => a + length(c), 0);
            n_rows++;
        }
    }
    return {
        total_size,
        n_rows
    }

}

const getTab = async (doc, { tab, range, offset, title_to_id }) => {
    const list_sheet_index = title_to_id[tab];
    //ensure an non empty columns exists after the last filled column in that top row
    let sheet_rows;
    if (range.start && range.end) {
        sheet_rows = await doc.sheetsByIndex[list_sheet_index].getRows({
            offset: offset + range.start,
            limit: range.end - range.start
        })
    } else {
        sheet_rows = await doc.sheetsByIndex[list_sheet_index].getRows({ offset });
    }
    let items = [];
    for (row of sheet_rows) {
        if (row._rawData[0] !== '') {
            items.push(row._rawData);
        }
    }
    return items;
}

const handlers = {
    platformconfig: getPlatformConfig,
    size: getSize,
    tab: getTab
}

exports.handler = async (event, context, callback) => {
    try {
        const doc = await getDoc();
        const { offset, rangeStart, rangeEnd, ...rest } = event.queryStringParameters;
        const config = {
            offset: parseInt(offset) - 2,
            range: {
                start: parseInt(rangeStart),
                end: parseInt(rangeEnd)
            }
        }

        for ([k, v] of Object.entries(rest)) {
            config[k] = v;
        }

        config.title_to_id = {};
        for (key of Object.keys(doc._rawSheets)) {
            let { title, index } = doc._rawSheets[key]._rawProperties;
            config.title_to_id[title] = index;
        }

        const ret = await handlers[config.request](doc, config);
        return {
            statusCode: 200,
            body: JSON.stringify(ret)
        }
    } catch (err) {
        console.log('googlesheets failed', err)
        return {
            statusCode: 500,
            body: err.toString()
        }
    }
}
