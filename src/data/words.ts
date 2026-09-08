export interface WordPair {
  en: string;
  zh: string;
  pinyin?: string;
}

export const WORD_BANK: WordPair[] = [
  // Animals
  { en: 'Cat', zh: '猫', pinyin: 'māo' },
  { en: 'Dog', zh: '狗', pinyin: 'gǒu' },
  { en: 'Fish', zh: '鱼', pinyin: 'yú' },
  { en: 'Bird', zh: '鸟', pinyin: 'niǎo' },
  { en: 'Horse', zh: '马', pinyin: 'mǎ' },
  { en: 'Rabbit', zh: '兔', pinyin: 'tù' },
  { en: 'Tiger', zh: '虎', pinyin: 'hǔ' },
  { en: 'Dragon', zh: '龙', pinyin: 'lóng' },
  { en: 'Snake', zh: '蛇', pinyin: 'shé' },
  { en: 'Monkey', zh: '猴', pinyin: 'hóu' },
  // Food & Drink
  { en: 'Water', zh: '水', pinyin: 'shuǐ' },
  { en: 'Rice', zh: '米', pinyin: 'mǐ' },
  { en: 'Tea', zh: '茶', pinyin: 'chá' },
  { en: 'Apple', zh: '苹果', pinyin: 'píngguǒ' },
  { en: 'Bread', zh: '面包', pinyin: 'miànbāo' },
  { en: 'Egg', zh: '蛋', pinyin: 'dàn' },
  { en: 'Milk', zh: '奶', pinyin: 'nǎi' },
  { en: 'Noodle', zh: '面', pinyin: 'miàn' },
  { en: 'Fruit', zh: '水果', pinyin: 'shuǐguǒ' },
  { en: 'Meat', zh: '肉', pinyin: 'ròu' },
  // Nature
  { en: 'Sun', zh: '日', pinyin: 'rì' },
  { en: 'Moon', zh: '月', pinyin: 'yuè' },
  { en: 'Star', zh: '星', pinyin: 'xīng' },
  { en: 'Fire', zh: '火', pinyin: 'huǒ' },
  { en: 'Wind', zh: '风', pinyin: 'fēng' },
  { en: 'Rain', zh: '雨', pinyin: 'yǔ' },
  { en: 'Snow', zh: '雪', pinyin: 'xuě' },
  { en: 'Cloud', zh: '云', pinyin: 'yún' },
  { en: 'Tree', zh: '树', pinyin: 'shù' },
  { en: 'Flower', zh: '花', pinyin: 'huā' },
  // People & Body
  { en: 'Person', zh: '人', pinyin: 'rén' },
  { en: 'Hand', zh: '手', pinyin: 'shǒu' },
  { en: 'Eye', zh: '眼', pinyin: 'yǎn' },
  { en: 'Heart', zh: '心', pinyin: 'xīn' },
  { en: 'Head', zh: '头', pinyin: 'tóu' },
  { en: 'Child', zh: '子', pinyin: 'zǐ' },
  { en: 'Mother', zh: '母', pinyin: 'mǔ' },
  { en: 'Father', zh: '父', pinyin: 'fù' },
  // Numbers & Time
  { en: 'One', zh: '一', pinyin: 'yī' },
  { en: 'Two', zh: '二', pinyin: 'èr' },
  { en: 'Three', zh: '三', pinyin: 'sān' },
  { en: 'Day', zh: '天', pinyin: 'tiān' },
  { en: 'Year', zh: '年', pinyin: 'nián' },
  { en: 'Time', zh: '时', pinyin: 'shí' },
  // Places & Things
  { en: 'Mountain', zh: '山', pinyin: 'shān' },
  { en: 'River', zh: '河', pinyin: 'hé' },
  { en: 'Sea', zh: '海', pinyin: 'hǎi' },
  { en: 'Earth', zh: '地', pinyin: 'dì' },
  { en: 'Door', zh: '门', pinyin: 'mén' },
  { en: 'Book', zh: '书', pinyin: 'shū' },
  { en: 'Car', zh: '车', pinyin: 'chē' },
  { en: 'Ship', zh: '船', pinyin: 'chuán' },
  { en: 'House', zh: '屋', pinyin: 'wū' },
  { en: 'Road', zh: '路', pinyin: 'lù' },
  // Colors
  { en: 'Red', zh: '红', pinyin: 'hóng' },
  { en: 'Blue', zh: '蓝', pinyin: 'lán' },
  { en: 'Green', zh: '绿', pinyin: 'lǜ' },
  { en: 'White', zh: '白', pinyin: 'bái' },
  { en: 'Black', zh: '黑', pinyin: 'hēi' },
  { en: 'Gold', zh: '金', pinyin: 'jīn' },
  // Actions & Qualities
  { en: 'Love', zh: '爱', pinyin: 'ài' },
  { en: 'Big', zh: '大', pinyin: 'dà' },
  { en: 'Small', zh: '小', pinyin: 'xiǎo' },
  { en: 'Good', zh: '好', pinyin: 'hǎo' },
  { en: 'Happy', zh: '乐', pinyin: 'lè' },
  { en: 'Eat', zh: '吃', pinyin: 'chī' },
  { en: 'Run', zh: '跑', pinyin: 'pǎo' },
  { en: 'Read', zh: '读', pinyin: 'dú' },
  { en: 'Write', zh: '写', pinyin: 'xiě' },
  { en: 'Speak', zh: '说', pinyin: 'shuō' },
];

export function getRandomWords(count: number, exclude?: WordPair): WordPair[] {
  const shuffled = [...WORD_BANK].sort(() => Math.random() - 0.5);
  const filtered = exclude ? shuffled.filter(w => w.zh !== exclude.zh) : shuffled;
  return filtered.slice(0, count);
}

export function generateRound(numOptions: number): { target: WordPair; options: WordPair[] } {
  const shuffled = [...WORD_BANK].sort(() => Math.random() - 0.5);
  const target = shuffled[0];
  const distractors = shuffled.slice(1, numOptions);
  const options = [target, ...distractors].sort(() => Math.random() - 0.5);
  return { target, options };
}
