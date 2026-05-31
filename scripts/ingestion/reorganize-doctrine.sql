-- Reorganize EOTC doctrine into the catechetical 7-topic structure.
--
-- Run once in the Supabase SQL Editor.
--
-- Safety:
--   • Does NOT touch doctrine_passages (only repoints doctrine_subtopics.topic_id).
--   • Preserves every existing subtopic slug exactly (slugs are FKs for passages).
--   • Idempotent: re-running produces the same result.
--   • English lives in `title`; Amharic/Ge'ez (where provided) lives in `title_am`.
--     Per spec, Amharic is supplied for topics only; subtopics stay English-only.

BEGIN;

-- 1) Bilingual title column (added once, no-op on re-run).
ALTER TABLE public.doctrine_topics    ADD COLUMN IF NOT EXISTS title_am text;
ALTER TABLE public.doctrine_subtopics ADD COLUMN IF NOT EXISTS title_am text;

-- 2) The seven topics (reusing existing topic ids 1..7).
UPDATE public.doctrine_topics SET
  title = 'Faith & Doctrine', title_am = 'ሃይማኖት', slug = 'haymanot',
  description = 'The foundational beliefs of the EOTC — what we believe and why.',
  sort_order = 1
WHERE id = '11111111-0000-0000-0000-000000000001';

UPDATE public.doctrine_topics SET
  title = 'Creation & Cosmology', title_am = 'ፍጥረት', slug = 'fetret',
  description = 'God as Creator — the 22 works of creation and the structure of the heavens.',
  sort_order = 2
WHERE id = '11111111-0000-0000-0000-000000000002';

UPDATE public.doctrine_topics SET
  title = 'Divine Law', title_am = 'ሕገ እግዚአብሔር', slug = 'higge-egziabeher',
  description = 'The three dispensations of law God gave humanity, and dietary law.',
  sort_order = 3
WHERE id = '11111111-0000-0000-0000-000000000003';

UPDATE public.doctrine_topics SET
  title = 'The Five Pillars of Mystery', title_am = 'ምስጢር', slug = 'mistir',
  description = 'The five core theological mysteries every believer must know.',
  sort_order = 4
WHERE id = '11111111-0000-0000-0000-000000000004';

UPDATE public.doctrine_topics SET
  title = 'The Seven Sacraments', title_am = 'ሥርዓተ ቤተ ክርስቲያን', slug = 'serate-bete-kristiyan',
  description = 'The seven sacraments of the Church and how they are administered.',
  sort_order = 5
WHERE id = '11111111-0000-0000-0000-000000000005';

UPDATE public.doctrine_topics SET
  title = 'Feasts of the Lord', title_am = 'በዓላት', slug = 'bealat',
  description = 'The major and minor feasts commemorating the works of our Lord.',
  sort_order = 6
WHERE id = '11111111-0000-0000-0000-000000000006';

UPDATE public.doctrine_topics SET
  title = 'The Passion & The Cross', title_am = 'ሕማማት', slug = 'himamat',
  description = 'The sufferings, piercings, and words of our Lord on the cross.',
  sort_order = 7
WHERE id = '11111111-0000-0000-0000-000000000007';

-- Holding topic for any subtopic not part of the catechetical core. Sorted last;
-- it has no passages, so the app naturally hides it until content is added.
UPDATE public.doctrine_topics SET
  title = 'Further Studies', title_am = NULL, slug = 'further-studies',
  description = 'Subtopics not yet part of the core curriculum.',
  sort_order = 99
WHERE id = '11111111-0000-0000-0000-000000000008';

-- Remove the now-unused 9th topic (it has no subtopics).
DELETE FROM public.doctrine_topics WHERE id = '11111111-0000-0000-0000-000000000009';

-- 3) Park every subtopic first, then reassign the curated ones. This guarantees
--    anything not explicitly listed below lands in "Further Studies" (and that all
--    curated subtopics become flat, top-level lesson cards in a clean order).
UPDATE public.doctrine_subtopics
  SET topic_id = '11111111-0000-0000-0000-000000000008', parent_subtopic_id = NULL;

-- ---- Topic 1 — ሃይማኖት | Faith & Doctrine ----
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000001', sort_order=1, title='Faith'                    WHERE slug='faith';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000001', sort_order=2, title='Faith and Works'          WHERE slug='necessity-of-faith-and-works';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000001', sort_order=3, title='Christianity'              WHERE slug='christianity';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000001', sort_order=4, title='Orthodox'                  WHERE slug='orthodox';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000001', sort_order=5, title='Tewahedo (Miaphysitism)'   WHERE slug='tewahedo-unified-nature';

-- ---- Topic 2 — ፍጥረት | Creation & Cosmology ----
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000002', sort_order=1, title='Acts of Creation'          WHERE slug='acts-of-creation';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000002', sort_order=2, title='The 22 Acts of Creation'   WHERE slug='the-22-acts-of-creation';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000002', sort_order=3, title='The 7 Heavens'             WHERE slug='the-7-heavens';

-- ---- Topic 3 — ሕገ እግዚአብሔር | Divine Law ----
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000003', sort_order=1, title='The Three Laws'            WHERE slug='the-three-laws';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000003', sort_order=2, title='Law of Conscience'         WHERE slug='law-of-the-conscience';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000003', sort_order=3, title='Law of the Old Testament'  WHERE slug='law-of-the-old-testament';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000003', sort_order=4, title='Law of the Gospel'         WHERE slug='law-of-the-gospel';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000003', sort_order=5, title='Clean and Unclean Foods'   WHERE slug='clean-and-unclean-foods';

-- ---- Topic 4 — ምስጢር | The Five Pillars of Mystery ----
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000004', sort_order=1,  title='The Five Pillars'             WHERE slug='the-five-pillars-of-mystery';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000004', sort_order=2,  title='Mystery of the Trinity'       WHERE slug='mystery-of-the-trinity';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000004', sort_order=3,  title='Mystery of the Incarnation'   WHERE slug='mystery-of-the-incarnation';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000004', sort_order=4,  title='From Whom Was He Made Man'    WHERE slug='from-whom-was-he-made-man';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000004', sort_order=5,  title='Who Became Man'               WHERE slug='who-is-the-one-who-became-man';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000004', sort_order=6,  title='Why Did He Become Man'        WHERE slug='why-did-he-become-man';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000004', sort_order=7,  title='Mystery of Baptism'           WHERE slug='mystery-of-baptism';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000004', sort_order=8,  title='Baptism in the Jordan'        WHERE slug='baptism-in-the-jordan-river';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000004', sort_order=9,  title='Baptism in Water'             WHERE slug='baptism-in-water';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000004', sort_order=10, title='Baptism by John'              WHERE slug='baptism-by-john';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000004', sort_order=11, title='Mystery of the Holy Eucharist' WHERE slug='mystery-of-the-holy-eucharist';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000004', sort_order=12, title='What Is It Prepared From'      WHERE slug='from-what-is-it-prepared';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000004', sort_order=13, title='Memorial of the Death'         WHERE slug='memorial-of-the-death-eucharist';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000004', sort_order=14, title='Mystery of the Resurrection'   WHERE slug='mystery-of-the-resurrection-of-the-dead';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000004', sort_order=15, title='Why It Was Fulfilled'          WHERE slug='why-it-was-fulfilled';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000004', sort_order=16, title='Sound of the Trumpet'          WHERE slug='sound-of-the-trumpet-resurrection';

-- ---- Topic 5 — ሥርዓተ ቤተ ክርስቲያን | The Seven Sacraments ----
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000005', sort_order=1,  title='The Seven Sacraments'         WHERE slug='the-seven-sacraments-of-the-church';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000005', sort_order=2,  title='Sacrament of Baptism'         WHERE slug='sacrament-of-baptism';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000005', sort_order=3,  title='Age Received'                 WHERE slug='baptism-age-received';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000005', sort_order=4,  title='The Mahteb and Cord'          WHERE slug='the-seal-mahteb-and-the-cord';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000005', sort_order=5,  title='Red Cord'                     WHERE slug='red-cord';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000005', sort_order=6,  title='Black Cord'                   WHERE slug='black-cord';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000005', sort_order=7,  title='Sacrament of Myron'           WHERE slug='sacrament-of-myron-holy-oil';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000005', sort_order=8,  title='Sacrament of the Eucharist'   WHERE slug='sacrament-of-the-eucharist';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000005', sort_order=9,  title='What We Receive'              WHERE slug='what-do-we-receive-from-eucharist';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000005', sort_order=10, title='Sacrament of Priesthood'      WHERE slug='sacrament-of-priesthood';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000005', sort_order=11, title='Diaconate'                    WHERE slug='diaconate';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000005', sort_order=12, title='Priesthood'                   WHERE slug='priesthood';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000005', sort_order=13, title='Sacrament of Matrimony'       WHERE slug='sacrament-of-matrimony';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000005', sort_order=14, title='Sacrament of Penance'         WHERE slug='sacrament-of-penance-confession';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000005', sort_order=15, title='To Whom to Confess'           WHERE slug='to-whom-should-one-confess';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000005', sort_order=16, title='How to Confess'               WHERE slug='how-should-one-confess';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000005', sort_order=17, title='Showing Oneself to the Priests' WHERE slug='showing-oneself-to-the-priests';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000005', sort_order=18, title='Mystery of Holy Unction'      WHERE slug='mystery-of-holy-unction';

-- ---- Topic 6 — በዓላት | Feasts of the Lord (topic title only; no duplicate subtopic) ----
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000006', sort_order=1, title='The 9 Major Feasts'         WHERE slug='the-9-major-feasts';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000006', sort_order=2, title='The 9 Minor Feasts'         WHERE slug='the-9-minor-feasts-of-the-lord';
-- feasts-of-the-lord stays in Further Studies (overview slug preserved; content moved in hierarchy script)

-- ---- Topic 7 — ሕማማት | The Passion & The Cross ----
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000007', sort_order=1, title='The 13 Sorrows of the Cross' WHERE slug='the-13-sorrows-of-the-cross';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000007', sort_order=2, title='The 5 Piercings of Christ'   WHERE slug='the-5-piercings-of-christ';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000007', sort_order=3, title='The 7 Words of the Cross'    WHERE slug='the-7-words-of-the-cross';
UPDATE public.doctrine_subtopics SET topic_id='11111111-0000-0000-0000-000000000007', sort_order=4, title='The 7 Miracles'              WHERE slug='the-7-miracles';

COMMIT;
