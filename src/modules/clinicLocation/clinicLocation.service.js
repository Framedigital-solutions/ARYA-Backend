const crypto = require('crypto');
const https = require('https');

const ClinicLocation = require('../../models/ClinicLocation');
const contentService = require('../content/content.service');

function nowIso() {
  return new Date().toISOString();
}

function toPlain(doc) {
  if (!doc || typeof doc !== 'object') return doc;
  const { _id, ...rest } = doc;
  return rest;
}

function tryExtractLatLng(text) {
  const raw = String(text || '');

  const at = raw.match(/@(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/);
  if (at) return { lat: Number(at[1]), lng: Number(at[2]) };

  const q = raw.match(/[?&]q=(-?\d{1,3}\.\d+)%2C(-?\d{1,3}\.\d+)/i);
  if (q) return { lat: Number(q[1]), lng: Number(q[2]) };

  const q2 = raw.match(/[?&]q=(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/i);
  if (q2) return { lat: Number(q2[1]), lng: Number(q2[2]) };

  const ll = raw.match(/[?&]ll=(-?\d{1,3}\.\d+),(-?\d{1,3}\.\d+)/i);
  if (ll) return { lat: Number(ll[1]), lng: Number(ll[2]) };

  return null;
}

function buildEmbedUrlFromLatLng(lat, lng) {
  const latNum = Number(lat);
  const lngNum = Number(lng);
  if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) return '';
  const q = encodeURIComponent(`${latNum},${lngNum}`);
  return `https://www.google.com/maps?q=${q}&output=embed`;
}

function resolveRedirect(url) {
  const input = String(url || '').trim();
  if (!input) return Promise.resolve('');

  return new Promise((resolve, reject) => {
    const req = https.request(
      input,
      {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0',
          Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
      },
      (res) => {
        const status = Number(res.statusCode || 0);
        const loc = res.headers && res.headers.location ? String(res.headers.location) : '';
        if (status >= 300 && status < 400 && loc) {
          const next = loc.startsWith('http') ? loc : new URL(loc, input).toString();
          return resolve(next);
        }
        return resolve(input);
      }
    );

    req.on('error', reject);
    req.end();
  });
}

async function resolveRedirectChain(url, { maxSteps = 5 } = {}) {
  let current = String(url || '').trim();
  for (let i = 0; i < maxSteps; i += 1) {
    const next = await resolveRedirect(current);
    if (!next || next === current) return current;
    current = next;
  }
  return current;
}

async function parseGoogleMapLink(googleMapLink) {
  const original = String(googleMapLink || '').trim();
  if (!original) return { googleMapLink: '', resolvedUrl: '', latitude: null, longitude: null, embedMapUrl: '' };

  const normalized = original;
  const direct = tryExtractLatLng(normalized);
  if (direct) {
    const embedMapUrl = buildEmbedUrlFromLatLng(direct.lat, direct.lng);
    return { googleMapLink: normalized, resolvedUrl: normalized, latitude: direct.lat, longitude: direct.lng, embedMapUrl };
  }

  let resolvedUrl = normalized;
  if (/^https?:\/\/maps\.app\.goo\.gl\//i.test(normalized) || /^https?:\/\/goo\.gl\//i.test(normalized)) {
    try {
      resolvedUrl = await resolveRedirectChain(normalized, { maxSteps: 5 });
    } catch (_) {
      resolvedUrl = normalized;
    }
  }

  const fromResolved = tryExtractLatLng(resolvedUrl);
  const latitude = fromResolved ? fromResolved.lat : null;
  const longitude = fromResolved ? fromResolved.lng : null;
  const embedMapUrl = fromResolved ? buildEmbedUrlFromLatLng(latitude, longitude) : '';

  return { googleMapLink: normalized, resolvedUrl, latitude, longitude, embedMapUrl };
}

async function listAdmin() {
  const docs = await ClinicLocation.find({}).sort({ updatedAt: -1 }).lean();
  return docs.map(toPlain);
}

async function seedFromClinicProfileIfEmpty() {
  const count = await ClinicLocation.estimatedDocumentCount();
  if (count > 0) return;

  let clinic;
  try {
    clinic = await contentService.getClinicProfile();
  } catch (_) {
    clinic = null;
  }

  const googleMapLink = clinic && (clinic.googleMapsUrl || (clinic.address && clinic.address.googleMapsUrl))
    ? String(clinic.googleMapsUrl || (clinic.address && clinic.address.googleMapsUrl) || '').trim()
    : '';

  if (!googleMapLink) return;

  try {
    await createAndActivate({
      clinicName: clinic && clinic.name ? String(clinic.name) : '',
      googleMapLink,
      addressText: clinic && clinic.addressText ? String(clinic.addressText) : '',
    });
  } catch (_) {
  }
}

async function getActivePublic() {
  await seedFromClinicProfileIfEmpty();
  const doc = await ClinicLocation.findOne({ status: 'active' }).sort({ updatedAt: -1 }).lean();
  return doc ? toPlain(doc) : undefined;
}

async function createAndActivate(payload) {
  const now = nowIso();
  const parsed = await parseGoogleMapLink(payload.googleMapLink);

  if (!parsed.embedMapUrl || parsed.latitude === null || parsed.longitude === null) {
    const err = new Error('Could not extract latitude/longitude from the Google Maps link');
    err.statusCode = 400;
    throw err;
  }

  let clinicName = String(payload.clinicName || '').trim();
  let addressText = String(payload.addressText || '').trim();

  if (!clinicName || !addressText) {
    try {
      const clinic = await contentService.getClinicProfile();
      if (!clinicName) clinicName = String((clinic && clinic.name) || '').trim();
      if (!addressText) addressText = String((clinic && clinic.addressText) || '').trim();
    } catch (_) {
    }
  }

  await ClinicLocation.updateMany({ status: 'active' }, { $set: { status: 'inactive', updatedAt: now } });

  const item = {
    id: crypto.randomUUID(),
    clinicName: clinicName || 'Clinic',
    googleMapLink: parsed.googleMapLink,
    embedMapUrl: parsed.embedMapUrl,
    latitude: parsed.latitude,
    longitude: parsed.longitude,
    addressText: addressText || '',
    status: 'active',
    createdAt: now,
    updatedAt: now,
  };

  await ClinicLocation.create(item);
  return item;
}

async function patchById(id, patch) {
  const current = await ClinicLocation.findOne({ id }).lean();
  if (!current) {
    const err = new Error('Clinic location not found');
    err.statusCode = 404;
    throw err;
  }

  const now = nowIso();
  const base = { ...current };

  let parsedLink = null;
  if (typeof patch.googleMapLink !== 'undefined') {
    parsedLink = await parseGoogleMapLink(patch.googleMapLink);
    if (!parsedLink.embedMapUrl || parsedLink.latitude === null || parsedLink.longitude === null) {
      const err = new Error('Could not extract latitude/longitude from the Google Maps link');
      err.statusCode = 400;
      throw err;
    }
  }

  const next = {
    ...base,
    ...patch,
    ...(parsedLink
      ? {
          googleMapLink: parsedLink.googleMapLink,
          embedMapUrl: parsedLink.embedMapUrl,
          latitude: parsedLink.latitude,
          longitude: parsedLink.longitude,
        }
      : {}),
    updatedAt: now,
  };

  const saved = await ClinicLocation.findOneAndUpdate({ id }, { $set: next }, { new: true, lean: true });
  return saved ? toPlain(saved) : toPlain(next);
}

async function setActive(id) {
  const current = await ClinicLocation.findOne({ id }).lean();
  if (!current) {
    const err = new Error('Clinic location not found');
    err.statusCode = 404;
    throw err;
  }

  const now = nowIso();
  await ClinicLocation.updateMany({ status: 'active' }, { $set: { status: 'inactive', updatedAt: now } });
  const saved = await ClinicLocation.findOneAndUpdate(
    { id },
    { $set: { status: 'active', updatedAt: now } },
    { new: true, lean: true }
  );

  return saved ? toPlain(saved) : toPlain({ ...current, status: 'active', updatedAt: now });
}

async function disable(id) {
  const now = nowIso();
  const saved = await ClinicLocation.findOneAndUpdate(
    { id },
    { $set: { status: 'inactive', updatedAt: now } },
    { new: true, lean: true }
  );

  if (!saved) {
    const err = new Error('Clinic location not found');
    err.statusCode = 404;
    throw err;
  }

  return toPlain(saved);
}

module.exports = {
  listAdmin,
  getActivePublic,
  createAndActivate,
  patchById,
  setActive,
  disable,
  parseGoogleMapLink,
};
