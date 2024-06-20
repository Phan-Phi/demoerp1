import { object, array, date, string } from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

import { ChoiceType } from "interfaces";

import { validateDateEnd } from "./utils";
import { getChoiceValue } from "libs";

interface OptionItem {
  formId: string;
  value: string;
  title: string;
  checked: boolean;
}

export interface ExportTransactionSchemaProps {
  date_start: Date | null;
  date_end: Date | null;
  field_options: OptionItem[];
  type: string;
  file_ext: string;
}

export const exportTransactionSchema = (choice: ChoiceType) => {
  const { export_file_types, export_file_extensions } = choice;

  return yupResolver(
    object().shape({
      date_start: date().nullable().required(),
      date_end: validateDateEnd("date_start").required(),
      field_options: array(object()),
      type: string().oneOf(getChoiceValue(export_file_types)),
      file_ext: string().oneOf(getChoiceValue(export_file_extensions)),
    })
  );
};

export const defaultExportTransactionFormState = (
  choice: ChoiceType
): ExportTransactionSchemaProps => {
  const { export_file_extensions, export_file_transaction_fields } = choice;

  const defaultFieldsOptionList = export_file_transaction_fields.map((el) => {
    return {
      value: el[0],
      title: el[1],
      checked: false,
    } as OptionItem;
  });

  return {
    date_start: null,
    date_end: new Date(),
    field_options: defaultFieldsOptionList,
    type: "Transaction",
    file_ext: getChoiceValue(export_file_extensions)[0],
  };
};
