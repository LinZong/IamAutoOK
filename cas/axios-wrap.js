const axios = require('axios').default
async function SafeGet(url, headers, custConfig) {
    let config = {
        maxRedirects: 0,
        validateStatus: function (status) {
            return status >= 200 && status <= 302
        },
        headers: headers,
        withCredentials: true,
        ...custConfig
    };

    return await axios.get(url,config)
}

module.exports = { SafeGet }