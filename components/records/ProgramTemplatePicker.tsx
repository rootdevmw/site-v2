"use client";
import { useState } from "react";
import { Dialog } from "@/components/ui/Dialog";
import {
  useProgramEditorTemplate,
  useProgramTemplateChoices,
} from "@/lib/hooks/useProgramEditor";
import { directoryPageState } from "@/lib/utils/directory-records";
import type { getProgramEditorTemplate } from "@/lib/api/program-editor";
import {
  DirectoryError,
  DirectoryLoading,
} from "@/components/directories/DirectoryList";
import { RecordPager } from "./RecordPager";
type Template = Awaited<ReturnType<typeof getProgramEditorTemplate>>;
export function ProgramTemplatePicker({
  actor,
  onClose,
  onApply,
}: {
  actor: { id: string; roles: string[] } | null;
  onClose: () => void;
  onApply: (template: Template) => void;
}) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ page: 1, search: "" });
  const [selected, setSelected] = useState("");
  const choices = useProgramTemplateChoices(filters, actor);
  const preview = useProgramEditorTemplate(selected, actor);
  const state = choices.data
    ? directoryPageState(filters.page, choices.data.total, choices.data.limit)
    : null;
  return (
    <Dialog
      open
      onClose={onClose}
      title="Choose an order of service"
      description="Applying a template replaces the current activities, program type and homecell. Your date and location stay as entered. Review the changes before saving."
    >
      <div className="member-form-field">
        <label htmlFor="program-template-search">Find a template</label>
        <input
          id="program-template-search"
          className="record-input"
          type="search"
          value={search}
          maxLength={200}
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
          Search templates
        </button>
      </div>
      <div className="mt-5">
        {choices.isPending ? (
          <DirectoryLoading label="Finding templates..." />
        ) : choices.isError ? (
          <DirectoryError
            noun="template directory"
            error={choices.error}
            retrying={choices.isFetching}
            onRetry={() => {
              void choices.refetch();
            }}
          />
        ) : (
          choices.data &&
          state && (
            <>
              <p className="member-form-help" role="status">
                {choices.data.total} templates
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
                  disabled={choices.isFetching}
                >
                  <legend className="sr-only">
                    Choose a template to preview
                  </legend>
                  {choices.data.data.map((entry) => (
                    <label key={entry.id} className="prayer-team-option">
                      <input
                        type="radio"
                        name="program-editor-template"
                        value={entry.id}
                        checked={entry.id === selected}
                        onChange={() => setSelected(entry.id)}
                      />
                      <span>
                        <strong>{entry.name}</strong>
                        <span>Template #{entry.id}</span>
                      </span>
                    </label>
                  ))}
                  {!choices.data.data.length && (
                    <p className="member-form-help">
                      No matching templates. Try another name or create a
                      template first.
                    </p>
                  )}
                </fieldset>
              )}
              <RecordPager
                page={filters.page}
                totalPages={state.totalPages}
                onPageChange={(page) => setFilters({ ...filters, page })}
                disabled={choices.isFetching}
                label="Template choice pages"
              />
            </>
          )
        )}
      </div>
      {selected && (
        <div className="program-template-preview mt-5" aria-live="polite">
          {preview.isPending ? (
            <p>Loading template preview...</p>
          ) : preview.isError ? (
            <DirectoryError
              noun="template preview"
              error={preview.error}
              retrying={preview.isFetching}
              onRetry={() => {
                void preview.refetch();
              }}
            />
          ) : (
            preview.data && (
              <>
                <h3 className="font-semibold">{preview.data.name}</h3>
                <p className="member-form-help">
                  {preview.data.type.name} ·{" "}
                  {preview.data.homecell?.name ||
                    (preview.data.homecellId
                      ? "Homecell #" + preview.data.homecellId
                      : "Church-wide")}{" "}
                  · {preview.data.items.length} activities
                </p>
                <ol>
                  {preview.data.items.map((item, index) => (
                    <li key={item.id}>
                      {index + 1}. {item.title}
                      {item.time && " · " + item.time}
                    </li>
                  ))}
                </ol>
              </>
            )
          )}
        </div>
      )}
      <div className="member-form-actions mt-5">
        <button
          type="button"
          className="record-button record-button-primary"
          disabled={
            !preview.data ||
            preview.isPending ||
            preview.isError ||
            preview.isFetching
          }
          onClick={() => {
            if (preview.data) onApply(preview.data);
          }}
        >
          Apply selected template
        </button>
        <button
          type="button"
          className="record-button record-button-secondary"
          onClick={onClose}
        >
          Keep current activities
        </button>
      </div>
    </Dialog>
  );
}
