const path = require('path');
const crypto = require('crypto');

const { readJson, writeJson } = require('../../utils/fileStore');

const filePath = path.join(__dirname, '..', '..', 'data', 'content.json');

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function normalizeProgramsSection(content) {
  const now = new Date().toISOString();
  const base = content && typeof content === 'object' ? content : {};

  let programs = base.programs;

  if (Array.isArray(programs)) {
    programs = { title: '', subtitle: '', items: programs };
  }

  if (!programs || typeof programs !== 'object') {
    programs = { title: '', subtitle: '', items: [] };
  }

  const items = Array.isArray(programs.items) ? programs.items : [];

  const nextItems = items.map((item) => {
    const createdAt = item.createdAt || now;
    const title = item.title || '';
    return {
      id: item.id || crypto.randomUUID(),
      slug: item.slug || slugify(title) || crypto.randomUUID(),
      title,
      shortDescription: item.shortDescription || '',
      bullets: Array.isArray(item.bullets) ? item.bullets : [],
      iconKey: item.iconKey || item.icon || '',
      sortOrder: Number.isInteger(item.sortOrder) ? item.sortOrder : 0,
      isPublished: typeof item.isPublished === 'boolean' ? item.isPublished : true,
      createdAt,
      updatedAt: item.updatedAt || createdAt,
    };
  });

  return {
    ...base,
    programs: {
      title: programs.title || '',
      subtitle: programs.subtitle || '',
      items: nextItems,
    },
  };
}

function normalizeTestimonialsSection(content) {
  const now = new Date().toISOString();
  const base = content && typeof content === 'object' ? content : {};

  let testimonials = base.testimonials;

  if (Array.isArray(testimonials)) {
    testimonials = { title: '', subtitle: '', items: testimonials };
  }

  if (!testimonials || typeof testimonials !== 'object') {
    testimonials = { title: '', subtitle: '', items: [] };
  }

  const items = Array.isArray(testimonials.items) ? testimonials.items : [];

  const nextItems = items.map((item) => {
    const createdAt = item.createdAt || now;

    const patientDisplayName = item.patientDisplayName || item.name || '';
    const quote = item.quote || '';
    const outcomeLabel = item.outcomeLabel || item.highlight || '';
    const treatmentDuration = item.treatmentDuration || '';

    let age = typeof item.age === 'number' ? item.age : undefined;
    let category = item.category || '';

    if ((!age || !category) && typeof item.meta === 'string') {
      const meta = item.meta;
      const ageMatch = meta.match(/(\d{1,3})\s*years?/i);
      if (!age && ageMatch) {
        const parsedAge = Number(ageMatch[1]);
        if (!Number.isNaN(parsedAge)) age = parsedAge;
      }

      if (!category) {
        const parts = meta.split('•').map((p) => p.trim()).filter(Boolean);
        if (parts.length > 1) category = parts[1];
      }
    }

    return {
      ...item,
      id: item.id || crypto.randomUUID(),
      patientDisplayName,
      age,
      category,
      quote,
      outcomeLabel,
      treatmentDuration,
      isPublished: typeof item.isPublished === 'boolean' ? item.isPublished : true,
      createdAt,
      updatedAt: item.updatedAt || createdAt,
    };
  });

  return {
    ...base,
    testimonials: {
      title: testimonials.title || '',
      subtitle: testimonials.subtitle || '',
      items: nextItems,
    },
  };
}

function normalizeClinicProfile(content) {
  const now = new Date().toISOString();
  const base = content && typeof content === 'object' ? content : {};
  const clinicProfile = base.clinicProfile && typeof base.clinicProfile === 'object' ? base.clinicProfile : {};

  const name = clinicProfile.name || '';
  const tagline = clinicProfile.tagline || '';
  const phones = Array.isArray(clinicProfile.phones) ? clinicProfile.phones : [];
  const primaryPhone = clinicProfile.primaryPhone || phones[0] || '';
  const secondaryPhone = clinicProfile.secondaryPhone || phones[1] || '';
  const googleMapsUrl =
    clinicProfile.googleMapsUrl || (clinicProfile.address && clinicProfile.address.googleMapsUrl) || '';

  const addressText =
    clinicProfile.addressText ||
    [
      clinicProfile.address && clinicProfile.address.line1,
      clinicProfile.address && clinicProfile.address.line2,
    ]
      .filter(Boolean)
      .join(', ');

  const hoursText =
    clinicProfile.hoursText ||
    (Array.isArray(clinicProfile.hours) ? clinicProfile.hours.map((h) => h.label).filter(Boolean).join(' | ') : '');

  return {
    ...base,
    clinicProfile: {
      ...clinicProfile,
      id: clinicProfile.id || 'clinic_main',
      name,
      tagline,
      primaryPhone,
      secondaryPhone,
      whatsappNumber: clinicProfile.whatsappNumber || '',
      addressText,
      hoursText,
      googleMapsUrl,
      updatedAt: clinicProfile.updatedAt || now,
    },
  };
}

function defaultContent() {
  return {
    updatedAt: new Date().toISOString(),
    hero: {
      titleLines: ['Restoring', 'Movement,', 'Restoring Life'],
      subtitle:
        'For over a century, Arya Homoeo Hall has been a beacon of hope for those seeking natural, holistic healing.',
      ctaPrimary: 'Book Consultation',
      ctaSecondary: 'Learn More',
    },
    clinic: {
      name: 'Arya Homoeo Hall',
      since: '1924',
      phones: ['+91 98765 43210', '+91 87654 32109'],
      email: ['info@aryahomoeohall.com', 'appointments@aryahomoeohall.com'],
      addressLines: ['123 Heritage Lane', 'Old City, Mumbai 400001'],
      hours: ['Mon-Sat: 9:00 AM - 7:00 PM', 'Sunday: 10:00 AM - 2:00 PM'],
    },
    clinicProfile: {
      id: 'clinic_main',
      name: 'Arya Homoeo Hall',
      since: '1924',
      tagline: 'Healing Since 1924',
      primaryPhone: '+91 98765 43210',
      secondaryPhone: '+91 87654 32109',
      whatsappNumber: '',
      phones: ['+91 98765 43210', '+91 87654 32109'],
      emails: ['info@aryahomoeohall.com', 'appointments@aryahomoeohall.com'],
      addressText: '123 Heritage Lane, Old City, Mumbai 400001',
      address: {
        line1: '123 Heritage Lane',
        line2: 'Old City, Mumbai 400001',
        city: 'Mumbai',
        state: 'MH',
        pincode: '400001',
        country: 'IN',
        googleMapsUrl: '',
      },
      hoursText: 'Mon-Sat: 9:00 AM - 7:00 PM | Sunday: 10:00 AM - 2:00 PM',
      hours: [
        { label: 'Mon-Sat', open: '09:00', close: '19:00' },
        { label: 'Sun', open: '10:00', close: '14:00' },
      ],
      googleMapsUrl: '',
      updatedAt: new Date().toISOString(),
      social: {
        facebook: '',
        instagram: '',
        youtube: '',
        linkedin: '',
      },
    },
    programs: {
      title: 'Specialized Care Programs',
      subtitle:
        'Our expertise in paralysis and polio treatment is backed by generations of clinical experience and thousands of success stories.',
      items: [
        {
          id: 'paralysis',
          title: 'Paralysis Recovery Program',
          shortDescription:
            'Comprehensive treatment focusing on restoring movement and function through natural methods.',
          bullets: [
            'Non-invasive nerve stimulation',
            'Customized homeopathic remedies',
            'Muscle strengthening protocols',
            'Holistic rehabilitation support',
          ],
          icon: 'paralysis',
        },
        {
          id: 'polio',
          title: 'Polio Management',
          shortDescription:
            'Specialized care for polio patients emphasizing quality of life and functional improvement.',
          bullets: [
            'Post-polio syndrome care',
            'Muscle atrophy prevention',
            'Pain management strategies',
            'Long-term wellness plans',
          ],
          icon: 'polio',
        },
        {
          id: 'neural',
          title: 'Neural Care & Wellness',
          shortDescription:
            'Preventive and curative treatments for overall nervous system health and vitality.',
          bullets: [
            'Preventive neurological care',
            'Chronic pain relief',
            'Natural immune boosting',
            'Stress & anxiety management',
          ],
          icon: 'neural',
        },
      ],
    },
    testimonials: {
      title: 'Stories of Hope & Healing',
      subtitle:
        'Real patients, real recovery. These testimonials represent the thousands of lives transformed through our natural healing approach.',
      items: [
        {
          id: 'rk-1',
          patientDisplayName: 'R.K.',
          age: 58,
          category: 'Paralysis Recovery',
          name: 'R.K.',
          meta: '58 years • Paralysis Recovery',
          quote:
            "After my stroke, I couldn't move my left side. Within 8 months of treatment at Arya Homoeo Hall, I can now walk without support. The care and patience shown by the doctors gave me hope when I had none.",
          treatmentDuration: '8 months',
          outcomeLabel: 'Walking Without Support',
          highlight: 'Walking Without Support',
          order: 1,
          isPublished: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
    },
  };
}

async function getAll() {
  const data = await readJson(filePath, defaultContent());
  return normalizeTestimonialsSection(normalizeClinicProfile(normalizeProgramsSection(data)));
}

async function getSection(section) {
  const all = await getAll();
  return all ? all[section] : undefined;
}

async function setAll(nextContent) {
  const payload = {
    ...nextContent,
    updatedAt: new Date().toISOString(),
  };
  await writeJson(filePath, payload);
  return payload;
}

async function setSection(section, value) {
  const current = await getAll();
  const nextContent = {
    ...(current || {}),
    [section]: value,
  };
  return setAll(nextContent);
}

async function getClinicProfile() {
  const all = await getAll();
  return all.clinicProfile;
}

function mergeClinicProfile(existing, input, isPatch) {
  const now = new Date().toISOString();
  const current = existing && typeof existing === 'object' ? existing : {};

  const next = isPatch ? { ...current, ...input } : { ...current, ...input };

  const name = typeof next.name === 'string' ? next.name : current.name || '';
  const tagline = typeof next.tagline === 'string' ? next.tagline : current.tagline || '';

  const primaryPhone = typeof next.primaryPhone === 'string' ? next.primaryPhone : current.primaryPhone || '';
  const secondaryPhone = typeof next.secondaryPhone === 'string' ? next.secondaryPhone : current.secondaryPhone || '';
  const phones = [primaryPhone, secondaryPhone].filter(Boolean);

  const googleMapsUrl = typeof next.googleMapsUrl === 'string' ? next.googleMapsUrl : current.googleMapsUrl || '';

  return {
    ...current,
    ...next,
    id: next.id || current.id || 'clinic_main',
    name,
    tagline,
    primaryPhone,
    secondaryPhone,
    phones,
    address: {
      ...(current.address && typeof current.address === 'object' ? current.address : {}),
      ...(next.address && typeof next.address === 'object' ? next.address : {}),
      googleMapsUrl,
    },
    googleMapsUrl,
    updatedAt: now,
  };
}

async function upsertClinicProfile(payload) {
  const all = await getAll();
  const nextProfile = mergeClinicProfile(all.clinicProfile, payload, false);
  const next = {
    ...all,
    clinicProfile: nextProfile,
  };
  await setAll(next);
  return nextProfile;
}

async function patchClinicProfile(patch) {
  const all = await getAll();
  if (!all.clinicProfile) {
    const err = new Error('Clinic profile not found');
    err.statusCode = 404;
    throw err;
  }
  const nextProfile = mergeClinicProfile(all.clinicProfile, patch, true);
  const next = {
    ...all,
    clinicProfile: nextProfile,
  };
  await setAll(next);
  return nextProfile;
}

async function deleteClinicProfile() {
  const all = await getAll();
  if (!all.clinicProfile) {
    const err = new Error('Clinic profile not found');
    err.statusCode = 404;
    throw err;
  }
  const removed = all.clinicProfile;
  const next = { ...all };
  delete next.clinicProfile;
  await setAll(next);
  return removed;
}

function sortTestimonials(items) {
  return [...items].sort((a, b) => {
    const ao = Number.isInteger(a.order) ? a.order : Number.isInteger(a.sortOrder) ? a.sortOrder : 0;
    const bo = Number.isInteger(b.order) ? b.order : Number.isInteger(b.sortOrder) ? b.sortOrder : 0;
    if (ao !== bo) return ao - bo;
    return String(a.patientDisplayName || '').localeCompare(String(b.patientDisplayName || ''));
  });
}

async function listTestimonials({ includeUnpublished }) {
  const all = await getAll();
  const section = all.testimonials || { title: '', subtitle: '', items: [] };
  const items = Array.isArray(section.items) ? section.items : [];
  const filtered = includeUnpublished ? items : items.filter((t) => t.isPublished);
  return {
    title: section.title || '',
    subtitle: section.subtitle || '',
    items: sortTestimonials(filtered),
  };
}

async function createTestimonial(payload) {
  const all = await getAll();
  const section = all.testimonials || { title: '', subtitle: '', items: [] };
  const items = Array.isArray(section.items) ? section.items : [];

  const now = new Date().toISOString();
  const item = {
    id: crypto.randomUUID(),
    patientDisplayName: payload.patientDisplayName,
    age: payload.age,
    category: payload.category,
    quote: payload.quote,
    outcomeLabel: payload.outcomeLabel || '',
    treatmentDuration: payload.treatmentDuration || '',
    isPublished: typeof payload.isPublished === 'boolean' ? payload.isPublished : true,
    createdAt: now,
    updatedAt: now,
  };

  const next = {
    ...all,
    testimonials: {
      title: section.title || '',
      subtitle: section.subtitle || '',
      items: [...items, item],
    },
  };

  await setAll(next);
  return item;
}

async function updateTestimonial(id, patch) {
  const all = await getAll();
  const section = all.testimonials || { title: '', subtitle: '', items: [] };
  const items = Array.isArray(section.items) ? section.items : [];

  const idx = items.findIndex((t) => t.id === id);
  if (idx < 0) {
    const err = new Error('Testimonial not found');
    err.statusCode = 404;
    throw err;
  }

  const current = items[idx];
  const now = new Date().toISOString();
  const nextItem = {
    ...current,
    ...patch,
    patientDisplayName:
      typeof patch.patientDisplayName !== 'undefined' ? patch.patientDisplayName : current.patientDisplayName,
    updatedAt: now,
  };

  const nextItems = [...items];
  nextItems[idx] = nextItem;

  const next = {
    ...all,
    testimonials: {
      title: section.title || '',
      subtitle: section.subtitle || '',
      items: nextItems,
    },
  };

  await setAll(next);
  return nextItem;
}

async function deleteTestimonial(id) {
  const all = await getAll();
  const section = all.testimonials || { title: '', subtitle: '', items: [] };
  const items = Array.isArray(section.items) ? section.items : [];

  const idx = items.findIndex((t) => t.id === id);
  if (idx < 0) {
    const err = new Error('Testimonial not found');
    err.statusCode = 404;
    throw err;
  }

  const removed = items[idx];
  const nextItems = items.filter((t) => t.id !== id);

  const next = {
    ...all,
    testimonials: {
      title: section.title || '',
      subtitle: section.subtitle || '',
      items: nextItems,
    },
  };

  await setAll(next);
  return removed;
}

function sortPrograms(items) {
  return [...items].sort((a, b) => {
    const ao = Number.isInteger(a.sortOrder) ? a.sortOrder : 0;
    const bo = Number.isInteger(b.sortOrder) ? b.sortOrder : 0;
    if (ao !== bo) return ao - bo;
    return String(a.title || '').localeCompare(String(b.title || ''));
  });
}

async function listPrograms({ includeUnpublished }) {
  const all = await getAll();
  const section = all.programs || { title: '', subtitle: '', items: [] };
  const items = Array.isArray(section.items) ? section.items : [];
  const filtered = includeUnpublished ? items : items.filter((p) => p.isPublished);
  return {
    title: section.title || '',
    subtitle: section.subtitle || '',
    items: sortPrograms(filtered),
  };
}

async function createProgram(payload) {
  const all = await getAll();
  const section = all.programs || { title: '', subtitle: '', items: [] };
  const items = Array.isArray(section.items) ? section.items : [];

  const slug = String(payload.slug || '').toLowerCase();
  const slugExists = items.some((p) => String(p.slug || '').toLowerCase() === slug);
  if (slugExists) {
    const err = new Error('Program slug must be unique');
    err.statusCode = 409;
    throw err;
  }

  const now = new Date().toISOString();
  const item = {
    id: crypto.randomUUID(),
    slug,
    title: payload.title,
    shortDescription: payload.shortDescription,
    bullets: Array.isArray(payload.bullets) ? payload.bullets : [],
    iconKey: payload.iconKey || '',
    sortOrder: Number.isInteger(payload.sortOrder) ? payload.sortOrder : 0,
    isPublished: typeof payload.isPublished === 'boolean' ? payload.isPublished : true,
    createdAt: now,
    updatedAt: now,
  };

  const next = {
    ...all,
    programs: {
      title: section.title || '',
      subtitle: section.subtitle || '',
      items: [...items, item],
    },
  };

  await setAll(next);
  return item;
}

async function updateProgram(id, patch) {
  const all = await getAll();
  const section = all.programs || { title: '', subtitle: '', items: [] };
  const items = Array.isArray(section.items) ? section.items : [];

  const idx = items.findIndex((p) => p.id === id);
  if (idx < 0) {
    const err = new Error('Program not found');
    err.statusCode = 404;
    throw err;
  }

  const current = items[idx];

  if (typeof patch.slug !== 'undefined') {
    const nextSlug = String(patch.slug || '').toLowerCase();
    const slugExists = items.some(
      (p) => p.id !== id && String(p.slug || '').toLowerCase() === nextSlug,
    );
    if (slugExists) {
      const err = new Error('Program slug must be unique');
      err.statusCode = 409;
      throw err;
    }
  }

  const now = new Date().toISOString();
  const nextItem = {
    ...current,
    ...patch,
    slug: typeof patch.slug !== 'undefined' ? String(patch.slug || '').toLowerCase() : current.slug,
    bullets: typeof patch.bullets !== 'undefined' ? patch.bullets : current.bullets,
    updatedAt: now,
  };

  const nextItems = [...items];
  nextItems[idx] = nextItem;

  const next = {
    ...all,
    programs: {
      title: section.title || '',
      subtitle: section.subtitle || '',
      items: nextItems,
    },
  };

  await setAll(next);
  return nextItem;
}

async function deleteProgram(id) {
  const all = await getAll();
  const section = all.programs || { title: '', subtitle: '', items: [] };
  const items = Array.isArray(section.items) ? section.items : [];

  const idx = items.findIndex((p) => p.id === id);
  if (idx < 0) {
    const err = new Error('Program not found');
    err.statusCode = 404;
    throw err;
  }

  const removed = items[idx];
  const nextItems = items.filter((p) => p.id !== id);

  const next = {
    ...all,
    programs: {
      title: section.title || '',
      subtitle: section.subtitle || '',
      items: nextItems,
    },
  };

  await setAll(next);
  return removed;
}

module.exports = {
  getAll,
  getSection,
  setAll,
  setSection,
  listPrograms,
  createProgram,
  updateProgram,
  deleteProgram,
  getClinicProfile,
  upsertClinicProfile,
  patchClinicProfile,
  deleteClinicProfile,
  listTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
};
