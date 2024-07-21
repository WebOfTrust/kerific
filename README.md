# kerific

Browser Extension and Bookmarklet for Concepts, Terminology and Glossaries.

*kerific* is a front plugin or extension that currently only works for Chrome and Brave. It **matches words in any text** on the web that is parseable for kerific **and offers buttons to various glossaries and definitions** in the [SSI](self-sovereign-identity) field.

## Relation with KERISSE

KERISSE is our engine for Concepts and Education targetted at programmers *to be* in the [KERI Suite](keri-suite). All glossaries that [KERISSE](KERISSE) is allowed to scrape are combined in the [Unified Glossary](https://weboftrust.github.io/WOT-terms/docs/glossary-unified?level=2). This unified glossary is based on a large JSON file, which kerific uses to match words in any text and serve the combined glossaries.

## Download kerific

It is in the [Chrome Webstore](https://chromewebstore.google.com/detail/kerific/ckbmkbbmnfbeecfmoiohobcdmopekgmp?hl=nl)

## Related repos

Mid 2024, we split the old WOT-terms repo into:

- [kerisse](https://github.com/WebOfTrust/kerisse) : search engine (Typesense-based [github.io site](https://weboftrust.github.io/kerisse/))
- new [WOT-terms](https://github.com/WebOfTrust/WOT-terms): glossary, solely focussed on terminology, filtering, and connect to source management (Docusaurus-based [github.io site](https://weboftrust.github.io/WOT-terms/?level=2))
- [keridoc:](https://github.com/WebOfTrust/keridoc) KERI documentation site (Docusaurus-based: [github.io site](https://weboftrust.github.io/keridoc/?level=2))
