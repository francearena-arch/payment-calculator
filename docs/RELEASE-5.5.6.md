# Release 5.5.6

Fix recommendation disappearing after manual offer edits. Separate calculation validity from export acknowledgement: valid inputs update the recommendation immediately, while pricing confirmation is still required for PDF/JSON exports after edits. No silent approval or outdated results. Missing/invalid input and unconfirmed required minimum-fee top-ups still suppress the recommendation.

Validation: Node suite and production build; browser regression coverage for recommendation visibility and winner changes before confirmation. Live preview checked with Nexi and competitor rate changes, blank invalid rate and recovery.
