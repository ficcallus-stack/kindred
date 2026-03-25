"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MaterialIcon } from "@/components/MaterialIcon";

export default function Breadcrumbs({ customName }: { customName?: string }) {
  const pathname = usePathname();
  const paths = pathname.split("/").filter(p => p !== "");
  
  const crumbItems = paths.map((p, i) => {
    const routeTo = `/${paths.slice(0, i + 1).join("/")}`;
    let label = p.charAt(0).toUpperCase() + p.slice(1);
    
    // Override 'nannies' to 'Browse Nannies' or replace UUIDs
    if (label.toLowerCase() === "nannies") label = "Browse Nannies";
    if (p.length > 20 && customName) label = customName;
    
    return { label, routeTo };
  });

  const schemaLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://kindredcareus.com/"
      },
      ...crumbItems.map((crumb, i) => ({
        "@type": "ListItem",
        "position": i + 2,
        "name": crumb.label,
        "item": `https://kindredcareus.com${crumb.routeTo}`
      }))
    ]
  };

  return (
    <nav aria-label="Breadcrumb" className="py-4">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaLd) }}
      />
      <ol className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-on-surface-variant opacity-60">
        <li>
          <Link href="/" className="hover:text-primary hover:opacity-100 transition-all flex items-center">
            <MaterialIcon name="home" className="text-sm" />
          </Link>
        </li>
        {crumbItems.map((crumb, i) => {
          const isLast = i === crumbItems.length - 1;
          return (
            <li key={crumb.routeTo} className="flex items-center gap-2">
              <span className="opacity-40">/</span>
              {isLast ? (
                <span className="text-primary italic" aria-current="page">
                  {crumb.label}
                </span>
              ) : (
                <Link prefetch={false} href={crumb.routeTo === '/browse nannies' ? '/browse' : crumb.routeTo} className="hover:text-primary hover:opacity-100 transition-all">
                  {crumb.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
