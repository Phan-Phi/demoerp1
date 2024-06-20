import { Row } from "react-table";
import { useIntl } from "react-intl";
import { useRouter } from "next/router";
import React, { Fragment, useCallback, useEffect, useMemo, useState } from "react";

import useSWR from "swr";
import { get } from "lodash";
import { Box, Grid, Stack, Typography } from "@mui/material";

import { InputNumber } from "compositions";
import Invoice from "containers/Cash/Invoice";
import OrderLine from "containers/Cash/OrderLine";
import StockOutNote from "containers/Cash/StockOutNote";
import ReceiptOrder from "containers/Cash/ReceiptOrder";
import { BackButton, LoadingDynamic } from "components";

import { PRODUCTS } from "routes";
import { transformUrl } from "libs";

import {
  ADMIN_CASH_DEBT_RECORDS_END_POINT,
  ADMIN_ORDERS_INVOICES_RETURN_INVOICES_END_POINT,
  ADMIN_ORDERS_INVOICES_RETURN_INVOICES_QUANTITIES_END_POINT,
  ADMIN_WAREHOUSES_PURCHASE_ORDERS_RECEIPT_ORDERS_RETURN_ORDERS_END_POINT,
} from "__generated__/END_POINT";

import { ADMIN_CASH_DEBT_RECORD_VIEW_TYPE_V1 } from "__generated__/apiType_v1";

export default function ViewDetailDebt() {
  const router = useRouter();
  const { messages } = useIntl();
  const [returnAmount, setReturnAmount] = useState(0);
  const [data, setData] = useState<ADMIN_CASH_DEBT_RECORD_VIEW_TYPE_V1>();

  const [returnValue, setReturnValue] = useState(0);
  const [returnSurcharge, setReturnSurcharge] = useState(0);

  const { data: dataDebt } = useSWR<ADMIN_CASH_DEBT_RECORD_VIEW_TYPE_V1>(() => {
    return transformUrl(`${ADMIN_CASH_DEBT_RECORDS_END_POINT}${router.query.id}`);
  });

  const { data: dataRCO } = useSWR<ADMIN_CASH_DEBT_RECORD_VIEW_TYPE_V1[]>(() => {
    const creditorType = get(dataDebt, "creditor_type");
    const orderId = get(dataDebt, "source.order");

    const params = {
      page: 1,
      page_size: 10,
      source_id: orderId,
      creditor_type: creditorType,
    };

    return transformUrl(ADMIN_CASH_DEBT_RECORDS_END_POINT, params);
  });

  useEffect(() => {
    if (dataDebt == undefined || dataRCO == undefined) return;

    if (
      dataDebt.source_type === "stock.receiptorder" ||
      dataDebt.source_type === "order.invoice"
    ) {
      setData(dataDebt);
    } else {
      const result = get(dataRCO, "results[0]");

      setData(result);
    }
  }, [dataDebt, dataRCO]);

  // Giá trị trả hàng
  const { data: returnValueData } = useSWR(() => {
    if (!data) return;

    const id = get(data, "source.id");
    const sourceType = get(data, "source_type");

    if (sourceType !== "order.invoice") return;

    return transformUrl(ADMIN_ORDERS_INVOICES_RETURN_INVOICES_QUANTITIES_END_POINT, {
      invoice: id,
      page_size: 1,
      is_confirmed: true,
      with_sum_amount_incl_tax: true,
    });
  });

  // Phụ phí trả hàng
  const { data: returnSurchargeData } = useSWR(() => {
    if (!data) return;

    const id = get(data, "source.id");
    const sourceType = get(data, "source_type");

    if (sourceType !== "order.invoice") return;

    return transformUrl(ADMIN_ORDERS_INVOICES_RETURN_INVOICES_END_POINT, {
      invoice: id,
      page_size: 1,
      is_confirmed: true,
      with_sum_surcharge: true,
    });
  });

  const source = get(data, "source");
  const id = get(source, "id");
  const sourceType: any = get(data, "source_type");

  const amount = parseFloat(get(source, "amount.incl_tax") || 0);
  const surcharge = parseFloat(get(source, "surcharge.incl_tax") || 0);
  const shippingCharge = parseFloat(get(source, "shipping_charge.incl_tax") || 0);
  const inMoney = parseFloat(get(source, "total_transaction_in_amount.incl_tax") || 0);
  const outMoney = parseFloat(get(source, "total_transaction_out_amount.incl_tax") || 0);

  const result = Math.abs(
    amount + surcharge + shippingCharge - Math.abs(inMoney - outMoney)
  );

  const { data: returnOrderData } = useSWR(() => {
    if (sourceType == "stock.receiptorder") {
      const params = {
        get_all: true,
        order: id,
        status: "Confirmed",
      };

      return transformUrl(
        ADMIN_WAREHOUSES_PURCHASE_ORDERS_RECEIPT_ORDERS_RETURN_ORDERS_END_POINT,
        params
      );
    }
  });

  useEffect(() => {
    if (sourceType == "stock.receiptorder") {
      if (returnOrderData == undefined) return;

      const tempReturnAmount = returnOrderData.reduce((totalValue, currentValue) => {
        const { amount, surcharge } = currentValue;

        const total =
          parseFloat(get(amount, "incl_tax")) + parseFloat(get(surcharge, "incl_tax"));

        return (totalValue += total);
      }, 0);

      const tempReturnValue = returnOrderData.reduce((totalValue, currentValue) => {
        const { amount } = currentValue;

        return (totalValue += parseFloat(get(amount, "incl_tax")));
      }, 0);

      const tempReturnSurcharge = returnOrderData.reduce((totalValue, currentValue) => {
        const { surcharge } = currentValue;

        return (totalValue += parseFloat(get(surcharge, "incl_tax")));
      }, 0);

      setReturnValue(tempReturnValue);
      setReturnSurcharge(tempReturnSurcharge);
      setReturnAmount(tempReturnAmount);
    } else {
      const _returnValue = parseFloat(get(returnValueData, "sum_amount_incl_tax", "0"));
      const _returnSurcharge = parseFloat(get(returnSurchargeData, "sum_surcharge", "0"));

      setReturnValue(_returnValue);
      setReturnSurcharge(_returnSurcharge);

      setReturnAmount(_returnValue + _returnSurcharge);
    }
  }, [returnOrderData, sourceType, source, returnValueData, returnSurchargeData]);

  const onGotoHandler = useCallback((data: Row<any>) => {
    const productId =
      get(data, "original.line.variant.product") ||
      get(data, "original.variant.product.id");

    window.open(`/${PRODUCTS}/${productId}`, "_blank");
  }, []);

  const ViewLineListMemo = useMemo(() => {
    if (sourceType == undefined) return null;

    if (sourceType === "stock.receiptorder") {
      return (
        <Fragment>
          <ReceiptOrder id={id} onGotoHandler={onGotoHandler} />
        </Fragment>
      );
    } else if (sourceType === "stock.stockoutnote") {
      return (
        <Fragment>
          <StockOutNote id={id} onGotoHandler={onGotoHandler} />
        </Fragment>
      );
    } else if (sourceType == "order.invoice") {
      return (
        <Fragment>
          <Invoice id={id} onGotoHandler={onGotoHandler} />
        </Fragment>
      );
    }

    return null;
  }, [sourceType, id]);

  const returnOrderLineMemo = useMemo(() => {
    if (sourceType !== "stock.receiptorder") {
      return null;
    }
    return (
      <Stack spacing={2}>
        <Typography>{messages["listingReturnOrderNote"]}</Typography>
        <OrderLine id={id} onGotoHandler={onGotoHandler} />
      </Stack>
    );
  }, [returnOrderData, sourceType, id]);

  if (data == undefined) return <LoadingDynamic />;

  return (
    <Box>
      <Grid container>
        <Grid item xs={12}>
          <Stack flexDirection="row" columnGap={2} marginTop={2}>
            <InputNumber
              readOnly={true}
              FormLabelProps={{
                children: messages["orderValue"] as string,
              }}
              InputProps={{
                inputProps: { placeholder: messages["orderValue"] as string },
              }}
              NumberFormatProps={{
                value: amount,
                suffix: " ₫",
              }}
            />

            <InputNumber
              readOnly={true}
              FormLabelProps={{
                children: messages["surcharge"] as string,
              }}
              InputProps={{
                inputProps: { placeholder: messages["surcharge"] as string },
              }}
              NumberFormatProps={{
                value: surcharge,
                suffix: " ₫",
              }}
            />

            {sourceType == "order.invoice" ? (
              <InputNumber
                readOnly={true}
                FormLabelProps={{
                  children: messages["shippingCharge"] as string,
                }}
                InputProps={{
                  inputProps: { placeholder: messages["shippingCharge"] as string },
                }}
                NumberFormatProps={{
                  value: shippingCharge,
                  suffix: " ₫",
                }}
              />
            ) : (
              <Box width={"100%"} />
            )}

            <InputNumber
              readOnly={true}
              FormLabelProps={{
                children: messages["totalPrice"] as string,
              }}
              InputProps={{
                inputProps: { placeholder: messages["totalPrice"] as string },
              }}
              NumberFormatProps={{
                value: amount + surcharge + shippingCharge - returnAmount,
                suffix: " ₫",
              }}
            />
          </Stack>

          <Stack flexDirection="row" columnGap={2} marginTop={2}>
            <InputNumber
              readOnly={true}
              FormLabelProps={{
                children: messages["inMoney"] as string,
              }}
              InputProps={{
                inputProps: { placeholder: messages["inMoney"] as string },
              }}
              NumberFormatProps={{
                value: inMoney,
                suffix: " ₫",
              }}
            />

            <InputNumber
              readOnly={true}
              FormLabelProps={{
                children: messages["outMoney"] as string,
              }}
              InputProps={{
                inputProps: { placeholder: messages["outMoney"] as string },
              }}
              NumberFormatProps={{
                value: outMoney,
                suffix: " ₫",
              }}
            />

            <InputNumber
              readOnly={true}
              FormLabelProps={{
                children: "Giá trị trả hàng",
              }}
              InputProps={{
                inputProps: { placeholder: "Giá trị trả hàng" },
              }}
              NumberFormatProps={{
                value: returnValue,

                suffix: " ₫",
              }}
            />

            <InputNumber
              readOnly={true}
              FormLabelProps={{
                children: "Phụ phí trả hàng",
              }}
              InputProps={{
                inputProps: { placeholder: "Phụ phí trả hàng" },
              }}
              NumberFormatProps={{
                value: returnSurcharge,

                suffix: " ₫",
              }}
            />
          </Stack>

          <InputNumber
            readOnly={true}
            FormLabelProps={{
              children: messages["needToPay"] as string,
            }}
            InputProps={{
              inputProps: { placeholder: messages["needToPay"] as string },
              sx: {
                fontWeight: 700,
              },
            }}
            NumberFormatProps={{
              value: result - returnAmount,
              suffix: " ₫",
            }}
          />
        </Grid>

        <Grid item xs={12}>
          {ViewLineListMemo !== null && (
            <Typography>{messages["listingProduct"]}</Typography>
          )}
        </Grid>

        <Grid item xs={12}>
          {ViewLineListMemo}
        </Grid>

        <Grid item xs={12}>
          {returnOrderLineMemo}
        </Grid>
      </Grid>

      <BackButton onClick={() => router.back()} />
    </Box>
  );
}
