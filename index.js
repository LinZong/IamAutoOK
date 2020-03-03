const { TryLogin } = require('./cas/index')
const { SafeGet } = require('./cas/axios-wrap')
const axios = require('axios').default
const { formatReport, IamAutoOK, CommonResponseFormat } = require('./format')
const readline = require('readline')
const fs = require('fs')

const SUBMIT_URL = "https://iamok.scut.edu.cn/mobile/recordPerDay/submitRecordPerDay"
const QUERY_URL = "https://iamok.scut.edu.cn/mobile/recordPerDay/getRecordPerDay"

const Reader = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const AllOK = {
    isGangAoTai: "否",
    isOverseasStudent: "否",
    inHubeiToHubeiVihicle: null,
    hasGoneToHubei: "否",
    notInHubeiToHubeiDate: 0,
    notInHubeiToHubeiVihicle: "",
    isVisitingRelativesOrTravelToWenzhou: "否",
    visitingRelativesOrTravelToWenzhouDate: null,
    visitingRelativesOrTravelToWenzhouVihicle: null,
    hasPassByWuhang: "否",
    passByWuhangDate: 0,
    passByWuhangVihicle: "",
    hasPassByWenzhou: "否",
    passByWenzhouDate: null,
    passByWenzhouVihicle: null,
    isBeenToEpidemicArea: "否",
    beenToEpidemicAreaLeftDate: null,
    beenToEpidemicAreaLeftProvince: null,
    beenToEpidemicAreaLeftCity: null,
    isBeenToEpidemicAreaWenzhou: "否",
    beenToEpidemicAreaWenzhouLeftDate: null,
    beenToEpidemicAreaWenzhouLeftProvince: null,
    beenToEpidemicAreaWenzhouLeftCity: null,
    isContactWithEpidemicAreaHealthyPerson: "否",
    isContactWithEpidemicAreaSuspectedOrPatient: "否",
    currentHealthStatusSymptom: "正常",
    currentHealthStatusSymptomDate: 0,
    currentHealthStatusAddressProvince: "",
    currentHealthStatusAddressCity: "",
    currentHealthStatusAddressCounty: "",
    currentHealthStatusAddressDetail: "",
    currentHealthStatusSymptomOtherDescription: "",
    familyCurrentHealthStatusSymptom: "正常",
    familyCurrentHealthStatusSymptomDate: 0,
    familyCurrentHealthStatusAddressProvince: "",
    familyCurrentHealthStatusAddressCity: "",
    familyCurrentHealthStatusAddressCounty: "",
    familyCurrentHealthStatusAddressDetail: "",
    familyCurrentHealthStatusSymptomOtherDescription: "",
    recordDate: 0,
    recordShowDate: 0,
    submitDate: 1580879599694,
    isSubmit: true,
    submitAdminAccount: null,
    submitAdminSchoolNumber: null,
    important: false,
    isRecordChanged: false
}

async function Upload(getData, cookie) {
    const allOkData = {...getData, ...AllOK}
    const { data, status } = await axios.post(SUBMIT_URL,allOkData, {headers: {Cookie:cookie}})
    if(status !== 200 || data.code !== 200) {
        console.warn("上报失败, 请使用原版IamOK重新上报。");
    }
    CommonResponseFormat(data)
    console.log("感谢使用IamAutoOK。现在可以安全地关闭它了.");
    // Reader.close()
}
function ReadConfig() {
    if(!fs.existsSync('config.json')) {
        throw "账号密码信息不存在."
    }
    const account = fs.readFileSync('config.json').toString()
    return JSON.parse(account)
}
async function Main() {
    try {
        IamAutoOK()
        const account = ReadConfig()
        const { ticketValidateCookies } = await TryLogin(account.UserName, account.Password, "https%3A%2F%2Fiamok.scut.edu.cn%2Fcas%2Flogin")
        const { data, status } = await SafeGet(QUERY_URL, { "Cookie": ticketValidateCookies })
        if (status !== 200 || data.code !== 200) {
            console.warn("当前 IamAutoOK 暂时无法使用。退出。");
        }
        formatReport(data.data)
        console.log("输入Yes（大小写敏感），立即将上述数据原样上报。\n");
        Reader.on('line', (confirm) => {
            if (confirm !== "Yes") {
                console.warn(`输入的${confirm} != Yes, 请重新输入.`)
                return
            }
            console.log("开始上报");
            Upload(data.data, ticketValidateCookies)
        })
    }
    catch (e) {
        console.warn("IamAutoOK 出现异常.");
        console.warn(e);
    }
}

Main()