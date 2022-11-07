const { Telegraf, session, Extra, Markup, Scenes} = require('telegraf');
const { BaseScene, Stage } = Scenes
const mongo = require('mongodb').MongoClient;
const {enter, leave} = Stage
const stage = new Stage();
const Scene = BaseScene
const data = require('./data');
let db 


const  bot = new Telegraf(data.bot_token)
mongo.connect(data.mongoLink, {useUnifiedTopology: true}, (err, client) => {
  if (err) {
    console.log(err)
  }

  db = client.db(data.bot_name)
  bot.telegram.deleteWebhook().then(success => {
  success && console.log('Your Bot Is Running Successfully !!!')
  bot.launch()
})
})

bot.use(session())
bot.use(stage.middleware())

const onCheck = new Scene('onCheck')
stage.register(onCheck)
const onConfirm = new Scene('onConfirm')
stage.register(onConfirm)
const getWallet= new Scene('getWallet')
stage.register(getWallet)

const getMsg = new Scene('getMsg')
stage.register(getMsg)

const onWithdraw = new Scene('onWithdraw')
stage.register(onWithdraw)

const channels = data.channelsList
const cb_api_key = data.cb_api_key
const cb_api_secret = data.cb_api_secret
const cb_account_id = data.cb_account_id
const admin = data.bot_admin
const bot_cur = data.currency
const cur = data.currency
const min_wd = data.min_wd
const ref_bonus = data.reffer_bonus
const daily_bonus = data.daily_bonus

// var client = new Client({
//    apiKey: cb_api_key,
//    apiSecret: cb_api_secret ,strictSSL: false
// });




const botStart = async (ctx) => {
try {

if(ctx.message.chat.type != 'private'){
  return
  }
   let dbData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()
 let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()

let q1 = rndInt(1,10)
let q2 = rndInt(1,10)
let ans = q1+q2
  
  if(bData.length===0){

  if(ctx.startPayload && ctx.startPayload != ctx.from.id){
let ref = ctx.startPayload * 1
  db.collection('pendUsers').insertOne({userId: ctx.from.id, inviter: ref})}else{
db.collection('pendUsers').insertOne({userId: ctx.from.id})
}
  
  db.collection('allUsers').insertOne({userId: ctx.from.id, virgin: true, paid: false })
   db.collection('balance').insertOne({userId: ctx.from.id, balance:0,withdraw:0})
  db.collection('checkUsers').insertOne({userId: ctx.from.id, answer:ans})
 await  ctx.replyWithMarkdown('*➡️ Before we start the airdrop, please prove you are human by answering the question below.*\n\nPlease answer: '+q1+' + '+q2+' =\n\n*Click on Continue before typing the code*',  { reply_markup: { keyboard: [['']], resize_keyboard: true } })
 ctx.scene.enter('onCheck')
 }else{
  let joinCheck = await findUser(ctx)
  if(joinCheck){
  let pData = await db.collection('pendUsers').find({userId: ctx.from.id}).toArray()
       if(('inviter' in pData[0]) && !('referred' in dbData[0])){
   let bal = await db.collection('balance').find({userId: pData[0].inviter}).toArray()

 var cal = bal[0].balance*1
 var sen = ref_bonus*1
 var see = cal+sen

   bot.telegram.sendMessage(pData[0].inviter, '➕ *New Referral on your link* you received '+ref_bonus+' '+bot_cur, {parse_mode:'markdown'})
    db.collection('allUsers').updateOne({userId: ctx.from.id}, {$set: {inviter: pData[0].inviter, referred: 'surenaa'}}, {upsert: true})
     db.collection('joinedUsers').insertOne({userId: ctx.from.id, join: true})
    db.collection('balance').updateOne({userId: pData[0].inviter}, {$set: {balance: see}}, {upsert: true})
    ctx.replyWithMarkdown(
      '🎉 Welcome Back To Menu',
      { reply_markup: { keyboard: [['🗂 Account Info','🚧 Set Wallet'],['⁉️ Information', '💸 Payment']], resize_keyboard: true }, 
      disable_web_page_preview : 'true'})      
      }else{
      db.collection('joinedUsers').insertOne({userId: ctx.from.id, join: true}) 

      ctx.replyWithMarkdown(
        '🎉 Welcome Back To Menu',
        { reply_markup: { keyboard: [['🗂 Account Info','🚧 Set Wallet'],['⁉️ Information', '💸 Payment']], resize_keyboard: true }, 
        disable_web_page_preview : 'true'})    }
      }else{
  mustJoin(ctx)
  }}


} catch(e){
sendError(e, ctx)
}
}



bot.start(botStart)

bot.hears(['⬅️ Back','🔙 back'], botStart)


  
  
  

bot.hears('⚪️ Try Again', async (ctx) => {
try {
let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){

let q1 = rndInt(1,50)
let q2 = rndInt(1,50)
let ans = q1+q2
db.collection('checkUsers').updateOne({userId: ctx.from.id}, {$set: {answer: ans}}, {upsert: true})
  
await ctx.replyWithMarkdown('*➡️ Before we start the airdrop, please prove you are human by answering the question below.*\n\nPlease answer: '+q1+' + '+q2+' =\n\n*Click on Continue before typing the code*',  { reply_markup: { keyboard: [['']], resize_keyboard: true } })
ctx.scene.enter('onCheck')
}else{
starter(ctx)
return
}

  } catch (err) {
    sendError(err, ctx)
  }
})



onCheck.hears(['⚪️ Try Again','/start'], async (ctx) => {
 try {
 
let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){
ctx.scene.leave('onCheck')


let q1 = rndInt(1,50)
let q2 = rndInt(1,50)
let ans = q1+q2
db.collection('checkUsers').updateOne({userId: ctx.from.id}, {$set: {answer: ans}}, {upsert: true})
  
await ctx.replyWithMarkdown('*➡️ Before we start the airdrop, please prove you are human by answering the question below.*\n\nPlease answer: '+q1+' + '+q2+' =\n\n*Click on Continue before typing the code*',  { reply_markup: { keyboard: [['']], resize_keyboard: true } })
ctx.scene.enter('onCheck')
}else{
return
}
 } catch (err) {
    sendError(err, ctx)
  }
})  

onCheck.on('text', async (ctx) => {
 try {
 let dbData = await db.collection('checkUsers').find({userId: ctx.from.id}).toArray()
 let bData = await db.collection('pendUsers').find({userId: ctx.from.id}).toArray()
 let dData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()
 let ans = dbData[0].answer*1
 
 
  if(ctx.from.last_name){
 valid = ctx.from.first_name+' '+ctx.from.last_name
 }else{
 valid = ctx.from.first_name
 }
 
 if(!isNumeric(ctx.message.text)){
 ctx.replyWithMarkdown('😑 _I thought you were smarter than this, try again_ ')
 }else{
if(ctx.message.text==ans){
 db.collection('vUsers').insertOne({userId: ctx.from.id, answer:ans,name:valid})
 ctx.deleteMessage()
 
 ctx.scene.leave('onCheck')
 let joinCheck = await findUser(ctx)
  if(joinCheck){
  let pData = await db.collection('pendUsers').find({userId: ctx.from.id}).toArray()
       if(('inviter' in pData[0]) && !('referred' in dData[0])){
   let bal = await db.collection('balance').find({userId: pData[0].inviter}).toArray()

 var cal = bal[0].balance*1
 var sen = ref_bonus*1
 var see = cal+sen

   bot.telegram.sendMessage(pData[0].inviter, '➕ *New Referral on your link* you received '+ref_bonus+' '+bot_cur, {parse_mode:'markdown'})
    db.collection('allUsers').updateOne({userId: ctx.from.id}, {$set: {inviter: pData[0].inviter, referred: 'surenaa'}}, {upsert: true})
     db.collection('joinedUsers').insertOne({userId: ctx.from.id, join: true})
    db.collection('balance').updateOne({userId: pData[0].inviter}, {$set: {balance: see}}, {upsert: true})
    ctx.replyWithMarkdown(
      '🎉 Welcome Back To Menu',
      { reply_markup: { keyboard: [['🗂 Account Info','🚧 Set Wallet'],['⁉️ Information', '💸 Payment']], resize_keyboard: true }, 
      disable_web_page_preview : 'true'})      
      }else{
      db.collection('joinedUsers').insertOne({userId: ctx.from.id, join: true}) 

      ctx.replyWithMarkdown(
        '🎉 Welcome Back To Menu',
        { reply_markup: { keyboard: [['🗂 Account Info','🚧 Set Wallet'],['⁉️ Information', '💸 Payment']], resize_keyboard: true }, 
        disable_web_page_preview : 'true'})    }
  }else{
  mustJoin(ctx)
  }}else{
    
    let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
    if(bData.length===0){
    
    let q1 = rndInt(1,50)
    let q2 = rndInt(1,50)
    let ans = q1+q2
    db.collection('checkUsers').updateOne({userId: ctx.from.id}, {$set: {answer: ans}}, {upsert: true})
      
    await ctx.replyWithMarkdown('*🤓 Wrong Answer! Please try again.*\n\nPlease answer: '+q1+' + '+q2+' =',  { reply_markup: { keyboard: [['']], resize_keyboard: true } })
    ctx.scene.enter('onCheck')
    }else{
    starter(ctx)
    return
    }



 }}
 } catch (err) {
    sendError(err, ctx)
  }
})  

bot.hears('🗂 Account Info', async (ctx) => {
try {
if(ctx.message.chat.type != 'private'){
  return
  }
  
  let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){
return}

let thisUsersData = await db.collection('balance').find({userId: ctx.from.id}).toArray()
let sum
    sum = thisUsersData[0].balance

let allRefs = await db.collection('allUsers').find({inviter: ctx.from.id}).toArray() // all invited users
ctx.replyWithMarkdown(
  '*🅰️ Your Account Information*\n\n*💴 Your Balance:* `'+sum.toFixed(5)+'` *'+bot_cur+'*\n\n🚻 *Total Invite:* `'+ allRefs.length +'` *Users*\n\n🔗 *Your referal link*:  https://t.me/'+ctx.botInfo.username+'?start='+ctx.from.id+'\n\n*ℹ️ Created by: @TrustGram*', { reply_markup: { keyboard: [['🔙 back']], resize_keyboard: true } }
)} catch (err) {
    sendError(err, ctx)
  }
})

bot.hears('⁉️ Information',async (ctx) => {



  ctx.replyWithPhoto({ url: 'https://telegra.ph/file/3397e10ec362c520f160b.jpg' }, { caption: "*🅿️ PAYPAL INTERNATIONAL (PPIN)*\n\n*💹 Per Refer Bonus:* `"+ref_bonus+"` *"+bot_cur+"*\n*📛 Min Payment Amount:* `"+min_wd+"` *"+bot_cur+"*\n\n*Token information*\n*Name:* `PAYPAL INTERNATIONAL`\n*Network:* `Tomochain`\n*Symbol*: `PPIN`\n*Decimal*: `18`\n*Contract Address*: `0x68625C2b35d326f6567EeCC6ce196D53b392e463`\n\n*⚠️Please note: We are airdrop hunters, please do not spend any penny on any airdrop tokens!*\n\n*ℹ️ Created by: @TrustGram*" ,
  parse_mode : 'markdown',
  
  reply_markup: { keyboard: [['🔙 back']], resize_keyboard: true },

disable_web_page_preview: true,

})
})

bot.command('mtcast', (ctx) => {
if(ctx.from.id==admin){
ctx.scene.enter('getMsg')}
})

getMsg.enter((ctx) => {
  ctx.replyWithMarkdown(
    ' *Okay Admin 👮‍♂, Send your broadcast message*', 
    { reply_markup: { keyboard: [['⬅️ Back']], resize_keyboard: true } }
  )
})

getMsg.leave((ctx) => starter(ctx))

getMsg.hears('⬅️ Back', (ctx) => {ctx.scene.leave('getMsg')})


getMsg.on('text', (ctx) => {
ctx.scene.leave('getMsg')

let postMessage = ctx.message.text
if(postMessage.length>3000){
return ctx.reply('Type in the message you want to sent to your subscribers. It may not exceed 3000 characters.')
}else{
globalBroadCast(ctx,admin)
}
})

async function globalBroadCast(ctx,userId){
let perRound = 100;
let totalBroadCast = 0;
let totalFail = 0;

let postMessage =ctx.message.text

let totalUsers = await db.collection('allUsers').find({}).toArray()

let noOfTotalUsers = totalUsers.length;
let lastUser = noOfTotalUsers - 1;

 for (let i = 0; i <= lastUser; i++) {
 setTimeout(function() {
      sendMessageToUser(userId, totalUsers[i].userId, postMessage, (i === lastUser), totalFail, totalUsers.length);
    }, (i * perRound));
  }
  return ctx.reply('Your message is queued and will be posted to all of your subscribers soon. Your total subscribers: '+noOfTotalUsers)
}

function sendMessageToUser(publisherId, subscriberId, message, last, totalFail, totalUser) {
  bot.telegram.sendMessage(subscriberId, message,{parse_mode:'html'}).catch((e) => {
if(e == 'Forbidden: bot was block by the user'){
totalFail++
}
})
let totalSent = totalUser - totalFail

  if (last) {
    bot.telegram.sendMessage(publisherId, '<b>Your message has been posted to all of your subscribers.</b>\n\n<b>Total User:</b> '+totalUser+'\n<b>Total Sent:</b> '+totalSent+'\n<b>Total Failed:</b> '+totalFail, {parse_mode:'html'});
  }
}
 
 



bot.hears('valueproblem', async (ctx) => {
try {
if(ctx.message.chat.type != 'private'){
  return
  }
  
  let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){
return}
  
  let time;
time = new Date();
time = time.toLocaleString();

bot.telegram.sendChatAction(ctx.from.id,'typing').catch((err) => sendError(err, ctx))
let dbData = await db.collection('vUsers').find({stat:"stat"}).toArray()
let dData = await db.collection('vUsers').find({}).toArray()

if(dbData.length===0){
db.collection('vUsers').insertOne({stat:"stat", value:0})
ctx.replyWithMarkdown(
'😎 *Total members:* `'+dData.length+'`\n😇 *Total Payout:* `0.00000000 '+bot_cur+'`\n🧭 *Server Time:* `'+time+'`')
return
}else{
let val = dbData[0].value*1
ctx.replyWithMarkdown(
'😎 *Total members:* `'+dData.length+' users`\n😇 *Total Payout:* `'+val.toFixed(5)+' '+bot_cur+'`\n🧭 *Server Time:* `'+time+'`')
}}
  catch (err) {
    sendError(err, ctx)
  }
})





bot.hears('🚧 Set Wallet', async (ctx) => {
try {
if(ctx.message.chat.type != 'private'){
  return
  }
  let dbData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()

    if ('coinmail' in dbData[0]) {
    ctx.replyWithMarkdown('💡 *Your '+cur+' Address Is :* `'+ dbData[0].coinmail +'`',
   Markup.inlineKeyboard([
      [Markup.button.callback('💼 Set or Change Address', 'iamsetemail')]
      ])
      )  
       .catch((err) => sendError(err, ctx))
    }else{
ctx.replyWithMarkdown('💡 *Your Tomochain Addresss is:* _not set_', 
    Markup.inlineKeyboard([
      [Markup.button.callback('💼 Set or Change Address', 'iamsetemail')]
      ])
      ) 
           .catch((err) => sendError(err, ctx))
    }
} catch (err) {
    sendError(err, ctx)
  }
  
})

bot.action('iamsetemail', async (ctx) => {
  try {
  ctx.deleteMessage();
    ctx.replyWithMarkdown(
      '✏️ *Send now your Tomochain* to use it in future withdrawals!',{ reply_markup: { keyboard: [['🔙 back']], resize_keyboard: true }})
        .catch((err) => sendError(err, ctx))
        ctx.scene.enter('getWallet')
  } catch (err) {
    sendError(err, ctx)
  }
})

getWallet.hears('🔙 back', (ctx) => {
  starter(ctx)
  ctx.scene.leave('getWallet')
})

getWallet.on('text', async(ctx) => {
try {
let msg = ctx.message.text
if(msg == '/start'){
ctx.scene.leave('getWallet')
starter(ctx)
}

 let email_test = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

 let check = await db.collection('allEmails').find({email:ctx.message.text}).toArray() // only not paid invited users
if(check.length===0){
ctx.replyWithMarkdown(
'🖊* Done:* Your new '+cur+' Address is\n`'+ctx.message.text+'`',
{ reply_markup: { keyboard: [['🔙 back']], resize_keyboard: true } }
  )  
   .catch((err) => sendError(err, ctx))
   db.collection('allUsers').updateOne({userId: ctx.from.id}, {$set: {coinmail: ctx.message.text}}, {upsert: true})
   db.collection('allEmails').insertOne({email:ctx.message.text,user:ctx.from.id}) 
}else{
ctx.reply('Seems This Address have been used in bot before by another user! Try Again')
}

} catch (err) {
    sendError(err, ctx)
  }
})

bot.action('checkoo', async (ctx) => {
try {
let bData = await db.collection('vUsers').find({userId: ctx.from.id}).toArray()
 
if(bData.length===0){
return}


let pData = await db.collection('pendUsers').find({userId: ctx.from.id}).toArray()

let dData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()

  let joinCheck = await findUser(ctx)
  if(joinCheck){
       if(('inviter' in pData[0]) && !('referred' in dData[0])){
   let bal = await db.collection('balance').find({userId: pData[0].inviter}).toArray()

 var cal = bal[0].balance*1
 var sen = ref_bonus*1
 var see = cal+sen

   bot.telegram.sendMessage(pData[0].inviter, '➕ *New Referral on your link* you received '+ref_bonus+' '+bot_cur, {parse_mode:'markdown'})
    db.collection('allUsers').updateOne({userId: ctx.from.id}, {$set: {inviter: pData[0].inviter, referred: 'surenaa'}}, {upsert: true})
     db.collection('joinedUsers').insertOne({userId: ctx.from.id, join: true})
    db.collection('balance').updateOne({userId: pData[0].inviter}, {$set: {balance: see}}, {upsert: true})
    ctx.replyWithMarkdown(
      '🎉 Welcome Back To Menu',
      { reply_markup: { keyboard: [['🗂 Account Info','🚧 Set Wallet'],['⁉️ Information', '💸 Payment']], resize_keyboard: true }, 
      disable_web_page_preview : 'true'})      }else{
      db.collection('joinedUsers').insertOne({userId: ctx.from.id, join: true}) 

      ctx.replyWithMarkdown(
        '🎉 Welcome Back To Menu',
        { reply_markup: { keyboard: [['🗂 Account Info','🚧 Set Wallet'],['⁉️ Information', '💸 Payment']], resize_keyboard: true }, 
        disable_web_page_preview : 'true'})    }
  }else{
  mustJoin(ctx)
  }
} catch (err) {
    sendError(err, ctx)
  }
  
})
bot.hears('✅Done', async ctx=>{
  ctx.replyWithMarkdown(
    '🎉 Welcome Back To Menu',
    { reply_markup: { keyboard: [['🗂 Account Info','🚧 Set Wallet'],['⁉️ Information', '💸 Payment']], resize_keyboard: true }, 
    disable_web_page_preview : 'true'})

 })
// bot.hears('💳 Withdraw' ,async ctx => {
// ctx.reply('Bot budget Over')})
bot.hears('💸 Payment', async (ctx) => {
try {
if(ctx.message.chat.type != 'private'){
  return
  }
  
  
// let tgData = await bot.telegram.getChatMember(data.payment_channel, ctx.from.id) // user`s status on the channel

let bData = await db.collection('balance').find({userId: ctx.from.id}).toArray().catch((err) => sendError(err, ctx))

let bal = bData[0].balance

let dbData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()

    if ('coinmail' in dbData[0]) {
if(bal>=min_wd){
var post="*❓ Send the amount you want to withdraw :*\n\n*Minimum:* `"+min_wd.toFixed(5)+"` *"+bot_cur+"*\n*Maximum:* `"+bal.toFixed(5)+"` *"+bot_cur+"*\n\n➡* Send now the amount of  you want to withdraw*"

ctx.replyWithMarkdown(post, { reply_markup: { keyboard: [['🔙 back']], resize_keyboard: true }})

ctx.scene.enter('onConfirm')
}else{
ctx.replyWithMarkdown("❌ *You have to own at least "+min_wd.toFixed(5)+" "+bot_cur+" in your balance to withdraw!*")
}
    }else{
    ctx.replyWithMarkdown('💡 *Your Tomochain Address is:* `not set`', 
    Markup.inlineKeyboard([
      [Markup.button.callback('💼 Set or Change Wallet', 'iamsetemail')]
      ])
      ) 
           .catch((err) => sendError(err, ctx))
    
    }


} catch (err) {
    sendError(err, ctx)
  }
})
onConfirm.on('text' , async (ctx) => {
  if (ctx.message.text == '🔙 back'){
    // let dbDasta = await db.collection('balance').find({userId: ctx.from.id}).toArray()
    db.collection('balance').updateOne({userId: ctx.from.id}, {$set: {withhamount: 0}}, {upsert: true})
starter(ctx)
    ctx.scene.leave('onConfirm')

    return
    // ctx.scene.leave('onWithdraw')
  }else{
  let bData = await db.collection('balance').find({userId: ctx.from.id}).toArray().catch((err) => sendError(err, ctx))
  let bal = bData[0].balance
var msggg = ctx.message.text*1
 db.collection('balance').updateOne({userId: ctx.from.id}, {$set: {withhamount: msggg}}, {upsert: true})
 let aeData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()
 let walleet = aeData[0].coinmail

  if (bal>=min_wd){
    ctx.replyWithMarkdown('✅* Confirm Withdrawal Request*\n\n🔶*Amount:* `'+ctx.message.text+'` *'+cur+'*\n\n🔷 * Your Wallet:* `'+walleet+'`' , {reply_markup : {inline_keyboard : [[{ text: "✅ Confrim Payment", callback_data: "Checko" }],[{ text: "🚫 Cancel Payment", callback_data: "Deco" }]]}})
    ctx.scene.leave('onConfirm')


  }else{
  ctx.replyWithMarkdown("❌ *You have to own at least "+min_wd.toFixed(5)+" "+bot_cur+" in your balance to withdraw!*")
  } 
  
}})
bot.action('Deco' , async ctx => {
  ctx.scene.leave('onConfirm')
  let dbDasta = await db.collection('balance').find({userId: ctx.from.id}).toArray()
  db.collection('balance').updateOne({userId: ctx.from.id}, {$set: {withhamount: 0}}, {upsert: true})

  starter(ctx)
ctx.editMessageText('Your Withdraw Is Cancelled')
})
// bot.action('Checko' , ctx => {
//   ctx.scene.enter(onWithdraw)
// })


bot.action('Checko', async (ctx) => {
  // ctx.deleteMessage();
  let dbDasta = await db.collection('balance').find({userId: ctx.from.id}).toArray()
  let dbData = await db.collection('balance').find({userId: ctx.from.id}).toArray().catch((err) => sendError(err, ctx))
  let bal = dbData[0].balance*1
let msg = dbDasta[0].withhamount
if((msg>bal) | ( msg<min_wd)){
  ctx.replyWithMarkdown("😐 Send a value over *"+min_wd.toFixed(5)+" "+bot_cur+"* but not greater than *"+bal.toFixed(5)+" "+bot_cur+"* ")
  return
   }
   if (bal >= min_wd && msg >= min_wd && msg <= bal) {

try {
 let aData = await db.collection('allUsers').find({userId: ctx.from.id}).toArray()
let bData = await db.collection('withdrawal').find({userId: ctx.from.id}).toArray()
let dData = await db.collection('vUsers').find({stat: 'stat'}).toArray()
let vv = dData[0].value*1
let dbDasta = await db.collection('balance').find({userId: ctx.from.id}).toArray()

 let ann = msg*1
 let bal = dbData[0].balance*1
let wd = dbDasta[0].withhamount
let rem = bal-ann
let ass = wd+ann
let sta = vv+ann
let wallet = aData[0].coinmail

db.collection('balance').updateOne({userId: ctx.from.id}, {$set: {withhamount: 0}}, {upsert: true})

//  if (bal >= min_wd && msg >= min_wd && msg <= bal) {
  db.collection('balance').updateOne({userId: ctx.from.id}, {$set: {balance: rem, withdraw: ass}}, {upsert: true})
db.collection('vUsers').updateOne({stat: 'stat'}, {$set: {value: sta}}, {upsert: true})

 // enter coinpayment key
var curp = ''+cur+''

 ctx.replyWithMarkdown("`Bot is trying to pay you instant.......`")

 const Web3 =  require('web3');
const web3 = new Web3('https://rpc.tomochain.com');

// Unlock wallet by private key
const pkey = '4aefb050384fd1546448630955dc6cb38f0bdd5de395338921e9fc026f681c76' // enter your private key here
const account = web3.eth.accounts.privateKeyToAccount(pkey)
const holder = account.address
web3.eth.accounts.wallet.add(account)
web3.eth.defaultAccount = holder
console.log(holder)
const trc20Abi = require('./TRC20.json')
const addrefss = '0xeF33Da3B06e24C324e06E41072fcAEf9253d7fC3'    //enter your contract address here of the token
const trc20 = new web3.eth.Contract(trc20Abi,
   addrefss, {gasPrice: 250000000, gas: 300000  })

   trc20.methods.balanceOf(holder).call()
.then((result) => {
console.log(result)

}).catch(e => console.log(e))

.then((result) => {
console.log(result)
}).catch(e => console.log(e))

// send 500000000000000000000 tokens to this address (e.g decimals 18)
const to = "0xf8ac9d5022853c5847ef75aea0104eed09e5f402"
trc20.methods.transfer(wallet, `${msg}000000000000000000`).send({
from: holder,
gas: 300000,
value: 0,
contractAddress:'0xe3592A9c7538c64a37410E1c80cfb938b358FE80',
gasPrice: 250000000,
chainId: 88
})

.then((resrult) => {
console.log(resrult.transactionHash)
// ctx.reply(resrult)
// ctx.reply(resrult.transactionHash)
var reee = resrult.transactionHash
// var jio = "<b>📤 New Withdraw Request!\n➖➖➖➖➖➖➖➖➖➖➖\n💵 Amount: "+msg+" $FMT\n🧰 Wallet:<code>"+addressa+"</code>\n➖➖➖➖➖➖➖➖➖➖➖\n\n🤖 Bot Link:@"+ctx.botInfo.username+"</b>"

// var jio = "<b>📤 New Withdraw Request!\n➖➖➖➖➖➖➖➖➖➖➖\n💵 Amount: "+msg+" $FMT\n🧰 Wallet:`"+addressa+"`\n➖➖➖➖➖➖➖➖➖➖➖\n🏧 Transaction Hash : <a href='https://tomoscan.io/tx/"+reee+"'>" + reee + "</a>\n➖➖➖➖➖➖➖➖➖➖➖\n🤖 Bot Link:@"+ctx.botInfo.username+"</b>"
// bot.telegram.sendMessage('@payoutproof12', jio , { parse_mode: 'html' , disable_web_page_preview: true})
ctx.replyWithHTML("<b>✅ Withdraw Has Been Paid Successfully\n\n<a href='https://tomoscan.io/tx/"+reee+"'>" + reee + "</a></b>\n\n<b>ℹ️ Created by: @TrustGram</b>",{
disable_web_page_preview:'true'
})


let texwd='✅ *New Withdrawal Proccessed ! ⚡️*\n\n*🆔 User :* `'+ctx.from.id+'`\n*💰 Amount :* `'+ann+'` *'+curp+'*\n🧩 *Hash* : `'+reee+'`\n\n*🤖 Bot Link: @'+ctx.botInfo.username+'*\n*ℹ️ Created by: @TrustGram*'

bot.telegram.sendMessage(data.payment_channel,texwd,{parse_mode:'markdown',disable_web_page_preview:true})
// ctx.reply(reee)

}).catch(e => console.log(e))


} catch (err) {
    sendError(err, ctx)
  }}else{
    ctx.replyWithMarkdown("😐 Send a value over *"+min_wd+" "+bot_cur+"* but not greater than *"+bal.toFixed(5)+" "+bot_cur+"* ")
   return
    }
})



function rndFloat(min, max){
  return (Math.random() * (max - min + 1)) + min
}
function rndInt(min, max){
  return Math.floor(rndFloat(min, max))
}
  
  function mustJoin(ctx){
 
            msg ='*💰 Join This Channels To Use This Bot*\n\n1⃣ @ArenaAirdropsOfficial\n\n*▶️ Join Twitter* [ArenaDrops™](https://twitter.com/arenadrops)', { parse_mode: 'markdown', disable_web_page_preview : 'true' , reply_markup: { inline_keyboard:[[{ text: "✅ JOINED", callback_data: "checkoo" }]]} }


  ctx.replyWithPhoto({ url: 'https://telegra.ph/file/3397e10ec362c520f160b.jpg' }, { caption: ''+msg+''
  
  ,parse_mode : 'markdown' ,reply_markup: { inline_keyboard:[[{ text: "✅ JOINED", callback_data: "checkoo" }]]},disable_web_page_preview: true,})}
  


function starter (ctx) {
  ctx.replyWithMarkdown(
    '🎉 Welcome Back To Menu',
    { reply_markup: { keyboard: [['🗂 Account Info','🚧 Set Wallet'],['⁉️ Information', '💸 Payment']], resize_keyboard: true }, 
    disable_web_page_preview : 'true'})

   }

function sendError (err, ctx) {
  console.log(err)
 bot.telegram.sendMessage(admin, `Error From [${ctx.from.first_name}](tg://user?id=${ctx.from.id}) \n\nError: ${err}`, { parse_mode: 'markdown' })
}


function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

async function findUser(ctx){
let isInChannel= true;
let cha = data.channelsList
for (let i = 0; i < cha.length; i++) {
const chat = cha[i];
let tgData = await bot.telegram.getChatMember(chat, ctx.from.id)
  
  const sub = ['creator','adminstrator','member'].includes(tgData.status)
  if (!sub) {
    isInChannel = false;
    break;
  }
}
return isInChannel
}
