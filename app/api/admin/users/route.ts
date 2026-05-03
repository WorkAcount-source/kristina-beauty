export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export {
  handleGetUsers as GET,
  handlePatchUser as PATCH,
  handlePostUser as POST,
  handleDeleteUser as DELETE,
} from "@/modules/users/users.controller";
