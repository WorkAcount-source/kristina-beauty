export const metadata = { title: "הצהרת נגישות" };

export default function AccessibilityPage() {
  return (
    <div className="pt-32 pb-20">
      <article className="container max-w-3xl prose prose-rose">
        <h1 className="font-display text-4xl font-bold mb-6">הצהרת נגישות</h1>
        <p>Kristina Place Of Beauty פועלת להנגשת האתר לאנשים עם מוגבלויות בהתאם לתקן הישראלי 5568, ברמת AA.</p>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">מה הונגש?</h2>
        <ul>
          <li>תמיכה בקוראי מסך וניווט מקלדת</li>
          <li>ניגודיות צבעים גבוהה</li>
          <li>תיאורי תמונות (alt)</li>
          <li>טקסטים בעברית בכיוון RTL</li>
        </ul>
        <h2 className="font-display text-2xl font-semibold mt-8 mb-3">פניות בנושא נגישות</h2>
        <p>במקרה של תקלות נגישות, ניתן לפנות אלינו בטלפון 052-3060735 או בדוא&quot;ל yagudaeva09@gmail.com.</p>
      </article>
    </div>
  );
}
