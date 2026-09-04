const { test, expect } = require('@playwright/test');
const site='http://127.0.0.1:4173', key='hosisHubPrototypeV1';
async function enter(page, member){await page.goto(site);if(member){await page.locator('#welcomeUser').selectOption(member);await page.locator('#continueUser').click();}else await page.getByRole('button',{name:'Continue as Admin'}).click();}
async function state(page){return page.evaluate(k=>JSON.parse(localStorage.getItem(k)),key);}

test('five equal desktop modules sit directly below KPIs with Members below them',async({page})=>{
  const errors=[];page.on('pageerror',e=>errors.push(e.message));await enter(page);const before=await state(page);
  for(const width of [1366,1440,1920]){
    await page.setViewportSize({width,height:1080});
    await expect(page.locator('.control-center-grid>.panel')).toHaveCount(5);
    expect(await page.locator('.control-center-grid>.panel h3').allTextContents()).toEqual(['Projects','Team Overview','Project Schedule','Projects by Stage','Project Tasks']);
    const geometry=await page.locator('#content').evaluate(el=>{
      const boxes=[...el.querySelectorAll('.control-center-grid>.panel')].map(p=>{const r=p.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,bottom:r.bottom};});
      return {boxes,kpiBottom:el.querySelector('.role-stat-grid').getBoundingClientRect().bottom,membersTop:el.querySelector('.dashboard-members').getBoundingClientRect().top};
    });
    expect(geometry.boxes[0].y).toBeGreaterThanOrEqual(geometry.kpiBottom);
    expect(geometry.boxes[0].y-geometry.kpiBottom).toBeLessThan(40);
    for(const [i,box] of geometry.boxes.entries()){
      expect(Math.abs(box.y-geometry.boxes[0].y)).toBeLessThan(2);
      expect(Math.abs(box.width-geometry.boxes[0].width)).toBeLessThan(2);
      expect(box.height).toBeGreaterThan(300);
      if(i)expect(box.x).toBeGreaterThan(geometry.boxes[i-1].x+geometry.boxes[i-1].width);
      expect(geometry.membersTop).toBeGreaterThanOrEqual(box.bottom);
    }
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    await page.screenshot({path:`test-results/dashboard-markup-${width}.png`,fullPage:true});
  }
  await expect(page.locator('.compact-project-list [data-project]')).toHaveCount(12);
  await expect(page.locator('.compact-schedule-row')).toHaveCount(12);
  expect(await page.locator('.compact-stage').count()).toBeGreaterThan(12);
  await expect(page.locator('.stage-bars .stage-track')).toHaveCount(6);
  await expect(page.locator('.dashboard-member-card')).toHaveCount(8);
  await expect(page.getByRole('button',{name:'Add Member',exact:true})).toBeVisible();
  const maya=page.locator('.dashboard-member-card[data-member-filter="maya"]');
  for(const text of ['Maya Chen','Active projects','Open tasks','Overdue tasks'])await expect(maya).toContainText(text);
  expect((await state(page)).projects).toEqual(before.projects);expect(errors).toEqual([]);
});

test('member cards and team rows open scoped workspaces with the exact requested section order',async({page})=>{
  await enter(page);const s=await state(page);
  for(const selector of ['.dashboard-member-card[data-member-filter="maya"]','.team-overview-row[data-member-filter="maya"]']){
    await page.locator(selector).click();
    expect(await page.locator('[data-member-section]').evaluateAll(els=>els.map(el=>el.dataset.memberSection))).toEqual(['projects','tasks','deadlines','meetings','schedule','activity']);
    const ids=await page.locator('.dashboard-projects [data-project]').evaluateAll(els=>els.map(el=>el.dataset.project));
    expect(ids).toEqual(s.projects.filter(p=>p.lifecycle!=='Archived'&&p.assigned.includes('maya')).map(p=>p.id));
    await page.getByRole('button',{name:'Company View'}).click();
  }
  await page.getByLabel('Switch role').click();await page.locator('#welcomeUser').selectOption('maya');await page.locator('#continueUser').click();
  expect(await page.locator('[data-member-section]').evaluateAll(els=>els.map(el=>el.dataset.memberSection))).toEqual(['projects','tasks','deadlines','meetings','schedule','activity']);
  await expect(page.locator('[data-add-dashboard-member]')).toHaveCount(0);
  await expect(page.locator('.control-center-grid')).toHaveCount(0);
  await expect(page.locator('[data-view="settings"]')).toHaveCount(0);
});

test('Add Member persists without replacing demo records and supports member entry',async({page})=>{
  await enter(page);const before=await state(page);
  await page.getByRole('button',{name:'Add Member',exact:true}).click();
  await page.getByLabel('Display Name',{exact:true}).fill('Jordan Avery');
  await page.getByLabel('Job Title',{exact:true}).fill('Project Coordinator');
  await page.getByLabel('Email',{exact:true}).fill('jordan@example.com');
  await page.getByRole('button',{name:'Save Changes'}).click();
  await expect(page.locator('.dashboard-member-card')).toHaveCount(9);
  const after=await state(page),id=Object.keys(after.members).find(id=>after.members[id].email==='jordan@example.com');
  expect(id).toBeTruthy();expect(after.members[id].workspaceId).toBe(after.workspace.id);
  expect(after.projects).toEqual(before.projects);
  for(const id of Object.keys(before.members))expect(after.members[id]).toEqual(before.members[id]);
  await page.locator('.dashboard-member-card').filter({hasText:'Jordan Avery'}).click();
  await page.getByRole('button',{name:'Edit profile',exact:true}).click();
  await page.getByLabel('Job Title',{exact:true}).fill('Senior Project Coordinator');
  await page.getByRole('button',{name:'Save Changes'}).click();
  await expect(page.locator('.member-personal-header')).toContainText('Senior Project Coordinator');
  await page.reload();await page.locator('#welcomeUser').selectOption(id);await page.locator('#continueUser').click();
  await expect(page.getByRole('heading',{name:'Welcome, Jordan',exact:true})).toBeVisible();
  await expect(page.locator('.dashboard-projects .project-card')).toHaveCount(0);
  await expect(page.locator('[data-view="members"]')).toHaveCount(0);
});

test('dashboard panels remain usable on phone, landscape and tablet',async({page})=>{
  await enter(page);
  for(const viewport of [{width:375,height:844},{width:844,height:390},{width:1024,height:900}]){
    await page.setViewportSize(viewport);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    for(const panel of await page.locator('.control-center-grid>.panel').all())await expect(panel).toBeVisible();
    await expect(page.locator('.dashboard-member-card')).toHaveCount(8);
  }
});
