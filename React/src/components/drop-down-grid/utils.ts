import DropDownBox from 'devextreme/ui/drop_down_box';

export function isSearchIncomplete(dropDownBox: DropDownBox): boolean {
  let displayValue = dropDownBox.option('displayValue');
  const text = dropDownBox.option('text');
  const textValue = text?.length ? text : undefined;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error (private API)
  displayValue = displayValue?.length && displayValue[0];
  return textValue !== displayValue;
}

