/* Интерфейс: маршрутизация по hash, каталог, карточка, конструктор, корзина, оформление. */
(function () {
  'use strict';
  var T = window.Tea, A = window.Art;
  var view = document.getElementById('view');
  var CART_KEY = 'zharovnya.cart';
  var rub = T.formatRub;

  /* ---------- хранилище ---------- */

  function load(key, fallback) {
    try {
      var v = JSON.parse(localStorage.getItem(key));
      return v == null ? fallback : v;
    } catch (e) { return fallback; }
  }
  function save(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch (e) { /* приватный режим: работаем в памяти */ }
  }

  var cart = load(CART_KEY, []);
  if (!Array.isArray(cart)) cart = [];
  var filters = { types: [], roast: '', maxPrice: 1000, query: '', sort: 'roast_desc' };
  var blend = { base: 'b-hojicha', additives: ['orange', 'cinnamon'], weight: 100, jar: true, name: '' };
  var checkout = { delivery: 'courier', promo: '' };

  function setCart(next) {
    cart = next;
    save(CART_KEY, cart);
    var n = T.cartTotals(cart, checkout.delivery).count;
    var badge = document.getElementById('cartCount');
    badge.textContent = n;
    badge.classList.toggle('is-on', n > 0);
  }

  var toastTimer;
  function toast(msg) {
    var el = document.getElementById('toast');
    el.textContent = msg;
    el.classList.add('is-on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove('is-on'); }, 2200);
  }

  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  /* ---------- каталог ---------- */

  function card(p) {
    return '<article class="card">' +
      '<a class="card__art" href="#/tea/' + p.id + '" aria-label="' + esc(p.name) + '">' + A.tin(p) + '</a>' +
      '<div class="card__body">' +
      '<p class="card__meta">' + esc(p.region) + '</p>' +
      '<h3><a href="#/tea/' + p.id + '">' + esc(p.name) + '</a></h3>' +
      '<p class="card__notes">' + p.notes.map(esc).join(' · ') + '</p>' +
      '<div class="card__foot"><span class="price">' + rub(p.price) + '<small> / 50 г</small></span>' +
      '<button class="btn btn--small" data-add="' + p.id + '">В корзину</button></div>' +
      '</div></article>';
  }

  function renderHome() {
    var typeChips = Object.keys(T.TYPES).map(function (k) {
      return '<button class="chip" data-type="' + k + '" aria-pressed="' + (filters.types.indexOf(k) >= 0) + '">' + T.TYPES[k] + '</button>';
    }).join('');
    var roastOpts = '<option value="">Любая</option>' + Object.keys(T.ROASTS).map(function (k) {
      return '<option value="' + k + '"' + (String(filters.roast) === k ? ' selected' : '') + '>' + T.ROASTS[k] + '</option>';
    }).join('');

    view.innerHTML =
      '<section class="hero">' +
      '<div class="hero__text">' +
      '<p class="eyebrow">Чайная лавка · обжарка на углях</p>' +
      '<h1>Чай, который<br>помнит <em>огонь</em></h1>' +
      '<p class="lead">Улуны, ходзича и пуэры, которые мы прожариваем вручную небольшими партиями. Или соберите свой купаж: основа, специи, цветы.</p>' +
      '<div class="hero__cta"><a class="btn" href="#catalog">Смотреть чай</a><a class="btn btn--ghost" href="#/blend">Собрать купаж</a></div>' +
      '</div>' +
      '<div class="hero__art" aria-hidden="true">' + heroArt() + '</div>' +
      '</section>' +
      '<section class="catalog" id="catalog" aria-labelledby="catTitle">' +
      '<div class="catalog__head"><h2 id="catTitle">Каталог</h2><p class="muted" id="found"></p></div>' +
      '<div class="catalog__grid">' +
      '<aside class="filters" aria-label="Фильтры">' +
      '<label class="field"><span>Поиск</span><input type="search" id="q" placeholder="мёд, Тайвань, дымок…" value="' + esc(filters.query) + '"></label>' +
      '<div class="field"><span>Вид чая</span><div class="chips">' + typeChips + '</div></div>' +
      '<label class="field"><span>Прожарка</span><select id="roast">' + roastOpts + '</select></label>' +
      '<label class="field"><span>Цена за 50 г: до <b id="maxOut">' + rub(filters.maxPrice) + '</b></span>' +
      '<input type="range" id="maxPrice" min="250" max="1000" step="10" value="' + filters.maxPrice + '"></label>' +
      '<label class="field"><span>Сортировка</span><select id="sort">' +
      opt('roast_desc', 'Сначала тёмные') + opt('price_asc', 'Дешевле') + opt('price_desc', 'Дороже') + opt('name', 'По названию') +
      '</select></label>' +
      '<button class="link" id="reset">Сбросить фильтры</button>' +
      '</aside>' +
      '<div class="cards" id="cards"></div>' +
      '</div></section>' +
      '<section class="promo-blend">' +
      '<div><p class="eyebrow">Конструктор</p><h2>Соберите купаж под себя</h2>' +
      '<p>Пять основ, восемь добавок, живая цена и превью цвета настоя. Смесь фасуем в день заказа.</p>' +
      '<a class="btn btn--light" href="#/blend">Открыть конструктор</a></div>' +
      '<div class="promo-blend__art" aria-hidden="true">' + A.jar({ base: 'b-oolong', additives: ['rose', 'cornflower', 'orange'], weight: 100, jar: true }) + '</div>' +
      '</section>';

    function opt(v, label) { return '<option value="' + v + '"' + (filters.sort === v ? ' selected' : '') + '>' + label + '</option>'; }

    drawCards();
    var q = document.getElementById('q');
    q.addEventListener('input', function () { filters.query = q.value; drawCards(); });
    document.getElementById('roast').addEventListener('change', function (e) { filters.roast = e.target.value; drawCards(); });
    document.getElementById('sort').addEventListener('change', function (e) { filters.sort = e.target.value; drawCards(); });
    document.getElementById('maxPrice').addEventListener('input', function (e) {
      filters.maxPrice = Number(e.target.value);
      document.getElementById('maxOut').textContent = rub(filters.maxPrice);
      drawCards();
    });
    view.querySelectorAll('[data-type]').forEach(function (b) {
      b.addEventListener('click', function () {
        var t = b.getAttribute('data-type'), i = filters.types.indexOf(t);
        if (i >= 0) filters.types.splice(i, 1); else filters.types.push(t);
        b.setAttribute('aria-pressed', i < 0);
        drawCards();
      });
    });
    document.getElementById('reset').addEventListener('click', function () {
      filters = { types: [], roast: '', maxPrice: 1000, query: '', sort: 'roast_desc' };
      renderHome();
    });
  }

  function drawCards() {
    var list = T.filterProducts(T.PRODUCTS, filters);
    var box = document.getElementById('cards');
    document.getElementById('found').textContent = 'Найдено: ' + list.length + ' из ' + T.PRODUCTS.length;
    box.innerHTML = list.length ? list.map(card).join('') :
      '<div class="empty"><p>Под такие условия ничего не нашлось.</p><p class="muted">Попробуйте поднять цену или убрать вид чая.</p></div>';
  }

  function heroArt() {
    var p = T.byId('tieguanyin');
    return '<div class="hero__stack">' + A.pouch(p) + '<div class="hero__cup">' +
      A.cup({ base: 'b-oolong', additives: [], weight: 100 }) + '</div></div>';
  }

  /* ---------- карточка товара ---------- */

  function renderProduct(id) {
    var p = T.byId(id);
    if (!p) return renderNotFound();
    var state = { weight: 100, qty: 1 };
    var related = T.PRODUCTS.filter(function (x) { return x.type === p.type && x.id !== p.id; }).slice(0, 3);
    if (related.length < 3) {
      related = related.concat(T.PRODUCTS.filter(function (x) { return x.roast === p.roast && x.type !== p.type; }).slice(0, 3 - related.length));
    }
    var brewTime = p.brew.time >= 120 ? Math.round(p.brew.time / 60) + ' мин' : p.brew.time + ' с';

    view.innerHTML =
      '<nav class="crumbs" aria-label="Навигация"><a href="#/">Каталог</a> / <span>' + T.TYPES[p.type] + '</span></nav>' +
      '<section class="product">' +
      '<div class="product__art">' + A.pouch(p) + '</div>' +
      '<div class="product__info">' +
      '<p class="eyebrow">' + T.TYPES[p.type] + ' · ' + esc(p.region) + '</p>' +
      '<h1>' + esc(p.name) + '</h1>' +
      '<div class="roast"><svg viewBox="0 0 52 14" aria-hidden="true">' + A.flames(p.roast, 0, 0) + '</svg>' +
      '<span>Прожарка: ' + T.ROASTS[p.roast].toLowerCase() + '</span></div>' +
      '<p class="lead">' + esc(p.text) + '</p>' +
      '<ul class="notes">' + p.notes.map(function (n) { return '<li>' + esc(n) + '</li>'; }).join('') + '</ul>' +
      '<fieldset class="weights"><legend>Вес</legend>' +
      T.WEIGHTS.map(function (w) {
        return '<label><input type="radio" name="w" value="' + w + '"' + (w === state.weight ? ' checked' : '') + '><span>' + w + ' г<small>' + rub(T.weightPrice(p.price, w)) + '</small></span></label>';
      }).join('') + '</fieldset>' +
      '<div class="buy"><div class="qty" role="group" aria-label="Количество">' +
      '<button data-q="-1" aria-label="Меньше">−</button><output id="qty">1</output><button data-q="1" aria-label="Больше">+</button></div>' +
      '<button class="btn" id="buy">В корзину · <span id="sum"></span></button></div>' +
      '<dl class="brew"><div><dt>Вода</dt><dd>' + p.brew.temp + '°C</dd></div><div><dt>Настой</dt><dd>' + brewTime +
      '</dd></div><div><dt>Проливов</dt><dd>до ' + p.brew.steeps + '</dd></div><div><dt>На 150 мл</dt><dd>5 г</dd></div></dl>' +
      '</div></section>' +
      '<section class="related"><h2>Похожие по характеру</h2><div class="cards cards--3">' + related.map(card).join('') + '</div></section>';

    function sync() {
      document.getElementById('qty').textContent = state.qty;
      document.getElementById('sum').textContent = rub(T.weightPrice(p.price, state.weight) * state.qty);
    }
    sync();
    view.querySelectorAll('input[name="w"]').forEach(function (r) {
      r.addEventListener('change', function () { state.weight = Number(r.value); sync(); });
    });
    view.querySelectorAll('[data-q]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.qty = Math.max(1, Math.min(20, state.qty + Number(b.getAttribute('data-q'))));
        sync();
      });
    });
    document.getElementById('buy').addEventListener('click', function () {
      setCart(T.cartAdd(cart, {
        key: p.id + '@' + state.weight, title: p.name, sub: state.weight + ' г',
        price: T.weightPrice(p.price, state.weight), qty: state.qty, href: '#/tea/' + p.id
      }));
      toast('Добавили: ' + p.name + ', ' + state.weight + ' г × ' + state.qty);
    });
  }

  /* ---------- конструктор купажа ---------- */

  function renderBlend() {
    view.innerHTML =
      '<section class="blend">' +
      '<div class="blend__head"><p class="eyebrow">Конструктор</p><h1>Свой купаж</h1>' +
      '<p class="lead">Выберите основу и до ' + T.MAX_ADDITIVES + ' добавок. Цена и цвет настоя меняются сразу.</p></div>' +
      '<div class="blend__grid">' +
      '<div class="blend__preview"><div class="blend__jar" id="jar"></div><div class="blend__cup" id="cup"></div>' +
      '<p class="blend__caption" id="caption"></p></div>' +
      '<form class="blend__form" id="blendForm" novalidate>' +
      '<fieldset><legend>1. Основа</legend><div class="opts" id="bases">' +
      T.BASES.map(function (b) {
        return '<label class="opt"><input type="radio" name="base" value="' + b.id + '"' + (blend.base === b.id ? ' checked' : '') + '>' +
          '<span><i style="background:' + b.leaf + '"></i>' + b.name + '<small>' + rub(b.price) + ' / 100 г</small></span></label>';
      }).join('') + '</div></fieldset>' +
      '<fieldset><legend>2. Добавки <small id="addCount"></small></legend><div class="opts" id="adds">' +
      T.ADDITIVES.map(function (a) {
        return '<label class="opt"><input type="checkbox" name="add" value="' + a.id + '"' + (blend.additives.indexOf(a.id) >= 0 ? ' checked' : '') + '>' +
          '<span><i style="background:' + a.color + '"></i>' + a.name + '<small>+' + rub(a.price) + '</small></span></label>';
      }).join('') + '</div></fieldset>' +
      '<fieldset><legend>3. Вес и упаковка</legend><div class="opts opts--row">' +
      T.BLEND_WEIGHTS.map(function (w) {
        return '<label class="opt opt--pill"><input type="radio" name="bw" value="' + w + '"' + (blend.weight === w ? ' checked' : '') + '><span>' + w + ' г</span></label>';
      }).join('') +
      '<label class="opt opt--pill"><input type="checkbox" id="jarBox"' + (blend.jar ? ' checked' : '') + '><span>Жестяная банка +' + rub(T.JAR_PRICE) + '</span></label>' +
      '</div></fieldset>' +
      '<label class="field"><span>Название на этикетке</span><input id="blendName" maxlength="28" placeholder="Например, «Зимний вечер»" value="' + esc(blend.name) + '"></label>' +
      '<div class="blend__total"><div><span class="muted" id="per"></span><strong id="blendSum"></strong></div>' +
      '<button class="btn" type="submit">Добавить купаж</button></div>' +
      '</form></div></section>';

    var form = document.getElementById('blendForm');
    form.addEventListener('change', function (e) {
      var t = e.target;
      if (t.name === 'base') blend.base = t.value;
      if (t.name === 'bw') blend.weight = Number(t.value);
      if (t.id === 'jarBox') blend.jar = t.checked;
      if (t.name === 'add') {
        var next = T.toggleAdditive(blend.additives, t.value);
        if (next.length === blend.additives.length && t.checked) {
          t.checked = false;
          toast('Не больше ' + T.MAX_ADDITIVES + ' добавок: вкус потеряется');
        }
        blend.additives = next;
      }
      drawBlend();
    });
    document.getElementById('blendName').addEventListener('input', function (e) { blend.name = e.target.value; drawBlend(); });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var price = T.blendPrice(blend).total;
      var base = T.findIn(T.BASES, blend.base);
      var addNames = blend.additives.map(function (id) { return T.findIn(T.ADDITIVES, id).name.toLowerCase(); });
      var title = blend.name.trim() ? '«' + blend.name.trim() + '»' : 'Купаж на основе: ' + base.name.toLowerCase();
      setCart(T.cartAdd(cart, {
        key: 'blend:' + [blend.base].concat(blend.additives.slice().sort()).join('+') + '@' + blend.weight + (blend.jar ? 'j' : '') + ':' + blend.name.trim(),
        title: title,
        sub: base.name + (addNames.length ? ' + ' + addNames.join(', ') : '') + ', ' + blend.weight + ' г' + (blend.jar ? ', банка' : ''),
        price: price, qty: 1, href: '#/blend'
      }));
      toast('Купаж в корзине');
    });
    drawBlend();
  }

  function drawBlend() {
    var price = T.blendPrice(blend);
    document.getElementById('jar').innerHTML = A.jar(blend);
    document.getElementById('cup').innerHTML = A.cup(blend);
    document.getElementById('blendSum').textContent = rub(price.total);
    document.getElementById('per').textContent = rub(price.perHundred) + ' за 100 г';
    document.getElementById('addCount').textContent = blend.additives.length + ' из ' + T.MAX_ADDITIVES;
    document.getElementById('caption').textContent = blend.name.trim() ? '«' + blend.name.trim() + '»' : 'Ваш купаж';
    view.querySelectorAll('input[name="add"]').forEach(function (c) {
      c.disabled = !c.checked && blend.additives.length >= T.MAX_ADDITIVES;
    });
  }

  /* ---------- корзина ---------- */

  function renderCart() {
    if (!cart.length) {
      view.innerHTML = '<section class="empty-page"><h1>Корзина пуста</h1><p class="lead">Загляните в каталог или соберите свой купаж.</p>' +
        '<div class="hero__cta"><a class="btn" href="#/">В каталог</a><a class="btn btn--ghost" href="#/blend">Собрать купаж</a></div></section>';
      return;
    }
    view.innerHTML = '<section class="cart"><h1>Корзина</h1><div class="cart__grid">' +
      '<ul class="lines" id="lines"></ul>' +
      '<aside class="summary" id="summary"></aside></div></section>';
    drawCart();
  }

  function drawCart() {
    var lines = document.getElementById('lines');
    if (!lines) return;
    if (!cart.length) return renderCart();
    lines.innerHTML = cart.map(function (x) {
      return '<li class="line"><div><a href="' + esc(x.href) + '"><b>' + esc(x.title) + '</b></a><p class="muted">' + esc(x.sub) + '</p></div>' +
        '<div class="qty qty--sm" role="group" aria-label="Количество"><button data-k="' + esc(x.key) + '" data-d="-1" aria-label="Меньше">−</button>' +
        '<output>' + x.qty + '</output><button data-k="' + esc(x.key) + '" data-d="1" aria-label="Больше">+</button></div>' +
        '<span class="price">' + rub(x.price * x.qty) + '</span>' +
        '<button class="del" data-k="' + esc(x.key) + '" data-d="del" aria-label="Удалить">×</button></li>';
    }).join('');
    lines.querySelectorAll('[data-k]').forEach(function (b) {
      b.addEventListener('click', function () {
        var key = b.getAttribute('data-k'), d = b.getAttribute('data-d');
        var item = cart.filter(function (x) { return x.key === key; })[0];
        setCart(T.cartSetQty(cart, key, d === 'del' ? 0 : item.qty + Number(d)));
        drawCart();
      });
    });
    drawSummary(document.getElementById('summary'), true);
  }

  function drawSummary(box, withButton) {
    var t = T.cartTotals(cart, checkout.delivery, checkout.promo);
    var left = T.FREE_DELIVERY_FROM - (t.subtotal - t.discount);
    box.innerHTML = '<h2>Итого</h2>' +
      '<dl><div><dt>Товары, ' + t.count + ' шт.</dt><dd>' + rub(t.subtotal) + '</dd></div>' +
      (t.discount ? '<div class="ok"><dt>Скидка</dt><dd>−' + rub(t.discount) + '</dd></div>' : '') +
      '<div><dt>Доставка</dt><dd>' + (t.shipping ? rub(t.shipping) : 'бесплатно') + '</dd></div>' +
      '<div class="sum"><dt>К оплате</dt><dd>' + rub(t.total) + '</dd></div></dl>' +
      (left > 0 && checkout.delivery !== 'pickup' ? '<p class="hint">До бесплатной доставки ' + rub(left) + '</p>' : '') +
      '<label class="field promo"><span>Промокод</span><span class="promo__row"><input id="promo" value="' + esc(checkout.promo) + '" placeholder="ЖАР10">' +
      '<button class="btn btn--small btn--ghost" id="applyPromo" type="button">Применить</button></span></label>' +
      (checkout.promo && !t.promoValid ? '<p class="err">Такого промокода нет</p>' : '') +
      (withButton ? '<a class="btn btn--wide" href="#/checkout">Оформить заказ</a>' : '');
    box.querySelector('#applyPromo').addEventListener('click', function () {
      checkout.promo = box.querySelector('#promo').value.trim();
      drawSummary(box, withButton);
    });
  }

  /* ---------- оформление ---------- */

  function renderCheckout() {
    if (!cart.length) return renderCart();
    var dOpts = Object.keys(T.DELIVERY).map(function (k) {
      var d = T.DELIVERY[k];
      return '<label class="opt opt--pill"><input type="radio" name="delivery" value="' + k + '"' + (checkout.delivery === k ? ' checked' : '') + '>' +
        '<span>' + d.name + '<small>' + (d.price ? rub(d.price) : 'бесплатно') + '</small></span></label>';
    }).join('');
    view.innerHTML = '<section class="cart"><nav class="crumbs"><a href="#/cart">Корзина</a> / <span>Оформление</span></nav>' +
      '<h1>Оформление</h1><div class="cart__grid">' +
      '<form class="checkout" id="co" novalidate>' +
      fld('name', 'Имя', 'text', 'Анна', 'name') +
      fld('phone', 'Телефон', 'tel', '+7 900 000-00-00', 'tel') +
      fld('email', 'Почта', 'email', 'you@mail.ru', 'email') +
      '<fieldset><legend>Доставка</legend><div class="opts opts--row">' + dOpts + '</div><p class="err" data-err="delivery"></p></fieldset>' +
      '<div id="addrWrap">' + fld('address', 'Адрес', 'text', 'Город, улица, дом, квартира', 'street-address') + '</div>' +
      '<label class="field"><span>Комментарий</span><textarea id="comment" rows="3" maxlength="300" placeholder="Позвонить за час, помолоть ячмень…"></textarea></label>' +
      '<label class="check"><input type="checkbox" id="agree"> <span>Согласен на обработку персональных данных</span></label><p class="err" data-err="agree"></p>' +
      '<button class="btn btn--wide" type="submit">Подтвердить заказ</button>' +
      '</form><aside class="summary" id="summary"></aside></div></section>';

    function fld(id, label, type, ph, ac) {
      return '<label class="field"><span>' + label + '</span><input id="' + id + '" type="' + type + '" placeholder="' + ph + '" autocomplete="' + ac + '">' +
        '<p class="err" data-err="' + id + '"></p></label>';
    }

    var form = document.getElementById('co');
    var summary = document.getElementById('summary');
    var touched = false;
    drawSummary(summary, false);
    syncAddress();

    function syncAddress() {
      document.getElementById('addrWrap').hidden = !T.DELIVERY[checkout.delivery].needsAddress;
    }
    function data() {
      return {
        name: form.querySelector('#name').value, phone: form.querySelector('#phone').value,
        email: form.querySelector('#email').value, address: form.querySelector('#address').value,
        delivery: checkout.delivery, agree: form.querySelector('#agree').checked
      };
    }
    function showErrors(errs) {
      form.querySelectorAll('[data-err]').forEach(function (p) {
        var k = p.getAttribute('data-err');
        p.textContent = errs[k] || '';
        var input = form.querySelector('#' + k);
        if (input) input.setAttribute('aria-invalid', errs[k] ? 'true' : 'false');
      });
    }

    form.addEventListener('change', function (e) {
      if (e.target.name === 'delivery') {
        checkout.delivery = e.target.value;
        syncAddress();
        drawSummary(summary, false);
      }
      if (touched) showErrors(T.validateCheckout(data()));
    });
    form.addEventListener('input', function () { if (touched) showErrors(T.validateCheckout(data())); });
    form.querySelector('#phone').addEventListener('blur', function (e) {
      var n = T.normalizePhone(e.target.value);
      if (n) e.target.value = n;
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      touched = true;
      var errs = T.validateCheckout(data());
      showErrors(errs);
      var first = Object.keys(errs)[0];
      if (first) {
        var el = form.querySelector('#' + first) || form.querySelector('[data-err="' + first + '"]');
        if (el && el.focus) el.focus();
        return;
      }
      var total = T.cartTotals(cart, checkout.delivery, checkout.promo).total;
      var num = 'Ж-' + String(Date.now()).slice(-6);
      var name = data().name.trim().split(/\s+/)[0];
      setCart([]);
      checkout.promo = '';
      renderDone(num, name, total);
      history.replaceState(null, '', '#/done');
    });
  }

  function renderDone(num, name, total) {
    view.innerHTML = '<section class="empty-page done"><div class="done__mark" aria-hidden="true">' + A.cup({ base: 'b-hojicha', additives: [], weight: 100 }) + '</div>' +
      '<h1>Спасибо, ' + esc(name) + '!</h1><p class="lead">Заказ <b>' + num + '</b> на ' + rub(total) +
      ' принят. Прожарим и отправим в течение двух дней, а подтверждение придёт на почту.</p>' +
      '<a class="btn" href="#/">Вернуться в каталог</a></section>';
    view.focus();
  }

  function renderNotFound() {
    view.innerHTML = '<section class="empty-page"><h1>Такой страницы нет</h1><p class="lead">Возможно, чай закончился или ссылка устарела.</p><a class="btn" href="#/">В каталог</a></section>';
  }

  /* ---------- маршрутизация ---------- */

  function route() {
    var h = location.hash || '#/';
    // Якоря внутри страницы (ссылка «к содержимому», «смотреть чай») не меняют экран
    if (h === '#catalog' || h === '#view') {
      if (!view.children.length) renderHome();
      var target = document.getElementById(h.slice(1));
      if (target) {
        if (h === '#view') target.focus();
        else target.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }
    var parts = h.replace(/^#\/?/, '').split('/');
    var page = parts[0] || 'home';
    document.querySelectorAll('[data-nav]').forEach(function (a) {
      a.classList.toggle('is-active', a.getAttribute('data-nav') === page);
    });
    if (page === 'home') renderHome();
    else if (page === 'tea') renderProduct(parts[1]);
    else if (page === 'blend') renderBlend();
    else if (page === 'cart') renderCart();
    else if (page === 'checkout') renderCheckout();
    else if (page === 'done') { location.hash = '#/'; return; }
    else renderNotFound();
    window.scrollTo(0, 0);
  }

  // Кнопки «В корзину» в карточках каталога: вес по умолчанию 50 г
  view.addEventListener('click', function (e) {
    var b = e.target.closest('[data-add]');
    if (!b) return;
    var p = T.byId(b.getAttribute('data-add'));
    setCart(T.cartAdd(cart, { key: p.id + '@50', title: p.name, sub: '50 г', price: p.price, qty: 1, href: '#/tea/' + p.id }));
    toast('Добавили: ' + p.name + ', 50 г');
  });

  window.addEventListener('hashchange', route);
  setCart(cart);
  route();
})();
