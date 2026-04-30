import { UsersManager } from "./manager";

export const dynamic = "force-dynamic";

export default function AdminUsersPage() {
  return (
    <div className="space-y-4">
      <h1 className="font-display text-2xl md:text-3xl font-bold">משתמשים</h1>
      <p className="text-sm text-muted-foreground">
        ניהול משתמשים: שינוי תפקיד, חסימה, איפוס סיסמה ומחיקת חשבון.
      </p>
      <UsersManager />
    </div>
  );
}
