import Link from "next/link";
import { getDictionary } from "@/lib/locale";
import { DEFAULT_LOCALE } from "@/lib/constants";

export default function NotFound() {
  const copy = getDictionary(DEFAULT_LOCALE);
  return <main className="container standalone"><h1>{copy.notFound.title}</h1><p>{copy.notFound.description}</p><Link href={`/${DEFAULT_LOCALE}`}>{copy.notFound.back}</Link></main>;
}
