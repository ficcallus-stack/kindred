import { getSubmissionDetails } from "../../actions";
import MarkingClient from "./marking-client";
import { notFound } from "next/navigation";

interface PageProps {
  params: { id: string };
}

export default async function ModeratorMarkingPage({ params }: PageProps) {
  const submission = await getSubmissionDetails(params.id);

  if (!submission) {
    notFound();
  }

  return <MarkingClient submission={submission} />;
}
