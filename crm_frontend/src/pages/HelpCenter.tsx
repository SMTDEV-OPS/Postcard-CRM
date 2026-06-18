import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Search, BookOpen, GraduationCap } from "lucide-react";
import { Input } from "@/components/ui/input";
import { HelpArticle } from "@/components/help/HelpArticle";
import { HELP_CATEGORIES, LEARNING_PATHS } from "@/help/helpTypes";
import {
  HELP_TOPICS,
  getHelpTopic,
  searchHelp,
  getTopicsByCategory,
} from "@/help/helpContent";
import { countFieldsForCategory } from "@/help/helpRegistry";
import { helpArticleUrl } from "@/help/useHelpTopic";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SUPPORT_EMAIL =
  import.meta.env.VITE_SUPPORT_EMAIL || "support@svayammeraki.com";

interface HelpCenterProps {
  isAdmin?: boolean;
}

export function HelpCenter({ isAdmin = false }: HelpCenterProps) {
  const location = useLocation();
  const [query, setQuery] = useState("");
  const [showAdminTopics, setShowAdminTopics] = useState(isAdmin);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activePath, setActivePath] = useState<string | null>(null);

  const includeAdmin = showAdminTopics || isAdmin;

  const searchResults = useMemo(
    () => searchHelp(query, { includeAdmin }),
    [query, includeAdmin]
  );

  const hashId = location.hash.replace("#", "");
  const hashTopic = hashId ? getHelpTopic(hashId) : undefined;

  useEffect(() => {
    if (hashTopic) {
      setActiveCategory(hashTopic.category);
      setActivePath(null);
      requestAnimationFrame(() => {
        const el = document.getElementById(hashId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [hashId, hashTopic]);

  const pathTopics = useMemo(() => {
    if (!activePath) return null;
    const path = LEARNING_PATHS.find((p) => p.id === activePath);
    if (!path) return null;
    return path.topicIds
      .map((id) => getHelpTopic(id))
      .filter((t): t is NonNullable<typeof t> => !!t && (includeAdmin || t.audience !== "admin"));
  }, [activePath, includeAdmin]);

  const displayTopics = query.trim()
    ? searchResults.topics
    : pathTopics
      ? pathTopics
      : activeCategory
        ? getTopicsByCategory(activeCategory, includeAdmin)
        : [];

  const categoriesWithTopics = HELP_CATEGORIES.filter((cat) => {
    const topics = getTopicsByCategory(cat.id, includeAdmin);
    return topics.length > 0;
  });

  const showHome = !query.trim() && !activeCategory && !activePath;

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-panel-enter">
      <div className="flex items-start gap-3">
        <BookOpen className="mt-1 h-6 w-6 shrink-0 text-primary" strokeWidth={1.5} />
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Training & Help</h1>
          <p className="text-sm text-muted-foreground">
            Guides for every module — search fields, browse by category, or follow a learning path.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActivePath(null);
            }}
            placeholder="Search articles and fields…"
            className="pl-9"
          />
        </div>
        {isAdmin && (
          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={showAdminTopics}
              onChange={(e) => setShowAdminTopics(e.target.checked)}
              className="rounded border-border"
            />
            Show admin & setup articles
          </label>
        )}
      </div>

      {query.trim() && searchResults.fields.length > 0 && (
        <div className="rounded-lg border border-border bg-muted/20 p-4 space-y-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Field matches ({searchResults.fields.length})
          </p>
          <ul className="space-y-1">
            {searchResults.fields.slice(0, 12).map(({ field, topicId, topicTitle }) => (
              <li key={field.id}>
                <Link
                  to={`${helpArticleUrl(topicId)}#${topicId}`}
                  className="text-sm hover:underline"
                >
                  <span className="font-medium text-foreground">{field.label}</span>
                  <span className="text-muted-foreground"> — {topicTitle}</span>
                </Link>
                <p className="text-xs text-muted-foreground line-clamp-1">{field.what}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-col gap-4 md:flex-row md:gap-8">
        <div className="md:hidden">
          <Select
            value={activePath ?? activeCategory ?? "home"}
            onValueChange={(v) => {
              if (v === "home") {
                setActiveCategory(null);
                setActivePath(null);
                setQuery("");
                return;
              }
              if (LEARNING_PATHS.some((p) => p.id === v)) {
                setActivePath(v);
                setActiveCategory(null);
                setQuery("");
                return;
              }
              setActiveCategory(v);
              setActivePath(null);
              setQuery("");
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Browse help" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="home">Home</SelectItem>
              {categoriesWithTopics.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.label}
                </SelectItem>
              ))}
              {LEARNING_PATHS.map((path) => (
                <SelectItem key={path.id} value={path.id}>
                  Path: {path.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <aside className="hidden w-48 shrink-0 md:block">
          <nav className="sticky top-4 space-y-0.5">
            <button
              type="button"
              onClick={() => {
                setActiveCategory(null);
                setActivePath(null);
                setQuery("");
              }}
              className={cn(
                "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                showHome ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              Home
            </button>
            {categoriesWithTopics.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
                  setActivePath(null);
                  setQuery("");
                }}
                className={cn(
                  "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                  activeCategory === cat.id
                    ? "bg-primary/10 font-medium text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                {cat.label}
              </button>
            ))}
          </nav>
        </aside>

        <div className="min-w-0 flex-1 space-y-10">
          {showHome && (
            <>
              <section className="space-y-3">
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" strokeWidth={1.5} />
                  <h2 className="text-lg font-semibold">Learning paths</h2>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {LEARNING_PATHS.map((path) => (
                    <button
                      key={path.id}
                      type="button"
                      onClick={() => {
                        setActivePath(path.id);
                        setActiveCategory(null);
                      }}
                      className="rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/30"
                    >
                      <p className="font-medium text-foreground">{path.title}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{path.description}</p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {path.topicIds.length} articles
                      </p>
                    </button>
                  ))}
                </div>
              </section>

              <section className="space-y-3">
                <h2 className="text-lg font-semibold">Browse by module</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {categoriesWithTopics.map((cat) => {
                    const topics = getTopicsByCategory(cat.id, includeAdmin);
                    const fieldCount = countFieldsForCategory(cat.id, HELP_TOPICS);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          setActiveCategory(cat.id);
                          setActivePath(null);
                        }}
                        className="rounded-lg border border-border bg-card p-4 text-left transition-colors hover:border-primary/40 hover:bg-muted/30"
                      >
                        <p className="font-medium text-foreground">{cat.label}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {topics.length} articles
                          {fieldCount > 0 && ` · ${fieldCount} fields documented`}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </section>
            </>
          )}

          {activePath && pathTopics && (
            <div className="rounded-lg border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
              <span className="font-medium">
                {LEARNING_PATHS.find((p) => p.id === activePath)?.title}
              </span>
              <button
                type="button"
                className="ml-3 text-primary hover:underline"
                onClick={() => setActivePath(null)}
              >
                Back to home
              </button>
            </div>
          )}

          {!showHome && displayTopics.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No articles match your search.
            </p>
          ) : (
            !showHome &&
            displayTopics.map((topic) => <HelpArticle key={topic.id} topic={topic} />)
          )}

          <div className="rounded-lg border border-border bg-muted/30 p-6">
            <h3 className="text-sm font-semibold text-foreground">Need more help?</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
              Contact your CRM administrator or email{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
                {SUPPORT_EMAIL}
              </a>
              . See the Support article for common login and API errors.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HelpCenter;
