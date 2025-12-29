const fs = require('fs/promises');
const path = require('path');

async function ensureDirForFile(filePath) {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
}

async function readJsonArray(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (err) {
    if (err && err.code === 'ENOENT') return [];
    throw err;
  }
}

async function readJson(filePath, defaultValue) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    if (err && err.code === 'ENOENT') return defaultValue;
    throw err;
  }
}

async function writeJsonArray(filePath, arr) {
  await ensureDirForFile(filePath);
  await fs.writeFile(filePath, JSON.stringify(arr, null, 2), 'utf8');
}

async function writeJson(filePath, value) {
  await ensureDirForFile(filePath);
  await fs.writeFile(filePath, JSON.stringify(value, null, 2), 'utf8');
}

async function appendJsonArray(filePath, item) {
  const current = await readJsonArray(filePath);
  current.push(item);
  await writeJsonArray(filePath, current);
}

module.exports = { readJsonArray, writeJsonArray, appendJsonArray, readJson, writeJson };
