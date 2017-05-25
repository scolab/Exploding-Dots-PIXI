const chars = '0123456789';
const sup = '⁰¹²³⁴⁵⁶⁷⁸⁹';

export const processSuperscript = (text: string): string => {
  let str = '';
  const txt = text.trim();
  for (let i = 0; i < txt.length; i += 1) {
    const n = chars.indexOf(txt[i]);
    str += (n !== -1 ? sup[n] : txt[i]);
  }
  return str;
};

export const setCharAt = (str: string, index: number, chr: string): string => {
  if (index > str.length - 1) {
    return str;
  }
  return str.substr(0, index) + chr + str.substr(index + 1);
};

export const addSuperscriptWhereNeeded = (text: string): string => {
  let txt: string = text.trim();
  for (let i = 0; i < txt.length; i += 1) {
    if (txt[i] === 'x' || txt[i] === 'X') {
      if (txt.length > (i + 1)) {
        const n = chars.indexOf(txt[i + 1]);
        if (n !== -1) {
          txt = setCharAt(txt, i + 1, sup[n]);
        }
      }
    }
  }
  return txt;
};

export const replaceAt = (text: string, index: number, replacement: string): string => {
  return text.substr(0, index) + replacement + text.substr((index - 1) + replacement.length);
};

export const superscriptToNormal = (text: string): string => {
  let txt: string = text.trim();
  for (let i = 0; i < txt.length; i += 1) {
    const n: number = sup.indexOf(txt[i]);
    if (n !== -1) {
      txt = setCharAt(txt, i, chars[n]);
    }
  }
  return txt;
};
