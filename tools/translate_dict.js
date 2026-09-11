import fs from 'fs';
import path from 'path';
import { DICT } from '../src/js/i18n_dict.js';

const rules = [
  // Names
  { en: /Bone/g, tg: 'Устухон', ru: 'Кость' },
  { en: /Muscle/g, tg: 'Мушак', ru: 'Мышца' },
  { en: /\(R\)/g, tg: '(Р)', ru: '(П)' },
  { en: /\(L\)/g, tg: '(Ч)', ru: '(Л)' },
  { en: /Right/g, tg: 'Рост', ru: 'Правый' },
  { en: /Left/g, tg: 'Чап', ru: 'Левый' },
  { en: /Vertebra/g, tg: 'Муҳра', ru: 'Позвонок' },
  { en: /Rib/g, tg: 'Қабурға', ru: 'Ребро' },
  { en: /Phalanx/g, tg: 'Фаланга', ru: 'Фаланга' },
  { en: /Metacarpal/g, tg: 'Метакарпал', ru: 'Пястная кость' },
  { en: /Metatarsal/g, tg: 'Метатарсал', ru: 'Плюсневая кость' },
  { en: /Proximal/g, tg: 'Проксималӣ', ru: 'Проксимальная' },
  { en: /Distal/g, tg: 'Дисталӣ', ru: 'Дистальная' },
  { en: /Middle/g, tg: 'Миёна', ru: 'Средняя' },
  
  // Skull
  { en: /Frontal/g, tg: 'Пешонӣ', ru: 'Лобная' },
  { en: /Parietal/g, tg: 'Фарқ', ru: 'Теменная' },
  { en: /Temporal/g, tg: 'Чакка', ru: 'Височная' },
  { en: /Occipital/g, tg: 'Паси сар', ru: 'Затылочная' },
  
  // Muscles
  { en: /Flexor/g, tg: 'Қаткунанда', ru: 'Сгибатель' },
  { en: /Extensor/g, tg: 'Росткунанда', ru: 'Разгибатель' },
  { en: /Abductor/g, tg: 'Дуркунанда', ru: 'Абдуктор' },
  { en: /Adductor/g, tg: 'Наздиккунанда', ru: 'Аддуктор' },
  { en: /Longus/g, tg: 'Дароз', ru: 'Длинная' },
  { en: /Brevis/g, tg: 'Кӯтоҳ', ru: 'Короткая' },
  { en: /Magnus/g, tg: 'Калон', ru: 'Большая' },
  { en: /Minimus/g, tg: 'Хурд', ru: 'Малая' },
  { en: /Medius/g, tg: 'Миёна', ru: 'Средняя' },
  { en: /Maximus/g, tg: 'Калонтарин', ru: 'Большая' },
  
  // Common description words
  { en: /Forms/g, tg: 'Ташкил медиҳад', ru: 'Образует' },
  { en: /Protects/g, tg: 'Муҳофизат мекунад', ru: 'Защищает' },
  { en: /Supports/g, tg: 'Дастгирӣ мекунад', ru: 'Поддерживает' },
  { en: /Allows/g, tg: 'Имкон медиҳад', ru: 'Позволяет' },
  { en: /Provides/g, tg: 'Таъмин мекунад', ru: 'Обеспечивает' },
  { en: /Attaches/g, tg: 'Пайваст мешавад', ru: 'Прикрепляется' },
  { en: /Connects/g, tg: 'Мепайвандад', ru: 'Соединяет' },
  { en: /the/g, tg: '', ru: '' }, // English article
  { en: /a/g, tg: '', ru: '' },
  { en: /and/g, tg: 'ва', ru: 'и' },
  { en: /of/g, tg: 'аз', ru: 'из' },
];

for (const key in DICT) {
  let tgText = DICT[key].en;
  let ruText = DICT[key].en;
  
  rules.forEach(rule => {
    tgText = tgText.replace(rule.en, rule.tg);
    ruText = ruText.replace(rule.en, rule.ru);
  });
  
  // Clean up double spaces
  DICT[key].tg = tgText.replace(/\s+/g, ' ').trim();
  DICT[key].ru = ruText.replace(/\s+/g, ' ').trim();
}

const out = `export const DICT = ${JSON.stringify(DICT, null, 2)};\n`;
fs.writeFileSync(path.resolve('./src/js/i18n_dict.js'), out, 'utf8');
console.log('Translated i18n_dict.js');
