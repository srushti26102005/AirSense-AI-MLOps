const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'src', 'pages');
const pages = fs.readdirSync(pagesDir).filter(f => f.endsWith('.jsx'));

pages.forEach(file => {
  const filePath = path.join(pagesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  if (content.includes('<DemoDataBanner />') && !content.includes('DemoDataBanner,') && !content.includes(', DemoDataBanner')) {
    content = content.replace('import { LoadingState, ErrorState }', 'import { LoadingState, ErrorState, DemoDataBanner }');
    content = content.replace('import { StatCard, LoadingState, ErrorState }', 'import { StatCard, LoadingState, ErrorState, DemoDataBanner }');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed import in ${file}`);
  }
});
console.log('Done');


