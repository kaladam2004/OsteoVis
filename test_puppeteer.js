import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
  page.on('requestfailed', request => {
     console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
  });
  
  await page.goto('http://localhost:5173/');
  
  // Wait a bit for load
  await new Promise(r => setTimeout(r, 3000));
  
  const fallback = await page.$eval('#fallback-msg', el => el.innerHTML).catch(e => null);
  if(fallback) {
      console.log('Fallback UI is visible!');
  } else {
      console.log('App loaded successfully!');
  }
  
  await browser.close();
})();
