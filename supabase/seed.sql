-- =============================================================================
-- Seed data for Kristina Place Of Beauty
-- Run with: npx supabase db reset
-- Or paste into the Supabase SQL editor to reset + reseed manually.
-- =============================================================================

-- ── Clean slate (order matters — FK dependencies) ────────────────────────────
delete from public.course_chapters;
delete from public.enrollments;
delete from public.courses;
delete from public.order_items;
delete from public.orders;
delete from public.products;
delete from public.bookings;
delete from public.blocked_slots;
delete from public.services;
delete from public.portfolio_items;
delete from public.instagram_posts;
delete from public.business_hours;
delete from public.site_settings;

-- ── Business hours (0=Sun … 6=Sat) ───────────────────────────────────────────
insert into public.business_hours (weekday, open_time, close_time, closed) values
  (0, '08:00', '16:00', false),
  (1, '08:00', '16:00', false),
  (2, '08:00', '16:00', false),
  (3, '08:00', '16:00', false),
  (4, '08:00', '16:00', false),
  (5, '08:00', '14:00', false),
  (6, null,    null,    true);

-- ── Site settings ─────────────────────────────────────────────────────────────
insert into public.site_settings (key, value) values
  ('contact', '{"phone":"052-3060735","whatsapp":"972523060735","email":"yagudaeva09@gmail.com","address":"קיבוץ גניגר","instagram":"https://www.instagram.com/kristina_place_of_beauty/"}'),
  ('hero',    '{"title":"Kristina Place Of Beauty","subtitle":"המקום שלך ליופי מקצועי","tagline":"מניקור, פדיקור ועיצוב ציפורניים ברמה הגבוהה ביותר"}');

-- ── Services ──────────────────────────────────────────────────────────────────
insert into public.services (name, description, duration_min, price, image_url, active) values
  ('מניקור',          'מניקור מקצועי לטיפוח הציפורניים',                 45, 80,  'https://res.cloudinary.com/dmrx96yqx/image/upload/v1593006988/placeOfBueaty/Gallery/f4papc5dqzrr74sotrlk.jpg',             true),
  ('פדיקור',          'פדיקור מפנק לטיפוח כפות הרגליים',                 60, 100, 'https://res.cloudinary.com/dmrx96yqx/image/upload/v1746189630/placeOfBueaty/Gallery/Screenshot_2025-05-02_151335_fjdjgb.png', true),
  ('עיצוב גבות',      'עיצוב גבות מקצועי בהתאמה אישית',                 30, 60,  'https://images.unsplash.com/photo-1604654894609-5f24e06ca19f?w=800&q=80',                                                    true),
  ('לק ג''ל',         'לק ג''ל איכותי לאורך זמן',                        60, 120, 'https://res.cloudinary.com/dmrx96yqx/image/upload/v1593006987/placeOfBueaty/Gallery/bmfn4zpa7v2qqzyec20x.jpg',              true),
  ('בניית ציפורניים', 'בניית ציפורניים מקצועית',                         90, 180, 'https://res.cloudinary.com/dmrx96yqx/image/upload/v1593006983/placeOfBueaty/Gallery/q25ghohsw4vms8l6s0am.jpg',              true),
  ('מניקור צרפתי',    'מניקור צרפתי קלאסי ואלגנטי',                     60, 110, 'https://res.cloudinary.com/dmrx96yqx/image/upload/v1596480555/placeOfBueaty/Gallery/y9flf93wvcagds8xbxyh.jpg',              true);

-- ── Products ──────────────────────────────────────────────────────────────────
insert into public.products (name, description, price, image_url, stock, category, active) values
  ('סט מברשות איפור מקצועיות', 'סט 12 מברשות איפור מקצועיות באיכות גבוהה.',        129.90, 'https://images.unsplash.com/photo-1522335789203-aaa2cdaa1822?w=800&q=80', 25, 'איפור',     true),
  ('סרום חומצה היאלורונית',    'סרום מרוכז שמרגיע, מרטיב ומשקם את העור.',          89.90,  'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80', 40, 'טיפוח עור', true),
  ('קרם פנים לילה',            'קרם לילה עשיר המתאים לכל סוגי העור.',              109.90, 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=800&q=80', 30, 'טיפוח עור', true),
  ('קרם פנים מזין',            'קרם עשיר בלחות עם תמציות טבעיות וויטמינים.',       120.00, 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80', 20, 'טיפוח עור', true),
  ('שמן קוטיקולה',             'שמן קוטיקולה מזין ומחזק ציפורניים.',               49.90,  'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80', 50, 'ציפורניים', true),
  ('לק ג''ל - גוון רוז',       'לק ג''ל בגוון רוז עדין, מחזיק עד 3 שבועות.',      59.90,  'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&q=80', 35, 'ציפורניים', true);

-- ── Courses ───────────────────────────────────────────────────────────────────
insert into public.courses (id, title, description, content, duration_min, price, image_url, active) values
  ('11111111-0000-0000-0000-000000000001',
   'קורס בניית ציפורניים מקצועי',
   'קורס מקיף ללימוד בניית ציפורניים מההתחלה ועד רמה מקצועית.',
   'בקורס תלמדו טכניקות מתקדמות, עיצובים חדשניים ותקבלו טיפים מקצועיים מהמומחים.',
   198, 299,
   'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80',
   true),
  ('11111111-0000-0000-0000-000000000002',
   'צביעת גבות - קורס בסיסי',
   'קורס חינמי ללימוד טכניקות בסיסיות בצביעת גבות.',
   'תכנים בסיסיים: ניתוח מבנה גבה, בחירת גוון, טכניקות מריחה ושימור.',
   57, 0,
   'https://images.unsplash.com/photo-1583241800698-9c2e463cb4f1?w=800&q=80',
   true),
  ('11111111-0000-0000-0000-000000000003',
   'יסודות הלק ג''ל',
   'קורס המלמד את יסודות הלק ג''ל באופן מקצועי ומעשי.',
   'תלמדו על סוגי ג''לים שונים, טכניקות מריחה וטיפים לעבודה מהירה ומקצועית.',
   108, 149,
   'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&q=80',
   true);

-- ── Course chapters ───────────────────────────────────────────────────────────
-- קורס בניית ציפורניים מקצועי — 8 פרקים, פרק 1 חינמי
insert into public.course_chapters (course_id, title, description, video_url, duration_min, sort_order, is_free) values
  ('11111111-0000-0000-0000-000000000001', 'הכרת הכלים והחומרים',       'סקירה מקיפה של כל הכלים והחומרים הדרושים לבניית ציפורניים מקצועית.', 'https://www.youtube.com/watch?v=xqxscmn2EO8', 18, 1, true),
  ('11111111-0000-0000-0000-000000000001', 'הכנת הציפורן הטבעית',       'כיצד לנקות, לעצב ולהכין את הציפורן הטבעית לפני הבנייה.',             'https://www.youtube.com/watch?v=xqxscmn2EO8', 22, 2, false),
  ('11111111-0000-0000-0000-000000000001', 'טכניקת אקריל — שלב ראשון', 'יישום שכבת הבסיס הראשונה בטכניקת האקריל.',                           'https://www.youtube.com/watch?v=xqxscmn2EO8', 30, 3, false),
  ('11111111-0000-0000-0000-000000000001', 'עיצוב וקיצוב',              'כיצד לעצב את אורך הציפורן ולקצב בצורה מדויקת.',                      'https://www.youtube.com/watch?v=xqxscmn2EO8', 25, 4, false),
  ('11111111-0000-0000-0000-000000000001', 'שיוף ויישור',               'טכניקות שיוף ויישור לקבלת משטח חלק ומקצועי.',                        'https://www.youtube.com/watch?v=xqxscmn2EO8', 28, 5, false),
  ('11111111-0000-0000-0000-000000000001', 'ציפוי ג''ל צבע',            'כיצד למרוח לק ג''ל צבע על גבי הציפורן המוכנה.',                      'https://www.youtube.com/watch?v=xqxscmn2EO8', 20, 6, false),
  ('11111111-0000-0000-0000-000000000001', 'עיצובים ואמנות',            'שיטות ליצירת עיצובים אומנותיים ייחודיים על הציפורניים.',              'https://www.youtube.com/watch?v=xqxscmn2EO8', 35, 7, false),
  ('11111111-0000-0000-0000-000000000001', 'תחזוקה והסרה נכונה',        'כיצד לתחזק את הציפורניים ולהסיר את הבנייה בצורה בטוחה.',             'https://www.youtube.com/watch?v=xqxscmn2EO8', 20, 8, false);

-- צביעת גבות קורס בסיסי — 4 פרקים, הכל חינמי
insert into public.course_chapters (course_id, title, description, video_url, duration_min, sort_order, is_free) values
  ('11111111-0000-0000-0000-000000000002', 'מבנה הגבה — ניתוח פנים', 'כיצד לנתח את מבנה הפנים ולקבוע את הצורה האידיאלית לגבה.', 'https://www.youtube.com/watch?v=xqxscmn2EO8', 15, 1, true),
  ('11111111-0000-0000-0000-000000000002', 'בחירת גוון צבע',         'כיצד לבחור את גוון הצבע המתאים לצבע השיער ולגוון העור.',  'https://www.youtube.com/watch?v=xqxscmn2EO8', 12, 2, true),
  ('11111111-0000-0000-0000-000000000002', 'טכניקת המריחה',          'צעד אחר צעד — כיצד למרוח את הצבע בצורה אחידה ומדויקת.',  'https://www.youtube.com/watch?v=xqxscmn2EO8', 20, 3, true),
  ('11111111-0000-0000-0000-000000000002', 'קביעת הצבע ושימור',      'כיצד לקבע את הצבע ולשמר את התוצאה לאורך זמן.',            'https://www.youtube.com/watch?v=xqxscmn2EO8', 10, 4, true);

-- יסודות הלק ג'ל — 6 פרקים, פרק 1 חינמי
insert into public.course_chapters (course_id, title, description, video_url, duration_min, sort_order, is_free) values
  ('11111111-0000-0000-0000-000000000003', 'מבוא — סוגי ג''לים',       'הכרת סוגי ג''לים שונים בשוק וההבדלים ביניהם.',               'https://www.youtube.com/watch?v=xqxscmn2EO8', 15, 1, true),
  ('11111111-0000-0000-0000-000000000003', 'הכנת הציפורן',             'ניקוי, דחיפת קוטיקולה ושיוף עדין לקבלת הצמדה מיטבית.',     'https://www.youtube.com/watch?v=xqxscmn2EO8', 18, 2, false),
  ('11111111-0000-0000-0000-000000000003', 'מריחת בסיס ואפייה',        'כיצד למרוח שכבת בסיס ולאפות בנורת UV/LED.',                 'https://www.youtube.com/watch?v=xqxscmn2EO8', 20, 3, false),
  ('11111111-0000-0000-0000-000000000003', 'מריחת צבע בשתי שכבות',    'הטכניקה הנכונה למריחה בשתי שכבות לצבע עמוק ואחיד.',        'https://www.youtube.com/watch?v=xqxscmn2EO8', 22, 4, false),
  ('11111111-0000-0000-0000-000000000003', 'שכבת סיום (Top Coat)',     'מריחת שכבת הגימור ואפייה סופית לברק ועמידות מקסימלית.',    'https://www.youtube.com/watch?v=xqxscmn2EO8', 15, 5, false),
  ('11111111-0000-0000-0000-000000000003', 'הסרה בטוחה',              'כיצד להסיר לק ג''ל בצורה בטוחה מבלי לפגוע בציפורן.',       'https://www.youtube.com/watch?v=xqxscmn2EO8', 18, 6, false);

-- ── Portfolio ─────────────────────────────────────────────────────────────────
insert into public.portfolio_items (title, description, image_url, sort_order) values
  ('מניקור ג''ל בעיצוב אומנותי', 'טכניקה מתקדמת לעיצוב ציפורניים',  'https://res.cloudinary.com/dmrx96yqx/image/upload/v1596480555/placeOfBueaty/Gallery/y9flf93wvcagds8xbxyh.jpg',              1),
  ('לק ג''ל בגוון עדין',         'מראה טבעי ועדין לכל אירוע',        'https://res.cloudinary.com/dmrx96yqx/image/upload/v1593006988/placeOfBueaty/Gallery/f4papc5dqzrr74sotrlk.jpg',              2),
  ('מניקור צרפתי קלאסי',         'מראה אלגנטי ונקי',                 'https://res.cloudinary.com/dmrx96yqx/image/upload/v1593006987/placeOfBueaty/Gallery/bmfn4zpa7v2qqzyec20x.jpg',              3),
  ('עיצוב ציפורניים אומנותי',    'עיצובים מיוחדים בהתאמה אישית',    'https://res.cloudinary.com/dmrx96yqx/image/upload/v1593006983/placeOfBueaty/Gallery/q25ghohsw4vms8l6s0am.jpg',              4),
  ('טיפול ספא לידיים',           'חוויה מפנקת לטיפוח הידיים',       'https://res.cloudinary.com/dmrx96yqx/image/upload/v1746189630/placeOfBueaty/Gallery/Screenshot_2025-05-02_151335_fjdjgb.png', 5);

-- ── Instagram posts ───────────────────────────────────────────────────────────
insert into public.instagram_posts (post_url, thumbnail_url, caption, sort_order) values
  ('https://www.instagram.com/kristina_place_of_beauty/', 'https://images.unsplash.com/photo-1604654894609-5f24e06ca19f?w=800&q=80', 'מניקור ג''ל מושלם 💅✨',               1),
  ('https://www.instagram.com/kristina_place_of_beauty/', 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=800&q=80', 'טכניקות עיצוב ציפורניים מתקדמות 🎨', 2),
  ('https://www.instagram.com/kristina_place_of_beauty/', 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&q=80', 'מראה טבעי ואלגנטי 💖',               3),
  ('https://www.instagram.com/kristina_place_of_beauty/', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80', 'טיפים לטיפוח ציפורניים בריאות ✨',   4);
