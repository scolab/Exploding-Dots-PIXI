const chars = '+−=()0123456789AaÆᴂɐɑɒBbcɕDdðEeƎəɛɜɜfGgɡɣhHɦIiɪɨᵻɩjJʝɟKklLʟᶅɭMmɱNnɴɲɳŋOoɔᴖᴗɵȢPpɸrRɹɻʁsʂʃTtƫUuᴜᴝʉɥɯɰʊvVʋʌwWxyzʐʑʒꝯᴥβγδθφχнნʕⵡ';
const sup   = '⁺⁻⁼⁽⁾⁰¹²³⁴⁵⁶⁷⁸⁹ᴬᵃᴭᵆᵄᵅᶛᴮᵇᶜᶝᴰᵈᶞᴱᵉᴲᵊᵋᶟᵌᶠᴳᵍᶢˠʰᴴʱᴵⁱᶦᶤᶧᶥʲᴶᶨᶡᴷᵏˡᴸᶫᶪᶩᴹᵐᶬᴺⁿᶰᶮᶯᵑᴼᵒᵓᵔᵕᶱᴽᴾᵖᶲʳᴿʴʵʶˢᶳᶴᵀᵗᶵᵁᵘᶸᵙᶶᶣᵚᶭᶷᵛⱽᶹᶺʷᵂˣʸᶻᶼᶽᶾꝰᵜᵝᵞᵟᶿᵠᵡᵸჼˤⵯ';

export const toSuperScript = (value) => {
      value = value.replace(/<sup[^>]*>(.*?)<\/sup>/g, processSuperscript);
    return value
};

export const processSuperscript = (match, p1) => {
    console.log(match, p1);
    let str = '';
    let txt = p1.trim();
    for (let i = 0; i < txt.length; i++) {
        let n = chars.indexOf(txt[i]);
        str += (n!=-1 ? sup[n] : txt[i]);
    }
    return str;
};
