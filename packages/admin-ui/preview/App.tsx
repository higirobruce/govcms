import { useState } from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Input,
  Label,
} from "../src";

export function App() {
  const [dark, setDark] = useState(false);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
  };

  return (
    <div className="min-h-screen">
      {/* Top bar — a taste of the product chrome */}
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border bg-card/80 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground text-sm font-bold">
            g
          </div>
          <span className="font-semibold tracking-tight">govcms</span>
          <Badge variant="secondary" className="ml-1">
            Studio
          </Badge>
        </div>
        <Button variant="outline" size="sm" onClick={toggle}>
          {dark ? "☀ Light" : "☾ Dark"}
        </Button>
      </header>

      <main className="mx-auto max-w-5xl space-y-10 px-6 py-10">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Product design system
          </h1>
          <p className="mt-1 max-w-prose text-sm text-muted-foreground">
            The CMS's own brand — modern and productive. Deliberately separate
            from the RISA-conformant government delivery system.
          </p>
        </div>

        {/* Buttons */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Buttons</h2>
          <div className="flex flex-wrap items-center gap-3">
            <Button>Publish</Button>
            <Button variant="secondary">Save draft</Button>
            <Button variant="outline">Preview</Button>
            <Button variant="ghost">Cancel</Button>
            <Button variant="destructive">Delete</Button>
            <Button variant="link">Learn more</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
          </div>
        </section>

        {/* Badges */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Status badges
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Draft</Badge>
            <Badge variant="outline">In review</Badge>
            <Badge variant="success">Published</Badge>
            <Badge>Approved</Badge>
            <Badge variant="destructive">Archived</Badge>
          </div>
        </section>

        {/* Cards + form */}
        <section className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">
            Cards &amp; forms
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>New entry</CardTitle>
                <CardDescription>
                  Create a page for the Pilot Ministry site.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title">Title</Label>
                  <Input id="title" placeholder="e.g. Apply for a permit" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="slug">Slug</Label>
                  <Input id="slug" placeholder="apply-for-a-permit" />
                </div>
              </CardContent>
              <CardFooter className="gap-3">
                <Button>Save draft</Button>
                <Button variant="ghost">Cancel</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Pilot Ministry</CardTitle>
                <CardDescription>3 content types · 2 locales</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <span>Pages</span>
                  <Badge variant="secondary">12</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>News</span>
                  <Badge variant="secondary">34</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Services</span>
                  <Badge variant="secondary">8</Badge>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Open workspace
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
