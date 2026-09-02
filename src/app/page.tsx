import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { PipelineSteps } from "@/components/pipeline-steps";
import { ImportForm } from "@/components/import-form";
import { UploadForm } from "@/components/upload-form";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="mx-auto max-w-3xl space-y-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          YouTube channel automation
        </h1>
        <p className="text-lg text-muted-foreground">
          ClipForge imports or ingests your videos, auto-captions and translates them, adds
          copyright-free music, and organizes everything into a topic-grouped catalog — on free,
          self-configurable AI.
        </p>
      </section>

      <section>
        <PipelineSteps />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Import from YouTube</CardTitle>
            <CardDescription>
              Paste a video or channel URL. We pull metadata and auto-categorize it.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ImportForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upload a file</CardTitle>
            <CardDescription>Drop in your own video to caption, score and clip.</CardDescription>
          </CardHeader>
          <CardContent>
            <UploadForm />
          </CardContent>
        </Card>
      </section>

      <section className="flex justify-center">
        <Link href="/catalog" className={buttonVariants({ size: "lg" })}>
          Open the catalog →
        </Link>
      </section>

      <section className="mx-auto max-w-3xl">
        <Card className="border-amber-300/50 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="flex gap-3 p-4 text-sm">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
            <p className="text-muted-foreground">
              <span className="font-medium text-foreground">Use responsibly.</span> Importing and
              re-posting other creators&rsquo; videos can violate YouTube&rsquo;s Terms and
              third-party copyright — adding background music does not clear the source
              video&rsquo;s rights. Import and auto-post are off by default and meant for content
              you own or are licensed to use.
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
