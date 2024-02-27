# kerific

Browser Extension and Bookmarklet for Concepts, Terminology and Glossaries.

*kerific* is a front plugin or extension that currently only works for Chrome and Brave. It **matches words in any text** on the web that is parseable for kerific **and offers buttons to various glossaries and definitions** in the [SSI](self-sovereign-identity) field.

## Relation with KERISSE

KERISSE is our engine for Concepts and Education targetted at programmers *to be* in the [KERI Suite](keri-suite). All glossaries that [KERISSE](KERISSE) is allowed to scrape are combined in the [Unified Glossary](https://weboftrust.github.io/WOT-terms/docs/glossary-unified?level=2). This unified glossary is based on a large JSON file, which kerific uses to match words in any text and serve the combined glossaries.

## Download kerific

It is in the [Chrome Webstore](https://chromewebstore.google.com/detail/kerific/ckbmkbbmnfbeecfmoiohobcdmopekgmp?hl=nl)

## For maintainers

### Submitting an extension

The steps to submit an extension to the Google Chrome Store can be found online and are not repeated here. It is important to note that the result of `npm run build` is what needs to be submitted and this can be found in the directory `/dist`.

### Testing an extension

It is possible to test locally by entering the code locally. To do this, go to the extension section in Chrome (or similar browser) and click on "load unpacked". Here you load the code into the aforementioned directory. You can reload this code via the reload button in the extension.
