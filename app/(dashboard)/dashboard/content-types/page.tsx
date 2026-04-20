"use client";

import { useRouter } from "next/navigation";
import { useContentTypes } from "@/app/modules/content/hooks/useContentTypes";
import { ContentTypeForm } from "@/app/modules/content/components/ContentTypeForm";

import { TableLayout } from "@/components/ui/TableLayout";
import { Table } from "@/components/ui/Table";
import { useState } from "react";

export default function ContentTypesPage() {
  const router = useRouter();
  const { data, isLoading } = useContentTypes();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const types = data?.data || [];

  return (
    <TableLayout
      title="Content Types"
      description="Manage content categories"
      actions={
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-lg text-sm font-medium bg-[var(--main-gold)] text-black hover:bg-[var(--gold-dark)] transition-all duration-200"
        >
          + Add Type
        </button>
      }
    >
      <Table
        data={types}
        isLoading={isLoading}
        emptyMessage="No content types found"
        columns={[{ header: "Name", accessor: "name" }]}
      />

      {showCreateModal && (
        <ContentTypeCreateModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => setShowCreateModal(false)}
        />
      )}
    </TableLayout>
  );
}

function ContentTypeCreateModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <button
        aria-label="Close modal"
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md rounded-2xl border border-[var(--border-soft)] bg-[var(--card-bg)] shadow-xl">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">
            Create Content Type
          </h2>

          <ContentTypeForm
            onSuccess={() => {
              onSuccess();
              onClose();
            }}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>
  );
}
