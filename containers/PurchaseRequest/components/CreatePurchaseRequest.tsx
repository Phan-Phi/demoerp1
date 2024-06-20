import { Row } from "react-table";
import { useIntl } from "react-intl";
import { Stack, Box } from "@mui/material";
import { useMountedState } from "react-use";
import { cloneDeep, get, isEmpty } from "lodash";
import React, { useCallback, useMemo, useState } from "react";

import CreatePurchaseRequestTable from "./CreatePurchaseRequestTable";
import { BackButton, Dialog, LoadingButton, SearchField, WrapperTable } from "components";

import { useFetch, useMutateTable, useNotification } from "hooks";
import { checkResArr, createRequest, setFilterValue, transformUrl } from "libs";

import {
  ADMIN_PRODUCTS_VARIANTS_END_POINT,
  ADMIN_PURCHASE_REQUESTS_END_POINT,
} from "__generated__/END_POINT";
import { ADMIN_PRODUCT_PRODUCT_VARIANT_VIEW_TYPE_V1 } from "__generated__/apiType_v1";

// TODO: issue 60

type CreatePurchaseRequestProps = {
  open: boolean;
  onClose: () => void;
  refreshData: () => void;
};

type CreatePurchaseRequestFilterType = {
  page: number;
  page_size: number;
  with_count: boolean;
  use_cache: boolean;
  search: string;
};

const defaultFilterValue: CreatePurchaseRequestFilterType = {
  page: 1,
  page_size: 25,
  with_count: true,
  use_cache: false,
  search: "",
};

export default function CreatePurchaseRequest(props: CreatePurchaseRequestProps) {
  const { onClose, open, refreshData } = props;

  const isMounted = useMountedState();
  const { messages } = useIntl();
  const { enqueueSnackbarWithSuccess, enqueueSnackbarWithError } = useNotification();

  const {
    data: editData,
    activeEditRow,
    activeEditRowHandler,
    updateEditRowDataHandler,
    removeEditRowDataHandler,
    resetEditRowHandler,
  } = useMutateTable({});

  const [addLoading, setAddLoading] = useState<Record<string, boolean>>({});

  const [listSelectedRow, setListSelectedRow] = useState<any>([]);

  const [filter, setFilter] =
    useState<CreatePurchaseRequestFilterType>(defaultFilterValue);

  const { data, changeKey, itemCount, isLoading } =
    useFetch<ADMIN_PRODUCT_PRODUCT_VARIANT_VIEW_TYPE_V1>(
      transformUrl(ADMIN_PRODUCTS_VARIANTS_END_POINT, filter)
    );

  const onFilterChangeHandler = useCallback(
    (key: string) => {
      return (value: any) => {
        let cloneFilter = cloneDeep(filter);

        cloneFilter = setFilterValue(cloneFilter, key, value);

        setFilter(cloneFilter);

        changeKey(
          transformUrl(
            transformUrl(ADMIN_PRODUCTS_VARIANTS_END_POINT, filter),
            cloneFilter
          )
        );
      };
    },
    [filter]
  );

  const pagination = useMemo(() => {
    return {
      pageIndex: filter.page - 1,
      pageSize: filter.page_size,
    };
  }, [filter]);

  const addHandler = useCallback(
    async ({
      data,
    }: {
      data: Row<Required<ADMIN_PRODUCT_PRODUCT_VARIANT_VIEW_TYPE_V1>>[];
    }) => {
      let trueLoadingList = {};
      let falseLoadingList = {};
      let bodyList: any[] = [];

      data.forEach((el) => {
        const id = el.original.id;
        falseLoadingList[id] = false;
        trueLoadingList[id] = true;

        const currentData = editData.current[id];

        const quantity = get(currentData, "quantity") || 1;
        const notes = get(currentData, "note");

        const body = {
          variant: id,
          quantity: quantity,
          notes: notes,
        };

        bodyList.push(body);
      });

      if (isEmpty(bodyList)) {
        onClose();

        return;
      }

      setAddLoading((prev) => {
        return {
          ...prev,
          ...trueLoadingList,
          all: true,
        };
      });

      try {
        const results = await createRequest(ADMIN_PURCHASE_REQUESTS_END_POINT, bodyList);
        const result = checkResArr(results);

        if (result) {
          enqueueSnackbarWithSuccess("Tạo yêu cầu đặt hàng thành công");
          refreshData();

          onClose();
        }
      } catch (err) {
        enqueueSnackbarWithError(err);
      } finally {
        if (isMounted()) {
          resetEditRowHandler();

          setAddLoading((prev) => {
            return {
              ...prev,
              ...falseLoadingList,
              all: false,
            };
          });
        }
      }
    },
    []
  );

  return (
    <Dialog
      {...{
        open,
        onClose: () => {
          if (addLoading?.all) {
            return;
          }

          onClose();
        },
        DialogProps: {
          PaperProps: {
            sx: {
              width: "70vw",
              maxWidth: "70vw",
            },
          },
        },
        DialogTitleProps: {
          children: "Tạo yêu cầu đặt hàng",
        },
        dialogContentTextComponent: () => {
          return (
            <Stack spacing={2}>
              <SearchField
                initSearch={filter.search}
                onChange={onFilterChangeHandler("search")}
              />

              <WrapperTable>
                <CreatePurchaseRequestTable
                  maxHeight="50vh"
                  data={data ?? []}
                  count={itemCount}
                  messages={messages}
                  editData={editData}
                  loading={addLoading}
                  isLoading={isLoading}
                  pagination={pagination}
                  addHandler={addHandler}
                  activeEditRow={activeEditRow}
                  setListSelectedRow={setListSelectedRow}
                  activeEditRowHandler={activeEditRowHandler}
                  onPageChange={onFilterChangeHandler("page")}
                  onPageSizeChange={onFilterChangeHandler("pageSize")}
                  updateEditRowDataHandler={updateEditRowDataHandler}
                  removeEditRowDataHandler={removeEditRowDataHandler}
                />
              </WrapperTable>

              <Box />
            </Stack>
          );
        },
        DialogActionsProps: {
          children: (
            <Stack flexDirection="row" columnGap={2}>
              <BackButton
                disabled={addLoading?.all}
                onClick={() => {
                  onClose();
                }}
              />

              <LoadingButton
                loading={!!addLoading["all"]}
                disabled={!!addLoading["all"]}
                onClick={() => {
                  if (listSelectedRow.length > 0) {
                    addHandler({ data: listSelectedRow as any[] });
                  }
                }}
              >
                {addLoading["all"] ? messages["addingStatus"] : messages["addStatus"]}
              </LoadingButton>
            </Stack>
          ),
        },
      }}
    />
  );
}
