const test = require('node:test');
const assert = require('node:assert/strict');
const T = require('../js/core.js');

test('каталог: у всех товаров есть известный вид, прожарка и заварка', () => {
  const ids = new Set();
  for (const p of T.PRODUCTS) {
    assert.ok(T.TYPES[p.type], p.id);
    assert.ok(T.ROASTS[p.roast], p.id);
    assert.ok(p.brew.temp > 0 && p.brew.time > 0 && p.brew.steeps > 0, p.id);
    assert.ok(!ids.has(p.id), 'дубль ' + p.id);
    ids.add(p.id);
  }
});

test('фильтр по виду, прожарке и цене', () => {
  const oolongs = T.filterProducts(T.PRODUCTS, { types: ['oolong'] });
  assert.ok(oolongs.length > 0);
  assert.ok(oolongs.every((p) => p.type === 'oolong'));

  const darkCheap = T.filterProducts(T.PRODUCTS, { roast: '3', maxPrice: 650 });
  assert.ok(darkCheap.every((p) => p.roast === 3 && p.price <= 650));
  assert.deepEqual(darkCheap.map((p) => p.id).sort(), ['hojicha', 'lapsang', 'mugi']);
});

test('поиск ищет по нотам и региону без учёта регистра', () => {
  assert.deepEqual(T.filterProducts(T.PRODUCTS, { query: 'ТАЙВАНЬ' }).map((p) => p.id), ['dongding']);
  assert.ok(T.filterProducts(T.PRODUCTS, { query: 'мёд' }).length >= 2);
  assert.equal(T.filterProducts(T.PRODUCTS, { query: 'кофейные зёрна' }).length, 0);
});

test('сортировка по цене', () => {
  const asc = T.filterProducts(T.PRODUCTS, { sort: 'price_asc' }).map((p) => p.price);
  assert.deepEqual(asc, asc.slice().sort((a, b) => a - b));
  const desc = T.filterProducts(T.PRODUCTS, { sort: 'price_desc' });
  assert.equal(desc[0].id, 'dahongpao');
});

test('цена за вес: оптовая скидка и округление до 10 ₽', () => {
  assert.equal(T.weightPrice(610, 50), 610);
  assert.equal(T.weightPrice(610, 100), 1160);
  assert.equal(T.weightPrice(610, 250), 2750);
  assert.throws(() => T.weightPrice(610, 70));
});

test('купаж: цена складывается из основы, добавок, веса и банки', () => {
  const p = T.blendPrice({ base: 'b-hojicha', additives: ['orange', 'cinnamon'], weight: 100, jar: true });
  assert.deepEqual(p, { perHundred: 1380, total: 1570 });
  const small = T.blendPrice({ base: 'b-ivan', additives: [], weight: 50, jar: false });
  assert.equal(small.total, 280);
  const big = T.blendPrice({ base: 'b-sencha', additives: ['mint'], weight: 200, jar: false });
  assert.equal(big.total, 1980);
});

test('купаж: ошибки при неверных данных', () => {
  assert.throws(() => T.blendPrice({ base: 'nope', additives: [], weight: 100 }), /основ/);
  assert.throws(() => T.blendPrice({ base: 'b-red', additives: ['salt'], weight: 100 }), /добавка/);
  assert.throws(() => T.blendPrice({ base: 'b-red', additives: ['mint', 'rose', 'orange', 'ginger', 'berry'], weight: 100 }));
});

test('не больше четырёх добавок, повторный выбор снимает добавку', () => {
  let list = [];
  for (const id of ['mint', 'rose', 'orange', 'ginger', 'berry']) list = T.toggleAdditive(list, id);
  assert.deepEqual(list, ['mint', 'rose', 'orange', 'ginger']);
  assert.deepEqual(T.toggleAdditive(list, 'rose'), ['mint', 'orange', 'ginger']);
});

test('цвет настоя: без добавок совпадает с основой, добавки его смещают', () => {
  assert.equal(T.mixColor('#b9763a', []), '#b9763a');
  const mixed = T.mixColor('#000000', ['#ffffff']);
  assert.match(mixed, /^#[0-9a-f]{6}$/);
  assert.notEqual(mixed, '#000000');
  assert.equal(mixed, '#272727');
});

test('генератор частиц детерминирован', () => {
  const a = T.seeded('x'), b = T.seeded('x');
  for (let i = 0; i < 5; i++) {
    const v = a();
    assert.equal(v, b());
    assert.ok(v >= 0 && v < 1);
  }
});

test('корзина: добавление объединяет одинаковые позиции, не мутирует исходник', () => {
  const empty = [];
  let cart = T.cartAdd(empty, { key: 'a@50', price: 100, qty: 1 });
  cart = T.cartAdd(cart, { key: 'a@50', price: 100, qty: 2 });
  cart = T.cartAdd(cart, { key: 'b@100', price: 300 });
  assert.equal(empty.length, 0);
  assert.deepEqual(cart.map((x) => [x.key, x.qty]), [['a@50', 3], ['b@100', 1]]);
  assert.equal(T.cartSetQty(cart, 'a@50', 0).length, 1);
});

test('итоги: промокод, порог бесплатной доставки, самовывоз', () => {
  const cart = [{ key: 'a', price: 1400, qty: 2 }];
  let t = T.cartTotals(cart, 'courier', '');
  assert.deepEqual([t.subtotal, t.shipping, t.total], [2800, 350, 3150]);
  t = T.cartTotals(cart, 'courier', ' жар10 ');
  assert.deepEqual([t.discount, t.promoValid, t.shipping, t.total], [280, true, 350, 2870]);
  t = T.cartTotals([{ key: 'a', price: 1500, qty: 2 }], 'post', '');
  assert.equal(t.shipping, 0);
  t = T.cartTotals(cart, 'pickup', 'нет-такого');
  assert.deepEqual([t.shipping, t.promoValid, t.total], [0, false, 2800]);
  assert.equal(T.cartTotals([], 'courier').total, 0);
});

test('телефон нормализуется в +7 (9XX) XXX-XX-XX', () => {
  assert.equal(T.normalizePhone('8 912 345 67 89'), '+7 (912) 345-67-89');
  assert.equal(T.normalizePhone('+7(912)3456789'), '+7 (912) 345-67-89');
  assert.equal(T.normalizePhone('9123456789'), '+7 (912) 345-67-89');
  assert.equal(T.normalizePhone('8 495 123 45 67'), null);
  assert.equal(T.normalizePhone('12345'), null);
});

test('валидация оформления', () => {
  const ok = { name: 'Анна', phone: '89123456789', email: 'a@mail.ru', delivery: 'courier', address: 'Казань, Баумана 19', agree: true };
  assert.deepEqual(T.validateCheckout(ok), {});
  assert.deepEqual(T.validateCheckout({ ...ok, delivery: 'pickup', address: '' }), {});
  const bad = T.validateCheckout({ name: '1', phone: '123', email: 'a@b', delivery: 'courier', address: 'дом', agree: false });
  assert.deepEqual(Object.keys(bad).sort(), ['address', 'agree', 'email', 'name', 'phone']);
  assert.ok(T.validateCheckout({ ...ok, delivery: 'drone' }).delivery);
});

test('формат рублей с неразрывными пробелами', () => {
  assert.equal(T.formatRub(1570), '1 570 ₽');
  assert.equal(T.formatRub(280), '280 ₽');
});
