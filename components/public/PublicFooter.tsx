import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="border-t border-[#d8e2dc] bg-[#18342f] text-white">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        {/* LEFT */}
        <div className="text-left">
          <p className="text-lg font-semibold">Redcross Church of Christ</p>
          <p className="mt-3 text-sm leading-6 text-[#d7e3dd]">
            A church family growing in worship, discipleship, and service to our
            community.
          </p>
        </div>

        {/* CENTER */}
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wide">
            Gatherings
          </p>

          <div className="mt-3 space-y-2 text-sm text-[#d7e3dd]">
            <p>Sunday English Service — 7:00 AM</p>
            <p>Sunday Chichewa Service — 9:30 AM</p>
            <p>Combined Service — 8:30 AM</p>
            <p className="text-xs">(Last Sunday of the month)</p>

            <p className="pt-2">Homecell Prayers — 6:00 PM (Wednesday)</p>
            <p className="text-xs">In respective homes per homecell program</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="text-right">
          <p className="text-sm font-semibold uppercase tracking-wide">
            Explore
          </p>

          <div className="mt-3 flex flex-col gap-2 text-sm text-[#d7e3dd] items-end">
            <Link href="/sermons" className="hover:text-white">
              Sermons
            </Link>
            <Link href="/events" className="hover:text-white">
              Events
            </Link>
            <Link href="/ministries" className="hover:text-white">
              Ministries
            </Link>
            <Link href="/contact" className="hover:text-white">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
