import { chromium } from "@playwright/test";

const base=process.env.E2E_BASE_URL??"http://127.0.0.1:4173";
const routes=["/academy","/academy/courses","/academy/courses/introduction-to-the-world-of-perfumery","/academy/courses/introduction-to-the-world-of-perfumery/lessons/how-to-smell-a-perfume","/library","/hall-archive","/artisan-login","/admin","/chamber-of-creation"];
const browser=await chromium.launch(process.platform==="win32"?{channel:"msedge"}:{});
const results=[];
for(const viewport of [{name:"desktop",width:1440,height:1000},{name:"pixel7",width:412,height:915}]){
  const page=await browser.newPage({viewport});const errors=[];const failed=[];
  page.on("console",message=>{if(message.type()==="error")errors.push(message.text());});
  page.on("pageerror",error=>errors.push(error.message));
  page.on("requestfailed",request=>failed.push(`${request.method()} ${request.url()} ${request.failure()?.errorText??"failed"}`));
  for(const route of routes){errors.length=0;failed.length=0;const response=await page.goto(`${base}${route}`,{waitUntil:"networkidle"});results.push({viewport:viewport.name,route,status:response?.status()??0,content:(await page.locator("body").innerText()).trim().length,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1),errors:[...errors],failed:[...failed]});}
  await page.close();
}
await browser.close();
const failures=results.filter(item=>item.status>=400||item.content===0||item.overflow||item.errors.length||item.failed.length);
console.log(JSON.stringify({checks:results.length,failures,results},null,2));
if(failures.length)process.exitCode=1;
