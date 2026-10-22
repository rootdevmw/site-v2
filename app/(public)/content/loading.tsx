import { MessageListLoading } from "@/components/public/MessageBrowse";
export default function Loading() {
  return (
    <section className="public-container public-section">
      <h1 className="public-display mb-8 text-4xl">
        Messages for the journey.
      </h1>
      <MessageListLoading />
    </section>
  );
}
