const fs = require('fs')

exports.handler = async (event, context, callback) => {
  const name = event.queryStringParameters.sheet
  if (name) {
    const body = fs.readFileSync(`./dump/${name}.json`, {encoding: 'utf-8'})
    return {
      statusCode: 200,
      body
    }
  }
}
