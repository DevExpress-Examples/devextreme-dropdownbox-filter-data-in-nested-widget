export function isSearchIncomplete(dropDownBox: any): boolean {
  const displayValue = dropDownBox.option('displayValue') as string[] | undefined;
  const text = dropDownBox.option('text') as string | undefined;
  const textValue = text?.length ? text : undefined;
  const displayFirst = displayValue?.length ? displayValue[0] : undefined;
  return textValue !== displayFirst;
}

