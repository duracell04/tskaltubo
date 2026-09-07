// Local static-site verification. Supply agent-browser executable as argument 3.
import { execFileSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const origin = process.argv[2] ?? 'http://127.0.0.1:4183';
const binary = process.argv[3] ?? 'agent-browser';
const session = 'tsk-property-chromium';
const output = path.resolve('.verification/property-first');
mkdirSync(output, { recursive: true });
const checks = [], pages = [];
function run(...args) {
  if (args[0] === 'click' || args[0] === 'focus') run('scrollintoview', args[1]);
  const result = JSON.parse(execFileSync(binary, ['--session', session, '--json', ...args], { encoding: 'utf8', timeout: 30000 }));
  if (!result.success) throw new Error(JSON.stringify(result));
  return result.data;
}
function evaluate(fn) {
  const code = `(async()=>{await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));return (${fn.toString()})();})()`;
  return run('eval', '-b', Buffer.from(code).toString('base64')).result;
}
function assert(value, message) {
  if (!value) throw new Error(message);
  checks.push(message);
}
function page(url) { run('open', `${origin}${url}`); run('wait', '--load', 'networkidle'); }
function rows() { return evaluate(() => document.querySelectorAll('.inventory-table tbody tr').length); }
function save(name) { run('screenshot', path.join(output, `${name}.png`)); }

run('errors', '--clear');
run('console', '--clear');
page('/en/');
run('set', 'viewport', '1440', '1000');
assert(rows() === 22, 'Homepage renders all 22 properties');
assert(evaluate(() => !document.querySelector('[data-nextjs-dialog]')), 'No framework error overlay');
assert(evaluate(() => !document.querySelector('main').innerText.includes('5.30%')), 'Homepage omits screening yield');
assert(evaluate(() => document.querySelectorAll('.main-navigation a').length === 4), 'Four primary destinations');
save('desktop-inventory');
run('click', '.inventory-filter-details summary');
run('fill', '.inventory-search input', 'Philiali');
assert(rows() === 1, 'Alias search matches Filiali');
run('fill', '.inventory-search input', '29.08.35.065');
assert(rows() === 1, 'Cadastral search finds Intourist');
run('fill', '.inventory-search input', 'no-such-property');
assert(rows() === 0 && evaluate(() => document.querySelector('.empty-state').textContent.includes('No properties')), 'Search empty state is visible');
run('click', '.inventory-filters button');
run('select', '.inventory-filters label:nth-child(1) select', 'state');
run('select', '.inventory-filters label:nth-child(2) select', 'requires_rehabilitation');
run('select', '.inventory-filters label:nth-child(5) select', 'audit-shortlist');
assert(rows() === 2, 'Combined ownership, development and shortlist filters');
run('click', '.inventory-filters button');
run('select', '.inventory-filters label:nth-child(3) select', 'live_auction');
assert(rows() === 0, 'No historical auction appears as a confirmed live offer');
run('click', '.inventory-filters button');
run('select', '.inventory-filters label:nth-child(4) select', 'undated');
assert(rows() === 1 && evaluate(() => document.querySelector('.inventory-table tbody').textContent.includes('Legends')), 'Undated operating listing remains undated');
run('click', '.inventory-filters button');
run('fill', '.inventory-search input', 'rkinigzeli');
run('click', '.inventory-table .property-name');
run('wait', '.property-profile');
assert(evaluate(() => document.querySelector('#prices').textContent.includes('5,131,000') && document.querySelector('#prices').textContent.includes('5,135,000')), 'Rkinigzeli retains both prices');
run('click', '.conflict-note .property-citations a:first-child');
run('wait', '#source-register');
assert(evaluate(() => { const target = document.getElementById(location.hash.slice(1)); return target?.innerText.includes('Conditional auction') && target.getBoundingClientRect().top >= 0 && target.getBoundingClientRect().top < innerHeight; }), 'Price evidence link reaches its dated source passage');
assert(evaluate(() => document.getElementById(location.hash.slice(1)).querySelector('a').href.includes('postid=3577')), 'Evidence links to the original NASP document');
page('/en/sanatoriums/tskaltubo-rustaveli-48/');
assert(evaluate(() => document.querySelector('#prices').textContent.includes('2,600,000') && document.querySelector('#prices').textContent.includes('11,262,000')), 'Tskaltubo profile preserves conflicting transaction scope');
save('desktop-property');
page('/en/news/');
assert(evaluate(() => document.querySelector('.news-item').id === 'reversions-june-2026'), 'News is ordered by publication date');
run('click', '.news-item:first-child .property-news-links a:first-child');
run('wait', '.property-profile');
assert(evaluate(() => location.pathname.includes('/medea/')), 'News links to affected property');
page('/en/project/');
assert(evaluate(() => document.querySelectorAll('.concept-card').length === 7), 'Project retains all seven scenarios');
run('click', '.project-links a:first-child');
run('wait', '.calculator');
assert(evaluate(() => document.querySelector('main').innerText.includes('Historical eleven-property audit analysis')), 'Calculator identifies its historical audit scope');
const baseline = evaluate(() => ({ summary: document.querySelector('.live-summary').innerText, reference: document.querySelector('.screening-reference').innerText, renovation: [...document.querySelectorAll('label')].find(e => e.textContent.includes('Renovation')).querySelector('input').value }));
run('find', 'label', 'Renovation · EUR / m²', 'fill', String(Number(baseline.renovation) + 100));
assert(evaluate(() => document.querySelector('.live-summary').innerText) !== baseline.summary, 'Calculator renovation edit changes results');
assert(evaluate(() => document.querySelector('.screening-reference').innerText) === baseline.reference, 'Calculator report reference remains unchanged');
run('click', '.calculator > .section-heading button');
assert(evaluate(() => document.querySelector('.live-summary').innerText) === baseline.summary, 'Calculator reset restores baseline');

for (const locale of ['en', 'de', 'ka']) {
  for (const suffix of ['', 'sanatoriums/', 'sanatoriums/intouristi/', 'sanatoriums/rkinigzeli/', 'sanatoriums/legends/', 'news/', 'project/', 'sources/', 'finance/']) {
    page(`/${locale}/${suffix}`);
    assert(!run('errors').errors.length, `${locale}/${suffix}: no browser errors`);
    for (const width of [360, 768, 1440]) {
      run('set', 'viewport', String(width), '900');
      const metrics = evaluate(() => ({
        overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
        heading: document.querySelector('h1')?.textContent,
        overlay: !!document.querySelector('[data-nextjs-dialog]'),
        failedResources: performance.getEntriesByType('resource').filter(r => r.responseStatus >= 400).map(r => r.name),
        unlabeled: [...document.querySelectorAll('input,select,textarea')].filter(e => !e.closest('label') && !e.getAttribute('aria-label') && !document.querySelector(`label[for="${e.id}"]`)).length,
      }));
      pages.push({ locale, suffix, width, ...metrics });
      assert(!metrics.overflow && metrics.heading && !metrics.overlay && !metrics.unlabeled && !metrics.failedResources.length, `${locale}/${suffix} ${width}px: content, labels, resources and no page overflow`);
      if (width === 360 && ['', 'sanatoriums/intouristi/', 'sources/'].includes(suffix)) save(`${locale}-${suffix.replaceAll('/', '-') || 'home'}-mobile`);
    }
  }
  console.log(`Browser layout checks complete: ${locale}`);
}
page('/en/sanatoriums/');
run('set', 'viewport', '390', '844');
run('focus', '.mobile-menu > summary');
run('press', 'Enter');
assert(evaluate(() => document.querySelector('.mobile-menu').open), 'Keyboard opens the mobile menu');
assert(evaluate(() => getComputedStyle(document.activeElement).outlineStyle !== 'none'), 'Keyboard focus is visible');
run('click', '.mobile-menu nav a:nth-child(2)');
run('wait', '.news-list');
assert(evaluate(() => !document.querySelector('.mobile-menu').open && location.pathname === '/en/news/'), 'Mobile menu navigates and closes');
page('/en/finance/?property=intouristi#main-content');
run('select', '.mobile-language select', 'de');
run('wait', '[lang="de"].site-shell');
assert(evaluate(() => location.pathname === '/de/finance/' && location.search === '?property=intouristi' && location.hash === '#main-content'), 'Language switch preserves property query and fragment');
page('/en/sanatoriums/');
run('focus', '.inventory-table-wrap');
run('press', 'ArrowRight');
assert(evaluate(() => document.querySelector('.inventory-table-wrap').scrollLeft > 0), 'Inventory table scrolls with keyboard on mobile');
page('/en/sources/');
run('click', '.request-panel button');
assert(evaluate(() => document.querySelector('.request-panel [role=status]').textContent.length > 0), 'Copy request provides success or manual-copy feedback');
assert(evaluate(() => ![...document.querySelectorAll('iframe,img')].some(e => /map/i.test(e.src))), 'No unsupported map markers');
const pageErrors = run('errors');
const consoleMessages = run('console');
assert(!pageErrors.errors.length, 'No browser errors across the complete flow');
writeFileSync(path.join(output, 'results.json'), JSON.stringify({ checks, pages, pageErrors, consoleMessages }, null, 2));
console.log(JSON.stringify({ checks: checks.length, viewportChecks: pages.length, pageErrors, consoleMessages }, null, 2));
