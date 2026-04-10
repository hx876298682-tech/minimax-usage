const JavaScriptObfuscator = require('javascript-obfuscator');
const fs = require('fs');
const path = require('path');

const files = ['input.html', 'widget.html', 'main.js', 'preload.js'];

files.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) return;

  let content = fs.readFileSync(filePath, 'utf8');

  if (file.endsWith('.html')) {
    // For HTML, obfuscate script content
    const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
    if (scriptMatch) {
      const scriptContent = scriptMatch[1];
      const obfuscated = JavaScriptObfuscator.obfuscate(scriptContent, {
        compact: true,
        controlFlowFlattening: true,
        deadCodeInjection: true,
        stringArray: true,
        stringArrayThreshold: 0.75,
        numbersToExpressions: true,
        simplify: true,
      }).getObfuscatedCode();

      content = content.replace(scriptMatch[1], obfuscated);
      fs.writeFileSync(filePath, content);
      console.log(`Obfuscated: ${file}`);
    }
  } else if (file.endsWith('.js')) {
    const obfuscated = JavaScriptObfuscator.obfuscate(content, {
      compact: true,
      controlFlowFlattening: true,
      deadCodeInjection: true,
      stringArray: true,
      stringArrayThreshold: 0.75,
      numbersToExpressions: true,
      simplify: true,
    }).getObfuscatedCode();

    fs.writeFileSync(filePath, obfuscated);
    console.log(`Obfuscated: ${file}`);
  }
});

console.log('Obfuscation complete!');
