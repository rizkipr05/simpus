import { authDb, recordsDb } from "./db.js";
import { users } from "./users.js";

export async function seedUsers() {
  const docs = users.map((user) => ({
    _id: `user:${user.username}`,
    type: "user",
    ...user,
  }));

  for (const doc of docs) {
    for (const db of [authDb, recordsDb]) {
      try {
        await db.get(doc._id);
      } catch (error) {
        if (error.status === 404) {
          await db.put(doc);
        } else {
          throw error;
        }
      }
    }
  }
}
