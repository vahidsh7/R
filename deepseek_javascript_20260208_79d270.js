// Save as fix-links.mjs
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_PATH = '/R/'; // Your base path
const SRC_DIR = path.join(__dirname, 'src');

async function updateFile(filePath) {
  try {
    let content = await fs.readFile(filePath, 'utf8');
    let originalContent = content;

    // 1. Fix common `toUrl` function patterns
    // Matches: return `/${lang}/posts/${slug}/`;
    // Becomes: return `${import.meta.env.BASE_URL}${lang}/posts/${slug}/`;
    content = content.replace(
      /return\s+`\/(\$\{?lang\}?)\/posts\/(\$\{?[a-zA-Z0-9_]+\}?)\/`;/g,
      `return \`\${import.meta.env.BASE_URL}\$1/posts/\$2/\`;`
    );

    // 2. Fix href attributes in .astro files
    // Matches: href={`/${lang}/posts/${slug}/`}
    // Becomes: href={`${import.meta.env.BASE_URL}${lang}/posts/${slug}/`}
    content = content.replace(
      /href=\{\`\/(\$\{?lang\}?)\/posts\/(\$\{?[a-zA-Z0-9_]+\}?)\/\`\}/g,
      `href={\`\${import.meta.env.BASE_URL}\$1/posts/\$2/\`}`
    );

    // 3. Fix other absolute /[lang]/ paths
    // Matches: `/${lang}/category/`, `/${lang}/tags/`, etc.
    content = content.replace(
      /\`\/(\$\{?lang\}?)\/(posts|category|tags|author|search)/g,
      `\`\${import.meta.env.BASE_URL}\$1/\$2`
    );

    if (content !== originalContent) {
      await fs.writeFile(filePath, content, 'utf8');
      console.log(`✅ Updated: ${path.relative(__dirname, filePath)}`);
      return true;
    }
    return false;
  } catch (err) {
    console.error(`❌ Error processing ${filePath}:`, err.message);
    return false;
  }
}

async function processFiles(dir) {
  try {
    const files = await fs.readdir(dir, { withFileTypes: true });
    
    for (const file of files) {
      const fullPath = path.join(dir, file.name);
      
      if (file.isDirectory()) {
        await processFiles(fullPath);
      } else if (
        file.name.endsWith('.astro') || 
        file.name.endsWith('.js') || 
        file.name.endsWith('.ts') ||
        file.name.endsWith('.jsx') || 
        file.name.endsWith('.tsx')
      ) {
        await updateFile(fullPath);
      }
    }
  } catch (err) {
    console.error(`❌ Error reading directory ${dir}:`, err.message);
  }
}

async function main() {
  console.log('🚀 Starting to fix internal links...');
  console.log(`📁 Scanning: ${SRC_DIR}`);
  console.log(`🎯 Base path will be: ${BASE_PATH}`);
  
  try {
    await processFiles(SRC_DIR);
    console.log('✨ Link fixing complete!');
    console.log('\n📋 Next steps:');
    console.log('1. Run `pnpm run build` to test locally');
    console.log('2. Check dist/ folder for correct links');
    console.log('3. Commit & push to trigger GitHub Pages deployment');
  } catch (err) {
    console.error('💥 Script failed:', err);
  }
}

// Run the script
main();
