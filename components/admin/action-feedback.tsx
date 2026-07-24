import { Alert } from "@/components/ui/alert";
import type { AdminActionResult } from "@/lib/actions/result";

type ActionFeedbackProps = {
  readonly result: AdminActionResult;
};

export function ActionFeedback({ result }: ActionFeedbackProps) {
  switch (result.kind) {
    case "idle":
      return null;
    case "success":
      return <Alert variant="success">{result.message}</Alert>;
    case "error":
      return <Alert variant="error">{result.message}</Alert>;
    default:
      return result satisfies never;
  }
}
