import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

async function enterApp(page) {
  await page.goto('/');
  await page.click('#btn-welcome-start');
}
async function seedDocument(page) {
  return page.evaluate(() => {
    const S = App.state;
    S.addSalary({source:'Primary Job',amount:115000});
    S.addSavings({location:'From Jeth',amount:4600});
    const loan = S.addLoan({name:'GGives',total:102600,paymentAmount:5700,monthsPaid:7});
    S.addLoanToBudget(loan);
    S.addBudget('Rent',9200,null,true);
    const first = S.viewedMonth();
    S.createMonth('2027-12');
    S.addBudget('Future',500);
    S.viewMonth(first);
    App.render.all();
    App.persistence.flush();
    return S.getDocument();
  });
}
async function openExport(page, wipe = false, encrypted = false) {
  await page.click('#btn-header-import');
  await expect(page.locator('#export-wipe')).not.toBeChecked();
  if (wipe) await page.check('#export-wipe');
  if (encrypted) {
    await page.check('#export-encrypt');
    await page.fill('#export-password','backup-password-123');
  }
}
async function downloadDocument(page, format, encrypted = false, enter = false) {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    enter ? page.locator('#export-filename').press('Enter') : page.click('#btn-export-' + format),
  ]);
  const raw = await readFile(await download.path(), 'utf8');
  const doc = await page.evaluate(async ({raw,filename,encrypted}) => App.io.processFile(
    new File([raw],filename,{type:'application/json'}),null,{encrypted,password:'backup-password-123'}
  ), {raw,filename:download.suggestedFilename(),encrypted});
  return {doc,filename:download.suggestedFilename()};
}

test.describe('Welcome introduction', () => {
  for (const dismiss of ['Get started','Close button','Escape','Backdrop']) {
    test(`welcome remembers ${dismiss} dismissal and preserves a direct route`, async ({page}) => {
      await page.goto('/#accounts');
      await expect(page.getByRole('dialog',{name:'Welcome to Budget2Go'})).toBeVisible();
      await expect(page.locator('#welcome-modal')).toContainText('Plan month by month');
      await expect(page.locator('#welcome-modal')).toContainText('Your data stays on this device');
      await expect(page.locator('#btn-welcome-start')).toBeFocused();
      await page.keyboard.press('Tab');
      await expect(page.locator('[data-close-welcome].btn-icon')).toBeFocused();
      await page.keyboard.press('Shift+Tab');
      await expect(page.locator('#btn-welcome-start')).toBeFocused();
      if (dismiss === 'Get started') await page.click('#btn-welcome-start');
      if (dismiss === 'Close button') await page.click('[data-close-welcome].btn-icon');
      if (dismiss === 'Escape') await page.keyboard.press('Escape');
      if (dismiss === 'Backdrop') await page.locator('#welcome-modal').click({position:{x:2,y:2}});
      await expect(page.locator('#welcome-modal')).toBeHidden();
      await expect(page.locator('#view-title')).toHaveText('Accounts');
      await expect(page.locator('#view-title')).toBeFocused();
      await expect(page.locator('#main-content')).not.toHaveAttribute('inert');
      await page.reload();
      await expect(page.locator('#welcome-modal')).toBeHidden();
      expect(await page.evaluate(() => localStorage.getItem('b2g-welcome-seen'))).toBe('true');
    });
  }
  test('existing drafts receive the welcome once without changing their records', async ({page}) => {
    await enterApp(page);
    const before=await seedDocument(page);
    await page.evaluate(() => localStorage.removeItem('b2g-welcome-seen'));
    await page.reload();
    await expect(page.locator('#welcome-modal')).toBeVisible();
    expect(await page.evaluate(() => App.state.getDocument())).toEqual(before);
    await page.click('#btn-welcome-start');
    await page.reload();
    await expect(page.locator('#welcome-modal')).toBeHidden();
  });
  test('welcome dismissal survives a full Settings wipe', async ({page}) => {
    await enterApp(page); await seedDocument(page);
    await page.click('.nav-item[data-view="settings"]');
    page.once('dialog',d=>d.accept()); await page.click('#btn-wipe-data');
    await expect(page.locator('#btn-header-import')).toHaveText('Import');
    await page.reload(); await expect(page.locator('#welcome-modal')).toBeHidden();
  });
  test('unavailable storage still allows a session-only welcome dismissal', async ({page}) => {
    await page.addInitScript(() => {
      const get=Storage.prototype.getItem, set=Storage.prototype.setItem;
      Storage.prototype.getItem=function(key){if(key==='b2g-welcome-seen')throw new Error('Unavailable');return get.call(this,key);};
      Storage.prototype.setItem=function(key,value){if(key==='b2g-welcome-seen')throw new Error('Unavailable');return set.call(this,key,value);};
    });
    await page.goto('/'); await page.click('#btn-welcome-start');
    await page.evaluate(()=>App.ui.showWelcome());
    await expect(page.locator('#welcome-modal')).toBeHidden();
    await page.click('.nav-item[data-view="budget"]');
    await expect(page.locator('#view-budget')).toBeVisible();
  });
});

test.describe('Explicit controls', () => {
  test('account edits require pencil buttons and the month label is centered', async ({page}) => {
    await enterApp(page); await seedDocument(page);
    for(const width of [430,1280]) {
      await page.setViewportSize({width,height:932});
      await page.click('.nav-item[data-view="accounts"]');
      for(const [kind,field] of [['salary','source'],['savings','location']]) {
        const row=page.locator(`#${kind}-body tr[data-id]`);
        await row.locator('.entry-name').click();
        await expect(page.locator('#entry-modal')).toBeHidden();
        await expect(row.locator('.entry-name')).not.toHaveAttribute('data-edit');
        const edit=row.locator('.account-actions [data-edit]'), trash=row.locator('[data-action^="delete-"]');
        const editBox=await edit.boundingBox(), trashBox=await trash.boundingBox();
        expect(editBox.y).toBe(trashBox.y); expect(editBox.x+editBox.width).toBeLessThanOrEqual(trashBox.x);
        await edit.click(); await expect(page.locator('#entry-'+field)).toHaveValue(kind==='salary'?'Primary Job':'From Jeth');
        await page.keyboard.press('Escape');
        if(width===430) expect((await row.boundingBox()).height).toBeLessThanOrEqual(kind==='salary'?133:120);
      }
      await expect(page.locator('#month-picker-button svg')).toHaveCount(0);
      const bar=await page.locator('.month-controls').boundingBox(), label=await page.locator('#selected-month-label').boundingBox();
      expect(Math.abs((label.x+label.width/2)-(bar.x+bar.width/2))).toBeLessThan(1);
      await page.locator('#month-picker-button').focus(); await page.keyboard.press('Enter');
      await expect(page.locator('#month-modal')).toBeVisible(); await page.keyboard.press('Escape');
      await expect(page.locator('#month-picker-button')).toBeFocused();
      await page.click('.nav-item[data-view="loans"]');
      expect(await page.locator('.loan-actions button').evaluateAll(els=>els.map(el=>el.dataset.action || el.dataset.edit))).toEqual(['loan-to-budget','loans','delete-loan']);
    }
  });
});

test.describe('Export and wipe safeguards', () => {
  test.beforeEach(async ({page})=>{await enterApp(page);});
  test('timestamped default uses the budget2go prefix and matches the preview after waiting', async ({page}) => {
    await page.clock.setFixedTime(new Date('2026-10-04T00:06:15+08:00'));
    await seedDocument(page); await openExport(page);
    await expect(page.locator('#export-timestamp')).toBeChecked();
    const preview = await page.locator('#filename-preview').textContent();
    expect(preview).toMatch(/^budget2go_\d{8}_\d{6}\.json$/);
    await expect(page.locator('#export-json-target code')).toHaveText(preview);
    await expect(page.locator('#export-csv-target code')).toHaveText(preview.replace(/\.json$/,'.csv'));
    await page.clock.setFixedTime(new Date('2026-10-04T00:07:15+08:00'));
    const result = await downloadDocument(page,'json');
    expect(result.filename).toBe(preview);
  });
  for (const format of ['json','csv']) for (const encrypted of [false,true]) {
    test(`${encrypted?'encrypted ':'plain '}${format} can export without a timestamp`, async ({page}) => {
      const before = await seedDocument(page); await openExport(page,false,encrypted);
      await page.uncheck('#export-timestamp');
      const filename = 'budget2go.'+(encrypted?'bgo':format);
      await expect(page.locator('#export-'+format+'-target code')).toHaveText(filename);
      await expect(page.locator('#filename-preview')).toHaveText(encrypted?'budget2go.bgo':'budget2go.json');
      const result = await downloadDocument(page,format,encrypted);
      expect(result.filename).toBe(filename); expect(result.doc).toEqual(before);
      await openExport(page);
      await expect(page.locator('#export-timestamp')).not.toBeChecked();
      await page.check('#export-timestamp');
      await expect(page.locator('#filename-preview')).toHaveText(/^budget2go_\d{8}_\d{6}\.json$/);
    });
  }
  test('custom filenames override defaults with and without timestamps', async ({page}) => {
    await seedDocument(page); await openExport(page);
    await page.fill('#export-filename','my backup');
    await expect(page.locator('#export-json-target code')).toHaveText('my_backup.json');
    await page.uncheck('#export-timestamp');
    await expect(page.locator('#filename-preview')).toHaveText('budget2go.json');
    await expect(page.locator('#export-json-target code')).toHaveText('my_backup.json');
    const result = await downloadDocument(page,'json');
    expect(result.filename).toBe('my_backup.json');
    await openExport(page);
    await page.fill('#export-filename','---');
    await expect(page.locator('#export-json-target code')).toHaveText('budget2go.json');
    expect((await downloadDocument(page,'json')).filename).toBe('budget2go.json');
  });
  for(const format of ['json','csv']) for(const encrypted of [false,true]) for(const wipe of [false,true]) {
    test(`${encrypted?'encrypted ':'plain '}${format} ${wipe?'requires confirmation before wiping':'retains records'}`, async ({page}) => {
      const before=await seedDocument(page);
      await openExport(page,wipe,encrypted);
      const result=await downloadDocument(page,format,encrypted);
      expect(result.doc).toEqual(before);
      expect(JSON.stringify(result.doc)).not.toContain('b2g-welcome-seen');
      expect(await page.evaluate(()=>App.state.getDocument())).toEqual(before);
      if(!wipe) {await expect(page.locator('#export-modal')).toBeHidden(); return;}
      await expect(page.locator('#export-heading-label')).toHaveText('Backup download started');
      await expect(page.locator('#export-backup-name')).toHaveText(result.filename);
      await expect(page.locator('#btn-export-keep')).toBeFocused();
      await page.click('#btn-export-wipe-confirm');
      await expect(page.locator('#export-modal')).toBeHidden();
      await expect(page.locator('#view-overview')).toBeVisible();
      await expect(page.locator('#btn-header-import')).toHaveText('Import');
      expect(await page.evaluate(()=>App.state.hasData())).toBe(false);
      expect(await page.evaluate(()=>localStorage.getItem('b2g-document-v2'))).toBeNull();
      await page.reload(); await expect(page.locator('#welcome-modal')).toBeHidden();
      expect(await page.evaluate(()=>App.state.hasData())).toBe(false);
    });
  }
  for(const cancel of ['Keep data','Escape','Close button','Backdrop']) {
    test(`${cancel} cancels wiping after export`, async ({page}) => {
      const before=await seedDocument(page); await openExport(page,true); await downloadDocument(page,'json');
      if(cancel==='Keep data')await page.click('#btn-export-keep');
      if(cancel==='Escape')await page.keyboard.press('Escape');
      if(cancel==='Close button')await page.click('#btn-modal-close');
      if(cancel==='Backdrop')await page.locator('#export-modal').click({position:{x:2,y:2}});
      await expect(page.locator('#export-modal')).toBeHidden();
      expect(await page.evaluate(()=>App.state.getDocument())).toEqual(before);
      await openExport(page); await expect(page.locator('#export-wipe')).not.toBeChecked();
    });
  }
  test('filename Enter uses the same export-and-wipe flow', async ({page}) => {
    const before=await seedDocument(page); await openExport(page,true);
    await page.fill('#export-filename','my-backup');
    const result=await downloadDocument(page,'json',false,true);
    expect(result.filename).toBe('my-backup.json'); expect(result.doc).toEqual(before);
    await expect(page.locator('#export-wipe-confirmation')).toBeVisible();
    await page.click('#btn-export-keep'); expect(await page.evaluate(()=>App.state.hasData())).toBe(true);
  });
  test('preparation blocks dismissal and duplicate exports, and errors never wipe', async ({page}) => {
    const before=await seedDocument(page); await openExport(page,true);
    await page.evaluate(()=>{
      window.exportCalls=0;
      App.io.exportJSON=()=>{window.exportCalls++;return new Promise((resolve,reject)=>{window.rejectExport=reject;});};
    });
    await page.click('#btn-export-json');
    await expect(page.locator('#export-modal')).toHaveAttribute('aria-busy','true');
    await expect(page.locator('#btn-export-json')).toBeDisabled(); await expect(page.locator('#btn-export-csv')).toBeDisabled();
    await expect(page.locator('#btn-modal-close')).toBeDisabled();
    await page.keyboard.press('Escape'); await page.locator('#export-modal').click({position:{x:2,y:2}});
    await page.evaluate(()=>{App.ui.exportFromDialog('json');App.ui.exportFromDialog('csv');});
    expect(await page.evaluate(()=>window.exportCalls)).toBe(1);
    await expect(page.locator('#export-modal')).toBeVisible();
    await page.evaluate(()=>window.rejectExport(new Error('Simulated export failure')));
    await expect(page.locator('#export-status')).toContainText('Simulated export failure');
    await expect(page.locator('#btn-export-json')).toBeEnabled();
    await expect(page.locator('#export-wipe-confirmation')).toBeHidden();
    expect(await page.evaluate(()=>App.state.getDocument())).toEqual(before);
  });
  test('encryption validation keeps financial records and allows retry', async ({page}) => {
    const before=await seedDocument(page); await openExport(page,true);
    await page.check('#export-encrypt'); await page.click('#btn-export-json');
    await expect(page.locator('#export-status')).toContainText('Password');
    expect(await page.evaluate(()=>App.state.getDocument())).toEqual(before);
    await page.fill('#export-password','backup-password-123'); await downloadDocument(page,'json',true);
    await expect(page.locator('#export-wipe-confirmation')).toBeVisible();
  });
  test('confirmed wipe clears preferences, offline resources, calculator and Undo', async ({page}) => {
    await seedDocument(page);
    await page.click('.nav-item[data-view="accounts"]');
    await page.click('#salary-body [data-action="delete-salary"]');
    await expect(page.locator('#undo-snackbar')).toBeVisible();
    await page.click('.nav-item[data-view="settings"]'); await page.selectOption('#theme-select','dark'); await page.uncheck('#grouping-toggle');
    await page.evaluate(async ()=>{
      localStorage.setItem('b2g-currency','USD|en-US');
      await caches.open('workbox-budget2go-test'); await caches.open('unrelated-test');
      const scope=new URL('./',location.href).href;
      const regs=[{scope,unregister:async()=>{window.regs=[];return true;}}]; window.regs=regs;
      Object.defineProperty(navigator.serviceWorker,'getRegistrations',{value:async()=>window.regs,configurable:true});
    });
    await page.click('#btn-calc-fab'); await page.click('[data-calc="9"]'); await page.click('#btn-calc-close');
    await openExport(page,true); await downloadDocument(page,'json'); await page.click('#btn-export-wipe-confirm');
    await expect(page.locator('#export-modal')).toBeHidden();
    await expect(page.locator('#undo-snackbar')).toBeHidden();
    await page.evaluate(()=>document.getElementById('btn-undo').click());
    expect(await page.evaluate(()=>App.state.hasData())).toBe(false);
    await expect(page.locator('#calc-display-result')).toHaveText('0');
    await expect(page.locator('#theme-select')).toHaveValue('system'); await expect(page.locator('#grouping-toggle')).toBeChecked();
    expect(await page.evaluate(()=>['b2g-document-v2','b2g-theme','b2g-grouping','b2g-currency','b2g-last-export'].map(key=>localStorage.getItem(key)))).toEqual([null,null,null,null,null]);
    expect(await page.evaluate(()=>localStorage.getItem('b2g-welcome-seen'))).toBe('true');
    expect(await page.evaluate(()=>caches.keys())).toEqual(['unrelated-test']);
    expect(await page.evaluate(()=>window.regs.length)).toBe(0);
  });
  test('failed saved-draft deletion keeps records and reports the failure', async ({page}) => {
    const before=await seedDocument(page);
    await page.evaluate(()=>{
      const remove=Storage.prototype.removeItem;
      Storage.prototype.removeItem=function(key){if(key==='b2g-document-v2')return;remove.call(this,key);};
    });
    await openExport(page,true); await downloadDocument(page,'json'); await page.click('#btn-export-wipe-confirm');
    await expect(page.locator('#export-modal')).toBeHidden();
    await expect(page.locator('.toast-error .toast-msg')).toContainText('records have been kept');
    expect(await page.evaluate(()=>App.state.getDocument())).toEqual(before);
    await expect(page.locator('#save-status')).toHaveAttribute('data-state','error');
  });
  test('partial offline cleanup reports incomplete deletion without claiming success', async ({page}) => {
    await seedDocument(page); await page.evaluate(()=>{Object.defineProperty(window,'caches',{value:{keys:async()=>['workbox-budget2go-test'],delete:async()=>{throw new Error('Blocked');}},configurable:true});});
    await openExport(page,true); await downloadDocument(page,'csv'); await page.click('#btn-export-wipe-confirm');
    await expect(page.locator('#export-modal')).toBeHidden();
    await expect(page.locator('.toast-msg')).toContainText('cleanup is incomplete: offline caches');
    expect(await page.evaluate(()=>App.state.hasData())).toBe(false);
    await expect(page.locator('#main-content')).not.toHaveAttribute('inert');
  });
  test('an import finishing after closing and wiping cannot restore a preview', async ({page}) => {
    const before=await seedDocument(page); await page.click('.nav-item[data-view="settings"]');
    await page.evaluate((doc)=>{App.io.processFile=()=>new Promise(resolve=>{window.finishImport=()=>resolve(doc);});},before);
    await page.click('#btn-toggle-import');
    await page.locator('#file-input').setInputFiles({name:'old.json',mimeType:'application/json',buffer:Buffer.from('{}')});
    await page.click('#btn-import-submit'); await expect(page.locator('#btn-import-submit')).toHaveText('Reading…');
    await page.keyboard.press('Escape');
    page.once('dialog',d=>d.accept()); await page.click('#btn-wipe-data');
    await expect(page.locator('#btn-header-import')).toHaveText('Import');
    await page.evaluate(()=>window.finishImport());
    await page.click('#btn-header-import');
    await expect(page.locator('#import-preview')).toBeHidden(); await expect(page.locator('#import-preview')).toBeEmpty();
    await expect(page.locator('#btn-import-submit')).toBeDisabled();
    expect(await page.evaluate(()=>App.state.hasData())).toBe(false);
  });
});
