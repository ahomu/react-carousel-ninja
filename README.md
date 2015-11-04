# react-carousel-ninja

[![npm version][npm-image]][npm-url] [![build status][circle-image]][circle-url] [![Dependency Status][deps-image]][deps-url]

## Installation

Recommend for use browserify, or other CommonJS/ES6 modules resolver.

To install the `react-carousel-ninja` by NPM.

```shell
npm install --save react-carousel-ninja
```

```javascript
// CommonJS
var CarouselNinja = require('react-carousel-ninja');

// ES6 modules (babel)
import CarouselNinja from 'react-carousel-ninja';
```

```shell
# CarouselNinja depends on React. If you want to separate `react` & `react-dom` as other bundle.
browserify index.tsx -x react -x react-dom -o bundle.js
browserify -r react -r react-dom -o libs.js
```

## Usage

:)

## API Reference

:)

## Tests

```
npm install
npm test
```

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request :D

## License

MIT

[npm-image]: https://img.shields.io/npm/v/react-carousel-ninja.svg
[npm-url]: https://npmjs.org/package/react-carousel-ninja
[circle-image]: https://circleci.com/gh/ahomu/react-carousel-ninja.svg?style=shield&circle-token=
[circle-url]: https://circleci.com/gh/ahomu/react-carousel-ninja
[deps-image]: https://david-dm.org/ahomu/react-carousel-ninja.svg
[deps-url]: https://david-dm.org/ahomu/react-carousel-ninja
