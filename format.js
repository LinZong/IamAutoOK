const formatters = {
    createTime: {
        name: "创建日期",
        format: (data) => new Date(data).toLocaleString()
    },
    updateTime: {
        name: "修改日期",
        format: (data) => new Date(data).toLocaleString()
    },
    name: {
        name: "姓名"
    },
    account: {
        name: "学号"
    },
    gender: {
        name: "性别"
    }
}

function IamAutoOK() {
    const logoBase64 = "ICBfX19fXyAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXyAgICAgICAgICAgX19fXyAgXyAgX18NCiB8XyAgIF98ICAgICAgICAgICAgICAgICAgICAvXCAgICAgICAgfCB8ICAgICAgICAgLyBfXyBcfCB8LyAvDQogICB8IHwgIF9fIF8gXyBfXyBfX18gICAgICAvICBcICBfICAgX3wgfF8gX19fICAgfCB8ICB8IHwgJyAvIA0KICAgfCB8IC8gX2AgfCAnXyBgIF8gXCAgICAvIC9cIFx8IHwgfCB8IF9fLyBfIFwgIHwgfCAgfCB8ICA8ICANCiAgX3wgfHwgKF98IHwgfCB8IHwgfCB8ICAvIF9fX18gXCB8X3wgfCB8fCAoXykgfCB8IHxfX3wgfCAuIFwgDQogfF9fX19fXF9fLF98X3wgfF98IHxffCAvXy8gICAgXF9cX18sX3xcX19cX19fLyAgIFxfX19fL3xffFxfXA=="
    console.log(Buffer.from(logoBase64, 'base64').toString('utf-8'))
    console.log("\n\n正在通过SSO登陆IamOK...");
}

function formatReport(data) {
    for (const field in data) {
        const formatter = formatters[field]
        const name = formatter ? formatter.name : field
        const value = formatter && formatter.format ? formatter.format(data[field]) : data[field]
        console.log(`${name}  ${value}`);
    }
    console.log("请自行阅读以上所填信息, 确保上述信息没有发生变更。如发生变更，请立即关闭此工具，打开IamOK重新申报正确的信息。");
    console.log("如因信息有误，为学校及国家的疫情防控工作带来任何负面影响，请自行负责。本工具及作者不承担任何责任。\n")
}

function CommonResponseFormat(response) {
    console.warn(`Code: ${response.code}, Message:${response.msg}`);

}

module.exports = { formatReport, IamAutoOK, CommonResponseFormat }