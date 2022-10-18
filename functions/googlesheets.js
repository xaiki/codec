const { GoogleSpreadsheet } = require('google-spreadsheet');
const fs = require('fs');

function dump(name) {
   return (data) =>{
     fs.writeFileSync(`./dump/${name}.json`, data)
     return data
   }
 }

exports.handler = async (event, context, callback) => {
    try {
        const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID);
        await doc.useServiceAccountAuth({
            client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            private_key: process.env.GOOGLE_CLIENT_PRIVATE_KEY.replace(/\\n/gm, '\n')
        });
        await doc.loadInfo()

        const requested_sheet_title = event.queryStringParameters.sheet
        const requested_sheet_offset = parseInt(event.queryStringParameters.offset) - 2

        let sheet_ids_by_title = {}
        Object.keys(doc._rawSheets).forEach((key) => {
            let sheet = doc._rawSheets[key]
            sheet_ids_by_title[sheet._rawProperties.title] = sheet._rawProperties.index
        })

        if (requested_sheet_title === 'platformconfig') {
            let platform_config_rows = await doc.sheetsByIndex[sheet_ids_by_title['Platform config']].getRows({ offset: requested_sheet_offset })
            let platform_config = {}
            platform_config_rows.forEach((platform_config_row) => {
                platform_config[platform_config_row._rawData[0]] = platform_config_row._rawData[1]
            })
            const body = JSON.stringify(platform_config);
            dump('platformconfig')(body)
            return {
                statusCode: 200,
                body
            }
        } else {
            const list_sheet_index = sheet_ids_by_title[requested_sheet_title]
            //ensure an non empty columns exists after the last filled column in that top row
            let sheet_rows = await doc.sheetsByIndex[list_sheet_index].getRows({ offset: requested_sheet_offset })
            let items = []
            sheet_rows.forEach((sheet_row) => {
                if (sheet_row._rawData[0] !== '') {
                    items.push(sheet_row._rawData)
                }
            })
            const body = JSON.stringify(items);
            dump(requested_sheet_title)(body)
            return {
                statusCode: 200,
                body
            }
        }
    } catch (err) {
        console.log({ err })
        return { statusCode: 500, body: err.toString() }
    }
}
