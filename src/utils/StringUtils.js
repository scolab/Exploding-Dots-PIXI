const chars = '0123456789';
const sup = '⁰¹²³⁴⁵⁶⁷⁸⁹';

export const processSuperscript = (text) => {
  let str = '';
  const txt = text.trim();
  for (let i = 0; i < txt.length; i++) {
    const n = chars.indexOf(txt[i]);
    str += (n != -1 ? sup[n] : txt[i]);
  }
  return str;
};

export const addSuperscriptWhereNeeded = (text) => {
  let txt = text.trim();
  for (let i = 0; i < txt.length; i++) {
    if (txt[i] === 'x' || txt[i] === 'X') {
      if (txt.length > (i + 1)) {
        const n = chars.indexOf(txt[i + 1]);
        if (n != -1) {
          txt = setCharAt(txt, i + 1, sup[n]);
        }
      }
    }
  }
  return txt;
};

export const setCharAt = (str, index, chr) => {
  if (index > str.length - 1) return str;
  return str.substr(0, index) + chr + str.substr(index + 1);
};

export const replaceAt = (text, index, replacement) => {
  return text.substr(0, index) + replacement + text.substr(index - 1 + replacement.length);
};


export const superscriptToNormal = (text) => {
  let txt = text.trim();
  for (let i = 0; i < txt.length; i++) {
    const n = sup.indexOf(txt[i]);
    if (n != -1) {
      txt = setCharAt(txt, i, chars[n]);
    }
  }
  return txt;
};
