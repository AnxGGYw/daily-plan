const chalk = require('chalk')
const {
  pullUserInfo,
  createIssue,
  getTodayIssue,
  hasCommented,
  createComment,
  updateComment
} = require('./github')

const {
  createToday,
  isContainTitle,
  createTemplateContent,
  createIssueTitle,
  createIssueBody
} = require('./utils')

// today date
const today = createToday('YYYY-MM-DD')

// template content
let content = createTemplateContent('./template.md')
content = `${content} \n ###### 更新时间：${createToday('YYYY-MM-DD HH:mm:ss')}`

const log = console.log

;(async () => {
  // user info
  const { login: user } = await pullUserInfo()
  if (!user) {
    log(chalk.red('user authorization error ...'))
    return
  }
  log(chalk.green(`load user success! username: ${user}`))

  // pull today issue
  const issue = await getTodayIssue(today)
  if (!issue) {
    log(chalk.redBright(`not found today's issue ...`))
    log(chalk.yellowBright(`creating today's issue...`))

    // if not found today issue, auto create issue
    const result = await createIssue(createIssueTitle(), createIssueBody())
    if (result.id && result.title) {
      log(chalk.greenBright(`create issue success! title: ${result.title}, body: ${result.body}`))
    } else {
      log(chalk.redBright(`create issue error! error message: ${JSON.stringify(result, null, 2)}`))
    }
    return
  }

  log(
    chalk.greenBright(
      `load today issue success! issue's title: ${issue.title}, create at: ${createToday(
        'YYYY-MM-DD HH:mm:ss',
        issue.created_at
      )}`
    )
  )

  // check today template
  const isTodayTemplate = await isContainTitle('./template.md', today)
  if (!isTodayTemplate) {
    log(chalk.red(`not found today's template ...`))
    return
  }

  // check had commented
  const comment = await hasCommented(issue, user)
  if (comment) {
    await handleComment(updateComment, comment, content, false)
  } else {
    await handleComment(createComment, issue, content)
  }

  async function handleComment(fn, instance, content, isCreate = true) {
    const logMsg = isCreate ? 'create' : 'update'

    const result = await fn(instance, content)
    if (result.id) {
      log(chalk.greenBright(`comment ${logMsg} success! ${logMsg} body: \n\n ${content}`))
    } else {
      log(
        chalk.redBright(
          `comment ${logMsg} error! error message: ${JSON.stringify(result, null, 2)}`
        )
      )
    }
  }
})()
