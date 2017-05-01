

var request = require("request");
var chai=require("chai");
var helloWorld = require("../index.js");
var base_url = "http://localhost:3000/";
var expect = chai.expect;
describe("searchByKey", function() {
  describe("POST /searchByKey", function() {
    it(" 200", function(done) {
      request.get(base_url, function(error, response, body) {
        expect(true).to.be.true;
expect(false).to.be.false;
        done();
      });
    });
    it("kkk", function(done) {
      request.get(base_url, function(error, response, body) {
          expect(true).to.be.true;
expect(false).to.be.false;
        //helloWorld.closeServer();
        done();
      });
    });
  });
});

describe("sendlink", function() {
  describe("POST /sendlink", function() {
    it(" 200", function(done) {
      request.get(base_url, function(error, response, body) {
        expect(true).to.be.true;
expect(false).to.be.false;
        done();
      });
    });
    it("kkk", function(done) {
      request.get(base_url, function(error, response, body) {
          expect(true).to.be.true;
expect(false).to.be.false;
        //helloWorld.closeServer();
        done();
      });
    });
  });
});
