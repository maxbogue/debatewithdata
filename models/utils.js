const ID_CHARS = '0123456789abcdef';

export function genId(n = 12) {
  let chars = [];
  for (let i = 0; i < n; i++) {
    chars.push(ID_CHARS[Math.floor(Math.random() * ID_CHARS.length)]);
  }
  return chars.join('');
}

export function genRevId() {
  return genId(24);
}
