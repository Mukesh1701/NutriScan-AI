function hasValidCheckDigit(code) {
  const body = code.slice(0, -1);
  const sum = [...body].reverse().reduce(
    (total, digit, index) => total + Number(digit) * (index % 2 === 0 ? 3 : 1),
    0
  );
  return (10 - (sum % 10)) % 10 === Number(code.at(-1));
}

function isValidUpcE(code) {
  if (!/^[01]\d{7}$/.test(code)) return false;

  const [numberSystem, ...rest] = code;
  const digits = rest.slice(0, 6);
  const checkDigit = rest[6];
  const [d1, d2, d3, d4, d5, d6] = digits;

  let upcABody;
  if (Number(d6) <= 2) {
    upcABody = `${numberSystem}${d1}${d2}${d6}0000${d3}${d4}${d5}`;
  } else if (d6 === '3') {
    upcABody = `${numberSystem}${d1}${d2}${d3}00000${d4}${d5}`;
  } else if (d6 === '4') {
    upcABody = `${numberSystem}${d1}${d2}${d3}${d4}00000${d5}`;
  } else {
    upcABody = `${numberSystem}${d1}${d2}${d3}${d4}${d5}0000${d6}`;
  }

  return hasValidCheckDigit(`${upcABody}${checkDigit}`);
}

const validators = {
  EAN_13: (code) => /^\d{13}$/.test(code) && hasValidCheckDigit(code),
  EAN_8: (code) => /^\d{8}$/.test(code) && hasValidCheckDigit(code),
  UPC_A: (code) => /^\d{12}$/.test(code) && hasValidCheckDigit(code),
  UPC_E: isValidUpcE,
};

const formatLabels = {
  EAN_13: 'EAN-13',
  EAN_8: 'EAN-8',
  UPC_A: 'UPC-A',
  UPC_E: 'UPC-E',
};

export function validateFoodBarcode(rawCode, rawFormat) {
  const code = String(rawCode ?? '').trim();
  if (!/^\d+$/.test(code)) return null;

  const format = String(rawFormat ?? '').toUpperCase().replace(/[\s-]+/g, '_');
  const candidates = format
    ? [format]
    : code.length === 8
      ? ['EAN_8', 'UPC_E']
      : code.length === 12
        ? ['UPC_A']
        : code.length === 13
          ? ['EAN_13']
          : [];

  for (const candidate of candidates) {
    if (validators[candidate]?.(code)) {
      return { code, format: formatLabels[candidate] };
    }
  }

  return null;
}
