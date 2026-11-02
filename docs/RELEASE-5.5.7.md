# Release 5.5.7

Remove pricing confirmation as an export prerequisite. PDF button stays enabled while idle, including after valid offer edits; validation occurs on click. Valid comparisons always call the automatic PDF+JSON mail flow. Missing/invalid inputs still prevent invalid output, with an explanatory status. During PDF creation/mail submission, the action is temporarily disabled to prevent duplicate concurrent sends. The optional acknowledgement is not auto-checked and remains accurate in the export metadata.

Validation: Node tests and build; live preview export after editing an offer with acknowledgement unchecked, including actual mail acceptance.
