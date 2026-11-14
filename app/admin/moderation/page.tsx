import type { Metadata } from "next";
import { connection } from "next/server";
import { HIDE_AFTER_REPORTS } from "../_lib/moderation";
import { getRecentComments, getReportedComments } from "../_lib/moderation.data";
import { EmptyState, GUTTER, PageHeader, Segmented } from "../_components/ui";
import { CommentCard } from "./CommentCard";

export const metadata: Metadata = {
  title: "Moderation — Kasala Admin",
  description: "Review reported comments.",
};

type Props = { searchParams: Promise<{ view?: string }> };

export default async function ModerationPage({ searchParams }: Props) {
  await connection();
  const { view } = await searchParams;
  const recent = view === "recent";
  const comments = recent ? await getRecentComments() : await getReportedComments();

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-bg text-fg">
      <PageHeader
        title="Moderation"
        description={
          <>
            People can report comments on incidents. A reported comment disappears for the
            person who reported it straight away, and for everyone once {HIDE_AFTER_REPORTS}{" "}
            people have reported it. Delete what breaks the rules; keep what was reported
            unfairly.
          </>
        }
      />
      <div className={`pb-5 ${GUTTER}`}>
        <Segmented
          label="View"
          value={recent ? "recent" : "reported"}
          items={[
            { id: "reported", label: "Reported", href: "/admin/moderation", count: recent ? undefined : comments.length },
            { id: "recent", label: "Recent comments", href: "/admin/moderation?view=recent" },
          ]}
        />
      </div>
      <main className={`flex-1 pb-8 ${GUTTER}`}>
        {comments.length === 0 ? (
          <EmptyState
            title={recent ? "No comments yet" : "Nothing reported"}
            hint={recent ? "Comments on incidents will show up here." : "All clear. Reported comments land here."}
          />
        ) : (
          <ul className="max-w-3xl space-y-3">
            {comments.map((c) => (
              <CommentCard key={c.id} comment={c} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
