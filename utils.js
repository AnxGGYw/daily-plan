const dayjs = require('dayjs')
const fs = require('fs')
const readline = require('readline')
const chalk = require('chalk')

function handleResponse(promise, errorExtra) {
  return promise
    .then(data => [null, data])
    .catch(err => {
      const errorData = err.response.data
      if (errorExtra) {
        return [Object.assign({}, errorData, errorExtra), null]
      }
      return [errorData, null]
    })
}

function createToday(rule, date) {
  // check isLocal
  const isLocal = process.env.MODE === 'local'
  if (isLocal) {
    return dayjs(date).format(rule)
  }
  // 代码在github上运行，运行是 UTC 时区
  // 中国时区 = UTC时区 + 8小时
  return dayjs(date).add(8, 'h').format(rule)
}

function exist(arr, compare) {
  return arr.find(compare)
}

function createTemplateContent(pathToFile) {
  const data = fs.readFileSync(pathToFile, { encoding: 'utf8' })
  return data
}

async function isContainTitle(pathToFile, date) {
  const title = await readFirstLine(pathToFile)
  return title && title.includes(date)
}

async function readFirstLine(pathToFile) {
  const readable = fs.createReadStream(pathToFile)
  const reader = readline.createInterface({ input: readable })
  const line = await new Promise(resolve => {
    reader.on('line', line => {
      reader.close()
      resolve(line)
    })
  })
  readable.close()
  return line
}

function createIssueTitle() {
  return `【每日计划】 ${createToday('YYYY-MM-DD')}`
}

function createIssueBody() {
  return '### 记录每日计划'
}

module.exports = {
  handleResponse,
  createToday,
  exist,
  isContainTitle,
  createTemplateContent,
  createIssueTitle,
  createIssueBody
}
