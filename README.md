# gcd-tampermonkey-scripts
Scripts that I've written in Tampermonkey to improve my own indexing experience. Everything here has been written with a script mentality so can easily be improved. I'll accept pull requests with improvements or fixes.

## Editors 2 Objects
More of a macro, also relies on the dropdown search coming back in a reasonable time.

### Future Improvements
 - Handle `Joseph Bloggs (credited as Joe Bloggs)` correctly
 - Change from a set time on the dropdown to actually monitoring for either a change in state or a network call

## Count On Editing Summary
Adds a total count of IMPs to your editing summary page.

## Migrate Features Too
The GCD already shows a 'Migrate credits' button that migrates both text creators and text features.
That button doesn't show if there are no creators to migrate, even if there is still a text feature.
This adds a 'Migrate Feature' button where appropriate.

# Questions and Typeset
Adds a button to the sequence edit page, when pressed it populates anything not marked as 'no' (i.e. 'no script') with a ? and letters with typeset. If a text field is already populated it is not overwritten.