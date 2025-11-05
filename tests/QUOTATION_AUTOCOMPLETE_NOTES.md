# Quotation Autocomplete Dropdown Close - Manual Test Notes

## Scope
Fix ensures the Sparepart Name/Number autocomplete dropdown closes on:
- Selection (click on a suggestion)
- Input blur (after short defer)
- Escape key (Esc)
- Outside click (anywhere outside the input/dropdown)

## Test Matrix

### Roles
- Director (director.jkt@bmj.com)
- Marketing Jakarta (citra.k@bmj.com)
- Marketing Semarang (agus.s@bmj.com or rina.w@bmj.com)

### Steps (repeat for each role)
1. Login and go to `/quotation/add`.
2. Set Project Type = Spareparts.
3. In Sparepart Name field, type a few letters to trigger suggestions.
4. Verify dropdown appears.
5. Click a suggestion → dropdown should close immediately.
6. Type again to show dropdown; press Esc → dropdown closes.
7. Type again to show dropdown; click outside the field → dropdown closes.
8. Blur the input by tabbing out → dropdown closes.
9. Ensure sparepartId is set and totals compute.
10. Submit a test quotation to ensure no regression.

## Expected Results
- Dropdown closes for all four close triggers above.
- sparepartId is set after selection; no validation error.
- Price/total calculations continue to function.
- No console errors.
- Purchase Add page remains unchanged.

## Regression Checks
- Director branch selection unaffected.
- Marketing auto-branch read-only unaffected.
- Suggestions still appear as before.

## Notes
- Implementation uses per-row `showDropdown[index]` with root click handler and Esc key.
- `searchedSpareparts` cleared on close to force-hide list.
