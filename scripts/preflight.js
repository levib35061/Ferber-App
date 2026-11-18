// Run before an App Store build/submission: npm run preflight
// Catches things that would ship a broken or placeholder app.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const config = fs.readFileSync(path.join(root, 'src/config.ts'), 'utf8');
const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8')).expo;
const problems = [];

const iosKey = (config.match(/REVENUECAT_IOS_KEY = '([^']*)'/) || [])[1] || '';
if (!iosKey.startsWith('appl_')) problems.push("RevenueCat App Store key (REVENUECAT_IOS_KEY in src/config.ts) is missing: the unlock would say 'Purchases open soon'.");
if (/['"]sk_[A-Za-z0-9]/.test(config)) problems.push('A secret RevenueCat key (sk_...) is in src/config.ts. Remove it.');
if (/['"]sb_secret_/.test(config)) problems.push('A Supabase secret key is in src/config.ts. Remove it.');
if (!app.extra?.eas?.projectId) problems.push('No EAS project id in app.json (run `npx eas-cli@latest init`); push notifications need it.');
if (app.ios?.infoPlist?.ITSAppUsesNonExemptEncryption !== false) problems.push('ITSAppUsesNonExemptEncryption should be false in app.json.');

const eas = JSON.parse(fs.readFileSync(path.join(root, 'eas.json'), 'utf8'));
if (eas.build?.production?.env?.EXPO_PUBLIC_DEMO_TOOLS) problems.push('The production build profile turns on demo tools. Remove EXPO_PUBLIC_DEMO_TOOLS from it.');

if (problems.length) {
  console.error('Not ready for the App Store:\n- ' + problems.join('\n- '));
  process.exit(1);
}
console.log('Preflight passed.');
