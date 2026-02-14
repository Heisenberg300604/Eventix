import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload, ArrowLeft, ArrowRight } from "lucide-react";
import { placeholderEvents } from "@/data/placeholders";

const EditEvent = () => {
  const { id } = useParams();
  const event = placeholderEvents.find((e) => e.id === id);

  if (!event) {
    return (
      <div className="py-20 text-center">
        <h1 className="text-2xl font-bold text-foreground">Event not found</h1>
        <Link to="/dashboard" className="mt-4 inline-block text-primary hover:underline">Back to dashboard</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <Link to="/dashboard" className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Edit Event</h1>
        <p className="mt-1 text-sm text-muted-foreground">Update your event details</p>
      </div>

      <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
        <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
          <div>
            <Label htmlFor="title" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Title</Label>
            <Input id="title" defaultValue={event.title} className="mt-1.5 rounded-xl bg-muted/50 border-0" />
          </div>
          <div>
            <Label htmlFor="description" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Description</Label>
            <Textarea id="description" defaultValue={event.description} className="mt-1.5 rounded-xl bg-muted/50 border-0" rows={4} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="date" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Date</Label>
              <Input id="date" type="text" defaultValue={event.date} className="mt-1.5 rounded-xl bg-muted/50 border-0" />
            </div>
            <div>
              <Label htmlFor="location" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Location</Label>
              <Input id="location" defaultValue={event.location} className="mt-1.5 rounded-xl bg-muted/50 border-0" />
            </div>
          </div>
          <div>
            <Label htmlFor="capacity" className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Capacity</Label>
            <Input id="capacity" type="number" defaultValue={event.capacity} className="mt-1.5 rounded-xl bg-muted/50 border-0" />
          </div>
          <div>
            <Label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Current Banner</Label>
            <div className="mt-1.5 overflow-hidden rounded-2xl border border-border">
              <img src={event.image} alt={event.title} className="aspect-[21/9] w-full object-cover" />
            </div>
            <div className="mt-3 flex items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30 px-6 py-8 transition-colors hover:border-primary/30 hover:bg-accent/30 cursor-pointer">
              <div className="text-center">
                <Upload className="mx-auto h-6 w-6 text-muted-foreground" />
                <p className="mt-1 text-sm font-medium text-muted-foreground">Upload new banner</p>
              </div>
            </div>
          </div>
        </div>

        <Button type="submit" size="lg" className="gap-2 rounded-xl px-8">
          Save Changes <ArrowRight className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
};

export default EditEvent;
