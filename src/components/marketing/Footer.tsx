import { Github, Linkedin, Twitter } from "lucide-react";
import { Logo } from "@/components/Logo";

const columns = [
  { title: "Product", links: ["Features", "Pricing", "Templates"] },
  { title: "Company", links: ["About", "Contact"] },
  { title: "Legal", links: ["Privacy", "Terms"] },
];

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="container-page grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            Collect testimonials. Build trust. Convert more.
          </p>
          <div className="mt-5 flex items-center gap-2">
            {[Github, Twitter, Linkedin].map((Icon, i) => (
              <a
                key={i}
                href="#"
                aria-label={["GitHub", "X", "LinkedIn"][i]}
                className="grid size-9 place-items-center rounded-lg border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="size-4" />
              </a>
            ))}
          </div>
        </div>
        {columns.map((col) => (
          <div key={col.title}>
            <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
            <ul className="mt-4 space-y-3">
              {col.links.map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-page border-t py-6 text-xs text-muted-foreground">
        © {new Date().getFullYear()} Testimonially. All rights reserved.
      </div>
    </footer>
  );
}
