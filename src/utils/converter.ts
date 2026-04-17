/**
 * convert.ts
 * Transliteration Engine using official Helakuru (Bhasha) Smart Phonetic standards.
 */

/**
 * Vowel modifiers (suffix appended to a consonant)
 * Mapped precisely to Helakuru phonetic rules.
 */
export const vowels: Record<string, string> = {
  'AA': 'ෑ',
  'Aa': 'ෑ',
  'aa': 'ා',
  'A': 'ැ',
  'ii': 'ී',
  'i': 'ි',
  'uu': 'ූ',
  'u': 'ු',
  'ee': 'ේ',
  'e': 'ෙ',
  'ai': 'ෛ',
  'oo': 'ෝ',
  'o': 'ො',
  'au': 'ෞ',
  'a': '', // Removes Hal Kirima
  
  // Specific Helakuru Modifiers
  'ruu': 'ෲ', // kruu -> කෲ
  'ru': 'ෘ',  // kru -> කෘ
};

/**
 * Independent vowels (Words starting with vowels)
 */
export const independentVowels: Record<string, string> = {
  'AA': 'ඈ',
  'Aa': 'ඈ',
  'aa': 'ආ',
  'A': 'ඇ',
  'ii': 'ඊ',
  'i': 'ඉ',
  'uu': 'ඌ',
  'u': 'උ',
  'ee': 'ඒ',
  'e': 'එ',
  'ai': 'ඓ',
  'oo': 'ඕ',
  'o': 'ඔ',
  'au': 'ඖ',
  'a': 'අ',
};

/**
 * Consonants (Base form with hal-kirima ්)
 * Incorporates Helakuru's 'z' prefix and capital letter rules.
 */
export const consonants: Record<string, string> = {
  // Helakuru Sanyaka & Special ('z' prefix)
  'zg': 'ඟ්',
  'zj': 'ඦ්',
  'zd': 'ඬ්',
  'zdh': 'ඳ්',
  'zq': 'ඳ්',
  'zk': 'ඤ්',
  'zh': 'ඥ්',
  
  // Mahaprana (Aspirated)
  'chh': 'ඡ්',
  'thh': 'ථ්',
  'dhh': 'ධ්',
  'kh': 'ඛ්',
  'gh': 'ඝ්',
  'ph': 'ඵ්',
  'bh': 'භ්',
  
  // Standard Modifiers
  'sh': 'ශ්',
  'Sh': 'ෂ්',
  'ch': 'ච්',
  'th': 'ත්',
  'dh': 'ද්',
  
  // Base Capital Letters
  'T': 'ඨ්',
  'D': 'ඪ්',
  'B': 'ඹ්',
  'L': 'ළ්',
  'X': 'ඞ්',
  'H': 'ඃ', // kaH -> කඃ
  
  // Anusvaraya
  'x': 'ං', // kax -> කං
  'zn': 'ං', // kazn -> කං
  
  // Base Simple Letters
  'k': 'ක්',
  'g': 'ග්',
  't': 'ට්',
  'd': 'ඩ්',
  'n': 'න්',
  'p': 'ප්',
  'b': 'බ්',
  'm': 'ම්',
  'y': 'ය්',
  'r': 'ර්',
  'l': 'ල්',
  'v': 'ව්',
  'w': 'ව්',
  's': 'ස්',
  'h': 'හ්',
  'j': 'ජ්',
  'f': 'ෆ්',

};

// Sort by longest string first to ensure 'zga' is checked before 'g'
const vowelKeys = Object.keys(vowels).sort((a, b) => b.length - a.length);
const indVowelKeys = Object.keys(independentVowels).sort((a, b) => b.length - a.length);
const consKeys = Object.keys(consonants).sort((a, b) => b.length - a.length);

/**
 * Converts Singlish string to Sinhala Unicode
 */
export const convertSinglishToUnicode = (text: string): string => {
  let result = text;

  // 1. Convert Word-starting vowels to independent Sinhala vowels
  result = result.replace(/(^|\s)([A-Za-z]+)/g, (match, space, word) => {
    let replaced = word;
    for (const key of indVowelKeys) {
      if (replaced.startsWith(key)) {
        return space + independentVowels[key] + replaced.slice(key.length);
      }
    }
    return match;
  });

  // 2. Consonants + Vowels combination
  for (const cons of consKeys) {
    for (const vow of vowelKeys) {
      const pattern = new RegExp(cons + vow, 'g');
      const sinhalaCons = consonants[cons].replace('්', '');
      const sinhalaVow = vowels[vow];
      result = result.replace(pattern, sinhalaCons + sinhalaVow);
    }
  }

  // 3. Remaining independent consonants
  for (const cons of consKeys) {
    const pattern = new RegExp(cons, 'g');
    result = result.replace(pattern, consonants[cons]);
  }

  // 4. Remaining independent vowels within words
  for (const vow of indVowelKeys) {
    const pattern = new RegExp(vow, 'g');
    result = result.replace(pattern, independentVowels[vow]);
  }

  // 5. Universal Rakaransaya (්‍ර) and Yansaya (්‍ය) ZWJ insertion
  //    Any consonant hal-kirima followed immediately by ර or ය gets a ZWJ
  //    so ligatures render correctly (e.g. shrii -> ශ්‍රී, kya -> ක්‍ය)
  result = result.replace(/\u0DCA\u0DBB/g, '\u0DCA\u200D\u0DBB'); // ්ර -> ්‍ර
  result = result.replace(/\u0DCA\u0DBA/g, '\u0DCA\u200D\u0DBA'); // ්ය -> ්‍ය


  return result;
};

/**
 * Unicode to Legacy (FM Abhaya) converter engine
 * Remains unchanged as FM Abhaya mapping is universal across all keyboards.
 */
export const convertUnicodeToLegacy = (unicodeText: string): string => {
  if (!unicodeText) return '';
  let text = unicodeText;

  // Complex Combinations
  // FM Abhaya doesn't use ZWJ – strip it so map keys match correctly
  // e.g. ශ්‍රී (with ZWJ) becomes ශ්රී (without) before lookup
  text = text.replace(/\u200D/g, '');

  const legacyMap: Record<string, string> = {

    // Rakaransaya (්‍ර) + vowel combinations not covered by extracted map
    // Format: consonant + aS% = cons + Diga Ispilla + Rakaransaya in FM Abhaya
    'ශ්රී': 'YS%', 'ශ්රි': 'Ys%', 'ශ්රා': 'Yd%', 'ශ්රු': 'Yq%', 'ශ්රූ': 'YQ%', 'ශ්රැ': 'Ye%',
    'ශ්ර': 'Ya%',
    'ස්රී': 'iS%', 'ස්රි': 'is%', 'ස්රා': 'id%', 'ස්රු': 'iq%', 'ස්රූ': 'iQ%',
    'ස්ර': 'ia%',
    'ප්රී': 'mS%', 'ප්රි': 'ms%', 'ප්රා': 'md%', 'ප්රු': 'mq%', 'ප්රූ': 'mQ%',
    'ප්ර': 'ma%',
    'න්රී': 'kS%', 'න්රා': 'kd%',
    'න්ර': 'ka%',
    'ම්රී': 'uS%', 'ම්රා': 'ud%',
    'ම්ර': 'ua%',
    'හ්රී': 'yS%', 'හ්රා': 'yd%',
    'හ්ර': 'ya%',
    'ව්රී': 'jS%', 'ව්රා': 'jd%',
    'ව්ර': 'ja%',
    'ල්රා': ',d%', 'ල්රී': ',S%',
    'ල්ර': ',a%',
    'ඛ්රී': 'LS%', 'ඛ්රා': 'Ld%',
    'ඛ්ර': 'La%',
    'ශ්‍රී': 'YS%', 'ශ්‍රේ': 'fYa%',

    // Rakaransaya (ර්‍) + vowel combinations for common consonants
    // Pattern: [cons_char][vowel_char][%]   for ා ి ී ු ූ forms
    //          f[cons_char][%]               for ෙ (kombuva) form
    //          f[cons_char][%]da             for ෝ  /  f[cons_char][%]d for ො
    //          [cons_char]a%                 for standalone (hal-kirima)

    // ක + Rakaransaya
    'ක්රි': 'ls%', 'ක්රී': 'lS%', 'ක්රා': 'ld%', 'ක්රු': 'lq%', 'ක්රූ': 'lQ%',
    'ක්රෙ': 'fl%', 'ක්රේ': 'fla%', 'ක්රෝ': 'fl%da', 'ක්රො': 'fl%d',
    'ක්ර': 'la%',

    // ග + Rakaransaya
    'ග්රි': '.s%', 'ග්රී': '.S%', 'ග්රා': '.d%', 'ග්රු': '.q%', 'ග්රූ': '.Q%',
    'ග්රෙ': 'f.%', 'ග්රේ': 'f.a%', 'ග්රෝ': 'f.%da', 'ග්රො': 'f.%d',
    'ග්ර': '.a%',

    // ත + Rakaransaya
    'ත්රි': ';s%', 'ත්රී': ';S%', 'ත්රා': ';d%', 'ත්රු': ';q%', 'ත්රූ': ';Q%',
    'ත්රෙ': 'f;%', 'ත්රේ': 'f;a%', 'ත්රෝ': 'f;%da', 'ත්රො': 'f;%d',
    'ත්ර': ';a%',

    // ට + Rakaransaya
    'ට්රි': 'á%', 'ට්රී': 'á%', 'ට්රා': 'gd%', 'ට්රු': 'gq%', 'ට්රූ': 'gQ%',
    'ට්රෙ': 'fg%', 'ට්රේ': 'fga%', 'ට්රෝ': 'fg%da', 'ට්රො': 'fg%d',
    'ට්ර': 'ga%',

    // ඩ + Rakaransaya
    'ඩ්රි': 'vs%', 'ඩ්රී': 'vS%', 'ඩ්රා': 'vd%', 'ඩ්රු': 'vq%', 'ඩ්රූ': 'vQ%',
    'ඩ්රෙ': 'fv%', 'ඩ්රේ': 'fva%', 'ඩ්රෝ': 'fv%da', 'ඩ්රො': 'fv%d',
    'ඩ්ර': 'va%',

    // බ + Rakaransaya
    'බ්රි': 'ns%', 'බ්රී': 'nS%', 'බ්රා': 'nd%', 'බ්රු': 'nq%', 'බ්රූ': 'nQ%',
    'බ්රෙ': 'fn%', 'බ්රේ': 'fna%', 'බ්රෝ': 'fn%da', 'බ්රො': 'fn%d',
    'බ්ර': 'na%',

    // ෆ + Rakaransaya
    'ෆ්රි': '*s%', 'ෆ්රී': '*S%', 'ෆ්රා': '*d%', 'ෆ්රු': '*q%', 'ෆ්රූ': '*Q%',
    'ෆ්රෙ': 'f*%', 'ෆ්රේ': 'f*a%', 'ෆ්රෝ': 'f*%da', 'ෆ්රො': 'f*%d',
    'ෆ්ර': '*a%',

    // ඝ + Rakaransaya
    'ඝ්රි': '>s%', 'ඝ්රී': '>S%', 'ඝ්රා': '>d%', 'ඝ්රු': '>q%', 'ඝ්රූ': '>Q%',
    'ඝ්රෙ': 'f>%', 'ඝ්රේ': 'f>a%', 'ඝ්රෝ': 'f>%da', 'ඝ්රො': 'f>%d',
    'ඝ්ර': '>a%',

    // ධ + Rakaransaya
    'ධ්රි': 'Os%', 'ධ්රී': 'OS%', 'ධ්රා': 'Od%', 'ධ්රු': 'Oq%', 'ධ්රූ': 'OQ%',
    'ධ්රෙ': 'fO%', 'ධ්රේ': 'fOa%', 'ධ්රෝ': 'fO%da', 'ධ්රො': 'fO%d',
    'ධ්ර': 'Oa%',

    // භ + Rakaransaya
    'භ්රි': 'Ns%', 'භ්රී': 'NS%', 'භ්රා': 'Nd%', 'භ්රු': 'Nq%', 'භ්රූ': 'NQ%',
    'භ්රෙ': 'fN%', 'භ්රේ': 'fNa%', 'භ්රෝ': 'fN%da', 'භ්රො': 'fN%d',
    'භ්ර': 'Na%',

    // ද + Rakaransaya (common)
    'ද්රි': 'os%', 'ද්රී': 'oS%', 'ද්රා': 'od%', 'ද්රු': 'oq%', 'ද්රූ': 'oQ%',
    'ද්රෙ': 'fo%', 'ද්රේ': 'foa%', 'ද්රෝ': 'fo%da', 'ද්රො': 'fo%d',

    // ස + Rakaransaya
    'ස්රි': 'is%', 'ස්රී': 'iS%', 'ස්රා': 'id%', 'ස්රු': 'iq%', 'ස්රූ': 'iQ%',
    'ස්රෙ': 'fi%', 'ස්රේ': 'fia%', 'ස්රෝ': 'fi%da', 'ස්රො': 'fi%d',
    'ස්ර': 'ia%',

    // ප + Rakaransaya
    'ප්රි': 'ms%', 'ප්රී': 'mS%', 'ප්රා': 'md%', 'ප්රු': 'mq%', 'ප්රූ': 'mQ%',
    'ප්රෙ': 'fm%', 'ප්රේ': 'fma%', 'ප්රෝ': 'fm%da', 'ප්රො': 'fm%d',
    'ප්ර': 'm%',

    // ශ + Rakaransaya (more forms)
    'ශ්රි': 'Ys%', 'ශ්රෙ': 'fY%', 'ශ්රෝ': 'fY%da', 'ශ්රො': 'fY%d', 'ශ්රේ': 'fYa%',
    'ශ්රී': 'YS%', 'ශ්රා': 'Yd%', 'ශ්රු': 'Yq%', 'ශ්රූ': 'YQ%',
    'ශ්ර': 'Ya%',


    // ෛ (AI) vowel combinations - prefixed with 'ff' in FM Abhaya
    'ත්‍රෛ': 'ff;%', 'ශෛ': 'ffY', 'චෛ': 'ffp', 'ජෛ': 'ffc', 'කෛ': 'ffl',
    'මෛ': 'ffu', 'පෛ': 'ffm', 'දෛ': 'ffo', 'තෛ': 'ff;', 'නෛ': 'ffk',
    'ධෛ': 'ffO', 'වෛ': 'ffj', 'ප්‍රෞ': 'fm%!',
    'ෂෛ': 'ffI', 'ළෛ': 'ff<', 'ඨෛ': 'ffG', 'ඩෛ': 'ffv', 'ගෛ': 'ff.', 'හෛ': 'ffy',
    'ලෛ': 'ff,', 'රෛ': 'ffr', 'සෛ': 'ffi', 'ටෛ': 'ffg', 'බෛ': 'ffn', 'යෛ': 'ffh',

    // ෞ (AU) vowel combinations
    'ෂෞ': 'fI!', 'ඡෞ': 'fP!', 'ශෞ': 'fY!', 'බෞ': 'fn!', 'චෞ': 'fp!', 'ඩෞ': 'fv!',
    'ෆෞ': 'f*!', 'ගෞ': 'f.!', 'ජෞ': 'fc!', 'කෞ': 'fl!', 'ලෞ': 'f,!', 'මෞ': 'fu!',
    'නෞ': 'fk!', 'පෞ': 'fm!', 'දෞ': 'fo!', 'රෞ': 'fr!', 'සෞ': 'fi!', 'ටෞ': 'fg!',
    'තෞ': 'f;!', 'භෞ': 'fN!', 'ඤෞ': 'f[!', 'හෞ': 'fy!', 'වෞ': 'fj!', 'යෞ': 'fh!',

    'ඳෝ': 'f|da',


    'ක්ෂෝ': 'fÌda',
    'බෝ': 'fnda',
    'චෝ': 'fpda',
    'ඩෝ': 'fvda',
    'ෆෝ': 'f*da',
    'ගෝ': 'f.da',
    'හෝ': 'fyda',
    'ජෝ': 'fcda',
    'කෝ': 'flda',
    'ලෝ': 'f,da',
    'මෝ': 'fuda',
    'නෝ': 'fkda',
    'පෝ': 'fmda',
    'දෝ': 'foda',
    'රෝ': 'frda',
    'සෝ': 'fida',
    'ටෝ': 'fgda',
    'වෝ': 'fjda',
    'තෝ': 'f;da',
    'භෝ': 'fNda',
    'යෝ': 'fhda',
    'ඤෝ': 'f[da',
    'ධෝ': 'fOda',
    'ථෝ': 'f:da',
    'ෂො': 'fId',
    'ඹො': 'fUd',
    'ඡො': 'fPd',
    'ඪො': 'fVd',
    'ඝො': 'f>d',
    'ඛො': 'fLd',
    'ළො': 'f<d',
    'ඟො': 'fÕd',
    'ණො': 'fKd',
    'ඵො': 'fMd',
    'ඨො': 'fGd',
    'ඬො': 'fËd',
    'ශො': 'fYd',
    'ඥො': 'f{d',
    'ඳො': 'f|d',
    'ක්ෂො': 'fÌd',
    'බො': 'fnd',
    'චො': 'fpd',
    'ඩො': 'fvd',
    'ෆො': 'f*d',
    'ගො': 'f.d',
    'හො': 'fyd',
    'ජො': 'fcd',
    'කො': 'fld',
    'ලො': 'f,d',
    'මො': 'fud',
    'නො': 'fkd',
    'පො': 'fmd',
    'දො': 'fod',
    'රො': 'frd',
    'සො': 'fid',
    'ටො': 'fgd',
    'වො': 'fjd',
    'තො': 'f;d',
    'භො': 'fNd',
    'යො': 'fhd',
    'ඤො': 'f[d',
    'ධො': 'fOd',
    'ථො': 'f:d',
    'ෂේ': 'fIa',
    'ඹේ': 'fò',
    'ඡේ': 'fþ',
    'ඪේ': 'fa',
    'ඝේ': 'f>a',
    'ඛේ': 'fÄ',
    'ළේ': 'f<a',
    'ඟේ': 'fÕa',
    'ණේ': 'fKa',
    'ඵේ': 'fMa',
    'ඨේ': 'fGa',
    'ඬේ': 'få',
    'ශේ': 'fYa',
    'ඥේ': 'f{a',
    'ඳේ': 'f|a',
    'ක්ෂේ': 'fÌa',
    'බේ': 'fí',
    'චේ': 'fÉ',
    'ඩේ': 'fâ',
    'ෆේ': 'f*',
    'ගේ': 'f.a',
    'හේ': 'fya',
    'පේ': 'fma',
    'කේ': 'fla',
    'ලේ': 'f,a',
    'මේ': 'fï',
    'නේ': 'fka',
    'ජේ': 'f–',
    'දේ': 'foa',
    'රේ': 'f¾',
    'සේ': 'fia',
    'ටේ': 'fÜ',
    'වේ': 'fõ',
    'තේ': 'f;a',
    'භේ': 'fNa',
    'යේ': 'fha',
    'ඤේ': 'f[a',
    'ධේ': 'fè',
    'ථේ': 'f:a',
    'ෂෙ': 'fI',
    'ඹෙ': 'fU',
    'ඓ': 'ft',
    'ඡෙ': 'fP',
    'ඪෙ': 'fV',
    'ඝෙ': 'f>',
    'ඛෙ': 'fn',
    'ළෙ': 'f<',
    'ඟෙ': 'fÕ',
    'ණෙ': 'fK',
    'ඵෙ': 'fM',
    'ඨෙ': 'fG',
    'ඬෙ': 'fË',
    'ශෙ': 'fY',
    'ඥෙ': 'f{',
    'ඳෙ': 'fË',
    'ක්ෂෙ': 'fÌ',
    'බෙ': 'fn',
    'චෙ': 'fp',
    'ඩෙ': 'fv',
    'ෆෙ': 'f*',
    'ගෙ': 'f.',
    'හෙ': 'fy',
    'ජෙ': 'fc',
    'කෙ': 'fl',
    'ලෙ': 'f,',
    'මෙ': 'fu',
    'නෙ': 'fk',
    'පෙ': 'fm',
    'දෙ': 'fo',
    'රෙ': 'fr',
    'සෙ': 'fi',
    'ටෙ': 'fg',
    'වෙ': 'fj',
    'තෙ': 'f;',
    'භෙ': 'fN',
    'යෙ': 'fh',
    'ඤෙ': 'f[',
    'ධෙ': 'fO',
    'ථෙ': 'f:',
    'තු': ';=',
    'ගු': '.=',
    'කු': 'l=',
    'තූ': ';+',
    'ගූ': '.+',
    'කූ': 'l+',
    'රු': 're',
    'රූ': 'rE',
    'ආ': 'wd',
    'ඇ': 'we',
    'ඈ': 'wE',
    'ඌ': 'W!',
    'ඖ': 'T!',
    'ඒ': 'ta',
    'ඕ': '´',
    'ඳි': '¢',
    'ඳී': '£',
    'දූ': '¥',
    'දී': '§',
    'ලූ': 'Æ',
    'ර්ය': '©',
    'ඳූ': 'ª',
    'ර්': '¾',
    'ඨි': 'À',
    'ඨී': 'Á',
    'ඡී': 'Â',
    'ඛ්': 'Ä',
    'ඛි': 'Å',
    'ලු': '¨',
    'ඛී': 'Ç',
    'දි': 'È',
    'ච්': 'É',
    'ජ්': '–',
    'රී': 'Í',
    'ඪී': 'Ð,',
    'චි': 'Ñ',
    'ථී': 'Ó',
    'ජී': '„',
    'චී': 'Ö',
    'ඞ්': 'û',
    'ඵී': 'Ú',
    'ට්': 'Ü',
    'ඵි': 'Ý',
    'රි': 'ß',
    'ටී': 'à',
    'ටි': 'á',
    'ඩ්': 'â',
    'ඩී': 'ã',
    'ඩි': '',
    'ඬ්': 'å',
    'ඬි': 'ç',
    'ධ්': 'è',
    'ඬී': 'é',
    'ධි': 'ê',
    'ධී': 'ë',
    'බි': 'ì',
    'බ්': 'í',
    'බී': 'î',
    'ම්': 'ï',
    'ජි': 'ð',
    'මි': 'ñ',
    'ඹ්': 'ò',
    'මී': 'ó',
    'ඹි': 'ô',
    'ව්': 'õ',
    'ඹී': 'ö',
    'ඳු': '÷',
    'ද්ර': 'ø',
    'වී': 'ù',
    'වි': 'ú',
    'ඞී': 'ü',
    'ඡි': '‰',
    'ඡ්': 'þ',
    'දු': 'ÿ',
    'ර්ණ': '“',
    'ණී': 'KS',
    'ඤු': '™',
    'ග': '.',
    'ළු': '¿',
    'ෂ': 'I',
    'ං': 'x',
    'ඃ': '#',
    'ඹ': 'U',
    'ඡ': 'P',
    'ඪ': 'V',
    'ඝ': '>',
    'ඊ': 'B',
    'ඣ': 'CO',
    'ඛ': 'L',
    'ළ': '<',
    'ඟ': 'Õ',
    'ණ': 'K',
    'ඵ': 'M',
    'ඨ': 'G',
    '\"': ',',
    ':': '(',
    'ෆ': '*',
    'ල': ',',
    '-': '-',
    'රැ': '/',
    'ථ': ':',
    'ත': ';',
    'රෑ': '?',
    'ක': 'l',
    'ෘ': 'D',
    'ෑ': 'E',
    'න': 'k',
    'භ': 'N',
    'ධ': 'O',
    'ඍ': 'R',
    'ඔ': 'T',
    'උ': 'W',
    'ශ': 'Y',
    'ඤ': '[',
    'ඉ': 'b',
    'ජ': 'c',
    'ට': 'g',
    'ය': 'h',
    'ස': 'i',
    'ව': 'j',
    'ප': 'm',
    'බ': 'n',
    'ද': 'o',
    'ච': 'p',
    'ර': 'r',
    'එ': 't',
    'ඒ': 'tA',
    'ම': 'u',
    'ඩ': 'v',
    'අ': 'w',
    'හ': 'y',
    'ඥ': '{',
    'ඳ': '|',
    'ක්ෂ': 'laI',
    'ැ': 'e',
    'ෙ': 'f',
    'ු': 'q',
    'ි': 's',
    'ූ': 'Q',
    'ී': 'S',
    'ෲ': 'DD',
    'ෟ': '!',
    'ා': 'd',
    '්': 'a',
    '￫': '^',
    '￩': '&',
    'ￔ': '‐`',
    'ￓ': '@',
    'ￒ': 'æ',
    'ￏ': '}',
    'ￎ': '~',
    'ￍ': '¤',
    'ￌ': '•',
    'ￊ': '›',
    'ﾶ': '∙',
    'ￕ': ']'
  };

  for (const [uni, leg] of Object.entries(legacyMap).sort((a,b) => b[0].length - a[0].length)) {
    text = text.split(uni).join(leg);
  }

  const SinhalaConsonants = '[\u0D9A-\u0DC6]';
  text = text.replace(new RegExp(`(${SinhalaConsonants})\u0DD9`, 'g'), 'f$1');

  return text;
};