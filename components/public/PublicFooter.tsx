import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="relative border-t border-[#ecd8c2] bg-[#2b1405] text-[#fde5c0]">
      {/* Top glow line (matches header hairline) */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#7c3d0f] via-[#e8820c] to-[#c2a23a]" />

      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-3 lg:px-8">
        {/* LEFT */}
        <div className="text-center md:text-left">
          <p className="text-lg font-semibold text-[#f7d9a8]">
            Church of Christ at Redcross
          </p>

          <p className="mt-3 text-sm leading-6 text-[#e6c79c]">
            A church family growing in worship, discipleship, and service to our
            community.
          </p>
        </div>

        {/* CENTER */}
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c2a23a]">
            Gatherings
          </p>

          <div className="mt-4 space-y-2 text-sm text-[#e6c79c]">
            <p>Sunday English Service — 7:00 AM</p>
            <p>Sunday Chichewa Service — 9:30 AM</p>
            <p>Combined Service — 8:30 AM</p>
            <p className="text-xs text-[#c2a23a]/70">
              (Last Sunday of the month)
            </p>

            <p className="pt-2">Homecell Prayers — 6:00 PM (Wednesday)</p>
            <p className="text-xs text-[#c2a23a]/70">
              In respective homes per homecell program
            </p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="text-center md:text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#c2a23a]">
            Explore
          </p>

          <div className="mt-4 flex flex-col gap-2 text-sm text-[#e6c79c] items-center md:items-end">
            {[
              { label: "Content", href: "/content", newTab: false },
              { label: "Events", href: "/events", newTab: false },
              { label: "Ministries", href: "/ministries", newTab: false },
              { label: "Contact", href: "/contact", newTab: false },
              { label: "Member Login", href: "/login", newTab: true },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                target={item.newTab ? "_blank" : undefined}
                className="relative transition-colors duration-200 hover:text-white
                after:absolute after:left-0 after:-bottom-0.5 after:h-[1px] after:w-0 
                after:bg-gradient-to-r after:from-[#c2620a] after:to-[#c2a23a] 
                after:transition-all after:duration-200 hover:after:w-full"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom strip */}
      <div className="border-t border-[#7c3d0f]/40 py-4 text-center text-xs text-[#c2a23a]/80">
        © {new Date().getFullYear()} Church of Christ at Red Cross. All rights
        reserved.
      </div>
    </footer>
  );
}
