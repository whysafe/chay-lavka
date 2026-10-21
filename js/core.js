/* Данные и чистая логика магазина: работает и в браузере (window.Tea), и в Node (module.exports). */
(function (root) {
  'use strict';

  var TYPES = {
    green: 'Зелёный',
    oolong: 'Улун',
    red: 'Красный',
    puer: 'Пуэр',
    herbal: 'Травяной'
  };

  var ROASTS = { 1: 'Лёгкая', 2: 'Средняя', 3: 'Глубокая' };

  // price: рублей за 50 г
  var PRODUCTS = [
    { id: 'hojicha', name: 'Ходзича с углей', type: 'green', roast: 3, price: 640, region: 'Сидзуока, Япония',
      leaf: '#8a5a2b', liquor: '#b9763a', notes: ['карамель', 'жареный орех', 'дымок'],
      brew: { temp: 90, time: 40, steeps: 3 },
      text: 'Стебли и листья сенчи прожариваем на древесных углях до цвета каштана. Кофеина почти нет, можно пить вечером.' },
    { id: 'lunjing', name: 'Лунцзин из котла', type: 'green', roast: 1, price: 780, region: 'Ханчжоу, Китай',
      leaf: '#9aa64a', liquor: '#d8d27a', notes: ['каштан', 'свежий горох', 'сладость'],
      brew: { temp: 80, time: 60, steeps: 4 },
      text: 'Плоский лист, который мастер прижимает ладонью к раскалённому воку. Сушим ещё раз у себя, коротко, чтобы раскрыть ореховую ноту.' },
    { id: 'genmai', name: 'Генмайча жареная', type: 'green', roast: 2, price: 420, region: 'Кагосима, Япония',
      leaf: '#a5a057', liquor: '#d9c47a', notes: ['рисовый крекер', 'попкорн', 'трава'],
      brew: { temp: 85, time: 50, steeps: 2 },
      text: 'Зелёный чай с рисом, который мы обжариваем небольшими партиями прямо перед фасовкой.' },
    { id: 'tieguanyin', name: 'Те Гуань Инь «Тан Бэй»', type: 'oolong', roast: 3, price: 890, region: 'Аньси, Китай',
      leaf: '#4b3a26', liquor: '#c27b2c', notes: ['жжёный сахар', 'слива', 'орхидея'],
      brew: { temp: 95, time: 25, steeps: 7 },
      text: 'Классический улун, который три дня томим на бамбуковых корзинах над углями. Цветочная база уходит в тёплую глубину.' },
    { id: 'dahongpao', name: 'Да Хун Пао', type: 'oolong', roast: 3, price: 980, region: 'Уишань, Китай',
      leaf: '#3a2a1e', liquor: '#a85a22', notes: ['минеральность', 'какао', 'жареная корица'],
      brew: { temp: 98, time: 20, steeps: 8 },
      text: 'Утёсный улун с долгим послевкусием. Добавляем лёгкую повторную прожарку, чтобы смягчить острые края.' },
    { id: 'dongding', name: 'Дун Дин средней прожарки', type: 'oolong', roast: 2, price: 820, region: 'Наньтоу, Тайвань',
      leaf: '#5d5a2c', liquor: '#d79a3a', notes: ['мёд', 'хлебная корка', 'груша'],
      brew: { temp: 92, time: 30, steeps: 6 },
      text: 'Скрученный тайваньский улун с балансом между цветком и жаром. Хорош в гайване и в чайнике.' },
    { id: 'dianhong', name: 'Дянь Хун золотой', type: 'red', roast: 2, price: 560, region: 'Юньнань, Китай',
      leaf: '#7a4416', liquor: '#b8461f', notes: ['мёд', 'батат', 'специи'],
      brew: { temp: 90, time: 45, steeps: 4 },
      text: 'Пушистые золотые почки. После досушки в печи вкус становится плотнее и слаще.' },
    { id: 'lapsang', name: 'Лапсанг на сосне', type: 'red', roast: 3, price: 610, region: 'Тунмугуань, Китай',
      leaf: '#2e211a', liquor: '#8f3a18', notes: ['костёр', 'копчёная слива', 'смола'],
      brew: { temp: 95, time: 40, steeps: 3 },
      text: 'Тот самый копчёный чай: лист подвяливают в дыму сосновых поленьев. Для тех, кто любит походный котелок.' },
    { id: 'shuDai', name: 'Шу пуэр «Старая деревня»', type: 'puer', roast: 2, price: 540, region: 'Мэнхай, Китай',
      leaf: '#3b2418', liquor: '#5c2410', notes: ['чернозём', 'финик', 'кора'],
      brew: { temp: 99, time: 15, steeps: 10 },
      text: 'Прессованный шу 2019 года, которому мы даём «подышать» и слегка прогреваем перед продажей.' },
    { id: 'shengRoast', name: 'Шэн пуэр прожаренный', type: 'puer', roast: 1, price: 720, region: 'Линцан, Китай',
      leaf: '#6b5a33', liquor: '#d7a53e', notes: ['абрикос', 'сухофрукты', 'горчинка'],
      brew: { temp: 95, time: 20, steeps: 8 },
      text: 'Молодой шэн с лёгкой обжаркой: убираем резкость, оставляем фруктовую яркость.' },
    { id: 'ivan', name: 'Иван-чай ферментированный', type: 'herbal', roast: 2, price: 320, region: 'Карелия, Россия',
      leaf: '#5a3a22', liquor: '#a4562a', notes: ['хлеб', 'сухофрукты', 'липа'],
      brew: { temp: 95, time: 300, steeps: 2 },
      text: 'Кипрей ручного скручивания, досушенный в русской печи. Без кофеина, с хлебным ароматом.' },
    { id: 'mugi', name: 'Мугича ячменная', type: 'herbal', roast: 3, price: 280, region: 'Алтай, Россия',
      leaf: '#7b4a1c', liquor: '#9c5a22', notes: ['поджаренный хлеб', 'кофе', 'орех'],
      brew: { temp: 99, time: 240, steeps: 1 },
      text: 'Цельный ячмень глубокой прожарки. Летом заваривайте холодным способом на ночь.' }
  ];

  // Конструктор купажа: цены за 100 г готовой смеси
  var BASES = [
    { id: 'b-hojicha', name: 'Ходзича', price: 1150, leaf: '#8a5a2b', liquor: '#b9763a' },
    { id: 'b-sencha', name: 'Сенча', price: 900, leaf: '#7f8f3a', liquor: '#cfc96a' },
    { id: 'b-oolong', name: 'Тёмный улун', price: 1500, leaf: '#4b3a26', liquor: '#c27b2c' },
    { id: 'b-red', name: 'Красный чай', price: 980, leaf: '#7a4416', liquor: '#b8461f' },
    { id: 'b-ivan', name: 'Иван-чай', price: 560, leaf: '#5a3a22', liquor: '#a4562a' }
  ];

  var ADDITIVES = [
    { id: 'mint', name: 'Мята', price: 90, color: '#5fae6e', shape: 'leaf', tint: '#9cc27a' },
    { id: 'rose', name: 'Лепестки розы', price: 160, color: '#d9566f', shape: 'petal', tint: '#d86a6a' },
    { id: 'orange', name: 'Цедра апельсина', price: 110, color: '#f08a24', shape: 'cube', tint: '#e89a3a' },
    { id: 'cinnamon', name: 'Корица', price: 120, color: '#9b4f1f', shape: 'stick', tint: '#a2522a' },
    { id: 'ginger', name: 'Имбирь', price: 100, color: '#e7c66b', shape: 'cube', tint: '#d9b04a' },
    { id: 'jasmine', name: 'Жасмин', price: 180, color: '#f4efe0', shape: 'flower', tint: '#e6dca0' },
    { id: 'cornflower', name: 'Василёк', price: 140, color: '#4f6fd6', shape: 'petal', tint: '#8a7fc0' },
    { id: 'berry', name: 'Брусника', price: 150, color: '#a3203a', shape: 'dot', tint: '#b33a4a' }
  ];

  var MAX_ADDITIVES = 4;
  var WEIGHTS = [50, 100, 250];
  var BLEND_WEIGHTS = [50, 100, 200];
  var JAR_PRICE = 190;
  var FREE_DELIVERY_FROM = 3000;
  var DELIVERY = {
    courier: { name: 'Курьер по городу', price: 350, needsAddress: true },
    post: { name: 'Почта России', price: 290, needsAddress: true },
    pickup: { name: 'Самовывоз из лавки', price: 0, needsAddress: false }
  };
  var PROMOS = { 'ЖАР10': 0.1, 'ПЕРВЫЙ': 0.15 };

  /* ---------- каталог ---------- */

  function byId(id) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
    return null;
  }

  // Цена за вес: чем больше упаковка, тем дешевле грамм
  function weightPrice(pricePer50, grams) {
    var k = { 50: 1, 100: 1.9, 250: 4.5 }[grams];
    if (!k) throw new Error('Неизвестный вес: ' + grams);
    return Math.round(pricePer50 * k / 10) * 10;
  }

  function filterProducts(list, f) {
    f = f || {};
    var q = (f.query || '').trim().toLowerCase();
    var out = list.filter(function (p) {
      if (f.types && f.types.length && f.types.indexOf(p.type) < 0) return false;
      if (f.roast && p.roast !== Number(f.roast)) return false;
      if (f.maxPrice && p.price > Number(f.maxPrice)) return false;
      if (q) {
        var hay = (p.name + ' ' + p.region + ' ' + p.notes.join(' ') + ' ' + TYPES[p.type]).toLowerCase();
        if (hay.indexOf(q) < 0) return false;
      }
      return true;
    });
    var sorters = {
      price_asc: function (a, b) { return a.price - b.price; },
      price_desc: function (a, b) { return b.price - a.price; },
      roast_desc: function (a, b) { return b.roast - a.roast || a.price - b.price; },
      name: function (a, b) { return a.name.localeCompare(b.name, 'ru'); }
    };
    if (f.sort && sorters[f.sort]) out.sort(sorters[f.sort]);
    return out;
  }

  /* ---------- купаж ---------- */

  function findIn(list, id) {
    for (var i = 0; i < list.length; i++) if (list[i].id === id) return list[i];
    return null;
  }

  function blendPrice(blend) {
    var base = findIn(BASES, blend.base);
    if (!base) throw new Error('Не выбрана основа');
    var grams = blend.weight;
    if (BLEND_WEIGHTS.indexOf(grams) < 0) throw new Error('Неизвестный вес: ' + grams);
    var adds = (blend.additives || []).map(function (id) {
      var a = findIn(ADDITIVES, id);
      if (!a) throw new Error('Неизвестная добавка: ' + id);
      return a;
    });
    if (adds.length > MAX_ADDITIVES) throw new Error('Не больше ' + MAX_ADDITIVES + ' добавок');
    var perHundred = base.price + adds.reduce(function (s, a) { return s + a.price; }, 0);
    var total = Math.round(perHundred * grams / 100) + (blend.jar ? JAR_PRICE : 0);
    return { perHundred: perHundred, total: total };
  }

  function toggleAdditive(list, id) {
    var i = list.indexOf(id);
    if (i >= 0) return list.slice(0, i).concat(list.slice(i + 1));
    if (list.length >= MAX_ADDITIVES) return list.slice();
    return list.concat(id);
  }

  function hexToRgb(hex) {
    var n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }

  function rgbToHex(rgb) {
    return '#' + rgb.map(function (v) {
      var s = Math.max(0, Math.min(255, Math.round(v))).toString(16);
      return s.length < 2 ? '0' + s : s;
    }).join('');
  }

  // Цвет настоя: основа с весом 1, каждая добавка подкрашивает на 0.18
  function mixColor(baseHex, tints) {
    var acc = hexToRgb(baseHex), w = 1;
    tints.forEach(function (t) {
      var c = hexToRgb(t);
      acc = acc.map(function (v, i) { return (v * w + c[i] * 0.18) / (w + 0.18); });
      w += 0.18;
    });
    return rgbToHex(acc);
  }

  // Детерминированный генератор, чтобы частицы в банке не прыгали при каждой перерисовке
  function seeded(seed) {
    var s = 0;
    for (var i = 0; i < seed.length; i++) s = (s * 31 + seed.charCodeAt(i)) >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  /* ---------- корзина ---------- */

  function cartAdd(cart, item) {
    var copy = cart.map(function (x) { return Object.assign({}, x); });
    for (var i = 0; i < copy.length; i++) {
      if (copy[i].key === item.key) {
        copy[i].qty = Math.min(99, copy[i].qty + (item.qty || 1));
        return copy;
      }
    }
    copy.push(Object.assign({ qty: 1 }, item));
    return copy;
  }

  function cartSetQty(cart, key, qty) {
    return cart
      .map(function (x) { return x.key === key ? Object.assign({}, x, { qty: Math.min(99, qty) }) : x; })
      .filter(function (x) { return x.qty > 0; });
  }

  function cartTotals(cart, delivery, promo) {
    var subtotal = cart.reduce(function (s, x) { return s + x.price * x.qty; }, 0);
    var count = cart.reduce(function (s, x) { return s + x.qty; }, 0);
    var code = (promo || '').trim().toUpperCase();
    var rate = PROMOS[code] || 0;
    var discount = Math.round(subtotal * rate);
    var d = DELIVERY[delivery] || DELIVERY.courier;
    var shipping = subtotal === 0 || subtotal - discount >= FREE_DELIVERY_FROM ? 0 : d.price;
    return {
      count: count,
      subtotal: subtotal,
      discount: discount,
      promoValid: rate > 0,
      shipping: shipping,
      total: subtotal - discount + shipping
    };
  }

  /* ---------- оформление ---------- */

  function normalizePhone(raw) {
    var d = String(raw || '').replace(/\D/g, '');
    if (d.length === 11 && (d[0] === '7' || d[0] === '8')) d = d.slice(1);
    if (d.length !== 10 || d[0] !== '9') return null;
    return '+7 (' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6, 8) + '-' + d.slice(8);
  }

  function validateCheckout(data) {
    var e = {};
    var name = (data.name || '').trim();
    if (!/^[A-Za-zА-Яа-яЁё][A-Za-zА-Яа-яЁё\s'-]{1,59}$/.test(name)) e.name = 'Укажите имя буквами, от 2 символов';
    if (!normalizePhone(data.phone)) e.phone = 'Нужен мобильный номер: +7 9XX XXX-XX-XX';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((data.email || '').trim())) e.email = 'Проверьте адрес почты';
    if (!DELIVERY[data.delivery]) e.delivery = 'Выберите способ доставки';
    else if (DELIVERY[data.delivery].needsAddress && (data.address || '').trim().length < 8) {
      e.address = 'Укажите город, улицу и дом';
    }
    if (!data.agree) e.agree = 'Нужно согласие на обработку данных';
    return e;
  }

  function formatRub(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' ₽';
  }

  var api = {
    TYPES: TYPES, ROASTS: ROASTS, PRODUCTS: PRODUCTS, BASES: BASES, ADDITIVES: ADDITIVES,
    MAX_ADDITIVES: MAX_ADDITIVES, WEIGHTS: WEIGHTS, BLEND_WEIGHTS: BLEND_WEIGHTS, JAR_PRICE: JAR_PRICE,
    DELIVERY: DELIVERY, FREE_DELIVERY_FROM: FREE_DELIVERY_FROM,
    byId: byId, findIn: findIn, weightPrice: weightPrice, filterProducts: filterProducts,
    blendPrice: blendPrice, toggleAdditive: toggleAdditive, mixColor: mixColor, seeded: seeded,
    cartAdd: cartAdd, cartSetQty: cartSetQty, cartTotals: cartTotals,
    normalizePhone: normalizePhone, validateCheckout: validateCheckout, formatRub: formatRub
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.Tea = api;
})(this);
