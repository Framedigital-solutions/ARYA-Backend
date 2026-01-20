function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function inferIconType({ title, iconType }) {
  const existing = normalizeText(iconType);
  if (existing) return existing;

  const t = normalizeText(title);

  if (t.includes('paralysis')) return 'paralysis';
  if (t.includes('polio')) return 'polio';
  if (t.includes('neural') || t.includes('nerve') || t.includes('wellness')) return 'neural';
  if (t.includes('gonorrhea')) return 'infection';
  if (t.includes('jaundice') || t.includes('liver')) return 'liver';
  if (t.includes('eczema') || t.includes('skin')) return 'skin';
  if (t.includes('asthma') || t.includes('respiratory') || t.includes('breath')) return 'respiratory';
  if (t.includes('arthritis') || t.includes('joint')) return 'joint';
  if (t.includes('sciatica') || t.includes('vata')) return 'nerve';

  return 'wellness';
}

function generateBulletPoints({ title, iconType, bulletPoints }) {
  const existing = Array.isArray(bulletPoints) ? bulletPoints.map((s) => String(s || '').trim()).filter(Boolean) : [];
  if (existing.length) return existing.slice(0, 3);

  const icon = inferIconType({ title, iconType });

  const common = ['Natural and non-invasive care', 'Personalized homeopathic remedies', 'Long-term wellness focused support'];

  const byIcon = {
    paralysis: ['Natural and non-invasive care', 'Support for movement and strength', 'Step-by-step recovery guidance'],
    polio: ['Gentle supportive care', 'Focus on daily mobility and comfort', 'Long-term wellness focused support'],
    neural: ['Whole-body wellness support', 'Stress and sleep friendly care', 'Natural and non-invasive care'],
    infection: ['Gentle immune support', 'Personalized homeopathic remedies', 'Safe and private care guidance'],
    liver: ['Gentle detox and recovery support', 'Diet and lifestyle friendly guidance', 'Personalized homeopathic remedies'],
    skin: ['Skin comfort and itch relief support', 'Diet and lifestyle friendly guidance', 'Natural and non-invasive care'],
    respiratory: ['Breathing comfort support', 'Triggers and lifestyle guidance', 'Natural and non-invasive care'],
    joint: ['Pain and stiffness comfort support', 'Movement and lifestyle guidance', 'Natural and non-invasive care'],
    nerve: ['Nerve comfort and mobility support', 'Personalized homeopathic remedies', 'Long-term wellness focused support'],
    wellness: common,
  };

  const list = byIcon[icon] || common;
  return list.slice(0, 3);
}

module.exports = { inferIconType, generateBulletPoints };
