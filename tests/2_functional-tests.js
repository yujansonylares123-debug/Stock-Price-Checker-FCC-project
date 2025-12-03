const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let requester;
let likeCount;

suite('Functional Tests', function () {
  this.timeout(10000);

  // Mantener la conexión abierta entre tests (útil para FCC) 
  before(function () {
    requester = chai.request(server).keepOpen();
  });

  after(function () {
    requester.close();
  });

  test('Viewing one stock: GET /api/stock-prices', function (done) {
    requester
      .get('/api/stock-prices')
      .query({ stock: 'GOOG' })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.isObject(res.body.stockData);

        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.isNumber(res.body.stockData.price);
        assert.isNumber(res.body.stockData.likes);

        done();
      });
  });

  test('Viewing one stock and liking it: GET /api/stock-prices', function (done) {
    requester
      .get('/api/stock-prices')
      .query({ stock: 'GOOG', like: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.isObject(res.body.stockData);

        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.isNumber(res.body.stockData.price);
        assert.isNumber(res.body.stockData.likes);

        likeCount = res.body.stockData.likes;
        done();
      });
  });

  test('Viewing the same stock and liking it again: 1 like per IP', function (done) {
    requester
      .get('/api/stock-prices')
      .query({ stock: 'GOOG', like: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.isObject(res.body.stockData);

        assert.equal(res.body.stockData.stock, 'GOOG');
        assert.isNumber(res.body.stockData.price);
        assert.isNumber(res.body.stockData.likes);

        // No debe aumentar el número de likes
        assert.equal(res.body.stockData.likes, likeCount);

        done();
      });
  });

  test('Viewing two stocks: GET /api/stock-prices', function (done) {
    requester
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'MSFT'] })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.isArray(res.body.stockData);
        assert.lengthOf(res.body.stockData, 2);

        res.body.stockData.forEach((s) => {
          assert.isString(s.stock);
          assert.isNumber(s.price);
          assert.property(s, 'rel_likes');
          assert.isNumber(s.rel_likes);
        });

        done();
      });
  });

  test('Viewing two stocks and liking them: GET /api/stock-prices', function (done) {
    requester
      .get('/api/stock-prices')
      .query({ stock: ['GOOG', 'MSFT'], like: true })
      .end(function (err, res) {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.isArray(res.body.stockData);
        assert.lengthOf(res.body.stockData, 2);

        res.body.stockData.forEach((s) => {
          assert.isString(s.stock);
          assert.isNumber(s.price);
          assert.property(s, 'rel_likes');
          assert.isNumber(s.rel_likes);
        });

        done();
      });
  });
});
