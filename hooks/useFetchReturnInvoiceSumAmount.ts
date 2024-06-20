import useSWR from "swr";
import { get } from "lodash";
import { useMemo } from "react";
import { transformUrl } from "libs";
import { ADMIN_ORDERS_INVOICES_RETURN_INVOICES_QUANTITIES_END_POINT } from "__generated__/END_POINT";

export const useFetchReturnInvoiceSumAmount = (id: number) => {
  const { data } = useSWR(() => {
    if (!id) return;

    return transformUrl(ADMIN_ORDERS_INVOICES_RETURN_INVOICES_QUANTITIES_END_POINT, {
      page_size: 1,
      return_invoice: id,
      with_sum_amount_incl_tax: true,
    });
  });

  const amountInclTax = useMemo(() => {
    if (!data) return 0;
    const amount = get(data, "sum_amount_incl_tax");

    return parseFloat(amount);
  }, [data]);

  return {
    sumAmount: amountInclTax,
  };
};
