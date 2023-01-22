import inquirer from "inquirer";
import fetch from "node-fetch";
import cheerio from  "cheerio";
import HttpsProxyAgent from "https-proxy-agent";
import * as  dotenv from 'dotenv' 
dotenv.config()
const proxyAgent = new HttpsProxyAgent('http://127.0.0.1:8080');
import puppeteer from "puppeteer";
import { delay } from "underscore";
import { exit } from "process";
import { PassThrough } from "stream";
// import {  } from "body-parser";
const cook =[]
const browser = await puppeteer.launch({
  // headless: false,
  // args: ['--proxy-server=127.0.0.1:8080']
});
const page = await browser.newPage();
var url = [
  "https://www.autodoc.co.uk/spares-search?keyword=",
  "https://www.autodoc.de/search?keyword=",
  "https://www.auto-doc.at/search?keyword=",
  "https://www.auto-doc.it/search?keyword=",

  "https://www.oscaro.com/fr/search?q=",
  "https://www.oscaro.pt/pt/search?q=",
  "https://www.oscaro.be/fr/search?q=",
  "https://www.oscaro.es/es/search?q=",

  // "https://turbo-diesel.co.uk/?post_type=product&s=",
  // "http://turbolader24.ch",
  // "https://www.eurocarparts.com",
  // "http://www.rockauto.com",
  // "https://www.atp-autoteile.de",
  // 'https://www.oreillyauto.com -- server down',
];
var siteNames = [
    "autodoc.co.uk",
    "autodoc.de",
    "auto-doc.at",
    "auto-doc.it",
  
    "oscaro.com",
    "oscaro.pt",
    "oscaro.be",
    "oscaro.es",
  
    "turbo-diesel.co.uk",
    "turbolader24.ch",
    "eurocarparts.com",
    "rockauto.com",
    "atp-autoteile.de",
    'oreillyauto.com',
  
]
// var items = await fetch(process.env.LINK+'items')
// console.log(await items.json())
// exit()
// var items = [
//   '852915-5007S',
//   '757042-9018S',
//   '753020-5006S',
//   '781504-5014S'    
// ]
var items_nos = await fetch(process.env.LINK+'shop/item/').then(res =>res.json())
// console.log(await items_nos)
const r = /:\/\/(.[^/]+)/;
const  today = new Date().toISOString().slice(0, 10);
var finalList = [
//   {
//   item_no:"test_item",
//   site_name:"sample.com",
//   price :123,
//   link:url[0] +'123',
//   date :today
// }
]
var agent = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36";
var cf_clearance = "v0dRrsKyo_zLet0CufexrmG4A3uNHCPP7BcTqPIz6Z8-1662904635-0-250";
const matchString= (a,b) => {
  return a.replace(/[^0-9a-z]/gi, '').toLowerCase()=== b.replace(/[^0-9a-z]/gi, '').toLowerCase();
}
const auto_doc_scrap =  async(html,item,url) => {
  const $ = cheerio.load(html);
  
  var res = await $("ul.list_products > li.item");
  const site = url.match(r)[1].replace("www.","");
    for (const x of res) {
      const str1 = await $(await x).find('.article_number').first().text().split(':')[1];
      if (matchString(str1,item)) {
        var result = await $(await x).find('div.price').text().replace(/[^0-9a-z,]/gi, '').replace(",",".")
        result = eval(result)
        console.log('price',result)
        finalList.push({
          item_no:item,
          site_name:site,
          price :result,
          link:url+item,
          date :today
        })
        break;
      }
    }
    
  }
  const puppet_scrap =async  (count, url, item, agent, cookie) => {
    var r = /:\/\/(.[^/]+)/;
  try {
    let cook = []
    cook .push({ "name":'cf_clearance',"value":cookie,"domain":url.match(r)[1].replace("www","")})
    await page.setUserAgent(await agent)
    await page.setCookie( ... cook);
    await page.goto(await url+item);  
    if (url != "https://www.oscaro.be/fr/search?q=") {
      await page.waitForNavigation() 
    }
    const data = await page.evaluate(  () =>   document.querySelector( '*').outerHTML);
    // await page.screenshot({path: './example2.png'});
    await oscoro_scrap( await data,await item,url)
    console.log( await count, 200);
  } 
  catch (err) {
    console.log(err)
  }
}

const oscoro_scrap =  async(html,item,url) => {
  const $ = await cheerio.load( await html);
  var res = await $( ".productbox");
  for (const x of await res) {
    const str1 = await $(await x).find('.ref-piece').text();
    // console.log(typeof str1 , typeof item)
    if (await str1 && matchString(await str1,await item)) {
      var result = await $(await x).find('p.price').text().replace(/[^0-9a-z,]/gi, '').replace(",",".") 
      const site =  url.match(r)[1].replace("www.","");
      result = await eval( await result) 
      console.log('price',await result,await str1)
      finalList.push({
        item_no:item,
        site_name:site,
        price :result,
        link:url+item,
        date :today
      })
      break;
    }
  }
  
}
const Scraping = async (count, url, item, agent, cookie) => {
  const res = await fetch(url+item, {
    method: "get",
    // agent:proxyAgent,
    headers: {
      "User-Agent": agent,
      Cookie: "cf_clearance=" + cookie
    },
  });
  await auto_doc_scrap(await res.text(),item,url)
  console.log(count, res.status);
};

const scrapRest = async (count, url, item) => {
  const res = await fetch (url+ item)
}

// console.clear();
var ans = await inquirer.prompt([
  {
    name: "choice",
    message: "Scraping : ",
    type: "list",
    choices: ["Start Scraping", "Set User-Agent"],
  },
]);
console.clear();
if (ans.choice !== "Start Scraping") {
  var ans = await inquirer.prompt([
    {
      name: "cookie",
      message: "Enter User-Agent :",
      type: "input",
    },
  ]);
  agent = ans.cookie;
  console.clear();
}
async function main () {
  for (let i = 0; i < url.length;i++ ) {
    var ans = await inquirer.prompt([
      {
        name: "cookie",
        message: "Enter Cookie cf_clearance for the site :" + url[i],
        type: "input",
      },
    ]);
    cf_clearance = ans.cookie;
    for (let j  =0 ; j < items.length; j++) {
      if (i < 4)
      await Scraping(j,url[i],items[j],agent,cf_clearance) ;
      else if (i < 8)
      await puppet_scrap(j,url[i],items[j],agent,cf_clearance);
      // var summa =5 ;
      // else {
      //     await scrapRest(j,url[i],items[j]);
      //   }
      }
      
    }
  }
  
  // exit()
  var items = []
for (let x of await items_nos ) {
  items.push(await x.item_no)
}

await main()
await fetch(process.env.LINK+'/shop/price/',{
  method:'POST',
  body:JSON.stringify(finalList),
  headers: {'Content-Type': 'application/json'}
}).then(res => console.log(" scrapped succesfully !!!"))
.catch(err => console.log(err.message , "please try again !!!"))
console.log(finalList); 

console.log("enter any key to exit !!!")
// code from stack overflow
process.stdin.setRawMode(true);
process.stdin.resume();
process.stdin.on('data', process.exit.bind(process, 0));

// export NODE_TLS_REJECT_UNAUTHORIZED=0