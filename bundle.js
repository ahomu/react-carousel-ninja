'use strict';

const fs = require('fs');

const browserify = require('browserify');
const licensify  = require('licensify');
const tsify      = require('tsify');
const babelify   = require('babelify');
const watchify   = require('watchify');

const EXTENSIONS    = ['.js', '.ts', '.tsx', '.json'];
const BUNDLE_INDEX  = './src/index.tsx';
const BUNDLE_OUTPUT = './react-carousel-ninja.js';

function applyBundleConf(b) {
  return b
    .plugin(licensify)
    .plugin(tsify)
    .external([require.resolve('react'), require.resolve('react-dom')])
    .transform(babelify.configure({
      extensions : EXTENSIONS
    }))
    .add(BUNDLE_INDEX);
}

if (process.argv[2] === '--watch') {

  const handler = () => {
    let whenError = false;
    b.bundle()
      .on('error', (e) => {
        whenError = true;
        console.error(e.message);
      })
      .on('end', () => {
        whenError ? console.log('update failure') : console.log('update success');
      })
      .pipe(fs.createWriteStream(BUNDLE_OUTPUT));
  };

  const b = applyBundleConf(browserify({
    extensions   : EXTENSIONS,
    debug        : true,
    cache        : {},
    packageCache : {},
    plugin       : [watchify]
  })).on('update', handler);

  handler();
} else {

  applyBundleConf(browserify({
    extensions   : EXTENSIONS,
    debug        : true
  })).bundle().pipe(fs.createWriteStream(BUNDLE_OUTPUT));

}
