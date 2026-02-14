import { Inbox } from "lucide-react";

const EmptyState = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
    <Inbox className="mb-4 h-12 w-12 text-muted-foreground/50" />
    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
    {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
  </div>
);

export default EmptyState;
