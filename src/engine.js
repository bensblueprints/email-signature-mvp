/*
 * Email Signature Studio — signature engine.
 * Pure, dependency-free module shared by the Electron renderer and Node tests.
 * All generated HTML is email-safe: table layouts, inline styles only,
 * no <link>, no <style> blocks, Outlook conditional comments where useful.
 */
(function (root, factory) {
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = factory();
  } else {
    root.SignatureEngine = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---------------------------------------------------------------- socials

  var SOCIAL_NETWORKS = [
    { id: 'linkedin',  label: 'LinkedIn',  color: '#0A66C2', glyph: 'in' },
    { id: 'twitter',   label: 'X / Twitter', color: '#000000', glyph: '𝕏' },
    { id: 'facebook',  label: 'Facebook',  color: '#1877F2', glyph: 'f' },
    { id: 'instagram', label: 'Instagram', color: '#E4405F', glyph: 'ig' },
    { id: 'youtube',   label: 'YouTube',   color: '#FF0000', glyph: '▶' },
    { id: 'tiktok',    label: 'TikTok',    color: '#010101', glyph: '♪' },
    { id: 'github',    label: 'GitHub',    color: '#181717', glyph: 'gh' },
    { id: 'dribbble',  label: 'Dribbble',  color: '#EA4C89', glyph: 'dr' },
    { id: 'behance',   label: 'Behance',   color: '#1769FF', glyph: 'Bē' },
    { id: 'pinterest', label: 'Pinterest', color: '#BD081C', glyph: 'p' },
    { id: 'whatsapp',  label: 'WhatsApp',  color: '#25D366', glyph: 'wa' },
    { id: 'telegram',  label: 'Telegram',  color: '#26A5E4', glyph: 'tg' }
  ];

  // ------------------------------------------------------------- utilities

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function telHref(phone) {
    return 'tel:' + String(phone || '').replace(/[^+\d]/g, '');
  }

  function webHref(url) {
    var u = String(url || '').trim();
    if (!u) return '';
    if (!/^https?:\/\//i.test(u)) u = 'https://' + u;
    return u;
  }

  function webLabel(url) {
    return String(url || '').trim().replace(/^https?:\/\//i, '').replace(/\/$/, '');
  }

  var FONT = "Arial, Helvetica, sans-serif";

  function normalizeProfile(p) {
    p = p || {};
    return {
      name: p.name || '',
      title: p.title || '',
      company: p.company || '',
      phone: p.phone || '',
      phone2: p.phone2 || '',
      email: p.email || '',
      website: p.website || '',
      address: p.address || '',
      photo: p.photo || '',          // base64 data URL from upload
      photoUrl: p.photoUrl || '',    // hosted URL (preferred for delivery)
      socials: p.socials || {},      // { linkedin: 'https://...', ... }
      banner: p.banner || '',        // base64 data URL
      bannerUrl: p.bannerUrl || '',  // hosted URL
      bannerLink: p.bannerLink || '',
      ctaText: p.ctaText || '',
      ctaUrl: p.ctaUrl || '',
      ctaColor: p.ctaColor || '#2563EB',
      disclaimer: p.disclaimer || ''
    };
  }

  function normalizeOptions(o) {
    o = o || {};
    return {
      accentColor: o.accentColor || '#2563EB',
      iconStyle: o.iconStyle === 'mono' ? 'mono' : 'color',
      textColor: o.textColor || '#1F2937',
      mutedColor: o.mutedColor || '#6B7280'
    };
  }

  function photoSrc(p) { return p.photoUrl || p.photo || ''; }
  function bannerSrc(p) { return p.bannerUrl || p.banner || ''; }

  // ------------------------------------------------------ shared fragments

  /**
   * Social icon row. Uses HTML "badge" cells (colored table cells with a
   * glyph) rather than image files, so signatures need zero external
   * requests and never show broken-image icons. Works in Gmail, Outlook,
   * Apple Mail and Thunderbird.
   */
  function socialRow(p, opts, align) {
    var cells = [];
    SOCIAL_NETWORKS.forEach(function (net) {
      var url = p.socials[net.id];
      if (!url) return;
      var bg = opts.iconStyle === 'mono' ? '#4B5563' : net.color;
      cells.push(
        '<td style="padding:0 6px 0 0;">' +
          '<a href="' + esc(webHref(url)) + '" target="_blank" title="' + esc(net.label) + '" ' +
            'style="display:inline-block;width:24px;height:24px;background-color:' + bg + ';' +
            'border-radius:4px;text-align:center;text-decoration:none;">' +
            '<span style="font-family:' + FONT + ';font-size:12px;font-weight:bold;color:#ffffff;line-height:24px;">' +
              esc(net.glyph) +
            '</span>' +
          '</a>' +
        '</td>'
      );
    });
    if (!cells.length) return '';
    return '<table cellpadding="0" cellspacing="0" border="0" role="presentation"' +
      (align === 'center' ? ' align="center"' : '') + '><tr>' + cells.join('') + '</tr></table>';
  }

  function ctaButton(p, opts) {
    if (!p.ctaText || !p.ctaUrl) return '';
    var color = p.ctaColor || opts.accentColor;
    return (
      '<!--[if mso]>' +
      '<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="' + esc(webHref(p.ctaUrl)) + '" ' +
        'style="height:32px;v-text-anchor:middle;width:180px;" arcsize="15%" fillcolor="' + esc(color) + '" stroke="f">' +
        '<center style="color:#ffffff;font-family:Arial,sans-serif;font-size:13px;font-weight:bold;">' +
          esc(p.ctaText) + '</center></v:roundrect><![endif]-->' +
      '<!--[if !mso]><!-->' +
      '<a href="' + esc(webHref(p.ctaUrl)) + '" target="_blank" ' +
        'style="display:inline-block;background-color:' + esc(color) + ';color:#ffffff;' +
        'font-family:' + FONT + ';font-size:13px;font-weight:bold;text-decoration:none;' +
        'padding:8px 20px;border-radius:5px;">' + esc(p.ctaText) + '</a>' +
      '<!--<![endif]-->'
    );
  }

  function bannerBlock(p) {
    var src = bannerSrc(p);
    if (!src) return '';
    var img = '<img src="' + esc(src) + '" alt="Banner" width="400" ' +
      'style="display:block;width:400px;max-width:100%;height:auto;border:0;border-radius:6px;" />';
    if (p.bannerLink) {
      img = '<a href="' + esc(webHref(p.bannerLink)) + '" target="_blank" style="text-decoration:none;">' + img + '</a>';
    }
    return img;
  }

  function disclaimerBlock(p, opts, width) {
    if (!p.disclaimer) return '';
    return '<tr><td colspan="9" style="padding-top:12px;">' +
      '<p style="margin:0;font-family:' + FONT + ';font-size:10px;line-height:14px;color:' +
      opts.mutedColor + ';max-width:' + (width || 480) + 'px;">' + esc(p.disclaimer) + '</p></td></tr>';
  }

  function contactBits(p, opts, sep) {
    sep = sep || ('<span style="color:' + opts.mutedColor + ';">&nbsp;&nbsp;|&nbsp;&nbsp;</span>');
    var linkStyle = 'color:' + opts.textColor + ';text-decoration:none;';
    var bits = [];
    if (p.phone) bits.push('<a href="' + telHref(p.phone) + '" style="' + linkStyle + '">' + esc(p.phone) + '</a>');
    if (p.phone2) bits.push('<a href="' + telHref(p.phone2) + '" style="' + linkStyle + '">' + esc(p.phone2) + '</a>');
    if (p.email) bits.push('<a href="mailto:' + esc(p.email) + '" style="' + linkStyle + '">' + esc(p.email) + '</a>');
    if (p.website) bits.push('<a href="' + esc(webHref(p.website)) + '" target="_blank" style="color:' + opts.accentColor + ';text-decoration:none;">' + esc(webLabel(p.website)) + '</a>');
    return bits.join(sep);
  }

  function contactStack(p, opts, labelIcons) {
    var rows = [];
    var style = 'font-family:' + FONT + ';font-size:12px;line-height:20px;color:' + opts.textColor + ';';
    var linkStyle = 'color:' + opts.textColor + ';text-decoration:none;';
    function row(iconChar, inner) {
      var icon = labelIcons
        ? '<span style="color:' + opts.accentColor + ';font-weight:bold;">' + iconChar + '&nbsp;&nbsp;</span>'
        : '';
      rows.push('<tr><td style="' + style + '">' + icon + inner + '</td></tr>');
    }
    if (p.phone) row('T', '<a href="' + telHref(p.phone) + '" style="' + linkStyle + '">' + esc(p.phone) + '</a>');
    if (p.phone2) row('M', '<a href="' + telHref(p.phone2) + '" style="' + linkStyle + '">' + esc(p.phone2) + '</a>');
    if (p.email) row('E', '<a href="mailto:' + esc(p.email) + '" style="' + linkStyle + '">' + esc(p.email) + '</a>');
    if (p.website) row('W', '<a href="' + esc(webHref(p.website)) + '" target="_blank" style="color:' + opts.accentColor + ';text-decoration:none;">' + esc(webLabel(p.website)) + '</a>');
    if (p.address) row('A', esc(p.address));
    if (!rows.length) return '';
    return '<table cellpadding="0" cellspacing="0" border="0" role="presentation">' + rows.join('') + '</table>';
  }

  function photoCell(p, size, round) {
    var src = photoSrc(p);
    if (!src) return '';
    return '<img src="' + esc(src) + '" alt="' + esc(p.name) + '" width="' + size + '" height="' + size + '" ' +
      'style="display:block;width:' + size + 'px;height:' + size + 'px;object-fit:cover;border:0;border-radius:' +
      (round ? '50%' : '8px') + ';" />';
  }

  function nameBlock(p, opts, nameSize, center) {
    var align = center ? 'text-align:center;' : '';
    var html = '<p style="margin:0;' + align + 'font-family:' + FONT + ';font-size:' + (nameSize || 17) +
      'px;font-weight:bold;color:' + opts.textColor + ';line-height:1.3;">' + esc(p.name) + '</p>';
    var sub = [];
    if (p.title) sub.push(esc(p.title));
    if (p.company) sub.push('<span style="color:' + opts.accentColor + ';font-weight:bold;">' + esc(p.company) + '</span>');
    if (sub.length) {
      html += '<p style="margin:2px 0 0 0;' + align + 'font-family:' + FONT + ';font-size:12px;color:' +
        opts.mutedColor + ';line-height:1.4;">' + sub.join('&nbsp;&nbsp;&middot;&nbsp;&nbsp;') + '</p>';
    }
    return html;
  }

  function wrap(inner, width) {
    // Outer wrapper: fixed-width table so signatures don't stretch full-width.
    return '<table cellpadding="0" cellspacing="0" border="0" role="presentation" ' +
      'style="width:' + width + 'px;max-width:100%;border-collapse:collapse;">' + inner + '</table>';
  }

  function extrasRows(p, opts, colspan) {
    var html = '';
    var banner = bannerBlock(p);
    var cta = ctaButton(p, opts);
    if (cta) html += '<tr><td colspan="' + colspan + '" style="padding-top:12px;">' + cta + '</td></tr>';
    if (banner) html += '<tr><td colspan="' + colspan + '" style="padding-top:12px;">' + banner + '</td></tr>';
    if (p.disclaimer) {
      html += '<tr><td colspan="' + colspan + '" style="padding-top:12px;">' +
        '<p style="margin:0;font-family:' + FONT + ';font-size:10px;line-height:14px;color:' +
        opts.mutedColor + ';">' + esc(p.disclaimer) + '</p></td></tr>';
    }
    return html;
  }

  // -------------------------------------------------------------- templates

  var TEMPLATES = {};

  TEMPLATES.classic = {
    name: 'Classic',
    render: function (p, opts) {
      var inner =
        '<tr>' +
          (photoSrc(p) ? '<td valign="top" style="padding:0 16px 0 0;">' + photoCell(p, 80, true) + '</td>' : '') +
          '<td valign="top">' +
            nameBlock(p, opts, 17) +
            '<p style="margin:8px 0 0 0;font-family:' + FONT + ';font-size:12px;color:' + opts.textColor + ';line-height:1.6;">' +
              contactBits(p, opts) + '</p>' +
            (p.address ? '<p style="margin:4px 0 0 0;font-family:' + FONT + ';font-size:11px;color:' + opts.mutedColor + ';">' + esc(p.address) + '</p>' : '') +
            '<div style="padding-top:10px;">' + socialRow(p, opts) + '</div>' +
          '</td>' +
        '</tr>' + extrasRows(p, opts, 2);
      return wrap(inner, 520);
    }
  };

  TEMPLATES['modern-sidebar'] = {
    name: 'Modern Sidebar',
    render: function (p, opts) {
      var inner =
        '<tr>' +
          '<td width="4" style="width:4px;background-color:' + opts.accentColor + ';font-size:0;line-height:0;">&nbsp;</td>' +
          (photoSrc(p) ? '<td valign="top" style="padding:0 16px;">' + photoCell(p, 88, false) + '</td>'
                       : '<td width="16" style="width:16px;font-size:0;">&nbsp;</td>') +
          '<td valign="top">' +
            nameBlock(p, opts, 18) +
            '<div style="padding-top:8px;">' + contactStack(p, opts, true) + '</div>' +
            '<div style="padding-top:10px;">' + socialRow(p, opts) + '</div>' +
          '</td>' +
        '</tr>' + extrasRows(p, opts, 3);
      return wrap(inner, 520);
    }
  };

  TEMPLATES.minimal = {
    name: 'Minimal',
    render: function (p, opts) {
      var line = [esc(p.name)];
      var sub = [p.title, p.company].filter(function (x) { return x; }).join(', ');
      if (sub) line.push('<span style="color:' + opts.mutedColor + ';font-weight:normal;">' + esc(sub) + '</span>');
      var inner =
        '<tr><td>' +
          '<p style="margin:0;font-family:' + FONT + ';font-size:14px;font-weight:bold;color:' + opts.textColor + ';">' +
            line.join('&nbsp;&nbsp;&middot;&nbsp;&nbsp;') + '</p>' +
          '<p style="margin:6px 0 0 0;font-family:' + FONT + ';font-size:12px;color:' + opts.textColor + ';">' +
            contactBits(p, opts) + '</p>' +
          (socialRow(p, opts) ? '<div style="padding-top:8px;">' + socialRow(p, opts) + '</div>' : '') +
        '</td></tr>' + extrasRows(p, opts, 1);
      return wrap(inner, 480);
    }
  };

  TEMPLATES['bold-accent'] = {
    name: 'Bold Accent Bar',
    render: function (p, opts) {
      var inner =
        '<tr><td style="background-color:' + opts.accentColor + ';padding:12px 16px;border-radius:6px 6px 0 0;">' +
          '<p style="margin:0;font-family:' + FONT + ';font-size:18px;font-weight:bold;color:#ffffff;">' + esc(p.name) + '</p>' +
          ((p.title || p.company) ? '<p style="margin:2px 0 0 0;font-family:' + FONT + ';font-size:12px;color:#ffffff;">' +
            esc([p.title, p.company].filter(Boolean).join(' — ')) + '</p>' : '') +
        '</td></tr>' +
        '<tr><td style="padding:12px 16px;border:1px solid #E5E7EB;border-top:0;border-radius:0 0 6px 6px;">' +
          '<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="width:100%;"><tr>' +
            (photoSrc(p) ? '<td valign="top" style="padding:0 14px 0 0;">' + photoCell(p, 72, true) + '</td>' : '') +
            '<td valign="top">' + contactStack(p, opts, true) +
              '<div style="padding-top:8px;">' + socialRow(p, opts) + '</div></td>' +
          '</tr></table>' +
        '</td></tr>' + extrasRows(p, opts, 1);
      return wrap(inner, 520);
    }
  };

  TEMPLATES.card = {
    name: 'Card',
    render: function (p, opts) {
      var inner =
        '<tr><td style="background-color:#F9FAFB;border:1px solid #E5E7EB;border-radius:10px;padding:18px 20px;">' +
          '<table cellpadding="0" cellspacing="0" border="0" role="presentation" style="width:100%;"><tr>' +
            (photoSrc(p) ? '<td valign="middle" style="padding:0 16px 0 0;">' + photoCell(p, 84, true) + '</td>' : '') +
            '<td valign="middle">' +
              nameBlock(p, opts, 17) +
              '<p style="margin:8px 0 0 0;font-family:' + FONT + ';font-size:12px;color:' + opts.textColor + ';line-height:1.6;">' +
                contactBits(p, opts, '<br />') + '</p>' +
              '<div style="padding-top:10px;">' + socialRow(p, opts) + '</div>' +
            '</td>' +
          '</tr></table>' +
        '</td></tr>' + extrasRows(p, opts, 1);
      return wrap(inner, 520);
    }
  };

  TEMPLATES.compact = {
    name: 'Compact',
    render: function (p, opts) {
      var pieces = [
        '<span style="font-weight:bold;color:' + opts.textColor + ';">' + esc(p.name) + '</span>'
      ];
      if (p.title || p.company) pieces.push('<span style="color:' + opts.mutedColor + ';">' + esc([p.title, p.company].filter(Boolean).join(', ')) + '</span>');
      var contact = contactBits(p, opts);
      var inner =
        '<tr>' +
          (photoSrc(p) ? '<td valign="middle" style="padding:0 10px 0 0;">' + photoCell(p, 44, true) + '</td>' : '') +
          '<td valign="middle">' +
            '<p style="margin:0;font-family:' + FONT + ';font-size:12px;line-height:1.5;">' + pieces.join('&nbsp;&nbsp;|&nbsp;&nbsp;') +
            (contact ? '<br />' + contact : '') + '</p>' +
            (socialRow(p, opts) ? '<div style="padding-top:6px;">' + socialRow(p, opts) + '</div>' : '') +
          '</td>' +
        '</tr>' + extrasRows(p, opts, 2);
      return wrap(inner, 560);
    }
  };

  TEMPLATES.corporate = {
    name: 'Corporate',
    render: function (p, opts) {
      var inner =
        '<tr>' +
          (photoSrc(p) ? '<td valign="top" style="padding:0 18px 0 0;">' + photoCell(p, 92, false) + '</td>' : '') +
          '<td valign="top" style="border-left:2px solid ' + opts.accentColor + ';padding-left:18px;">' +
            nameBlock(p, opts, 17) +
            '<div style="padding-top:8px;">' + contactStack(p, opts, true) + '</div>' +
          '</td>' +
        '</tr>' +
        '<tr><td colspan="2" style="padding-top:12px;border-bottom:1px solid #E5E7EB;font-size:0;line-height:0;">&nbsp;</td></tr>' +
        '<tr><td colspan="2" style="padding-top:10px;">' + socialRow(p, opts) + '</td></tr>' +
        extrasRows(p, opts, 2);
      return wrap(inner, 520);
    }
  };

  TEMPLATES.creative = {
    name: 'Creative',
    render: function (p, opts) {
      var inner =
        '<tr>' +
          (photoSrc(p) ? '<td valign="middle" style="padding:0 0 0 0;"><table cellpadding="0" cellspacing="0" border="0" role="presentation"><tr>' +
            '<td style="background-color:' + opts.accentColor + ';border-radius:50%;padding:4px;">' + photoCell(p, 82, true) + '</td>' +
            '</tr></table></td><td width="18" style="width:18px;font-size:0;">&nbsp;</td>' : '') +
          '<td valign="middle">' +
            '<p style="margin:0;font-family:' + FONT + ';font-size:19px;font-weight:bold;color:' + opts.accentColor + ';">' + esc(p.name) + '</p>' +
            ((p.title || p.company) ? '<p style="margin:2px 0 0 0;font-family:' + FONT + ';font-size:12px;letter-spacing:1px;text-transform:uppercase;color:' + opts.mutedColor + ';">' +
              esc([p.title, p.company].filter(Boolean).join(' • ')) + '</p>' : '') +
            '<p style="margin:8px 0 0 0;font-family:' + FONT + ';font-size:12px;color:' + opts.textColor + ';line-height:1.6;">' +
              contactBits(p, opts) + '</p>' +
            '<div style="padding-top:10px;">' + socialRow(p, opts) + '</div>' +
          '</td>' +
        '</tr>' + extrasRows(p, opts, 3);
      return wrap(inner, 540);
    }
  };

  TEMPLATES['photo-left'] = {
    name: 'Photo Left',
    render: function (p, opts) {
      var inner =
        '<tr>' +
          (photoSrc(p) ? '<td valign="middle" style="padding:0 20px 0 0;"><img src="' + esc(photoSrc(p)) + '" alt="' + esc(p.name) + '" width="110" height="110" ' +
            'style="display:block;width:110px;height:110px;object-fit:cover;border:0;border-radius:10px;" /></td>' : '') +
          '<td valign="middle">' +
            nameBlock(p, opts, 18) +
            '<div style="padding-top:8px;">' + contactStack(p, opts, false) + '</div>' +
            '<div style="padding-top:10px;">' + socialRow(p, opts) + '</div>' +
          '</td>' +
        '</tr>' + extrasRows(p, opts, 2);
      return wrap(inner, 540);
    }
  };

  TEMPLATES['photo-top'] = {
    name: 'Photo Top',
    render: function (p, opts) {
      var inner =
        (photoSrc(p) ? '<tr><td align="center" style="padding-bottom:12px;">' + photoCell(p, 96, true) + '</td></tr>' : '') +
        '<tr><td align="center">' + nameBlock(p, opts, 18, true) + '</td></tr>' +
        '<tr><td align="center" style="padding-top:8px;">' +
          '<p style="margin:0;font-family:' + FONT + ';font-size:12px;color:' + opts.textColor + ';line-height:1.6;text-align:center;">' +
            contactBits(p, opts) + '</p>' +
          (p.address ? '<p style="margin:4px 0 0 0;font-family:' + FONT + ';font-size:11px;color:' + opts.mutedColor + ';text-align:center;">' + esc(p.address) + '</p>' : '') +
        '</td></tr>' +
        '<tr><td align="center" style="padding-top:10px;">' + socialRow(p, opts, 'center') + '</td></tr>' +
        extrasRows(p, opts, 1).replace(/<td colspan="1"/g, '<td align="center"');
      return wrap(inner, 420);
    }
  };

  // ---------------------------------------------------------------- output

  function generateSignature(profile, templateId, options) {
    var p = normalizeProfile(profile);
    var opts = normalizeOptions(options);
    var tpl = TEMPLATES[templateId] || TEMPLATES.classic;
    return tpl.render(p, opts);
  }

  /** Full standalone .html document (for saving to disk / attaching). */
  function generateDocument(profile, templateId, options) {
    var sig = generateSignature(profile, templateId, options);
    var p = normalizeProfile(profile);
    return '<!DOCTYPE html>\n<html>\n<head>\n<meta charset="utf-8" />\n' +
      '<meta name="viewport" content="width=device-width, initial-scale=1" />\n' +
      '<title>' + esc(p.name || 'Email Signature') + ' — Email Signature</title>\n' +
      '</head>\n<body style="margin:0;padding:24px;background-color:#ffffff;">\n' +
      sig + '\n</body>\n</html>\n';
  }

  // ------------------------------------------------------------------- CSV

  /** Minimal RFC-4180-ish CSV parser (quoted fields, commas, newlines). */
  function parseCsv(text) {
    var rows = [];
    var row = [];
    var field = '';
    var inQuotes = false;
    var i = 0;
    text = String(text || '').replace(/^﻿/, '');
    while (i < text.length) {
      var c = text[i];
      if (inQuotes) {
        if (c === '"') {
          if (text[i + 1] === '"') { field += '"'; i += 2; continue; }
          inQuotes = false; i++; continue;
        }
        field += c; i++; continue;
      }
      if (c === '"') { inQuotes = true; i++; continue; }
      if (c === ',') { row.push(field); field = ''; i++; continue; }
      if (c === '\r') { i++; continue; }
      if (c === '\n') { row.push(field); rows.push(row); row = []; field = ''; i++; continue; }
      field += c; i++;
    }
    if (field.length || row.length) { row.push(field); rows.push(row); }
    return rows.filter(function (r) { return r.some(function (f) { return f.trim() !== ''; }); });
  }

  /**
   * CSV → array of profiles. First row = headers. Recognized headers (case
   * insensitive): name, title, company, phone, phone2, email, website,
   * address, photourl, disclaimer, plus one column per social network id
   * (linkedin, twitter, ...).
   */
  function csvToProfiles(text) {
    var rows = parseCsv(text);
    if (rows.length < 2) return [];
    var headers = rows[0].map(function (h) { return h.trim().toLowerCase().replace(/[\s_-]/g, ''); });
    var socialIds = SOCIAL_NETWORKS.map(function (n) { return n.id; });
    return rows.slice(1).map(function (r) {
      var p = { socials: {} };
      headers.forEach(function (h, idx) {
        var v = (r[idx] || '').trim();
        if (!v) return;
        if (socialIds.indexOf(h) !== -1) { p.socials[h] = v; return; }
        if (h === 'photourl' || h === 'photo') { p.photoUrl = v; return; }
        if (h === 'ctatext') { p.ctaText = v; return; }
        if (h === 'ctaurl') { p.ctaUrl = v; return; }
        if (['name', 'title', 'company', 'phone', 'phone2', 'email', 'website', 'address', 'disclaimer'].indexOf(h) !== -1) {
          p[h] = v;
        }
      });
      return p;
    }).filter(function (p) { return p.name || p.email; });
  }

  function safeFileName(s) {
    return String(s || 'signature').trim().replace(/[^a-z0-9_\- ]/gi, '').replace(/\s+/g, '-').toLowerCase() || 'signature';
  }

  return {
    TEMPLATES: TEMPLATES,
    TEMPLATE_IDS: Object.keys(TEMPLATES),
    SOCIAL_NETWORKS: SOCIAL_NETWORKS,
    generateSignature: generateSignature,
    generateDocument: generateDocument,
    parseCsv: parseCsv,
    csvToProfiles: csvToProfiles,
    safeFileName: safeFileName,
    esc: esc
  };
});
