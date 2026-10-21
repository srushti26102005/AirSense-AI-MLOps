const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const pages = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

const inlineBanner1 = `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e0f2fe', padding: '12px 16px', borderRadius: 'var(--radius-md)', color: '#0369a1', fontSize: '0.875rem' }}>
        <span>⚠️ Note: Data displayed is for demonstration purposes and does not represent live CPCB metrics.</span>
      </div>`;
const inlineBanner2 = `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e0f2fe', padding: '12px 16px', borderRadius: 'var(--radius-md)', color: '#0369a1', fontSize: '0.875rem' }}>
        <span>Data Source: Mock / Demo Data</span>
      </div>`;
const inlineBanner3 = `<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e0f2fe', padding: '12px 16px', borderRadius: 'var(--radius-md)', color: '#0369a1', fontSize: '0.875rem' }}>
        <span>Data Source: Demo Data — Not connected to live environmental APIs.</span>
        <span>Last Updated: {formatDate(new Date())}</span>
      </div>`;

pages.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  if (content.includes(inlineBanner1)) {
    content = content.replace(inlineBanner1, `<DemoDataBanner />`);
    changed = true;
  }
  if (content.includes(inlineBanner2)) {
    content = content.replace(inlineBanner2, `<DemoDataBanner />`);
    changed = true;
  }
  if (content.includes(inlineBanner3)) {
    content = content.replace(inlineBanner3, `<DemoDataBanner />`);
    changed = true;
  }

  // Also replace any variants of the banner
  const regex = /<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#e0f2fe'.*?<\/div>/s;
  if (regex.test(content)) {
    content = content.replace(regex, `<DemoDataBanner />`);
    changed = true;
  }

  if (changed) {
    if (!content.includes('DemoDataBanner')) {
      // Need to add import
      if (content.includes('import { LoadingState, ErrorState')) {
        content = content.replace('import { LoadingState, ErrorState', 'import { LoadingState, ErrorState, DemoDataBanner');
      } else if (content.includes('import { StatCard, LoadingState, ErrorState }')) {
        content = content.replace('import { StatCard, LoadingState, ErrorState }', 'import { StatCard, LoadingState, ErrorState, DemoDataBanner }');
      }
    }
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
console.log('Done');
