import DropDownBox from 'devextreme/ui/drop_down_box';

export function isSearchIncomplete(dropDownBox: DropDownBox): boolean {
  const displayValue = dropDownBox.option('displayValue') as string[] | undefined;
  const text = dropDownBox.option('text');
  const textValue = text?.length ? text : undefined;
  const displayFirst = displayValue?.length ? displayValue[0] : undefined;
  return textValue !== displayFirst;
}

