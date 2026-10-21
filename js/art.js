/* SVG-иллюстрации: банка для каталога, крафт-пакет для карточки, стеклянная банка и чашка для конструктора. */
(function (root) {
  'use strict';
  var T = root.Tea;

  function flames(n, x, y) {
    var s = '';
    for (var i = 0; i < 3; i++) {
      var op = i < n ? 1 : 0.18;
      s += '<path transform="translate(' + (x + i * 16) + ' ' + y + ') scale(.55)" opacity="' + op +
        '" d="M12 0c5 6 8 10 8 15a8 8 0 0 1-16 0c0-4 2-6 4-9 0 4 1 5 3 5-1-4 0-8 1-11z" fill="#e0703f"/>';
    }
    return s;
  }

  // Жестяная банка для карточки каталога
  function tin(p) {
    return '<svg viewBox="0 0 200 200" role="img" aria-label="' + p.name + '">' +
      '<ellipse cx="100" cy="182" rx="62" ry="9" fill="#2a1a12" opacity=".14"/>' +
      '<rect x="46" y="44" width="108" height="136" rx="10" fill="#2a1a12"/>' +
      '<rect x="46" y="84" width="108" height="64" fill="' + p.leaf + '"/>' +
      '<rect x="46" y="84" width="108" height="64" fill="url(#grain)" opacity=".35"/>' +
      '<rect x="40" y="30" width="120" height="22" rx="6" fill="#3b271b"/>' +
      '<rect x="40" y="30" width="120" height="6" rx="3" fill="#fff" opacity=".12"/>' +
      '<rect x="58" y="94" width="84" height="44" rx="4" fill="#f3ead9"/>' +
      '<text x="100" y="114" text-anchor="middle" font-family="Yeseva One, serif" font-size="13" fill="#2a1a12">' +
      T.TYPES[p.type] + '</text>' +
      flames(p.roast, 78, 120) +
      '<rect x="56" y="48" width="8" height="128" fill="#fff" opacity=".07"/>' +
      '<defs><pattern id="grain" width="6" height="6" patternUnits="userSpaceOnUse">' +
      '<circle cx="1" cy="1" r=".8" fill="#000"/><circle cx="4" cy="4" r=".6" fill="#fff"/></pattern></defs>' +
      '</svg>';
  }

  // Крафт-пакет с окошком, через которое виден лист
  function pouch(p) {
    var rnd = T.seeded(p.id), bits = '';
    for (var i = 0; i < 46; i++) {
      var x = 112 + rnd() * 76, y = 150 + rnd() * 70, r = 2 + rnd() * 4;
      bits += '<ellipse cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" rx="' + (r * 1.6).toFixed(1) +
        '" ry="' + r.toFixed(1) + '" transform="rotate(' + Math.round(rnd() * 180) + ' ' + x.toFixed(1) + ' ' + y.toFixed(1) +
        ')" fill="' + p.leaf + '" opacity="' + (0.6 + rnd() * 0.4).toFixed(2) + '"/>';
    }
    return '<svg viewBox="0 0 300 320" role="img" aria-label="Пакет: ' + p.name + '">' +
      '<defs><clipPath id="win"><rect x="110" y="140" width="80" height="84" rx="40"/></clipPath>' +
      '<linearGradient id="kraft" x1="0" x2="1"><stop offset="0" stop-color="#b8925e"/><stop offset=".5" stop-color="#d4b383"/>' +
      '<stop offset="1" stop-color="#b08957"/></linearGradient></defs>' +
      '<ellipse cx="150" cy="300" rx="100" ry="12" fill="#2a1a12" opacity=".15"/>' +
      '<path d="M70 40h160l14 256H56z" fill="url(#kraft)"/>' +
      '<path d="M70 40h160v18H70z" fill="#a17a48"/>' +
      '<path d="M76 66h148" stroke="#8a6438" stroke-dasharray="4 4"/>' +
      '<rect x="110" y="140" width="80" height="84" rx="40" fill="#f3ead9" opacity=".6"/>' +
      '<g clip-path="url(#win)"><rect x="100" y="130" width="100" height="100" fill="' + p.liquor + '" opacity=".25"/>' + bits + '</g>' +
      '<rect x="110" y="140" width="80" height="84" rx="40" fill="none" stroke="#2a1a12" stroke-width="2"/>' +
      '<text x="150" y="98" text-anchor="middle" font-family="Yeseva One, serif" font-size="20" fill="#2a1a12">Жаровня</text>' +
      '<text x="150" y="120" text-anchor="middle" font-family="Manrope, sans-serif" font-size="11" letter-spacing="2" fill="#2a1a12">' +
      T.TYPES[p.type].toUpperCase() + '</text>' +
      '<rect x="92" y="240" width="116" height="34" rx="4" fill="#2a1a12"/>' +
      flames(p.roast, 125, 249) +
      '</svg>';
  }

  var shapes = {
    leaf: function (x, y, r, c, a) {
      return '<ellipse cx="' + x + '" cy="' + y + '" rx="' + (r * 1.8) + '" ry="' + r + '" transform="rotate(' + a + ' ' + x + ' ' + y + ')" fill="' + c + '"/>';
    },
    petal: function (x, y, r, c, a) {
      return '<path transform="translate(' + x + ' ' + y + ') rotate(' + a + ')" d="M0 0c' + r + ' -' + r * 2 + ' ' + r * 3 + ' -' + r + ' 0 ' + r * 1.4 + 'c-' + r * 3 + ' -' + r * 2.4 + ' -' + r + ' -' + r * 3.4 + ' 0 -' + r * 1.4 + 'z" fill="' + c + '"/>';
    },
    cube: function (x, y, r, c, a) {
      return '<rect x="' + (x - r) + '" y="' + (y - r) + '" width="' + r * 2 + '" height="' + r * 1.6 + '" rx="1" transform="rotate(' + a + ' ' + x + ' ' + y + ')" fill="' + c + '"/>';
    },
    stick: function (x, y, r, c, a) {
      return '<rect x="' + (x - r * 3) + '" y="' + (y - r * 0.6) + '" width="' + r * 6 + '" height="' + r * 1.2 + '" rx="' + r * 0.6 + '" transform="rotate(' + a + ' ' + x + ' ' + y + ')" fill="' + c + '" stroke="#5c2c10" stroke-width=".8"/>';
    },
    flower: function (x, y, r, c) {
      var s = '';
      for (var k = 0; k < 5; k++) {
        var ang = k * 72 * Math.PI / 180;
        s += '<circle cx="' + (x + Math.cos(ang) * r).toFixed(1) + '" cy="' + (y + Math.sin(ang) * r).toFixed(1) + '" r="' + r * 0.8 + '" fill="' + c + '"/>';
      }
      return s + '<circle cx="' + x + '" cy="' + y + '" r="' + r * 0.5 + '" fill="#e6b840"/>';
    },
    dot: function (x, y, r, c) {
      return '<circle cx="' + x + '" cy="' + y + '" r="' + r * 1.1 + '" fill="' + c + '"/><circle cx="' + (x - r * 0.4) + '" cy="' + (y - r * 0.4) + '" r="' + r * 0.3 + '" fill="#fff" opacity=".5"/>';
    }
  };

  // Стеклянная банка: основа насыпана слоем, добавки разбросаны поверх
  function jar(blend) {
    var base = T.findIn(T.BASES, blend.base);
    var adds = blend.additives.map(function (id) { return T.findIn(T.ADDITIVES, id); });
    var fill = { 50: 120, 100: 150, 200: 178 }[blend.weight] || 150;
    var top = 250 - fill;
    var rnd = T.seeded(blend.base + blend.additives.join(''));
    var leaves = '';
    for (var i = 0; i < 90; i++) {
      var x = 62 + rnd() * 136, y = top + 6 + rnd() * (fill - 10);
      leaves += shapes.leaf(x.toFixed(1), y.toFixed(1), (2 + rnd() * 2.5).toFixed(1), base.leaf, Math.round(rnd() * 180));
    }
    var extras = '';
    adds.forEach(function (a) {
      for (var j = 0; j < 14; j++) {
        var ax = 64 + rnd() * 132, ay = top + 6 + rnd() * (fill - 12);
        extras += shapes[a.shape](+ax.toFixed(1), +ay.toFixed(1), +(2.4 + rnd() * 2).toFixed(1), a.color, Math.round(rnd() * 180));
      }
    });
    var lid = blend.jar
      ? '<rect x="66" y="22" width="128" height="30" rx="6" fill="#3b271b"/><rect x="66" y="24" width="128" height="6" rx="3" fill="#fff" opacity=".15"/>'
      : '<path d="M66 50 L80 26 H180 L194 50z" fill="#c9a878" stroke="#8a6438"/>';
    return '<svg viewBox="0 0 260 280" role="img" aria-label="Банка с купажом">' +
      '<defs><clipPath id="jarclip"><rect x="56" y="58" width="148" height="196" rx="22"/></clipPath></defs>' +
      '<ellipse cx="130" cy="266" rx="92" ry="9" fill="#2a1a12" opacity=".15"/>' +
      '<g clip-path="url(#jarclip)"><rect x="50" y="' + top + '" width="160" height="' + (fill + 10) + '" fill="' + base.leaf + '" opacity=".55"/>' +
      leaves + extras + '</g>' +
      '<rect x="56" y="58" width="148" height="196" rx="22" fill="#fff" opacity=".12" stroke="#2a1a12" stroke-width="3"/>' +
      '<rect x="70" y="70" width="10" height="160" rx="5" fill="#fff" opacity=".35"/>' +
      '<rect x="62" y="50" width="136" height="12" rx="4" fill="#2a1a12" opacity=".8"/>' + lid +
      '</svg>';
  }

  // Чашка с настоем: цвет смешивается из основы и оттенков добавок
  function cup(blend) {
    var base = T.findIn(T.BASES, blend.base);
    var tints = blend.additives.map(function (id) { return T.findIn(T.ADDITIVES, id).tint; });
    var color = T.mixColor(base.liquor, tints);
    return '<svg viewBox="0 0 200 160" role="img" aria-label="Цвет настоя">' +
      '<ellipse cx="96" cy="146" rx="80" ry="10" fill="#2a1a12" opacity=".12"/>' +
      '<path d="M28 48h136c0 52-26 88-68 88s-68-36-68-88z" fill="#f7f1e6" stroke="#2a1a12" stroke-width="3"/>' +
      '<path d="M164 64c26 0 28 36 0 40" fill="none" stroke="#2a1a12" stroke-width="6" stroke-linecap="round"/>' +
      '<ellipse cx="96" cy="50" rx="66" ry="12" fill="' + color + '"/>' +
      '<ellipse cx="80" cy="47" rx="22" ry="3" fill="#fff" opacity=".35"/>' +
      '<path class="steam" d="M70 30c-8-8 8-14 0-24M96 30c-8-8 8-14 0-24M122 30c-8-8 8-14 0-24" fill="none" stroke="#2a1a12" stroke-opacity=".25" stroke-width="3" stroke-linecap="round"/>' +
      '</svg>';
  }

  root.Art = { tin: tin, pouch: pouch, jar: jar, cup: cup, flames: flames };
})(this);
