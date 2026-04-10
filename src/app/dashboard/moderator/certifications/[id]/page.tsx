import { getSubmissionDetails } from "../../actions";
import MarkingClient from "./marking-client";
import { notFound } from "next/navigation";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ModeratorMarkingPage({ params }: PageProps) {
  const { id } = await params;
  const submission = await getSubmissionDetails(id);

  if (!submission) {
    notFound();
  }

  return <MarkingClient submission={submission} />;
}
