import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const base=process.env.E2E_BASE_URL??"http://127.0.0.1:4173";
const routes=process.env.E2E_ACADEMY_ONLY
  ? ["/academy"]
  : ["/academy","/academy/courses","/academy/courses/introduction-to-the-world-of-perfumery","/academy/courses/introduction-to-the-world-of-perfumery/lessons/how-to-smell-a-perfume","/library","/hall-archive","/artisan-login","/admin","/chamber-of-creation"];
const browser=await chromium.launch(process.platform==="win32"?{channel:"msedge"}:{});
const screenshotDir=process.env.E2E_SCREENSHOT_DIR;
if(screenshotDir)await mkdir(screenshotDir,{recursive:true});
const results=[];
for(const viewport of [{name:"desktop",width:1440,height:1000},{name:"pixel7",width:412,height:915}]){
  const page=await browser.newPage({viewport});const errors=[];const failed=[];const badResponses=[];
  page.on("console",message=>{if(message.type()==="error")errors.push(message.text());});
  page.on("pageerror",error=>errors.push(error.message));
  page.on("requestfailed",request=>failed.push(`${request.method()} ${request.url()} ${request.failure()?.errorText??"failed"}`));
  page.on("response",response=>{if(response.status()>=400)badResponses.push(`${response.status()} ${response.url()}`);});
  for(const route of routes){errors.length=0;failed.length=0;badResponses.length=0;const response=await page.goto(`${base}${route}`,{waitUntil:"networkidle"});if(screenshotDir&&route==="/academy")await page.screenshot({path:join(screenshotDir,`academy-landing-${viewport.name}.png`),fullPage:true});results.push({viewport:viewport.name,route,status:response?.status()??0,content:(await page.locator("body").innerText()).trim().length,overflow:await page.evaluate(()=>document.documentElement.scrollWidth>window.innerWidth+1),verticalOverflow:await page.evaluate(()=>document.documentElement.scrollHeight>window.innerHeight+1),errors:[...errors],failed:[...failed],badResponses:[...badResponses]});}
  await page.close();
}
await browser.close();
const failures=results.filter(item=>item.status>=400||item.content===0||item.overflow||(item.viewport==="desktop"&&item.route==="/academy"&&item.verticalOverflow)||item.errors.length||item.failed.length);
console.log(JSON.stringify({checks:results.length,failures,results},null,2));
if(failures.length)process.exitCode=1;
