/*
  model.js

  This file is required. It must export a class with at least one public function called `getData`

  Documentation: http://koopjs.github.io/docs/usage/provider
*/
const request = require('request').defaults({ gzip: true, json: true })
const config = require('config')

const { exec } = require("child_process");


function Model (koop) {}

// Public function to return data from the
// Return: GeoJSON FeatureCollection
//
// Config parameters (config/default.json)
// req.
//
// URL path parameters:
// req.params.host (if index.js:hosts true)
// req.params.id  (if index.js:disableIdParam false)
// req.params.layer
// req.params.method
Model.prototype.getData = function (req, callback) {
  const parts = req.params.layer.split("@", 3);
  const len = parts.length;
  if (len > 2) {
    const error = new Error('Invalid layer format: should be [COMMITISH@]REPOSITORY');
    error.code = 400;
    return callback(error)
  }

  const commitish = (len == 2) ? parts[0] : "HEAD";
  const repo = (len == 2) ? parts[1] : parts[0];

  // Call the remote API with our developer key
  exec(`kart -C ${repo} diff [EMPTY]...${commitish} -ogeojson`, (err, stdout, stderr) => {
    if (err) {
      const error = new Error(stderr)
      error.code = 500;  // Also useful: err.errror ?
      return callback(error);
    }

    geojson = JSON.parse(stdout);

    // Optional: cache data for 10 seconds at a time by setting the ttl or "Time to Live"
    // geojson.ttl = 10

    // Optional: Service metadata and geometry type
    geojson.metadata = {
      name: 'Kart Sample Provider',
      description: `Generated from ${commitish} @ ${repo}`,
      // geometryType: 'Polygon' // Default is automatic detection in Koop
    }

    // hand off the data to Koop
    callback(null, geojson)
  })
}

module.exports = Model


