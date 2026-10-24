import { getProgramTypes } from "@/lib/public-api/programs";
import { loadHomeFeed } from "@/lib/utils/optional-feed";
import { publicProgramTypes } from "@/lib/utils/public-programs";

function TypeSelect({
  selected,
  types,
  pending = false,
}: {
  selected: string;
  types: { id: string; name: string }[];
  pending?: boolean;
}) {
  return (
    <div className="min-w-0">
      <label
        htmlFor="program-type"
        className="mb-2 block text-sm font-semibold"
      >
        Program type
      </label>
      <select
        id="program-type"
        name={pending ? undefined : "typeId"}
        defaultValue={selected}
        disabled={pending}
        className="public-input"
      >
        <option value="">All program types</option>
        {selected && !types.some((type) => type.id === selected) && (
          <option value={selected}>Selected program type</option>
        )}
        {types.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </select>
      {pending && (
        <>
          <input type="hidden" name="typeId" value={selected} />
          <p
            role="status"
            className="mt-2 text-xs leading-6 text-[var(--public-muted)]"
          >
            Loading program types…
          </p>
        </>
      )}
    </div>
  );
}
export function ProgramTypeLoading({ selected }: { selected: string }) {
  return <TypeSelect selected={selected} types={[]} pending />;
}
export async function ProgramTypeField({ selected }: { selected: string }) {
  const result = await loadHomeFeed(async (options) => ({
    data: publicProgramTypes(await getProgramTypes(options)),
  }));
  return (
    <div className="min-w-0">
      <TypeSelect selected={selected} types={result.data || []} />
      {result.unavailable && (
        <p className="mt-2 text-xs leading-6 text-[var(--public-muted)]">
          Types could not load. You can still search or keep your selected type.
        </p>
      )}
    </div>
  );
}
