export const metadata = { title: "מדיניות פרטיות" };

export default function PrivacyPage() {
  return (
    <div className="pt-32 pb-20">
      <article className="container max-w-3xl prose prose-rose">
        <h1 className="font-display text-4xl font-bold mb-6">מדיניות פרטיות</h1>
        <p>אנחנו ב-Kristina Place Of Beauty מכבדים את פרטיותך. מדיניות זו מסבירה אילו מידע אנו אוספים, כיצד אנו משתמשים בו וכיצד אנו שומרים עליו.</p>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">מידע שאנו אוספים</h2>
        <p>שם, טלפון, דוא&quot;ל, פרטי הזמנות ותורים, וכל מידע שתבחרי לספק לנו ביוזמתך.</p>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">שימוש במידע</h2>
        <p>המידע משמש לניהול תורים והזמנות, יצירת קשר ושירות לקוחות. איננו מעבירים מידע לצדדים שלישיים מלבד נותני שירות נדרשים (כגון סליקת תשלומים).</p>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">זכויותייך</h2>
        <p>בכל עת ניתן לפנות אלינו לצורך תיקון, מחיקה או קבלת המידע השמור עלייך.</p>
      </article>
    </div>
  );
}
