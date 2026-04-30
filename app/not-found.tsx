import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-rose">
      <div className="text-center space-y-6 p-8">
        <div className="font-display text-9xl font-bold text-gradient">404</div>
        <h1 className="font-display text-3xl font-bold">העמוד לא נמצא</h1>
        <p className="text-muted-foreground">העמוד שחיפשת לא קיים או הועבר</p>
        <Button asChild size="lg"><Link href="/">חזרה לעמוד הבית</Link></Button>
      </div>
    </div>
  );
}
