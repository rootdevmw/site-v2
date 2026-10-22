"use client";
import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import { useContentAuthors } from "@/lib/hooks/useContentEditor";
import { directoryPageState } from "@/lib/utils/directory-records";
import type { RelatedRecord } from "@/lib/utils/record-details";
import {
  DirectoryError,
  DirectoryLoading,
} from "@/components/directories/DirectoryList";
import { RecordPager } from "./RecordPager";
export function ContentAuthorPicker({
  value,
  initialAuthor,
  actor,
  disabled,
  error,
  onChange,
}: {
  value?: string;
  initialAuthor?: RelatedRecord | null;
  actor: { id: string; roles: string[] } | null;
  disabled: boolean;
  error?: string;
  onChange: (id: string) => void;
}) {
  const [open, setOpen] = useState(false),
    [chosen, setChosen] = useState<RelatedRecord | null>(null);
  const author =
    chosen?.id === value
      ? chosen
      : initialAuthor?.id === value
        ? initialAuthor
        : null;
  return (
    <div className="member-form-field">
      <label htmlFor="content-authorId">Author (optional)</label>
      <button
        id="content-authorId"
        type="button"
        className="record-input directory-picker"
        disabled={disabled}
        aria-haspopup="dialog"
        aria-describedby={
          error ? "content-authorId-error" : "content-author-help"
        }
        onClick={() => setOpen(true)}
      >
        <span>
          {value
            ? author?.name || "Current profile #" + value
            : "No author assigned"}
        </span>
        <span aria-hidden="true">Choose</span>
      </button>
      <p id="content-author-help" className="member-form-help">
        The author name can appear publicly. Assigning an author does not change
        account access.
      </p>
      {value && (
        <button
          type="button"
          className="directory-text-link"
          disabled={disabled}
          onClick={() => onChange("")}
        >
          Clear author
        </button>
      )}
      {error && (
        <p id="content-authorId-error" className="member-form-error">
          {error}
        </p>
      )}
      {open && (
        <ContentAuthorSearch
          actor={actor}
          currentId={value}
          onClose={() => setOpen(false)}
          onSelect={(entry) => {
            setChosen(entry);
            onChange(entry.id);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}
export function ContentAuthorSearch({
  actor,
  currentId,
  onClose,
  onSelect,
}: {
  actor: { id: string; roles: string[] } | null;
  currentId?: string;
  onClose: () => void;
  onSelect: (person: RelatedRecord) => void;
}) {
  const [search, setSearch] = useState(""),
    [filters, setFilters] = useState({ page: 1, search: "" }),
    [selected, setSelected] = useState<RelatedRecord | null>(null);
  const query = useContentAuthors(filters, actor);
  const state = query.data
    ? directoryPageState(filters.page, query.data.total, query.data.limit)
    : null;
  return (
    <Dialog
      open
      onClose={onClose}
      title="Choose an author"
      description="Choose an active directory profile. Only profile names and IDs are loaded for this selection."
    >
      <div className="member-form-field">
        <label htmlFor="content-author-search">Find a person</label>
        <input
          id="content-author-search"
          type="search"
          className="record-input"
          maxLength={200}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              setFilters({ page: 1, search: search.trim() });
            }
          }}
        />
        <button
          type="button"
          className="record-button record-button-secondary mt-3"
          onClick={() => setFilters({ page: 1, search: search.trim() })}
        >
          Search authors
        </button>
      </div>
      <div className="mt-5">
        {query.isPending ? (
          <DirectoryLoading label="Finding authors..." />
        ) : query.isError ? (
          <DirectoryError
            noun="author directory"
            error={query.error}
            retrying={query.isFetching}
            onRetry={() => {
              void query.refetch();
            }}
          />
        ) : (
          query.data &&
          state && (
            <>
              <p className="member-form-help" role="status">
                {query.data.total} directory profiles
              </p>
              {state.outOfRange ? (
                <button
                  type="button"
                  className="record-button record-button-secondary"
                  onClick={() =>
                    setFilters({ ...filters, page: state.totalPages })
                  }
                >
                  Go to last available page
                </button>
              ) : (
                <fieldset
                  className="prayer-team-options group-leadership-options"
                  disabled={query.isFetching}
                >
                  <legend className="sr-only">Choose one author</legend>
                  {query.data.data.map((person) => (
                    <label key={person.id} className="prayer-team-option">
                      <input
                        type="radio"
                        name="content-author-choice"
                        value={person.id}
                        checked={selected?.id === person.id}
                        onChange={() => setSelected(person)}
                      />
                      <span>
                        <strong>{person.name}</strong>
                        <span>
                          Profile #{person.id}
                          {person.id === currentId && " · Current author"}
                        </span>
                      </span>
                    </label>
                  ))}
                  {!query.data.data.length && (
                    <p className="member-form-help">
                      No matching profiles. Try another name or leave the author
                      unassigned.
                    </p>
                  )}
                </fieldset>
              )}
              <RecordPager
                page={filters.page}
                totalPages={state.totalPages}
                onPageChange={(page) => setFilters({ ...filters, page })}
                disabled={query.isFetching}
                label="Author directory pages"
              />
            </>
          )
        )}
      </div>
      {selected && (
        <p role="status" className="member-form-help mt-4">
          Selected: {selected.name} · Profile #{selected.id}
        </p>
      )}
      <div className="member-form-actions mt-5">
        <button
          type="button"
          className="record-button record-button-primary"
          disabled={
            !selected || query.isPending || query.isError || query.isFetching
          }
          onClick={() => {
            if (selected) onSelect(selected);
          }}
        >
          Use selected author
        </button>
        <button
          type="button"
          className="record-button record-button-secondary"
          onClick={onClose}
        >
          Keep current author
        </button>
      </div>
    </Dialog>
  );
}
