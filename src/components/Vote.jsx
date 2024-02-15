import { db } from "@/db";
import auth from "../app/middleware";
import { revalidatePath } from "next/cache";
import { VoteButton } from "./VoteButton";
import { ReportUser } from "./ReportUser";

export async function Vote({ postId, votes }) {
  async function upvote() {
    "use server";
    const session = await auth();

    // Prevents someone from voting if they are not logged in 
    if(session !== null) {
      const rowsFound = await db.query("SELECT * FROM votes WHERE user_id = $1 AND post_id = $2",
        [session.user.id, postId]
      );

      // Prevents someone from voting twice
      if(rowsFound.rowCount === 0) {
        await db.query(
          "INSERT INTO votes (user_id, post_id, vote, vote_type) VALUES ($1, $2, $3, $4)",
          [session.user.id, postId, 1, "post"]
        );
      }
    }

    revalidatePath("/");
    revalidatePath(`/post/${postId}`);
  }

  async function downvote() {
    "use server";
    const session = await auth();

    // Prevents someone from voting if they are not logged in
    if(session !== null) {
      console.log("Downvote", postId, "by user", session.user.id);
      
      const rowsFound = await db.query("SELECT * FROM votes WHERE user_id = $1 AND post_id = $2",
        [session.user.id, postId]
      );

      // Prevents someone from voting twice
      if(rowsFound.rowCount === 0) {
        await db.query(
          "INSERT INTO votes (user_id, post_id, vote, vote_type) VALUES ($1, $2, $3, $4)",
          [session.user.id, postId, -1, "post"]
        );
      }
    }

    revalidatePath("/");
    revalidatePath(`/post/${postId}`);
  }


  // Report user functionality does NOT write data yet.
  async function report() {
    "use server";
    const session = await auth();

    // Prevents someone from reporting if they are not logged in
    if(session !== null) {
      console.log("Report", postId, "by user", session.user.id);
      
      const rowsFound = await db.query("SELECT * FROM votes WHERE user_id = $1 AND post_id = $2",
        [session.user.id, postId]
      );

      if(rowsFound.rowCount === 0) {
/*
        await db.query(
          "INSERT INTO votes (user_id, post_id, vote, vote_type) VALUES ($1, $2, $3, $4)",
          [session.user.id, postId, -1, "post"]

        );
*/
      }
    }

    revalidatePath("/");
    revalidatePath(`/post/${postId}`);
  }

  return (
    <>
      {votes} votes
      <div className="flex space-x-3">
        <form action={upvote}>
          <VoteButton label="Upvote" />
        </form>
        <form action={downvote}>
          <VoteButton label="Downvote" />
        </form>
        <form action={report}>
          <ReportUser label="Report User" />
        </form>
      </div>
    </>
  );
}
