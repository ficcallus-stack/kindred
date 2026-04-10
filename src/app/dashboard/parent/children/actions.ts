"use server";

import { requireUser } from "@/lib/get-server-user";
import { db } from "@/db";
import { children } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { createChildSchema, updateChildSchema, type CreateChildInput } from "@/lib/validations";
import { rateLimit } from "@/lib/rate-limit";

export async function getChildren() {
  const clerkUser = await requireUser();

  return db.query.children.findMany({
    where: eq(children.parentId, clerkUser.uid),
  });
}

export async function addChild(data: CreateChildInput) {
  return addChildrenBatch([data]);
}

export async function addChildrenBatch(data: CreateChildInput[]) {
  const clerkUser = await requireUser();

  const { success } = await rateLimit(`addChild:${clerkUser.uid}`);
  if (!success) throw new Error("Too many requests");

  if (data.length === 0) throw new Error("No child data provided");

  const newChildren = await db.transaction(async (tx) => {
    const results = [];
    for (const childData of data) {
      const parsed = createChildSchema.safeParse(childData);
      if (!parsed.success) {
        throw new Error(`Validation failed for ${childData.name || 'a child'}: ${parsed.error.issues.map((e) => e.message).join(", ")}`);
      }

      const [newChild] = await tx.insert(children).values({
        parentId: clerkUser.uid,
        name: parsed.data.name,
        age: parsed.data.age,
        type: parsed.data.type,
        bio: parsed.data.bio,
        photoUrl: parsed.data.photoUrl,
        specialNeeds: parsed.data.specialNeeds,
        interests: parsed.data.interests,
        medicalNotes: parsed.data.medicalNotes,
      }).returning();
      results.push(newChild);
    }
    return results;
  });

  revalidatePath("/dashboard/parent");
  return { success: true, count: newChildren.length };
}

export async function removeChild(childId: string) {
  const clerkUser = await requireUser();

  // Only delete own children
  await db.delete(children).where(
    and(eq(children.id, childId), eq(children.parentId, clerkUser.uid))
  );

  revalidatePath("/dashboard/parent");
}
