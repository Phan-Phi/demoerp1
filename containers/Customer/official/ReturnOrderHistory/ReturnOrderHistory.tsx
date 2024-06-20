import { cloneDeep } from "lodash";
import { Stack } from "@mui/material";
import { useRouter } from "next/router";
import React, { useCallback, useContext, useEffect, useMemo, useState } from "react";

import { useFetch } from "hooks";
import { EDIT, ORDERS } from "routes";
import { setFilterValue, transformUrl } from "libs";
import { Context as CustomerContext } from "../context";
import ReturnOrderHistoryTable from "./ReturnOrderHistoryTable";
import { RETURN_INVOICE_VIEW_TYPE_V1 } from "__generated__/apiType_v1";
import { ADMIN_ORDERS_INVOICES_RETURN_INVOICES_END_POINT } from "__generated__/END_POINT";

// TODO: issue 55

export type ReturnOrderHistoryFilterType = {
  page: number;
  page_size: number;
  with_count: boolean;
  receiver: number | undefined;
};

const defaultFilterValue: ReturnOrderHistoryFilterType = {
  page: 1,
  page_size: 25,
  with_count: true,
  receiver: undefined,
};

export default function ReturnOrderHistory() {
  const router = useRouter();
  const context = useContext(CustomerContext);
  const [filter, setFilter] = useState<ReturnOrderHistoryFilterType>(defaultFilterValue);

  const { data, changeKey, itemCount, isLoading } = useFetch<RETURN_INVOICE_VIEW_TYPE_V1>(
    transformUrl(ADMIN_ORDERS_INVOICES_RETURN_INVOICES_END_POINT, {
      ...filter,
      receiver: context.state.id,
    })
  );

  useEffect(() => {
    if (context.state.id) {
      changeKey(
        transformUrl(ADMIN_ORDERS_INVOICES_RETURN_INVOICES_END_POINT, {
          ...defaultFilterValue,
          receiver: context.state.id,
        })
      );
    }
  }, [context.state.id]);

  const onFilterChangeHandler = useCallback(
    (key: string) => {
      return (value: any) => {
        let cloneFilter = cloneDeep(filter);

        cloneFilter = setFilterValue(cloneFilter, key, value);

        setFilter(cloneFilter);

        changeKey(
          transformUrl(ADMIN_ORDERS_INVOICES_RETURN_INVOICES_END_POINT, {
            ...cloneFilter,
            receiver: context.state.id,
          })
        );
      };
    },
    [filter, context.state.id]
  );

  const pagination = useMemo(() => {
    return {
      pageIndex: filter.page - 1,
      pageSize: filter.page_size,
    };
  }, [filter]);

  const onViewNoteHandler = useCallback(async (orderId: number) => {
    router.push(`/${ORDERS}/${EDIT}/${orderId}`);
  }, []);

  return (
    <Stack spacing={3}>
      <ReturnOrderHistoryTable
        data={data ?? []}
        count={itemCount}
        maxHeight={300}
        isLoading={isLoading}
        pagination={pagination}
        onViewNoteHandler={onViewNoteHandler}
        onPageChange={onFilterChangeHandler("page")}
        onPageSizeChange={onFilterChangeHandler("pageSize")}
      />
    </Stack>
  );
}
