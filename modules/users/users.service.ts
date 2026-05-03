import {
  listUsersWithProfiles,
  updateUserRole,
  setUserBan,
  generatePasswordResetLink,
  deleteUserById,
} from "./users.repository";
import { BadRequestError } from "@/lib/utils/errors";

export async function listUsers() {
  return listUsersWithProfiles();
}

export async function updateUser(
  adminId: string,
  id: string,
  action: "role" | "ban",
  value?: string | boolean
) {
  if (id === adminId) throw new BadRequestError("אי אפשר לשנות את עצמך");

  if (action === "role") {
    if (value !== "admin" && value !== "customer") {
      throw new BadRequestError("תפקיד לא תקין");
    }
    await updateUserRole(id, value);
    return;
  }

  if (action === "ban") {
    await setUserBan(id, Boolean(value));
    return;
  }

  throw new BadRequestError("פעולה לא מוכרת");
}

export async function resetUserPassword(email: string) {
  const link = await generatePasswordResetLink(email);
  return { link };
}

export async function deleteUser(adminId: string, id: string) {
  if (id === adminId) throw new BadRequestError("אי אפשר למחוק את עצמך");
  await deleteUserById(id);
}
