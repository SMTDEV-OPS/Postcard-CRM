import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Search, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { HelpArticle } from "@/components/help/HelpArticle";
import { HELP_CATEGORIES } from "@/help/helpTypes";
import { getHelpTopic, searchHelpTopics, getTopicsByCategory } from "@/help/helpContent";
import { cn } from "@/lib/utils";

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

  const includeAdmin = showAdminTopics || isAdmin;

  const searchResults = useMemo(
    () => searchHelpTopics(query, { includeAdmin }),
    [query, includeAdmin]
  );

  const hashId = location.hash.replace("#", "");
  const hashTopic = hashId ? getHelpTopic(hashId) : undefined;

  useEffect(() => {
    if (hashTopic) {
      setActiveCategory(hashTopic.category);
      requestAnimationFrame(() => {
        const el = document.getElementById(hashId);
        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [hashId, hashTopic]);

  const displayTopics = query.trim()
    ? searchResults
    : activeCategory
      ? getTopicsByCategory(activeCategory, includeAdmin)
      : searchResults;

  const categoriesWithTopics = HELP_CATEGORIES.filter((cat) => {
    const topics = getTopicsByCategory(cat.id, includeAdmin);
    return topics.length > 0;
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6 animate-panel-enter">
      <div className="flex items-start gap-3">
        <BookOpen className="mt-1 h-6 w-6 shrink-0 text-primary" strokeWidth={1.5} />
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Training & Help</h1>
          <p className="text-sm text-muted-foreground">
            Guides for every module — search or browse by category.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search help articles…"
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

      <div className="flex gap-8">
        <aside className="hidden w-48 shrink-0 md:block">
          <nav className="sticky top-4 space-y-0.5">
            <button
              type="button"
              onClick={() => {
                setActiveCategory(null);
                setQuery("");
              }}
              className={cn(
                "w-full rounded-md px-3 py-2 text-left text-sm transition-colors",
                !activeCategory && !query.trim()
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              All topics
            </button>
            {categoriesWithTopics.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveCategory(cat.id);
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
          {displayTopics.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              No articles match your search.
            </p>
          ) : (
            displayTopics.map((topic) => (
              <HelpArticle key={topic.id} topic={topic} />
            ))
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
