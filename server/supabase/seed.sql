-- Seed data for Kristina Place Of Beauty
-- =============================================

-- Business hours (Sunday=0 ... Saturday=6)
insert into public.business_hours (weekday, open_time, close_time, closed) values
  (0, '08:00', '16:00', false),
  (1, '08:00', '16:00', false),
  (2, '08:00', '16:00', false),
  (3, '08:00', '16:00', false),
  (4, '08:00', '16:00', false),
  (5, '08:00', '14:00', false),
  (6, null, null, true)
on conflict (weekday) do nothing;

-- Site settings
insert into public.site_settings (key, value) values
  ('contact', '{"phone":"052-3060735","whatsapp":"972523060735","email":"yagudaeva09@gmail.com","address":"קיבוץ גניגר","instagram":"https://www.instagram.com/kristina_place_of_beauty/"}'),
  ('hero', '{"title":"Kristina Place Of Beauty","subtitle":"המקום שלך ליופי מקצועי","tagline":"מניקור, פדיקור ועיצוב ציפורניים ברמה הגבוהה ביותר"}')
on conflict (key) do nothing;

-- Services
insert into public.services (name, description, duration_min, price, image_url) values
  ('מניקור', 'מניקור מקצועי לטיפוח הציפורניים', 45, 80, 'https://res.cloudinary.com/dmrx96yqx/image/upload/v1593006988/placeOfBueaty/Gallery/f4papc5dqzrr74sotrlk.jpg'),
  ('פדיקור', 'פדיקור מפנק לטיפוח כפות הרגליים', 60, 100, 'https://res.cloudinary.com/dmrx96yqx/image/upload/v1746189630/placeOfBueaty/Gallery/Screenshot_2025-05-02_151335_fjdjgb.png'),
  ('עיצוב גבות', 'עיצוב גבות מקצועי בהתאמה אישית', 30, 60, 'https://images.unsplash.com/photo-1604654894609-5f24e06ca19f?w=800&q=80'),
  ('לק ג''ל', 'לק ג''ל איכותי לאורך זמן', 60, 120, 'https://res.cloudinary.com/dmrx96yqx/image/upload/v1593006987/placeOfBueaty/Gallery/bmfn4zpa7v2qqzyec20x.jpg'),
  ('בניית ציפורניים', 'בניית ציפורניים מקצועית', 90, 180, 'https://res.cloudinary.com/dmrx96yqx/image/upload/v1593006983/placeOfBueaty/Gallery/q25ghohsw4vms8l6s0am.jpg'),
  ('מניקור צרפתי', 'מניקור צרפתי קלאסי ואלגנטי', 60, 110, 'https://res.cloudinary.com/dmrx96yqx/image/upload/v1596480555/placeOfBueaty/Gallery/y9flf93wvcagds8xbxyh.jpg');

-- Products
insert into public.products (name, description, price, image_url, stock, category) values
  ('סט מברשות איפור מקצועיות', 'סט 12 מברשות איפור מקצועיות באיכות גבוהה להשגת מראה מושלם.', 129.90, 'https://images.unsplash.com/photo-1522335789203-aaa2cdaa1822?w=800&q=80', 25, 'איפור'),
  ('סרום חומצה היאלורונית', 'סרום מרוכז שמרגיע, מרטיב ומשקם את העור. מספק לחות לאורך זמן.', 89.90, 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80', 40, 'טיפוח עור'),
  ('קרם פנים לילה', 'קרם פנים לילה עשיר המתאים לכל סוגי העור, מחדש ומזין את העור בזמן השינה.', 109.90, 'https://images.unsplash.com/photo-1570194065650-d99fb4bedf0a?w=800&q=80', 30, 'טיפוח עור'),
  ('קרם פנים מזין', 'קרם פנים עשיר בלחות שמזין ומחדש את העור. מכיל תמציות טבעיות וויטמינים.', 120.00, 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&q=80', 20, 'טיפוח עור'),
  ('שמן קוטיקולה', 'שמן קוטיקולה מזין ומחזק את הציפורניים והעור סביבן.', 49.90, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80', 50, 'ציפורניים'),
  ('לק ג''ל - גוון רוז', 'לק ג''ל איכותי בגוון רוז עדין, מחזיק עד 3 שבועות.', 59.90, 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&q=80', 35, 'ציפורניים');

-- Courses
insert into public.courses (title, description, content, duration_min, price, image_url) values
  ('קורס בניית ציפורניים מקצועי', 'קורס מקיף ללימוד בניית ציפורניים מההתחלה ועד רמה מקצועית.', 'בקורס תלמדו טכניקות מתקדמות, עיצובים חדשניים ותקבלו טיפים מקצועיים מהמומחים.', 320, 299, 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80'),
  ('צביעת גבות - קורס בסיסי', 'קורס חינמי ללימוד טכניקות בסיסיות בצביעת גבות', 'תכנים בסיסיים: ניתוח מבנה גבה, בחירת גוון, טכניקות מריחה ושימור.', 60, 0, 'https://images.unsplash.com/photo-1583241800698-9c2e463cb4f1?w=800&q=80'),
  ('יסודות הלק ג''ל', 'קורס המלמד את יסודות הלק ג''ל באופן מקצועי ומעשי.', 'תלמדו על סוגי ג''לים שונים, טכניקות מריחה, וטיפים לעבודה מהירה ומקצועית.', 180, 149, 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&q=80');

-- Portfolio
insert into public.portfolio_items (title, description, image_url, sort_order) values
  ('מניקור ג''ל בעיצוב אומנותי', 'טכניקה מתקדמת לעיצוב ציפורניים', 'https://res.cloudinary.com/dmrx96yqx/image/upload/v1596480555/placeOfBueaty/Gallery/y9flf93wvcagds8xbxyh.jpg', 1),
  ('לק ג''ל בגוון עדין', 'מראה טבעי ועדין לכל אירוע', 'https://res.cloudinary.com/dmrx96yqx/image/upload/v1593006988/placeOfBueaty/Gallery/f4papc5dqzrr74sotrlk.jpg', 2),
  ('מניקור צרפתי קלאסי', 'מראה אלגנטי ונקי', 'https://res.cloudinary.com/dmrx96yqx/image/upload/v1593006987/placeOfBueaty/Gallery/bmfn4zpa7v2qqzyec20x.jpg', 3),
  ('עיצוב ציפורניים אומנותי', 'עיצובים מיוחדים בהתאמה אישית', 'https://res.cloudinary.com/dmrx96yqx/image/upload/v1593006983/placeOfBueaty/Gallery/q25ghohsw4vms8l6s0am.jpg', 4),
  ('טיפול ספא לידיים', 'חוויה מפנקת לטיפוח הידיים', 'https://res.cloudinary.com/dmrx96yqx/image/upload/v1746189630/placeOfBueaty/Gallery/Screenshot_2025-05-02_151335_fjdjgb.png', 5);

-- Instagram
insert into public.instagram_posts (post_url, thumbnail_url, caption, sort_order) values
  ('https://www.instagram.com/p/example1/', 'https://images.unsplash.com/photo-1604654894609-5f24e06ca19f?w=800&q=80', 'מניקור ג''ל מושלם 💅✨', 1),
  ('https://www.instagram.com/p/example2/', 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?w=800&q=80', 'טכניקות עיצוב ציפורניים מתקדמות 🎨', 2),
  ('https://www.instagram.com/p/example3/', 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?w=800&q=80', 'מראה טבעי ואלגנטי 💖', 3),
  ('https://www.instagram.com/p/example4/', 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&q=80', 'טיפים לטיפוח ציפורניים בריאות ✨', 4);
