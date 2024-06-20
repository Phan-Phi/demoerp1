import { useSticky } from "react-table-sticky";
import { FormattedMessage, useIntl } from "react-intl";
import { CellProps, useTable, useRowSelect } from "react-table";
import React, { Fragment, PropsWithChildren, useEffect, useMemo } from "react";

import { get } from "lodash";
import DynamicMessage from "messages";
import { Box, Stack, Typography, styled } from "@mui/material";

import {
  Table,
  TableBody,
  TableHead,
  RenderBody,
  RenderHeader,
  TableContainer,
  TablePagination,
  WrapperTableCell,
  TableCellForEdit,
  TableCellForAvatar,
  TableCellForSelection,
  TableHeaderForSelection,
} from "components/TableV3";
import { CommonTableProps } from "interfaces";
import { AddButton, Link, NumberFormat } from "components";

import { ADMIN_PRODUCT_PRODUCT_VARIANT_VIEW_TYPE_V1 } from "__generated__/apiType_v1";

type CreatePurchaseRequestTableProps =
  CommonTableProps<ADMIN_PRODUCT_PRODUCT_VARIANT_VIEW_TYPE_V1> & Record<string, any>;

const CreatePurchaseRequestTable = (props: CreatePurchaseRequestTableProps) => {
  const {
    data,
    count,
    maxHeight,
    pagination,
    isLoading,
    onPageChange,
    onPageSizeChange,
    renderHeaderContentForSelectedRow,
    setListSelectedRow,
    ...restProps
  } = props;

  const { formatMessage } = useIntl();

  const columns = useMemo(() => {
    return [
      {
        accessor: "selection",
        Header: (props) => {
          const { getToggleAllRowsSelectedProps } = props;

          return (
            <TableHeaderForSelection
              getToggleAllRowsSelectedProps={getToggleAllRowsSelectedProps}
            />
          );
        },
        Cell: (props: PropsWithChildren<CellProps<any, any>>) => {
          const { row } = props;

          return (
            <Fragment>
              <TableCellForSelection row={row} />
            </Fragment>
          );
        },
        maxWidth: 64,
        width: 64,
      },
      {
        accessor: "primary_image",
        Header: "",
        Cell: (
          props: PropsWithChildren<
            CellProps<ADMIN_PRODUCT_PRODUCT_VARIANT_VIEW_TYPE_V1, any>
          >
        ) => {
          const { row } = props;

          const image = get(row, "original.primary_image.product_small");

          return <TableCellForAvatar src={image} />;
        },
        maxWidth: 90,
        width: 90,
      },
      {
        Header: "Mã hàng",
        accessor: "editable_sku",
        Cell: (
          props: PropsWithChildren<
            CellProps<ADMIN_PRODUCT_PRODUCT_VARIANT_VIEW_TYPE_V1, any>
          >
        ) => {
          const { value, row } = props;

          return <WrapperTableCell>{value}</WrapperTableCell>;
        },
      },
      {
        Header: <FormattedMessage id={`table.productName`} />,
        accessor: "productName",
        Cell: (
          props: PropsWithChildren<
            CellProps<ADMIN_PRODUCT_PRODUCT_VARIANT_VIEW_TYPE_V1, any>
          >
        ) => {
          const { row, onGotoHandler } = props;

          const value = get(row, "original.name");

          return (
            <WrapperTableCell>
              <Stack spacing="6px">
                <Link
                  href={"#"}
                  onClick={(e: React.SyntheticEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onGotoHandler?.(row);
                  }}
                >
                  {value}
                </Link>
              </Stack>
            </WrapperTableCell>
          );
        },
      },
      {
        Header: (
          <Box textAlign="right">
            <FormattedMessage id={`table.price`} />
          </Box>
        ),
        accessor: "price",
        Cell: (
          props: PropsWithChildren<
            CellProps<ADMIN_PRODUCT_PRODUCT_VARIANT_VIEW_TYPE_V1, any>
          >
        ) => {
          const { row } = props;

          const value: string = get(row, "original.price.incl_tax") || "0";

          return (
            <WrapperTableCell textAlign="right">
              <NumberFormat value={value && parseFloat(value)} />
            </WrapperTableCell>
          );
        },
      },
      {
        Header: (
          <Box textAlign="right" minWidth={150}>
            <FormattedMessage id={`table.available_quantity`} />
          </Box>
        ),
        accessor: "available_quantity_can_order",
        Cell: (
          props: PropsWithChildren<
            CellProps<ADMIN_PRODUCT_PRODUCT_VARIANT_VIEW_TYPE_V1, any>
          >
        ) => {
          const { row } = props;

          const quantity = get(row, "original.quantity");
          const allocatedQuantity = get(row, "original.allocated_quantity");

          const remainingQuantity = quantity - allocatedQuantity;

          return (
            <WrapperTableCell textAlign="right">
              <NumberFormat value={remainingQuantity} suffix="" />
            </WrapperTableCell>
          );
        },
      },

      {
        Header: (
          <Box textAlign="right" minWidth={150}>
            <FormattedMessage id={`table.unit_quantity`} />
          </Box>
        ),
        accessor: "quantity",
        Cell: (
          props: PropsWithChildren<
            CellProps<ADMIN_PRODUCT_PRODUCT_VARIANT_VIEW_TYPE_V1, any>
          >
        ) => {
          const { row, cell, updateEditRowDataHandler, editData } = props;

          const id = get(row, "original.id");
          const columnId = get(cell, "column.id");

          return (
            <TableCellForEdit
              {...{
                inputType: "number",
                value: get(editData, `current.${id}.${columnId}`) || "",
                onChange: (value) => {
                  updateEditRowDataHandler?.({
                    value,
                    row,
                    keyName: columnId,
                  });
                },
                NumberFormatProps: {
                  allowNegative: false,
                  suffix: "",
                  isAllowed: (values) => {
                    const { floatValue } = values;

                    if (floatValue == undefined) return true;

                    return true;
                  },
                },
              }}
            />
          );
        },
      },

      {
        Header: <Box minWidth={150}>Ghi chú</Box>,
        accessor: "note",
        Cell: (
          props: PropsWithChildren<
            CellProps<ADMIN_PRODUCT_PRODUCT_VARIANT_VIEW_TYPE_V1, any>
          >
        ) => {
          const { row, cell, updateEditRowDataHandler, editData } = props;

          const id = get(row, "original.id");
          const columnId = get(cell, "column.id");

          return (
            <TableCellForEdit
              {...{
                inputType: "text",
                value: get(editData, `current.${id}.${columnId}`) || "",
                onChange: (value) => {
                  updateEditRowDataHandler?.({
                    value,
                    row,
                    keyName: columnId,
                  });
                },
              }}
            />
          );
        },
      },

      {
        Header: (
          <Box minWidth={80}>
            <FormattedMessage id={`table.action`} />
          </Box>
        ),
        accessor: "action",
        Cell: (
          props: PropsWithChildren<
            CellProps<ADMIN_PRODUCT_PRODUCT_VARIANT_VIEW_TYPE_V1, any>
          >
        ) => {
          const { row, loading: addLoading, addHandler } = props;

          const id = get(row, "original.id");

          return (
            <Stack columnGap={1} flexDirection="row" alignItems="center">
              <AddButton
                disabled={!!addLoading[id]}
                onClick={() => {
                  addHandler?.({ data: [row] });
                }}
              />
            </Stack>
          );
        },

        sticky: "right",
      },
    ];
  }, []);

  const table = useTable(
    {
      columns: columns as any,
      data,
      manualPagination: true,
      autoResetPage: false,
      ...restProps,
    },
    useSticky,
    useRowSelect
  );

  useEffect(() => {
    setListSelectedRow(table.selectedFlatRows);
  }, [table.selectedFlatRows.length]);

  return (
    <Box>
      <TableContainer maxHeight={maxHeight}>
        <Table>
          <TableHead>
            <RenderHeader
              table={table}
              renderHeaderContentForSelectedRow={(tableInstance) => {
                const selectedRows = tableInstance.selectedFlatRows;

                return (
                  <Stack flexDirection="row" columnGap={3} alignItems="center">
                    <Typography>{`${formatMessage(DynamicMessage.selectedRow, {
                      length: selectedRows.length,
                    })}`}</Typography>
                  </Stack>
                );
              }}
            />
          </TableHead>
          <TableBody>
            <RenderBody loading={isLoading} table={table} />
          </TableBody>
        </Table>
      </TableContainer>

      <Box display="flex" justifyContent="flex-end">
        <TablePagination
          count={count}
          page={pagination.pageIndex}
          rowsPerPage={pagination.pageSize}
          onPageChange={(_, page) => {
            onPageChange(page);
          }}
          onRowsPerPageChange={onPageSizeChange}
          rowsPerPageOptions={[25, 50, 75, 100]}
        />
      </Box>
    </Box>
  );
};

export default CreatePurchaseRequestTable;

type ToolTipProps = {
  quantity: number;
  quantityCustomer: number | string;
};

const ToolTip = ({ quantity, quantityCustomer }: ToolTipProps) => {
  return (
    <Stack gap="2px">
      <Stack flexDirection="row" alignItems="center" gap="4px">
        <StyledText>Tồn: </StyledText>
        <StyledText>{quantity}</StyledText>
      </Stack>

      <Stack flexDirection="row" alignItems="center" gap="4px">
        <StyledText>KH đặt: </StyledText>
        <StyledText>{quantityCustomer}</StyledText>
      </Stack>
    </Stack>
  );
};

const StyledText = styled(Typography)(() => {
  return {
    fontSize: 12,
  };
});
