import { FormattedMessage } from "react-intl";
import { useSticky } from "react-table-sticky";
import { CellProps, useTable } from "react-table";
import React, { PropsWithChildren, useMemo } from "react";

import { get } from "lodash";
import { Box, Stack } from "@mui/material";

import { CommonTableProps } from "interfaces";
import { formatDate, getDisplayValueFromChoiceItem } from "libs";
import { useChoice, useFetchReturnInvoiceSumAmount } from "hooks";

import {
  Table,
  TableBody,
  TableHead,
  RenderBody,
  RenderHeader,
  TableContainer,
  TablePagination,
  WrapperTableCell,
  WrapperTableLink,
} from "components/TableV3";
import { NumberFormat, ViewButton, WrapperTable } from "components";
import { RETURN_INVOICE_VIEW_TYPE_V1 } from "__generated__/apiType_v1";

type ReturnOrderHistoryTableProps = CommonTableProps<RETURN_INVOICE_VIEW_TYPE_V1> &
  Record<string, any>;

export default function ReturnOrderHistoryTable(props: ReturnOrderHistoryTableProps) {
  const {
    data,
    count,
    maxHeight,
    pagination,
    isLoading,
    onPageChange,
    onPageSizeChange,
    ...restProps
  } = props;

  const columns = useMemo(() => {
    return [
      {
        Header: <FormattedMessage id={`table.invoiceSid`} />,
        accessor: "invoiceSid",
        Cell: (props: PropsWithChildren<CellProps<any, any>>) => {
          const { row, onViewNoteHandler } = props;

          const value = get(row, "original.sid");

          const id = get(row, "original.invoice.order");

          return (
            <WrapperTableLink
              onClick={() => {
                onViewNoteHandler(id);
              }}
            >
              {value}
            </WrapperTableLink>
          );
        },
        colSpan: 2,
      },
      {
        Header: <FormattedMessage id={`table.date_created`} />,
        accessor: "date_created",
        Cell: (props: PropsWithChildren<CellProps<any, any>>) => {
          const { row } = props;

          const value = get(row, "original.date_created");

          return <WrapperTableCell>{formatDate(value)}</WrapperTableCell>;
        },
      },
      {
        Header: <FormattedMessage id={`table.owner_name`} />,
        accessor: "owner_name",
        Cell: (props: PropsWithChildren<CellProps<any, any>>) => {
          const { row } = props;

          const value = get(row, "original.owner_name");

          return <WrapperTableCell>{value}</WrapperTableCell>;
        },
      },
      {
        Header: (
          <Box textAlign="right">
            <FormattedMessage id={`table.amount`} />
          </Box>
        ),
        accessor: "amount",

        Cell: (props: PropsWithChildren<CellProps<any, any>>) => {
          const { row } = props;

          const id = get(row, "original.id");

          const { sumAmount } = useFetchReturnInvoiceSumAmount(id);

          return (
            <WrapperTableCell textAlign="right">
              <NumberFormat value={sumAmount} />
            </WrapperTableCell>
          );
        },
      },
      {
        Header: <FormattedMessage id={`table.status`} />,
        accessor: "status",

        Cell: (props: PropsWithChildren<CellProps<any, any>>) => {
          const { row } = props;
          const { invoice_statuses } = useChoice();

          const value: string = get(row, "original.invoice.status");
          const displayValue = getDisplayValueFromChoiceItem(invoice_statuses, value);

          return <WrapperTableCell>{displayValue}</WrapperTableCell>;
        },
      },
      {
        Header: <FormattedMessage id={`table.action`} />,
        accessor: "action",
        Cell: (props: PropsWithChildren<CellProps<any, any>>) => {
          const { row, onViewNoteHandler } = props;
          const id = get(row, "original.invoice.order");

          return (
            <Stack flexDirection="row" alignItems="center" columnGap={1}>
              <ViewButton
                onClick={() => {
                  onViewNoteHandler(id);
                }}
              />
            </Stack>
          );
        },
        width: 100,
        maxWidth: 100,
        sticky: "right",
      },
    ];
  }, []);

  const table = useTable(
    {
      data,
      columns: columns as any,
      manualPagination: true,
      autoResetPage: false,
      ...restProps,
    },
    useSticky
  );

  return (
    <WrapperTable>
      <TableContainer maxHeight={maxHeight}>
        <Table>
          <TableHead>
            <RenderHeader table={table} />
          </TableHead>

          <TableBody>
            <RenderBody loading={isLoading} table={table} />
          </TableBody>
        </Table>

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
      </TableContainer>
    </WrapperTable>
  );
}
