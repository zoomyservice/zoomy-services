#!/usr/bin/env python3
"""Builds zoomy.services (English, French, Spanish) from the templates in _src/templates.

Run from anywhere:  python3 _src/build.py
Every string is written in all three languages right in the template: T('English', 'Français', 'Español').
"""
import os, re, sys, time
from jinja2 import Environment, FileSystemLoader

SRC = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.dirname(SRC)
SITE = 'https://zoomy.services'
LANGS = ['en', 'fr', 'es']
V = time.strftime('%Y%m%d%H%M')

# (file, template, titles, descriptions, options)
PAGES = [
    ('index.html', 'index.html', {}),
    ('website-design.html', 'websites.html', {}),
    ('admin-panel.html', 'admin.html', {}),
    ('app-design.html', 'apps.html', {}),
    ('3d-modelling.html', '3d.html', {}),
    ('chatbot.html', 'chatbot.html', {}),
    ('phone-agent.html', 'phone.html', {}),
    ('animated-creatives.html', 'video.html', {}),
    ('about.html', 'about.html', {}),
    ('faq.html', 'faq.html', {}),
    ('contact.html', 'contact.html', {'hide_cta': True}),
    ('thank-you.html', 'thanks.html', {'hide_cta': True, 'noindex': True}),
    ('privacy.html', 'privacy.html', {'hide_cta': True}),
    ('terms.html', 'terms.html', {'hide_cta': True}),
]
SINGLE = [
    ('data-deletion.html', 'data-deletion.html', {'hide_cta': True}),
    ('404.html', '404.html', {'hide_cta': True, 'noindex': True, 'abs_root': True}),
]
# Old pages that no longer exist: send visitors somewhere useful.
REDIRECTS = {
    'pricing.html': 'contact.html',
    'campaign-portfolio.html': './',
    'calculator.html': 'contact.html',
    'portfolio.html': './',
    'services.html': './',
}

# 3D showcase: a model is shown once both its picture and its 3D file exist
MODEL_KEYS = ['watch', 'perfume', 'keyboard', 'camera', 'headphones', 'microphone', 'turntable', 'lamp', 'airliner', 'house']
READY_MODELS = [k for k in MODEL_KEYS if os.path.exists(os.path.join(OUT, 'img', '3d', k + '.jpg')) and os.path.exists(os.path.join(OUT, 'img', '3d', 'full', k + '.jpg'))]
HERO_VIDEO = os.path.exists(os.path.join(OUT, 'img', '3d', 'house-turn.mp4'))

env = Environment(loader=FileSystemLoader(os.path.join(SRC, 'templates')), autoescape=False,
                  trim_blocks=True, lstrip_blocks=True)


def render(file, tpl, opts, lang, langs):
    depth = 0 if lang == 'en' else 1
    root = '/' if opts.get('abs_root') else ('../' * depth)

    def L(f, l=None):
        l = l or lang
        if opts.get('abs_root'):
            return ('/' if l == 'en' else '/' + l + '/') + ('' if f == 'index.html' else f)
        if l == lang:
            return './' if f == 'index.html' else f
        if lang == 'en':
            base = l + '/'
        elif l == 'en':
            base = '../'
        else:
            base = '../' + l + '/'
        return base + ('' if f == 'index.html' else f)

    def T(en, fr=None, es=None):
        return {'en': en, 'fr': fr if fr is not None else en, 'es': es if es is not None else en}[lang]

    def abs_url(f, l):
        return SITE + '/' + ('' if l == 'en' else l + '/') + ('' if f == 'index.html' else f)

    nav = [
        ('website-design.html', T('Websites', 'Sites web', 'Sitios web')),
        ('app-design.html', T('Apps', 'Applis', 'Apps')),
        ('3d-modelling.html', T('3D', '3D', '3D')),
        ('admin-panel.html', T('Admin panels', 'Administration', 'Paneles')),
        ('chatbot.html', T('Chat', 'Chat', 'Chat')),
        ('phone-agent.html', T('Phone agents', 'Agents téléphoniques', 'Agentes telefónicos')),
        ('about.html', T('About', 'À propos', 'Nosotros')),
    ]
    ctx = dict(lang=lang, langs=langs, root=root, v=V, T=T, L=L, abs_url=abs_url,
               page_file=file, page_parents=opts.get('parents'), nav=nav,
               lang_url=lambda l: L(file, l), canonical=abs_url(file, lang),
               hide_cta=opts.get('hide_cta'), noindex=opts.get('noindex'),
               single_lang=len(langs) == 1, no_chat=opts.get('no_chat'),
               ready_models=READY_MODELS, hero_video=HERO_VIDEO)
    html = env.get_template(tpl).render(**ctx)
    html = re.sub(r'\n\s*\n+', '\n', html)
    # house style: no exclamation marks in copy (the chatbot and phone agents follow the same rule)
    body = html.split('<main id="main">', 1)[1].split('</main>', 1)[0]
    if '!' in re.sub(r'<!--.*?-->|<script.*?</script>', '', body, flags=re.S):
        sys.exit(f'Exclamation mark found in {lang}/{file}')
    path = os.path.join(OUT, file) if lang == 'en' else os.path.join(OUT, lang, file)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w', encoding='utf-8') as fh:
        fh.write(html)
    return path


def redirect_page(target, lang):
    url = SITE + '/' + ('' if lang == 'en' else lang + '/') + ('' if target == './' else target)
    return ('<!doctype html><html lang="%s"><head><meta charset="utf-8"><title>Zoomy</title>'
            '<meta name="robots" content="noindex"><link rel="canonical" href="%s">'
            '<meta http-equiv="refresh" content="0; url=%s"></head>'
            '<body><p><a href="%s">zoomy.services</a></p><script>location.replace(%r)</script></body></html>\n'
            % (lang, url, target, target, target))


def main():
    out = []
    only = os.environ.get('ONLY')
    for lang in LANGS:
        for file, tpl, opts in PAGES:
            if only and file not in only.split(','):
                continue
            out.append(render(file, tpl, opts, lang, LANGS))
        if only:
            continue
        for old, target in REDIRECTS.items():
            if lang != 'en' and old == 'calculator.html':
                continue
            p = os.path.join(OUT, old) if lang == 'en' else os.path.join(OUT, lang, old)
            with open(p, 'w', encoding='utf-8') as fh:
                fh.write(redirect_page(target, lang))
    if only:
        print('partial build', len(out)); return
    for file, tpl, opts in SINGLE:
        out.append(render(file, tpl, opts, 'en', ['en']))
    # sitemap
    urls = []
    for file, tpl, opts in PAGES:
        if opts.get('noindex'):
            continue
        for lang in LANGS:
            u = SITE + '/' + ('' if lang == 'en' else lang + '/') + ('' if file == 'index.html' else file)
            alts = ''.join('<xhtml:link rel="alternate" hreflang="%s" href="%s"/>' % (l, SITE + '/' + ('' if l == 'en' else l + '/') + ('' if file == 'index.html' else file)) for l in LANGS)
            urls.append('<url><loc>%s</loc><lastmod>%s</lastmod>%s</url>' % (u, time.strftime('%Y-%m-%d'), alts))
    with open(os.path.join(OUT, 'sitemap.xml'), 'w') as fh:
        fh.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + '\n'.join(urls) + '\n</urlset>\n')
    print('built', len(out), 'pages, version', V)


if __name__ == '__main__':
    main()
