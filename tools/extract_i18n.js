import fs from 'fs';
import path from 'path';

// We will read the files as strings and extract data using regex since they are ES modules
const dataJs = fs.readFileSync(path.resolve('./src/js/data.js'), 'utf8');
const musclesJs = fs.readFileSync(path.resolve('./src/js/muscles_data.js'), 'utf8');

const translations = {};

// Parse Bones
const boneRegex = /\{id:\s*'([^']+)',\s*name:\s*'([^']+)'(?:,\s*latinName:\s*'[^']*')?,\s*category:\s*'([^']+)'(?:,\s*cat:\s*'[^']*')?,\s*description:\s*'([^']+)',\s*fn:\s*'([^']+)'\}/g;
let match;
while ((match = boneRegex.exec(dataJs)) !== null) {
  const [_, id, name, category, desc, fn] = match;
  translations[`bone_name_${id}`] = { en: name, tg: name, ru: name };
  translations[`bone_desc_${id}`] = { en: desc, tg: desc, ru: desc };
  translations[`bone_fn_${id}`] = { en: fn, tg: fn, ru: fn };
}

// Parse Muscles
const muscleRegex = /\{id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*latinName:\s*'[^']+',\s*category:\s*'([^']+)',\s*cat:\s*'[^']+',\s*function:\s*'([^']+)',\s*innervation:\s*'([^']+)',\s*bloodSupply:\s*'([^']+)'/g;
while ((match = muscleRegex.exec(musclesJs)) !== null) {
  const [_, id, name, category, fn, inn, blood] = match;
  translations[`muscle_name_${id}`] = { en: name, tg: name, ru: name };
  translations[`muscle_fn_${id}`] = { en: fn, tg: fn, ru: fn };
  translations[`muscle_inn_${id}`] = { en: inn, tg: inn, ru: inn };
  translations[`muscle_blood_${id}`] = { en: blood, tg: blood, ru: blood };
}

const out = `export const DICT = ${JSON.stringify(translations, null, 2)};\n`;
fs.writeFileSync(path.resolve('./src/js/i18n_dict.js'), out, 'utf8');
console.log('Generated i18n_dict.js');
