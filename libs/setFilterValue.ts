import { set } from "lodash";
import { isPossiblePhoneNumber } from "react-phone-number-input";

const BOOLEAN_KEY_LIST = [
  "is_active",
  "gender",
  "in_business",
  "type",
  "total_debt",
  "flow_type",
  "source_type",
  "period",
  "purchase_channel",
  "payment_method",
  "type_sale",
  "birthday",
  "range",
  "total_debt_amount_start",
  "total_debt_amount_end",
  "total_purchase_start",
  "total_purchase_end",
  "price_start",
  "price_end",
  "category",
  "order_date",
  "total_start",
  "total_end",
  "owner",
  "status",
  "warehouse",
  "variant_name",
  "partner",
  "channel",
  "shipping_method",
  "shipping_status",
  "shipper",
  "direction",
  "reasons",
  "tag_names_params",
  "is_below_threshold",
  "action_auditLog",
  "actor",
  "record",
  "sales_in_charge",
  "province",
  "district",
  "product_variant",
  "variant",
];

const DATE_KEY_LIST = [
  "date_created_start",
  "date_created_end",
  "date_joined_start",
  "date_joined_end",
  "date_placed_start",
  "date_placed_end",
  "date_start",
  "date_end",
  "birthday_start",
  "birthday_end",
  "total_debt_amount_start",
  "total_debt_amount_end",
  "date_confirmed_start",
  "date_confirmed_end",
  "publication_date_start",
  "publication_date_end",
  "available_for_purchase_start",
  "available_for_purchase_end",
  "lowStockThreshold",
  "price_tables",
];

export function setFilterValue<T extends Record<string, any>>(
  filter: T,
  key: string,
  value: any
) {
  if (key === "page") {
    set(filter, "page", value + 1);
  } else if (key === "pageSize") {
    set(filter, "page_size", value.target.value);
  } else if (key === "search") {
    if (value && isPossiblePhoneNumber(value.toString(), "VN")) {
      set(filter, "search", parseInt(value.toString().replaceAll(" ", "")));
    } else {
      set(filter, "search", value);
    }
  } else if (key === "action") {
    set(filter, "action", value.target.value);
  } else if (DATE_KEY_LIST.includes(key)) {
    set(filter, key, value);
  } else if (BOOLEAN_KEY_LIST.includes(key)) {
    set(filter, key, value);
  }

  if (key === "page") return filter;

  set(filter, "page", 1);

  return filter;
}
