export const metadata = { title: "תנאי שימוש" };

export default function TermsPage() {
  return (
    <div className="pt-32 pb-20">
      <article className="container max-w-3xl prose prose-rose">
        <h1 className="font-display text-4xl font-bold mb-6">תנאי שימוש</h1>
        <p>השימוש באתר Kristina Place Of Beauty כפוף לתנאים המפורטים להלן. השימוש באתר מהווה הסכמה מלאה לתנאים אלה.</p>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">הזמנות ותורים</h2>
        <p>קביעת תור מהווה התחייבות להגעה. ביטולים יש לבצע לפחות 24 שעות מראש.</p>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">קניין רוחני</h2>
        <p>כל התכנים, התמונות והעיצובים באתר מוגנים בזכויות יוצרים ואין להעתיקם.</p>
      </article>
    </div>
  );
}
