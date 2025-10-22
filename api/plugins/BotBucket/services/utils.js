"use strict";

const DEFAULT_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0 Safari/537.36";

function normalizeWhitespace(s) {
  return (s || "")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

module.exports = {
  DEFAULT_UA,
  normalizeWhitespace,
};
