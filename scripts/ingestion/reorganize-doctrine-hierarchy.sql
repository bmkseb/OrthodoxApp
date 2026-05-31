-- Nest doctrine subtopics under their theological parent headings.
-- Run after reorganize-doctrine.sql. Safe to re-run (idempotent).
-- Does NOT touch doctrine_passages.

BEGIN;

-- ---- Topic 2 — Creation: Acts of Creation → 22 Acts, 7 Heavens ----
UPDATE public.doctrine_subtopics SET parent_subtopic_id = NULL, sort_order = 1
  WHERE slug = 'acts-of-creation';
UPDATE public.doctrine_subtopics SET
  parent_subtopic_id = (SELECT id FROM public.doctrine_subtopics WHERE slug = 'acts-of-creation'),
  sort_order = 1
  WHERE slug = 'the-22-acts-of-creation';
UPDATE public.doctrine_subtopics SET
  parent_subtopic_id = (SELECT id FROM public.doctrine_subtopics WHERE slug = 'acts-of-creation'),
  sort_order = 2
  WHERE slug = 'the-7-heavens';

-- ---- Topic 3 — Divine Law: Three Laws → conscience, OT, gospel ----
UPDATE public.doctrine_subtopics SET parent_subtopic_id = NULL, sort_order = 1
  WHERE slug = 'the-three-laws';
UPDATE public.doctrine_subtopics SET
  parent_subtopic_id = (SELECT id FROM public.doctrine_subtopics WHERE slug = 'the-three-laws'),
  sort_order = 1
  WHERE slug = 'law-of-the-conscience';
UPDATE public.doctrine_subtopics SET
  parent_subtopic_id = (SELECT id FROM public.doctrine_subtopics WHERE slug = 'the-three-laws'),
  sort_order = 2
  WHERE slug = 'law-of-the-old-testament';
UPDATE public.doctrine_subtopics SET
  parent_subtopic_id = (SELECT id FROM public.doctrine_subtopics WHERE slug = 'the-three-laws'),
  sort_order = 3
  WHERE slug = 'law-of-the-gospel';
UPDATE public.doctrine_subtopics SET parent_subtopic_id = NULL, sort_order = 2
  WHERE slug = 'clean-and-unclean-foods';

-- ---- Topic 4 — Five Pillars: intro + 5 mysteries with sub-lessons ----
UPDATE public.doctrine_subtopics SET parent_subtopic_id = NULL, sort_order = 1
  WHERE slug = 'the-five-pillars-of-mystery';
UPDATE public.doctrine_subtopics SET parent_subtopic_id = NULL, sort_order = 2
  WHERE slug = 'mystery-of-the-trinity';
UPDATE public.doctrine_subtopics SET parent_subtopic_id = NULL, sort_order = 3
  WHERE slug = 'mystery-of-the-incarnation';
UPDATE public.doctrine_subtopics SET
  parent_subtopic_id = (SELECT id FROM public.doctrine_subtopics WHERE slug = 'mystery-of-the-incarnation'),
  sort_order = 1
  WHERE slug = 'from-whom-was-he-made-man';
UPDATE public.doctrine_subtopics SET
  parent_subtopic_id = (SELECT id FROM public.doctrine_subtopics WHERE slug = 'mystery-of-the-incarnation'),
  sort_order = 2
  WHERE slug = 'who-is-the-one-who-became-man';
UPDATE public.doctrine_subtopics SET
  parent_subtopic_id = (SELECT id FROM public.doctrine_subtopics WHERE slug = 'mystery-of-the-incarnation'),
  sort_order = 3
  WHERE slug = 'why-did-he-become-man';
UPDATE public.doctrine_subtopics SET parent_subtopic_id = NULL, sort_order = 4
  WHERE slug = 'mystery-of-baptism';
UPDATE public.doctrine_subtopics SET
  parent_subtopic_id = (SELECT id FROM public.doctrine_subtopics WHERE slug = 'mystery-of-baptism'),
  sort_order = 1
  WHERE slug = 'baptism-in-the-jordan-river';
UPDATE public.doctrine_subtopics SET
  parent_subtopic_id = (SELECT id FROM public.doctrine_subtopics WHERE slug = 'mystery-of-baptism'),
  sort_order = 2
  WHERE slug = 'baptism-in-water';
UPDATE public.doctrine_subtopics SET
  parent_subtopic_id = (SELECT id FROM public.doctrine_subtopics WHERE slug = 'mystery-of-baptism'),
  sort_order = 3
  WHERE slug = 'baptism-by-john';
UPDATE public.doctrine_subtopics SET parent_subtopic_id = NULL, sort_order = 5
  WHERE slug = 'mystery-of-the-holy-eucharist';
UPDATE public.doctrine_subtopics SET
  parent_subtopic_id = (SELECT id FROM public.doctrine_subtopics WHERE slug = 'mystery-of-the-holy-eucharist'),
  sort_order = 1
  WHERE slug = 'from-what-is-it-prepared';
UPDATE public.doctrine_subtopics SET
  parent_subtopic_id = (SELECT id FROM public.doctrine_subtopics WHERE slug = 'mystery-of-the-holy-eucharist'),
  sort_order = 2
  WHERE slug = 'memorial-of-the-death-eucharist';
UPDATE public.doctrine_subtopics SET parent_subtopic_id = NULL, sort_order = 6
  WHERE slug = 'mystery-of-the-resurrection-of-the-dead';
UPDATE public.doctrine_subtopics SET
  parent_subtopic_id = (SELECT id FROM public.doctrine_subtopics WHERE slug = 'mystery-of-the-resurrection-of-the-dead'),
  sort_order = 1
  WHERE slug = 'why-it-was-fulfilled';
UPDATE public.doctrine_subtopics SET
  parent_subtopic_id = (SELECT id FROM public.doctrine_subtopics WHERE slug = 'mystery-of-the-resurrection-of-the-dead'),
  sort_order = 2
  WHERE slug = 'sound-of-the-trumpet-resurrection';

-- ---- Topic 5 — Seven Sacraments: overview + each sacrament with details ----
UPDATE public.doctrine_subtopics SET parent_subtopic_id = NULL, sort_order = 1
  WHERE slug = 'the-seven-sacraments-of-the-church';
UPDATE public.doctrine_subtopics SET parent_subtopic_id = NULL, sort_order = 2
  WHERE slug = 'sacrament-of-baptism';
UPDATE public.doctrine_subtopics SET
  parent_subtopic_id = (SELECT id FROM public.doctrine_subtopics WHERE slug = 'sacrament-of-baptism'),
  sort_order = 1
  WHERE slug = 'baptism-age-received';
UPDATE public.doctrine_subtopics SET
  parent_subtopic_id = (SELECT id FROM public.doctrine_subtopics WHERE slug = 'sacrament-of-baptism'),
  sort_order = 2
  WHERE slug = 'the-seal-mahteb-and-the-cord';
UPDATE public.doctrine_subtopics SET
  parent_subtopic_id = (SELECT id FROM public.doctrine_subtopics WHERE slug = 'sacrament-of-baptism'),
  sort_order = 3
  WHERE slug = 'red-cord';
UPDATE public.doctrine_subtopics SET
  parent_subtopic_id = (SELECT id FROM public.doctrine_subtopics WHERE slug = 'sacrament-of-baptism'),
  sort_order = 4
  WHERE slug = 'black-cord';
UPDATE public.doctrine_subtopics SET parent_subtopic_id = NULL, sort_order = 3
  WHERE slug = 'sacrament-of-myron-holy-oil';
UPDATE public.doctrine_subtopics SET parent_subtopic_id = NULL, sort_order = 4
  WHERE slug = 'sacrament-of-the-eucharist';
UPDATE public.doctrine_subtopics SET
  parent_subtopic_id = (SELECT id FROM public.doctrine_subtopics WHERE slug = 'sacrament-of-the-eucharist'),
  sort_order = 1
  WHERE slug = 'what-do-we-receive-from-eucharist';
UPDATE public.doctrine_subtopics SET parent_subtopic_id = NULL, sort_order = 5
  WHERE slug = 'sacrament-of-priesthood';
UPDATE public.doctrine_subtopics SET
  parent_subtopic_id = (SELECT id FROM public.doctrine_subtopics WHERE slug = 'sacrament-of-priesthood'),
  sort_order = 1
  WHERE slug = 'diaconate';
UPDATE public.doctrine_subtopics SET
  parent_subtopic_id = (SELECT id FROM public.doctrine_subtopics WHERE slug = 'sacrament-of-priesthood'),
  sort_order = 2
  WHERE slug = 'priesthood';
UPDATE public.doctrine_subtopics SET parent_subtopic_id = NULL, sort_order = 6
  WHERE slug = 'sacrament-of-matrimony';
UPDATE public.doctrine_subtopics SET parent_subtopic_id = NULL, sort_order = 7
  WHERE slug = 'sacrament-of-penance-confession';
UPDATE public.doctrine_subtopics SET
  parent_subtopic_id = (SELECT id FROM public.doctrine_subtopics WHERE slug = 'sacrament-of-penance-confession'),
  sort_order = 1
  WHERE slug = 'to-whom-should-one-confess';
UPDATE public.doctrine_subtopics SET
  parent_subtopic_id = (SELECT id FROM public.doctrine_subtopics WHERE slug = 'sacrament-of-penance-confession'),
  sort_order = 2
  WHERE slug = 'how-should-one-confess';
UPDATE public.doctrine_subtopics SET
  parent_subtopic_id = (SELECT id FROM public.doctrine_subtopics WHERE slug = 'sacrament-of-penance-confession'),
  sort_order = 3
  WHERE slug = 'showing-oneself-to-the-priests';
UPDATE public.doctrine_subtopics SET parent_subtopic_id = NULL, sort_order = 8
  WHERE slug = 'mystery-of-holy-unction';

-- ---- Topic 6 — Feasts: 9 Major & 9 Minor directly under the topic (no duplicate overview row) ----
UPDATE public.doctrine_subtopics SET parent_subtopic_id = NULL, sort_order = 1
  WHERE slug = 'the-9-major-feasts';
UPDATE public.doctrine_subtopics SET parent_subtopic_id = NULL, sort_order = 2
  WHERE slug = 'the-9-minor-feasts-of-the-lord';
-- Move the overview intro passage into the Major Feasts branch
UPDATE public.doctrine_passages
SET subtopic_id = (SELECT id FROM public.doctrine_subtopics WHERE slug = 'the-9-major-feasts')
WHERE subtopic_id = (SELECT id FROM public.doctrine_subtopics WHERE slug = 'feasts-of-the-lord');
-- Park the redundant overview subtopic (slug preserved for legacy links)
UPDATE public.doctrine_subtopics SET
  topic_id = '11111111-0000-0000-0000-000000000008',
  parent_subtopic_id = NULL
  WHERE slug = 'feasts-of-the-lord';

COMMIT;
