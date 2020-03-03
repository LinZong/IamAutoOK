const _ = require('lodash')
const { SafeGet } = require('./axios-wrap')
const cheerio = require('cheerio')
const { strEnc } = require('./des')
const qs = require('querystring')
const axios = require('axios').default

const SSO_URL = "https://sso.scut.edu.cn/cas/login?service="

async function TryLogin(username, password, callbackUrl) {
    if (_.isEmpty(callbackUrl))
        throw "Callback url must not be null."
    const REQ_URL = SSO_URL + callbackUrl
    const { data: SSOPage, headers } = await SafeGet(REQ_URL)
    let SSOCookies = headers["set-cookie"].map(it => it.split(';')[0]).join(';')

    const $ = cheerio.load(SSOPage)

    const lt = $("#lt").val();
    const ul = username.length
    const pl = password.length
    const rsa = strEnc(username + password + lt, '1', '2', '3')
    const execution = $("[name=execution]").first().attr('value')
    const _eventId = $("[name=_eventId]").first().attr('value')
    const content = await axios.post(REQ_URL,
        qs.stringify({
            lt, ul, pl, rsa, execution, _eventId
        }),
        {
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Cookie": SSOCookies
            },
            maxRedirects: 0,
            validateStatus: function (status) {
                return status >= 200 && status <= 302
            },
            withCredentials: true
        })
    const redirectLocation = content.headers['location']
    if(_.isEmpty(redirectLocation)) {
        throw "用户名或密码错误，退出."
    }
    SSOCookies = content.headers["set-cookie"].map(it => it.split(';')[0]).join(';')
    const ticketValidate = await SafeGet(redirectLocation)
    const ticketValidateRedirectLocation = ticketValidate.headers['location']
    let ticketValidateCookies = ticketValidate.headers["set-cookie"].map(it => it.split(';')[0]).join(';')
    
    if(_.isEmpty(ticketValidateRedirectLocation)) {
        throw "无法重定向至AuthCode认证页，退出。"
    }
    const doAuthWithSSO = await SafeGet(ticketValidateRedirectLocation, { "Cookie": ticketValidateCookies })
    const finalLocation = doAuthWithSSO.headers['location']
    ticketValidateCookies += ";" + doAuthWithSSO.headers["set-cookie"].map(it => it.split(';')[0]).join(';')

    return { finalLocation, ticketValidateCookies }
}


module.exports = { TryLogin }