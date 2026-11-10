import assert from 'node:assert/strict';
import test from 'node:test';
import { validateFoodBarcode } from '../src/lib/barcodeValidation.js';

test('accepts valid EAN and UPC product barcodes', () => {
  assert.deepEqual(validateFoodBarcode('4006381333931', 'EAN_13'), {
    code: '4006381333931',
    format: 'EAN-13',
  });
  assert.deepEqual(validateFoodBarcode('96385074', 'EAN_8'), {
    code: '96385074',
    format: 'EAN-8',
  });
  assert.deepEqual(validateFoodBarcode('036000291452', 'UPC_A'), {
    code: '036000291452',
    format: 'UPC-A',
  });
  assert.deepEqual(validateFoodBarcode('04252614', 'UPC_E'), {
    code: '04252614',
    format: 'UPC-E',
  });
});

test('rejects invalid check digits, unsupported formats, and mismatched formats', () => {
  assert.equal(validateFoodBarcode('4006381333932', 'EAN_13'), null);
  assert.equal(validateFoodBarcode('96385075', 'EAN_8'), null);
  assert.equal(validateFoodBarcode('036000291453', 'UPC_A'), null);
  assert.equal(validateFoodBarcode('04252615', 'UPC_E'), null);
  assert.equal(validateFoodBarcode('4006381333931', 'CODE_128'), null);
  assert.equal(validateFoodBarcode('4006381333931', 'EAN_8'), null);
  assert.equal(validateFoodBarcode('random-code', 'EAN_13'), null);
});

test('infers only valid retail formats when the decoder omits its format', () => {
  assert.equal(validateFoodBarcode('4006381333931').format, 'EAN-13');
  assert.equal(validateFoodBarcode('036000291452').format, 'UPC-A');
  assert.equal(validateFoodBarcode('96385074').format, 'EAN-8');
  assert.equal(validateFoodBarcode('04252614').format, 'UPC-E');
  assert.equal(validateFoodBarcode('12345678'), null);
});
